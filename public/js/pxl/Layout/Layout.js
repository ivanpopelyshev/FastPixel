(function(){
	"use strict";

	/**
	 * pxl.Layout
	 * Call with width and height parameters
	 * or with already existing ImageData as source
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
		 */
		this.layerList = [];

		/**
		 * @property activeLayer
		 * @type {Layer}
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
	 * Append new Layer instance (if possible).
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
	 * Delete active layer (if has at least one).
	 *
	 * @method deleteLayer
	 * @chainable
	 */
	layoutProto.deleteLayer = function(){
		var layerList = this.layerList;
		if (layerList.length === 1){
			layerList[0].reset(); //don't delete the last one
		} else{
			for (var i = 0; i < layerList.length; ++i){
				if (layerList[i] === this.activeLayer){
					layerList.splice(i, 1);
					this.activeLayer = layerList[layerList.length - 1]; //top layer become active
					break;
				}
			}
		}
		return this;
	};

	/**
	 * Each visible layer "drawn" to main dataLayer layer (Back-to-front);
	 * Notify subscribers.
	 *
	 * @param options {Object} [in]
	 * @method mergeLayers
	 * @chainable
	 */
	layoutProto.mergeLayers = function(options){
		options = options || {};
		var clonedOpts = Object.create(options);
		var visibleLayers = this._visibleLayers();
		var layerCount = visibleLayers.length;
		var dataLayer = this.dataLayer;
		if (!layerCount){
			dataLayer.reset();
		} else{
			if ((options.start && options.offset) || options.indexes){
				clonedOpts.other = visibleLayers[0];
				clonedOpts.isMix = false;
				dataLayer.merge(clonedOpts); //copy bottom layer
				clonedOpts.isMix = !!options.isMix;
			} else{
				dataLayer.copy(visibleLayers[0]); //much faster
			}
			for (var i = 1; i < layerCount; ++i){
				clonedOpts.other = visibleLayers[i];
				dataLayer.merge(clonedOpts); //mix other layers
			}
		}
		this.observer.notify(pxl.PIXELS_CHANGED_EVENT, options);
		return this;
	};

    /**
     * Replace old color by new one in an active layer.
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
     * Plot pixel or group of pixels onto active layer.
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
     * Flood fill on an active layer.
	 *
	 * @method fill
	 * @param options {Object} [in]
	 * @chainable
     */
    layoutProto.fill = function(options){
		if (this.activeLayer.fill(options)){
			this.mergeLayers();
		}
		return this;
    };

	/**
	 * @method indexesAt
	 * @param options {Object} [in]
	 * @param options.start {Vector2}
	 * @param options.offset {Vector2}
	 * @return {Array} warn: static array(read-only)
	 */
	layoutProto.indexesAt = (function(){ //anonymous
		var _container = [0];
		return function(options){
			var rContainer = _container; //store reference in current scope
			var start = options.start;
			var x = Math.max(0, options.start.x);
			var y = Math.max(0, options.start.y);
			var width = Math.min(this.getWidth() - 1, options.offset.x);
			var length = width * Math.min(this.getHeight() - 1, options.offset.y);
			var posWrapper = new pxl.Vector2;
			var indexOffset = 0;
			var index = this.indexAt(start);
			rContainer.length = length;
			for (var i = 0; i < length; ++i){
				rContainer[i] = index + indexOffset; //take an index relative to coordinates
				if (++indexOffset >= width){
					indexOffset = 0;
					index = this.indexAt(posWrapper.set(x, ++y));
				}
			}
			return rContainer;
		}
	})();

	/**
	 * Provide an index from position
	 * @method indexAt
	 * @param position {Vector2} [in]
	 * @return {Number}
	 */
	layoutProto.indexAt = function(position){
		return position.x + position.y * this.getWidth();
	};

	/**
	 * Provide position according to index
	 * @method positionFrom
	 * @param index {Number} [in]
	 * @return {Vector2}
	 */
	layoutProto.positionFrom = function(index){
		var width = this.getWidth();
		return new pxl.Vector2(index % width, (index / width) | 0);
	};

	/**
	 * @method getImageData
	 * @return {ImageData}
	 */
	layoutProto.getImageData = function(){
		return this._imageData;
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
	 * @method _visibleLayers
	 * @private
	 * @return {Array}
	 */
	layoutProto._visibleLayers = function(){
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
		this.activeLayer = null;
		for (var i = 0; i < this.layerList.length; ++i){
			this.layerList[i].destroy();
			this.layerList[i] = null;
		}
		Layout.history.clean();
	};
})();