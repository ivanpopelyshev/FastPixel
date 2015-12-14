(function(){
	"use strict";

	/**
	 * @constructor
	 * @class Layer
	 * @throws {Error} Raise an error if data size larger than the size of the MAX_BUFFER_SIZE.
	 * @param options {Object} [in]
	 * @param options.source {ArrayBuffer|Number} Specify other buffer or a size (without offset)
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

		if (this.data.length > Layer.MAX_BUFFER_SIZE){
			this.data = null;
			throw new Error;
		}

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

	/**
	 * Strict limitation, but that's enough for pixel-art
	 *
	 * @property MAX_BUFFER_SIZE
	 * @type {Number}
	 * @static
	 * @final
	 * @default 1024*1024*4
	 */
	Layer.MAX_BUFFER_SIZE = 1024 * 1024 * 4;

	var layerProto = Layer.prototype;

	/**
	 * Reset the data to default.
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
	 * Warn: Make sure layers have same size before call this.
	 *
	 * @method copy
	 * @param other {Layer} [in]
	 * @param fullCopy {Boolean|undefined} [in]
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
	 * Merge each pixel of two layers;
	 * Or apply merging to pixels within start and offset options.
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
		var self = this;
		if ((!options.start || !options.offset) && !options.isMix){
			self.copy(options.other, false); //much faster
		} else{
			var otherData = options.other.data;
			var method = options.isMix === true ? "mixAt" : "setAt";
			self._layout.__process(options, function(i, length){
				while (i < length){
					self[method](i,
								otherData[i++],
								otherData[i++],
								otherData[i++],
								otherData[i++]);
				}
			});
		}
	};

	/**
	 * Replace specific color from position with new one on whole layer;
	 * Or just on area within start and offset options.
	 *
	 * @method colorReplace
	 * @param options {Object} [in]
	 * @param options.pixel {ImageDataArray|Array}
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 * @param options.position {Vector2}
	 * @param options.isMix {Boolean}
	 */
	layerProto.colorReplace = function(options){
		var self = this;
		var session = pxl.Layout.Layer.history.getSession(this);
		var pixel = this.pixelFromPosition(options.position);
		var r = options.pixel[0];
		var g = options.pixel[1];
		var b = options.pixel[2];
		var a = options.pixel[3];
		var oldR = pixel[0];
		var oldG = pixel[1];
		var oldB = pixel[2];
		var oldA = pixel[3];
		session.initColor(oldR, oldG, oldB, oldA);
		this._layout.__process(options, function(i, length){
			for (; i < length; i += 4){
				if (self.compareAt(i, oldR, oldG, oldB, oldA)){
					session.pushIndex(i);
					self.setAt(i, r, g, b, a);
				}
			}
		});
	};

	/**
	 * Set new color for layer;
	 * Or just for area within start and offset options.
	 *
	 * @method set
	 * @param options {Object} [in]
	 * @param options.pixel {ImageDataArray}
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 * @param options.isMix {Boolean}
	 */
	layerProto.set = function(options){
		var self = this;
		var data = this.data;
		var session = pxl.Layout.Layer.history.getSession(this);
		var r = options.pixel[0];
		var g = options.pixel[1];
		var b = options.pixel[2];
		var a = options.pixel[3];
		var method = options.isMix === true ? "mixAt" : "setAt";
		this._layout.__process(options, function(i, length){
			for (; i < length; i += 4){
				session.pushPixel(i,
								  data[i],
								  data[i + 1],
								  data[i + 2],
								  data[i + 3]);
				self[method](i, r, g, b, a);
			}
		});
	};

	/**
	 * Change specific channel for layer;
	 * Or channel for area within start and offset options.
	 *
	 * @method setChannel
	 * @param options {Object} [in]
	 * @param options.channelOffset {Number} 0-3 (rgba)
	 * @param options.value {Number} 0-255
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 */
	layerProto.setChannel = function(options){
		var data = this.data;
		var session = pxl.Layout.Layer.history.getSession(this);
		var channelOffset = options.channelOffset;
		var value = options.value;
		this._layout.__process(options, function(i, length){
			for (; i < length; i += 4){
				session.pushPixel(i,
								  data[i],
								  data[i + 1],
								  data[i + 2],
								  data[i + 3]);
				data[i + channelOffset] = value;
			}
		});
	};

	/**
	 * Flood fill (no recursion, custom stack);
	 * Can be applyed for area within start and offset options.
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
	layerProto.fill = function(options){
		var self = this;
		var leftBorder = 0;
		var endIndex = this.data.length;
		var pixel = options.pixel;
		var index = this._layout.indexAt(options.position) << 2;
		if (index < 0 || index >= endIndex ||  //don't fill on out of memory!
			this.compareAt(index, pixel[0], pixel[1], pixel[2], pixel[3])){ //don't fill on same colour!
			return;
		}
		var rightBorder = this._layout.getWidth() << 2;
		var startIndex = 0;
		var widthOffset = rightBorder;
		var pixelOffset = 4;
		var session = pxl.Layout.Layer.history.getSession(this);
		var tmpIndex = 0;
		var tokenPixel = this.pixelAt(index); //pixel before changes
		var oldR = tokenPixel[0];
		var oldG = tokenPixel[1];
		var oldB = tokenPixel[2];
		var oldA = tokenPixel[3];
		this[options.isMix === true ? "mixAt" : "setAt"](
			index, pixel[0], pixel[1], pixel[2], pixel[3]);
		tokenPixel = this.pixelAt(index); //pixel after changes
		var r = tokenPixel[0];
		var g = tokenPixel[1];
		var b = tokenPixel[2];
		var a = tokenPixel[3];
		var stack = [index];
		session.initColor(oldR, oldG, oldB, oldA);
		if (options.start && options.offset){
			startIndex = pxl.clamp(
				this._layout.indexAt(options.start), 0, endIndex) << 2;
			endIndex = pxl.clamp(this._layout.indexAt(
				new pxl.Vector2(options.start).add(options.offset)),
				0, endIndex) << 2;
			leftBorder = options.start.x << 2;
			rightBorder = (options.start.x + options.offset.x) << 2;
		}
		do{
			index = stack.pop();
			tmpIndex = index + pixelOffset; //move right
			if (tmpIndex % widthOffset <= rightBorder){
				_fill();
			}
			tmpIndex = index + widthOffset; //move down
			if (tmpIndex < endIndex){
				_fill();
			}
			tmpIndex = index - pixelOffset; //move left
			if (tmpIndex % widthOffset >= leftBorder){
				_fill();
			}
			tmpIndex = index - widthOffset; //move up
			if (tmpIndex > startIndex){
				_fill();
			}
		} while(stack.length);

		//Helper:
		function _fill(){
			if (self.compareAt(tmpIndex, oldR, oldG, oldB, oldA)){
				self.setAt(tmpIndex, r, g, b, a);
				stack.push(tmpIndex);
				session.pushIndex(tmpIndex);
			}
		};
	};	

	/**
	 * @method setAt
	 * @param i {Number} index where to apply.
	 * @param r {Number}
	 * @param g {Number}
	 * @param b {Number}
	 * @param a {Number}
	 */
	layerProto.setAt = function(i, r, g, b, a){
		var data = this.data;
		data[i] = r;
		data[i + 1] = g;
		data[i + 2] = b;
		data[i + 3] = a;
	};

	/**
	 * @see http://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
	 * @method mixAt
	 * @param i {Number} index where to apply.
	 * @param r {Number}
	 * @param g {Number}
	 * @param b {Number}
	 * @param a {Number}
	 */
	layerProto.mixAt = function(i, r, g, b, a){
		if (a !== 0){ //don't waste time on transparent pixels
			var data = this.data;
			var thisA = data[i + 3];
			if (thisA === 0){ //same as above ^
				this.setAt(i, r, g, b, a);
			} else{
				thisA /= 255.0; //cast alpha channels to 0.0..1.0 format
				a /= 255.0;
				var aMul = thisA * (1 - a);
				var newA = a + aMul; //new alpha
				var op1 = a / newA;
				var op2 = aMul / newA;
				data[i] = data[i++] * op1 + r * op2;
				data[i] = data[i++] * op1 + g * op2;
				data[i] = data[i++] * op1 + b * op2;
				data[i] = newA * 255;
			}
		}
	};

	/**
	 * @method compareAt
	 * @param i {Number} index where to apply.
	 * @param r {Number}
	 * @param g {Number}
	 * @param b {Number}
	 * @param a {Number}
	 * @return {Boolean}
	 */
	layerProto.compareAt = function(i, r, g, b, a){
		var data = this.data;
		return (data[i] === r &&
				data[i + 1] === g &&
				data[i + 2] === b &&
				data[i + 3] === a);
	};

	/**
	 * @method pixelFromPosition
	 * @param position {Vector2} [in]
	 * @return {ImageDataArray}
	 */
	layerProto.pixelFromPosition = function(position){
		return this.pixelAt(this._layout.indexAt(position) << 2);
	};

	/**
	 * Warn: index without color-offset!
	 *
	 * @see layerProto.pixelAt
	 * @method pixelFromIndex
	 * @param index {Number} [in]
	 * @return {ImageDataArray}
	 */
	layerProto.pixelFromIndex = function(index){
		return this.pixelAt(index << 2);
	};

	/**
	 * Index with color-offset (which equal to x4 (rgba)).
	 *
	 * @method pixelAt
	 * @param index {Number} [in]
	 * @return {ImageDataArray}
	 */
	layerProto.pixelAt = function(index){
		var pixel = new pxl.ImageDataArray(4);
		var data = this.data;
		pixel[0] = data[index];
		pixel[1] = data[++index];
		pixel[2] = data[++index];
		pixel[3] = data[++index];
		return pixel;
	};

	/**
	 * @method generateImageData
	 * @param options {Object} [in]
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 * @return {ImageData}
	 */
	layerProto.generateImageData = function(options){
		var index = 0;
		var thisData = this.data;
		var layout = this._layout;
		var imageData = (options.start && options.offset
			? pxl.createImageData(options.offset.x, options.offset.y)
			: pxl.createImageData(layout.getWidth(), layout.getHeight())
		);
		var data = new pxl.ImageDataArray(imageData.data.buffer);
		layout.__process(options, function(i, length){
			while (i < length){
				data[index++] = thisData[i++];
				data[index++] = thisData[i++];
				data[index++] = thisData[i++];
				data[index++] = thisData[i++];
			}
		});
		return imageData;
	};

	/**
	 * @method getLayout
	 * @return {Layout}
	 */
	layerProto.getLayout = function(){
		return this._layout;
	};

	/**
	 * @method cloneData
	 * @param options {Object} [in]
	 * @param options.start {Vector2|undefined}
	 * @param options.offset {Vector2|undefined}
	 * @return {ImageDataArray}
	 */
	layerProto.cloneData = function(options){
		var index = 0;
		var data = null;
		var thisData = this.data;
		if (options.start && options.offset){
			data = new pxl.ImageDataArray(options.offset.x, options.offset.y);
			this._layout.__process(options, function(i, length){
				while (i < length){
					data[index++] = thisData[i++];
					data[index++] = thisData[i++];
					data[index++] = thisData[i++];
					data[index++] = thisData[i++];
				}
			});
		} else{
			data = new pxl.ImageDataArray(thisData); //copy constructor
		}
		return data;
	};

	/**
	 * Destructor.
	 *
	 * @method destroy
	 */
	layerProto.destroy = function(){
		this._layout = this.data = null;
		this.isVisible = false;
		pxl.Layout.Layer.history.clean();
	};
})();