(function(){
	"use strict";

	/**
	 * pxl.Layout.Layer
	 *
	 * @constructor
	 * @class Layer
	 * @param options {Object} [in]
	 * @param options.source {ArrayBuffer|Number} Specify other buffer or size (without offset) as a source to create data-array 
	 * @param options.layout {Layout}
	 * @param options.name {String}
	 */
	var Layer = pxl.Layout.Layer = function(options){
		/**
		 * @property data
		 * @type {ImageDataArray}
		 */
		this.data = new pxl.ImageDataArray(typeof options.source === "number"
			? options.source << 2
			: options.source
		);

		/**
		 * @property name
		 * @type {String}
		 * @default ""
		 */
		this.name = options.name || "";

		/**
		 * @property isVisible
		 * @type {Boolean}
		 * @default true
		 */
		this.isVisible = true;

		/**
		 * @property _layout
		 * @private
		 * @type {Layout}
		 */
		this._layout = options.layout;
	};

	var layerProto = Layer.prototype;

	/**
	 * Reset the layer to default.
	 *
	 * @method reset
	 */
	layerProto.reset = function(){
		var data = this.data;
		if ("fill" in pxl.ImageDataArray.prototype){ //ES6
			data.fill(0);
		} else{
			for (var i = 0, length = data.length; i < length; ++i){
				data[i] = 0;
			}
		}
	};

	/**
	 * Make sure that layers have equal size
	 *
	 * @method copy
	 * @param {Layer} [in]
	 * @param {Boolean|undefined} [in]
	 */
	layerProto.copy = function(other, fullCopy){
		this.data.set(other.data);
		if (fullCopy === true){
			this.name = other.name;
			this._layout = other._layout;
			this.isVisible = other.isVisible;
		}
	};

	/**
	 * Put "start" and "offset" to apply only to area within;
	 * Or put already computed "indexes" list and only that pixels will be merged;
	 * Or just skip this two definitions above and the whole layer will be merged;
	 *
	 * @method merge
     * @param options {Object}[in]
	 * @param options.isMix {Boolean}
	 * @param options.other {Layer}
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 * @param options.indexes {Array|undefined}
     */
	layerProto.merge = function(options){
		var i = 0;
		var length = 0;
		var method = (options.isMix === true ? "mix" : "set");
		var thisPixel = new pxl.Layout.Layer.Pixel(this.data);
		var otherPixel = new pxl.Layout.Layer.Pixel(options.other.data);
		if ((options.start && options.offset) || options.indexes){
			var indexes = options.indexes || this._layout.indexesAt(options);
			length = indexes.length;
			for (i = 0; i < length; ++i){
				thisPixel.index = otherPixel.index = indexes[i] << 2;
				thisPixel[method](otherPixel);
			}
		} else{
			length = this.data.length;
			for (i = 0; i < length; i += 4){
				thisPixel.index = otherPixel.index = i;
				thisPixel[method](otherPixel);
			}
		}
	};

	/**
	 * Flood fill (no recursion, custom stack);
	 * Warn: there are possible freezes on canvas sizes more than 512x512
	 *
	 * @method fill
	 * @param options {Object} [in]
	 * @param options.position {Vector2}
	 * @param options.pixel {ImageDataArray|Array}
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 * @param options.isMix {Boolean|undefined}
	 * @return {Boolean}
	 */
    layerProto.fill = (function(){ //anonymous
		var _stackX = new pxl.PrimitivePool(Number);
		var _stackY = new pxl.PrimitivePool(Number);
		return function(options){
			var startIndex = this._layout.indexAt(options.position);
			var dataPixel = new pxl.Layout.Layer.Pixel(
				this.data, startIndex << 2
			);
			if (dataPixel.compare(options.pixel)){
				return false; //don't fill on same colour
			}
			var source = new pxl.ImageDataArray(this.pixelFromIndex(startIndex)); //pixel before changes
			var stackX = _stackX; //store reference in a current scope
			var stackY = _stackY;
			var history = pxl.Layout.history;
			var tokenPos = new pxl.Vector2;
			var layout = this._layout;
			var boundedTop = 0;
			var boundedRight = 0;
			var boundedLeft = 0;
			var boundedBottom = 0;
			if (!options.start || !options.offset){
				boundedRight = layout.getWidth() - 1;
				boundedBottom = layout.getHeight() - 1;
				//boundedTop and boundedLeft are already 0
			} else{
				boundedTop = Math.max(0, options.start.y);
				boundedRight = Math.min(
					layout.getWidth() - 1, options.start.x + options.offset.x
				);
				boundedBottom = Math.min(
					layout.getHeight() - 1, options.start.y + options.offset.y
				);
				boundedLeft = Math.max(0, options.start.x);
			}
			history.cache(dataPixel); //save before change
			dataPixel[options.isMix === true ? "mix" : "set"](options.pixel);
			var seed = this.pixelFromIndex(startIndex); //pixel after changes
			stackX.push(options.position.x);
			stackY.push(options.position.y);
			do{
				tokenPos.set(stackX.pop(), stackY.pop());
				if (tokenPos.y > boundedTop){ //top
					tokenPos.y -= 1; //move up
					_fill();
					tokenPos.y += 1; //turn back for next reuse
				}
				if (tokenPos.x < boundedRight){ //right
					tokenPos.x += 1;
					_fill();
					tokenPos.x -= 1;
				}
				if (tokenPos.y < boundedBottom){ //bottom
					tokenPos.y += 1;
					_fill();
					tokenPos.y -= 1;
				}
				if (tokenPos.x > boundedLeft){ //left
					tokenPos.x -= 1;
					_fill();
					tokenPos.x += 1;
				}
			} while(stackX._size); //god forgive me!

			stackX.reduce();
			stackY.reduce();

			return true; //filling completed successfully

			//Helper
			//I hope, this one become inline in a good browser!!
			function _fill(){ 
				dataPixel.index = layout.indexAt(tokenPos) << 2;
				if (dataPixel.compare(source)){
					//cache for undo-redo
					history.cache(dataPixel);

					//you don't need to mix each pixel,
					//seed is mixed once and that's enough!
					//All other near pixels have to be same!
					//So, mix source only and then just copy this result!
					dataPixel.set(seed);

					//expand available memory and set new properties
					stackX.push(tokenPos.x);
					stackY.push(tokenPos.y);
				}
			};
		};
	})();

	/**
	 * @method plot
	 * @param options {Object} [in]
	 * @param options.pixel {ImageDataArray}
	 * @param options.indexes {Array|undefined}
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 * @param options.isMix {Boolean}
	 */
	layerProto.plot = function(options){
		var i = 0;
		var length = 0;
		var otherPixel = options.pixel;
		var history = pxl.Layout.history;
		var method = (options.isMix === true ? "mix" : "set");
		var thisPixel = new pxl.Layout.Layer.Pixel(this.data);
		if ((options.start && options.offset) || options.indexes){
			var indexes = options.indexes || this._layout.indexesAt(options);
			length = indexes.length;
			for (i = 0; i < length; ++i){
				thisPixel.index = indexes[i] << 2;
				history.cache(thisPixel);
				thisPixel[method](otherPixel);
			}
		} else{
			length = this.data.length;
			for (i = 0; i < length; i += 4){
				thisPixel.index = i;
				history.cache(thisPixel);
				thisPixel[method](otherPixel);
			}
		}
	};

	/**
	 * @method colorReplace
	 * @param options {Object} [in]
	 * @param options.oldPixel {ImageDataArray|Array}
	 * @param options.pixel {ImageDataArray|Array}
	 * @param options.indexes {Array|undefined}
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 * @param options.isMix {Boolean}
	 */
	layerProto.colorReplace = function(options){
		var i = 0;
		var length = 0;
		var history = pxl.Layout.history;
		var pixel = new pxl.Layout.Layer.Pixel(this.data);
		var oldPixel = new pxl.ImageDataArray(options.oldPixel);
		var destPixel = new pxl.Layout.Layer.Pixel(options.oldPixel);
		destPixel[options.isMix === true ? "mix" : "set"](options.pixel);
		if ((options.start && options.offset) || options.indexes){
			var indexes = options.indexes || this._layout.indexesAt(options);
			length = indexes.length;
			for (i = 0; i < length; ++i){
				pixel.index = indexes[i] << 2;
				if (pixel.compare(oldPixel)){
					history.cache(pixel);
					pixel.set(destPixel);
				}
			}
		} else{
			length = this.data.length;
			for (i = 0; i < length; i += 4){
				pixel.index = i;
				if (pixel.compare(oldPixel)){
					history.cache(pixel);
					pixel.set(destPixel);
				}
			}
		}
	};

	/**
	 * @see layerProto.pixelAt
	 * @method pixelFromPosition
	 * @param position {Vector2} [in]
	 * @return {ImageDataArray}
	 */
	layerProto.pixelFromPosition = function(position){
		return this.pixelAt(this._layout.indexAt(position) << 2); //mul. by 4
	};

	/**
	 * @see layerProto.pixelAt
	 * @method pixelFromIndex
	 * @param index {Number} [in]
	 * @return {ImageDataArray}
	 */
	layerProto.pixelFromIndex = function(index){
		return this.pixelAt(index <<= 2); //mul. by 4
	};

	/**
	 * @method getLayout
	 * @return {Layout}
	 */
	layerProto.getLayout = function(){
		return this._layout;
	};

	/**
	 * @method pixelAt
	 * @param index {Number} [in]
	 * @return {ImageDataArray} warn: direct reference onto data's property buffer
	 */
	layerProto.pixelAt = function(index){
		return this.data.subarray(index, index + 4);
	};

	/**
	 * @destructor
	 * @method destroy
	 */
	layerProto.destroy = function(){
		this._layout = this.data = null;
		this.isVisible = false;
	};
})();