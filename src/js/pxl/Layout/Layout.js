(function(){
	"use strict";

	/**
	 * The main model class.
	 * Contain layers and delegate processing to them.
	 *
	 * @example
		var layout = pxl.Layout(8, 16);
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
	 * @example
		var layer = layout.insertLayer(0); //push to front
	 * @method insertLayer
	 * @param index {Number|undefined} [in] Index where to insert. Or it would be added to top if no index passed.
	 * @return {Layer|null} The newly created layer.
	 */
	layoutProto.insertLayer = function(index){
		var layer = null;
		if (arguments.length){
			if (index >= 0 && index <= this.layerList.length){
				layer = _makeLayer(this);
				this.layerList.splice(index, 0, layer);
			}
		} else{
			layer = _makeLayer(this);
			this.layerList.push(layer);
		}
		return layer;

		//Helper:
		function _makeLayer(self){
			return new Layout.Layer(self.getWidth() * self.getHeight(), self);
		};
	};

	/**
	 * Change an active layer.
	 *
	 * @method setActiveTo
	 * @param index {Number} [in] Index where to apply.
	 * @chainable
	 */
	layoutProto.setActiveTo = function(index){
		if (index >= 0 && index < this.layerList.length){
			this.activeLayer = this.layerList[index];
		}
		return this;
	};

	/**
	 * @method removeAllLayers
	 * @chainable
	 */
	layoutProto.removeAllLayers = function(){
		this.activeLayer = null;
		while (this.layerList.length){
			this.layerList.pop().destroy();
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
		for (var i = 0; i < layerList.length; ++i){
			if (layerList[i] === this.activeLayer){
				layerList.splice(i, 1);
				this.activeLayer.destroy();
				this.activeLayer = null;
				break;
			}
		}
		return this;
	};

	/**
	 * "Drawn" each layer to main dataLayer layer (Back-to-front);
	 * Will use visible layers from "layerList" parameter;
	 * Or visible layers from self's "layerList" property;
	 * Note: if "layerList" is empty or if there are no visible layers the model would be reseted;
	 * Also, notify subscribers.
	 *
	 * @example
		layout.mergeLayers({isNotifyView: true});
	 * @method mergeLayers
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @param options.isNotifyView {Boolean}
	 * @param layerList {Array|undefined} [in] List of layers to merge.
	 * @chainable
	 */
	layoutProto.mergeLayers = function(options, layerList){
		var clonedOpts = {};
		var layers = _getVisibleLayers(layerList || this.layerList);
		var layerCount = layers.length;
		var dataLayer = this.dataLayer;
		if (layerCount === 0){
			dataLayer.reset();
		} else{
			//it's important to disable mix for first layer (force-copy):
			clonedOpts.isMix = false;
			clonedOpts.start = options.start;
			clonedOpts.offset = options.offset;
			for (var i = 0; i < layerCount; ++i){
				clonedOpts.other = layers[i];
				dataLayer.merge(clonedOpts);
				clonedOpts.isMix = true; //other layers have processed properly
			}
		}
		if (options.isNotifyView === true){
			this.observer.notify(Layout.PIXELS_CHANGED_EVENT, options);
		}
		return this;
	};

    /**
     * Replace old colour by new one;
	 * Delegate processing to the activeLayer;
	 * Update the model.
	 *
	 * Look at: pxl.Layout.Layer.replace
	 *
	 * @method replace
	 * @param options {Object} [in]
	 * @chainable
     */
	layoutProto.replace = function(options){
		this.activeLayer.replace(options);
		this.mergeLayers(options);
		return this;
	};

    /**
     * Set pixel or group of pixels (force-fill);
	 * Delegate processing to the activeLayer;
	 * Update the model.
	 *
	 * Look at: pxl.Layout.Layer.set
	 *
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
	 * Delegate processing to the activeLayer;
	 * Update the model.
	 *
	 * Look at: pxl.Layout.Layer.setChannel
	 *
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
	 * Delegate processing to the activeLayer;
	 * Update the model.
	 *
	 * Look at: pxl.Layout.Layer.fill
	 *
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
	 * @example
		var index = layout.indexAt(new pxl.Point(1, 1));
		//in 8x16 layout, an index would be equal to 9
	 */
	layoutProto.indexAt = function(position){
		return (position.x | 0) + (position.y | 0) * this.getWidth();
	};

	/**
	 * Provide position according to index (without offset).
	 *
	 * @method positionFrom
	 * @param index {Number} [in]
	 * @return {Point}
	 * @example
		var position = layout.positionFrom(9);
		//in 8x16 layout, the position would be equal to {x: 1, y: 1}
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
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
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
	 * @method getVisibleLayers
	 * @return {Array}
	 */
	layoutProto.getVisibleLayers = function(){
		return _getVisibleLayers(this.layerList);
	};

	/**
	 * @example
		var options = {start: new pxl.Point(-1, 0), offset: new pxl.Point(100, 100)};
		layout.fixRange(options);
		//in 8x16 layout, the options would fixed to: {start: {x: 0, y: 0},	offset: {x: 8, y: 16}};
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
			var width = this.getWidth();
			var high = options.offset.y | 0;
			var wideOffset = options.offset.x | 0;
			var index = this.indexAt(options.start);
			while (high--){
				callback(index, index + wideOffset);
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
		this._imageData = this.dataLayer = null;
		this.removeAllLayers();
	};


    //Helper:
    function _getVisibleLayers(layerList){
        var getVisibleLayers = [];
		for (var i = 0; i < layerList.length; ++i){
			if (layerList[i].isVisible === true){
				getVisibleLayers.push(layerList[i]);
			}
		}
		return getVisibleLayers;
    };
})();