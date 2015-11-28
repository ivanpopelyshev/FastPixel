(function(){
	"use strict";

	/**
	 * Pass width and height parameters;
	 * or just already existing ImageData as source.
	 *
	 * @constructor
	 * @class Layout
	 * @param ImageData {Object} [in]
	 * @param width {Number}
	 * @param height {Number}
	 */
	var Layout = pxl.Layout = function(){
		/**
		 * @property _imageData
		 * @private
		 * @type {ImageData}
		 */
		this._imageData = pxl.createImageData.apply(null, arguments);

		/**
		 * @property dataLayer
		 * @type {Layer}
		 */
		this.dataLayer = new pxl.Layout.Layer({
			"source": this._imageData.data.buffer, "layout": this
		});

		/**
		 * @property layerList
		 * @type {Array}
		 * @default []
		 */
		this.layerList = [];

		/**
		 * @property activeLayer
		 * @type {Layer}
		 * @default null
		 */
		this.activeLayer = null;

		/**
		 * @property observer
		 * @type {Observer}
		 */
		this.observer = new pxl.Observer;
	};

	var layoutProto = Layout.prototype;

	/**
	 * Append new Layer instance into the layerList (if possible);
	 * activeLayer point on new instance.
	 *
	 * @method appendLayer
	 * @chainable
	 */
	layoutProto.appendLayer = function(){
		if (this.layerList.length < pxl.MAX_LAYER_COUNT){
			this.activeLayer = new Layout.Layer({
				"source": this.getWidth() * this.getHeight(),
				"layout": this,
				"name": "Layer " + this.layerList.length
			});
			this.layerList.push(this.activeLayer);
		}
		return this;
	};

	/**
	 * Delete an active layer.
	 *
	 * @method deleteLayer
	 * @chainable
	 */
	layoutProto.deleteLayer = function(){
		var layerList = this.layerList;
		var length = layerList.length;
		for (var i = 0; i < length; ++i){
			if (layerList[i] === this.activeLayer){
				layerList.splice(i, 1);
				this.activeLayer.destroy(); //don't forget to destroy one!
				this.activeLayer = (layerList.length === 0
					? null
					: layerList[length - 1] //top layer become active
				);
				break;
			}
		}
		return this;
	};

	/**
	 * Each visible layer "drawn" to main dataLayer layer (Back-to-front);
	 * (delegate processing to the activeLayer);
	 * Notify subscribers.
	 *
	 * @param options {Object} [in]
	 * @param options.isMix {Boolean}
	 * @param options.start {Vector2}
	 * @param options.offset {Vector2}
	 * @param options.isNotifyView {Boolean}
	 * @method mergeLayers
	 * @chainable
	 */
	layoutProto.mergeLayers = function(options){
		var clonedOpts = {};
		var visibleLayers = this.visibleLayers();
		var layerCount = visibleLayers.length;
		var dataLayer = this.dataLayer;
		if (!layerCount){
			dataLayer.reset();
		} else{
			clonedOpts.start = options.start;
			clonedOpts.offset = options.offset;
			clonedOpts.indexes = options.indexes;
			clonedOpts.isMix = false; //it's important to set mix to false at first layer
			for (var i = 0; i < layerCount; ++i){
				clonedOpts.other = visibleLayers[i];
				dataLayer.merge(clonedOpts);
				clonedOpts.isMix = !!options.isMix; //other layers have processed properly
			}
		}
		if (options.isNotifyView === true){
			this.observer.notify(pxl.PIXELS_CHANGED_EVENT, options);
		}
		return this;
	};

    /**
     * Replace old colour by new one;
	 * delegate processing to the activeLayer.
	 *
	 * @method colorReplace
	 * @param options {Object} [in]
	 * @chainable
     */
	layoutProto.colorReplace = function(options){
		this.activeLayer.colorReplace(options);
		this.mergeLayers(options);
		return this;
	};

    /**
     * Plot pixel or group of pixels (faster then force-fill);
	 * delegate processing to the activeLayer.
	 *
	 * @method plot
	 * @param options {Object} [in]
	 * @chainable
     */
	layoutProto.plot = function(options){
		this.activeLayer.plot(options);
		this.mergeLayers(options);
		return this;
	};

    /**
     * Flood fill;
	 * delegate processing to the activeLayer.
	 *
	 * @method fill
	 * @param options {Object} [in]
	 * @chainable
     */
    layoutProto.fill = function(options){
		if (this.activeLayer.fill(options)){
			this.mergeLayers(options);
		}
		return this;
    };

	/**
	 * Provide list of indexes within start and offset coordinates.
	 * Warn: don't compute indexes by yourself! Use this method only!
	 *
	 * @method indexesAt
	 * @param options {Object} [in]
	 * @param options.start {Vector2}
	 * @param options.offset {Vector2}
	 * @return {Array} warn: static array(read-only)
	 */
	layoutProto.indexesAt = (function(){ //anonymous
		var _container = [0];
		return function(options){
			var rContainer = _container; //move reference in current scope
			var start = options.start;
			var x = Math.max(0, start.x);
			var y = Math.max(0, start.y);
			var width = Math.min(this.getWidth() - 1, options.offset.x);
			var length = width * Math.min(this.getHeight() - 1, options.offset.y);
			var positionTmp = new pxl.Vector2;
			var indexOffset = 0;
			var index = this.indexAt(start);
			rContainer.length = length;
			for (var i = 0; i < length; ++i){
				rContainer[i] = index + indexOffset; //take an index relative to coordinates
				if (++indexOffset >= width){
					indexOffset = 0;
					index = this.indexAt(positionTmp.set(x, ++y));
				}
			}
			return rContainer;
		}
	})();

	/**
	 * Provide an index from position.
	 *
	 * @method indexAt
	 * @param position {Vector2} [in]
	 * @return {Number}
	 */
	layoutProto.indexAt = function(position){
		return position.x + position.y * this.getWidth();
	};

	/**
	 * Provide position according to index (without offset).
	 *
	 * @method positionFrom
	 * @param index {Number} [in]
	 * @return {Vector2}
	 */
	layoutProto.positionFrom = function(index){
		var width = this.getWidth();
		return new pxl.Vector2(index % width, (index / width) | 0);
	};

	/**
	 * Get whole image data or just a part of it (according to options).
	 *
	 * @method getImageData
	 * @param options {Object|undefined} [in]
	 * @return {ImageData}
	 */
	layoutProto.getImageData = function(options){
		var imageData = null;
		if (options){
			imageData = pxl.createImageData(options.offset.x, options.offset.y);
			var dataPixel = new pxl.Layout.Layer.Pixel(
				new pxl.ImageDataArray(imageData.data.buffer)
			);
			var otherPixel = new pxl.Layout.Layer.Pixel(this.dataLayer.data);
			var indexes = options.indexes || this.indexesAt(options);
			var length = indexes.length;
			for (var i = 0, j = 0; i < length; ++i){
				dataPixel.index = j;
				otherPixel.index = indexes[i] << 2;
				dataPixel.set(otherPixel);
				j += 4;
			}
		} else{
			imageData = this._imageData;
		}
		return imageData;
	};

	/**
	 * @method getWidth
	 * @return {Number}
	 */
	layoutProto.getWidth = function(){
		return this._imageData.width;
	};

	/**
	 * @method getHeight
	 * @return {Number}
	 */
	layoutProto.getHeight = function(){
		return this._imageData.height;
	};

	/**
	 * @method visibleLayers
	 * @return {Array}
	 */
	layoutProto.visibleLayers = function(){
		var visibleLayers = [];
		var layerList = this.layerList;
		for (var i = 0; i < layerList.length; ++i){
			if (layerList[i].isVisible){
				visibleLayers.push(layerList[i]);
			}
		}
		return visibleLayers;
	};

	/**
	 * @destructor
	 * @method destroy
	 */
	layoutProto.destroy = function(){
		this.dataLayer.destroy();
		this._imageData = this.dataLayer = this.activeLayer = null;
		while (this.layerList.length){
			this.layerList.pop().destroy();
		}
	};
})();