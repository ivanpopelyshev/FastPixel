(function(){
	"use strict";

	/**
	 * Pass width and height parameters;
	 * Or just already existing ImageData as a source.
	 *
	 * @constructor
	 * @class Layout
	 * @param param1 {ImageData|Number} [out]
	 * @param param2 {undefined|Number} [in]
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
		this.dataLayer = new pxl.Layout.Layer(
			this._imageData.data.buffer, this);

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

		Object.seal(this);
	};

	/**
	 * Model event name.
	 *
	 * @property PIXELS_CHANGED_EVENT
	 * @type {String}
	 * @final
	 * @static
	 * @default "pixelsChanged"
	 */
	Layout.PIXELS_CHANGED_EVENT = "pixelsChanged";

	var layoutProto = Layout.prototype;

	/**
	 * Append new Layer instance into the layerList;
	 * activeLayer point on new instance.
	 *
	 * @method appendLayer
	 * @param name {String|undefined} [in]
	 * @chainable
	 */
	layoutProto.appendLayer = function(name){
		this.activeLayer = new Layout.Layer(
			this.getWidth() * this.getHeight(),
			this,
			typeof name === "string" ? name : "Layer " + this.layerList.length
		);
		this.layerList.push(this.activeLayer);
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
		for (var i = 0; i < layerList.length; ++i){
			if (layerList[i] === this.activeLayer){
				layerList.splice(i, 1);
				this.activeLayer.destroy();
				this.activeLayer = (layerList.length === 0
					? null
					: layerList[layerList.length - 1] //top layer become active
				);
				break;
			}
		}
		return this;
	};

	/**
	 * Each visible layer "drawn" to main dataLayer layer (Back-to-front);
	 * Notify subscribers.
	 *
	 * @method mergeLayers
	 * @param options {Object} [in]
	 * @param options.isMix {Boolean}
	 * @param options.start {Point}
	 * @param options.offset {Point}
	 * @param options.isNotifyView {Boolean}
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
			clonedOpts.isMix = false; //it's important to disable mix first time!
			for (var i = 0; i < layerCount; ++i){
				clonedOpts.other = visibleLayers[i];
				dataLayer.merge(clonedOpts);
				clonedOpts.isMix = !!options.isMix; //other layers have processed properly
			}
		}
		if (options.isNotifyView === true){
			this.observer.notify(Layout.PIXELS_CHANGED_EVENT, options);
		}
		return this;
	};

    /**
     * Replace old colour by new one;
	 * delegate processing to the activeLayer.
	 *
	 * @see pxl.Layout.Layer.colorReplace
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
     * Set pixel or group of pixels (force-fill);
	 * delegate processing to the activeLayer.
	 *
	 * @see pxl.Layout.Layer.set
	 * @method set
	 * @param options {Object} [in]
	 * @chainable
     */
	layoutProto.set = function(options){
		this.activeLayer.set(options);
		this.mergeLayers(options);
		return this;
	};

    /**
     * Setting the value for specific channel;
	 * delegate processing to the activeLayer.
	 *
	 * @see pxl.Layout.Layer.setChannel
	 * @method setChannel
	 * @param options {Object} [in]
	 * @chainable
     */
	layoutProto.setChannel = function(options){
		this.activeLayer.setChannel(options);
		this.mergeLayers(options);
		return this;
	};

    /**
     * Flood fill;
	 * delegate processing to the activeLayer.
	 *
	 * @see pxl.Layout.Layer.fill
	 * @method fill
	 * @param options {Object} [in]
	 * @chainable
     */
    layoutProto.fill = function(options){
		this.activeLayer.fill(options);
		this.mergeLayers(options);
		return this;
    };

	/**
	 * Provide an index from position.
	 *
	 * @method indexAt
	 * @param position {Point} [in]
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
	 * @return {Point}
	 */
	layoutProto.positionFrom = function(index){
		var width = this.getWidth();
		return new pxl.Point(index % width, (index / width) | 0);
	};

	/**
	 * Get whole image data or just a part of it (according to options).
	 *
	 * @method getImageData
	 * @param options {Object} [in]
	 * @return {ImageData}
	 */
	layoutProto.getImageData = function(options){
		return (options.start && options.offset
			? this.dataLayer.generateImageData(options)
			: this._imageData //much faster
		);
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
	 * @method getLayersCount
	 * @return {Number}
	 */
	layoutProto.getLayersCount = function(){
		return this.layerList.length;
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
	 * @method fixRange
	 * @param options {Object} [out]
	 * @param options.start {Point}
	 * @param options.offset {Point}
	 * @return {Boolean} False if range can't be fixed.
	 */
	layoutProto.fixRange = function(options){
		var start = options.start;
		var offset = options.offset;
		var width = this.getWidth();
		var height = this.getHeight();

		if (start.x >= width || start.y >= height ||
			offset.x <= 0 || offset.y <= 0) return false; //unfixed things

		if (start.x < 0){
			offset.x -= -start.x;
			start.x = 0;
		}
		if (start.y < 0){
			offset.y -= -start.y;
			start.y = 0;
		}
		if (start.x + offset.x > width){
			offset.x = width - start.x;
		}
		if (start.y + offset.y > height){
			offset.y = height - start.y;
		}

		return !(offset.x <= 0 || offset.y <= 0); //is still bad?
	};

	/**
	 * Warn: for internal usage only!
	 *
	 * @method __process
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @param callback {Function}
	 * @private
	 */
	layoutProto.__process = function(options, callback){
		if (options.start && options.offset){
			var length = 0;
			var high = options.offset.y;
			var width = this.getWidth() << 2;
			var wideOffset = options.offset.x << 2;
			var index = this.indexAt(options.start) << 2;
			for (var i = 0; i < high; ++i){
				length = index + wideOffset;
				callback(index, length);
				index += width;
			}
		} else{
			callback(0, this.dataLayer.data.length);
		}
	};

	/**
	 * Destructor.
	 *
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