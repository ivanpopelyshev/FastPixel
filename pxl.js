;var pxl = (function(document){
	"use strict";

	var _imgDataCtor = null;
	var _isSupported = true;
	var _canvas = null;
	var _ctx = null;

	try{
		_canvas = document.createElement("CANVAS");
		_canvas.width = _canvas.height = 1; //reduce the amount of memory
		_ctx = _canvas.getContext("2d");
		_imgDataCtor = Object.getPrototypeOf( //ES5
			_ctx.getImageData(0,0,1,1).data
		).constructor;
		if (!((new _imgDataCtor).buffer)){
			throw new Error; //Array or CanvasPixelArray doesn't have a buffer
		}
    } catch(err){
		_isSupported = false;
	}

	/**
	 * Main API's "namespace"
	 *
	 * @module pxl
	 * @class pxl
	 * @static
	 */
	return{
		/**
		 * @property MIN_ZOOM_SCALE
		 * @final
		 */
		MIN_ZOOM_SCALE: 1,

		/**
		 * @property MAX_ZOOM_SCALE
		 * @final
		 */
		MAX_ZOOM_SCALE: 64,

		/**
		 * @property MIN_PEN_SIZE
		 * @final
		 */
		MIN_PEN_SIZE: 1,

		/**
		 * @property MAX_PEN_SIZE
		 * @final
		 */
		MAX_PEN_SIZE: 5,

		/**
		 * @property MIN_CANVAS_SIZE
		 * @final
		 */
        MIN_CANVAS_SIZE: 8,

		/**
		 * Strict limitation, but that's enough for pixel-art
		 *
		 * @property MAX_CANVAS_SIZE
		 * @final
		 */
        MAX_CANVAS_SIZE: 1024,

		/**
		 * Maximum layer count per layout
		 *
		 * @property MAX_LAYER_COUNT
		 * @final
		 */
		MAX_LAYER_COUNT: 8,

		/**
		 * @property MAX_HISTORY_SIZE
		 * @final
		 */
		MAX_HISTORY_SIZE: 20,

		/**
		 * View-model event name.
		 *
		 * @property PIXELS_CHANGED_EVENT
		 * @final
		 */
		PIXELS_CHANGED_EVENT: "pixelsChanged",

		/**
		 * @property ImageDataArray
		 * @type {Uint8ClampedArray|Uint8Array|Uint16Array|Uint32Array}
		 */
		ImageDataArray: _imgDataCtor,

		/**
		 * Reference onto the currently active view instance.
		 *
		 * @property activeView
		 * @type {View|null}
		 * @default null
		 */
		activeView: null,

		/**
		 * Is API supported on current browser. Call one before started.
		 *
		 * @method isSupported
		 * @return {Boolean}
		 */
		isSupported: function(){
			return _isSupported;
		},

		/**
		 * Clamp a destination number to min-max borders.
		 *
		 * @method clamp
		 * @param dest {Number}
		 * @param min {Number}
		 * @param max {Number}
		 * @return {Number}
		 */
		clamp: function(dest, min, max){
			return (dest > max ? max : (dest < min ? min : dest));
		},

		/**
		 * @method createImageData
		 * @param {ImageData|Number}
		 * @param {undefined|Number}
		 * @return {ImageData}
		 */
		createImageData: function(){
			return _ctx.createImageData.apply(_ctx, arguments);
		},

		/**
		 * Use this method to create canvas elements.
		 *
		 * @method createCanvas
		 * @return {HTMLCanvasElement}
		 */
		createCanvas: function(){
			return _canvas.cloneNode();
		}
	};
})(document);
;(function(parent){
    "use strict";

	if (!parent){
		return;
	}

    /**
     * @constructor
	 * @class Vector2
     * @param x {Number|undefined}
     * @param y {Number|undefined}
     */
    var Vector2 = parent.Vector2 = function(x, y){
        this.set(x || 0, y);

		/**
		 * @property x
		 * @type {Number}
		 * @default 0
		 */

		/**
		 * @property y
		 * @type {Number}
		 * @default 0
		 */
    };

	/**
	 * Floating point error for comparison method.
	 *
	 * @static
	 * @type {Number}
	 */
	Vector2.EPSILON = 1e-10;

    var vector2Proto = Vector2.prototype;

	/**
	 * Return string is JSON format.
	 *
	 * @method toString
	 * @return {String}
	 */
	vector2Proto.toString = function(){
		return '{"x":' + this.x + ',"y":' + this.y + '}';
	};

	/**
	 * Add two Vector2 instances;
	 * or add Vector2 instance and numbers.
	 *
	 * @method add
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.add = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x += param1.x;
            this.y += param1.y;
        } else{
            this.x += param1;
            this.y += (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Substrust one Vector2 instance from another;
	 * or substrust number from Vector2 instance.
	 *
	 * @method sub
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.sub = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x -= param1.x;
            this.y -= param1.y;
        } else{
            this.x -= param1;
            this.y -= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Multiply two Vector2 instances;
	 * or multiply Vector2 instance by numbers.
	 *
	 * @method mul
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.mul = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x *= param1.x;
            this.y *= param1.y;
        } else{
            this.x *= param1;
            this.y *= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Divide one Vector2 instance by another;
	 * or divide Vector2 instance by numbers.
	 *
	 * @method div
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.div = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x /= param1.x;
            this.y /= param1.y;
        } else{
            this.x /= param1;
            this.y /= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Copy Vector2 instance;
	 * or set new values for Vector2 instance.
	 *
	 * @method set
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.set = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x = param1.x;
            this.y = param1.y;
        } else{
            this.x = param1;
            this.y = (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Compare two Vector2 instances
	 * or compare Vector2 instance properties with numbers.
	 *
	 * @method cmp
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @retun {Boolean}
     */
    vector2Proto.cmp = function(param1, param2){
		var EPSILON = Vector2.EPSILON;
        if (param1 instanceof Vector2){
            return (Math.abs(this.x - param1.x) < EPSILON &&
                    Math.abs(this.y - param1.y) < EPSILON);
        }
        return (
			Math.abs(this.x - param1) < EPSILON &&
			Math.abs(
				this.y - (typeof param2 === "number" ? param2 : param1)
			) < EPSILON
		);
    };

	/**
	 * Make Vector2 instance properties absolute.
	 *
	 * @method abs
	 * @chainable
	 */
	vector2Proto.abs = function(){
		if (this.x < 0){
			this.x = -this.x;
		}
		if (this.y < 0){
			this.y = -this.y;
		}
		return this;
	};

	/**
	 * Make Vector2 instance properties negative.
	 *
	 * @method neg
	 * @chainable
	 */
	vector2Proto.neg = function(){
		if (this.x >= 0){
			this.x = -this.x;
		}
		if (this.y >= 0){
			this.y = -this.y;
		}
		return this;
	};

	/**
	 * Swap properties between Vector2 instances.
	 *
	 * @method swap
	 * @param other {Vector2}
	 * @chainable
	 */
	vector2Proto.swap = function(other){
		var tmp = other.x;
		other.x = this.x;
		this.x = tmp;
		tmp = other.y;
		other.y = this.y;
		this.y = tmp;
		return this;
	};

	/**
	 * Round down Vector2 instance properties.
	 *
	 * @method floor
	 * @chainable
	 */
	vector2Proto.floor = function(){
		this.x = _floor(this.x);
		this.y = _floor(this.y);
		return this;
	};

	/**
	 * Round up Vector2 instance properties.
	 *
	 * @method ceil
	 * @chainable
	 */
	vector2Proto.ceil = function(){
		this.x = _ceil(this.x);
		this.y = _ceil(this.y);
		return this;
	};

	/**
	 * Round Vector2 instance properties.
	 *
	 * @method round
	 * @chainable
	 */
	vector2Proto.round = function(){
		this.x = _round(this.x);
		this.y = _round(this.y);
		return this;
	};

	/**
	 * Check for NaN value inside properties.
	 *
	 * @method hasNaN
	 * @return {Boolean}
	 */
	vector2Proto.hasNaN = function(){
		return this.x !== this.x || this.y !== this.y;
	};

	/**
	 * Check for Infinity value inside properties.
	 *
	 * @method hasInfinity
	 * @return {Boolean}
	 */
	vector2Proto.hasInfinity = function(){
		return !isFinite(this.x) || !isFinite(this.y);
	};

    /**
	 * Return new Vector2 instance with same properties.
	 *
	 * @method clone
     * @return {Vector2}
     */
	vector2Proto.clone = function(){
		return new Vector2(this);
	};

	//Helpers:

	//correctly floor down if negative
	function _floor(n){
		return (n < 0 ? (n | 0) - 1 : n | 0);
	};

	//faster than Math.round
	function _round(n){
		return (n + 0.5) | 0;
	};

	//
	function _ceil(n){
		return (n === (n | 0) ? n : (n | 0) + 1);
	};
})(pxl);
;(function(parent){
    "use strict";

	if (!parent){
		return;
	}

    /**
	 * Simple observer-pattern implementation.
	 *
     * @constructor
	 * @class Observer
     */
    var Observer = parent.Observer = function(){
		/**
		 * @property _eventBook
		 * @private
		 * @type {Object}
		 * @default {}
		 */
        this._eventBook = {};
    };

    var observerProto = Observer.prototype;

    /**
	 * @method subscribe
     * @param event {String} [in] Name of event.
     * @param method {Function} [out] The method to execute when event is fired.
     */
    observerProto.subscribe = function(event, method){
        if (event in this._eventBook){
            var list = this._eventBook[event];
			if (list.indexOf(method) === -1){
				list.push(method);
			}
        } else{
			this._eventBook[event] = [method];
		}
    };

    /**
	 * @method unsubscribe
     * @param event {String} [in] Name of event.
     * @param method {Function} [in] Have to be same reference as in subscribe method.
     */
    observerProto.unsubscribe = function(event, method){
        if (event in this._eventBook){
            var list = this._eventBook[event];
            var index = list.indexOf(method);
            if (index !== -1){
                list.splice(index, 1);
            }
        }
    };

    /**
	 * @method notify
     * @param event {String} [in][in] Name of event.
     * @param eventObj {Object} [in/out] Special event data.
     */
    observerProto.notify = function(event, eventObj){
        if (event in this._eventBook){
            var list = this._eventBook[event];
            for (var i = 0; i < list.length; ++i){
                list[i](eventObj); //callback
            }
        }
    };
})(pxl);
;(function(parent){
	"use strict";

	if (!parent){
		return;
	}

	/**
	 * Warn: this container is for primitive types only (Boolean, Number, String);
	 * For performance reason it also don't check for types during push(),
	 * so make sure you push same type as you set in constructor;
	 * Grows up as usual array but this one is better to re-use (GC friendly).
	 *
	 * @constructor
	 * @class PrimitivePool
	 * @param ctor {String|Number|Boolean} [in]
	 */
	var PrimitivePool = parent.PrimitivePool = function(ctor){
		/**
		 * @property _container
		 * @private
		 * @type {Array}
		 */
		this._container = [typeof ctor === "function" ? ctor() : ctor]; //tell interpreter which type we going to use

		/**
		 * @property _size
		 * @private
		 * @type {Number}
		 * @default 0
		 */
		this._size = 0;
	};

	var poolProto = PrimitivePool.prototype;

	/**
	 * Get the current pool's "occupancy".
	 *
	 * @method size
	 * @return {Number}
	 */
	poolProto.size = function(){
		return this._size;
	};

	/**
	 * @method push
	 * @param primitive {String|Number|Boolean} [in]
	 */
	poolProto.push = function(primitive){
		if (this._size === this._container.length){
			this._size = this._container.push(primitive);
		} else{
			this._container[this._size++] = primitive;
		}
	};

	/**
	 * Pop the last available element (or null if pool is empty).
	 *
	 * @method pop
	 * @return {String|Number|Boolean|null}
	 */
	poolProto.pop = function(){
		return (this._size === 0 ? null : this._container[--this._size]);
	};

	/**
	 * Get available element by index (or null if index is out of size).
	 *
	 * @method at
	 * @param index {Number} [in]
	 * @return {String|Number|Boolean|null}
	 */
	poolProto.at = function(index){
		return (index < this._size || index < 0 ? this._container[index] : null);
	};

	/**
	 * Get the last available element (or null if pool is empty).
	 *
	 * @method back
	 * @return {String|Number|Boolean|null}
	 */
	poolProto.back = function(){
		return (this._size === 0 ? null : this._container[this._size - 1]);
	};

	/**
	 * Completely reduce size (memory is still occupied).
	 *
	 * @method reduce
	 */
	poolProto.reduce = function(){
		this._size = 0;
	};

	/**
	 * Reduce unused memory.
	 *
	 * @method shrink
	 */
	poolProto.shrink = function(){
		this._container.length = this._size;
	};

	/**
	 * Deallocate whole data.
	 *
	 * @method free
	 */
	poolProto.free = function(){
		this._container.length = this._size = 0;
	};
})(pxl);
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
(function(){
	"use strict";

	/**
	 * pxl.Layout.Layer.Pixel
	 *
	 * @constructor
	 * @class Pixel
	 * @param data {ImageDataArray} [out] warn: size of an array have to be at least 4
	 * @param index {Number|undefined} [in]
	 */
	var Pixel = pxl.Layout.Layer.Pixel = function(data, index){
		/**
		 * @property data
		 * @type {ImageDataArray}
		 */
		this.data = data;

		/**
		 * @property index
		 * @type {Number}
		 * @default 0
		 */
		this.index = index || 0;
	};

	var pixelProto = Pixel.prototype;

	/**
	 * @method toString
	 * @return {String} "r,g,b,a"-like format
	 */
	pixelProto.toString = function(){
		var data = this.data;
		var index = this.index;
		return (data[index] + "," +		//r
				data[++index] + "," +	//g
				data[++index] + "," +	//b
				data[++index]);			//a
	};

	/**
	 * @method compare
	 * @param other {Pixel|ImageDataArray|Array} [in]
	 * @return {Boolean}
	 */
	pixelProto.compare = function(other){
		var data = this.data;
		var index = this.index;
		var otherData = other.data || other;
		var otherIndex = other.index || 0;
		return (data[index] === otherData[otherIndex] && 		//r
				data[++index] === otherData[++otherIndex] && 	//g
				data[++index] === otherData[++otherIndex] && 	//b
				data[++index] === otherData[++otherIndex]);		//a
	};

	/**
	 * @method isOpaque
	 * @return {Boolean}
	 */
	pixelProto.isOpaque = function(){
		return this.data[this.index + 3] === 255;
	};

	/**
	 * @method isTransparent
	 * @return {Boolean}
	 */
	pixelProto.isTransparent = function(){
		return this.data[this.index + 3] === 0;
	};

	/**
	 * @method set
	 * @param other {Pixel|ImageDataArray|Array} [in]
	 */
	pixelProto.set = function(other){
		var data = this.data;
		var index = this.index;
		var otherData = other.data || other;
		var otherIndex = other.index || 0;
		data[index] = otherData[otherIndex];		//r
		data[++index] = otherData[++otherIndex];	//g
		data[++index] = otherData[++otherIndex];	//b
		data[++index] = otherData[++otherIndex];	//a
	};

	/**
	 * Mix two pixels from dest and src ImageDataArray containers
	 *
	 * @see http://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
	 * @method mix
	 * @param other {Pixel|ImageDataArray|Array} [in]
	 */
	pixelProto.mix = function(other){
		var data = this.data;
		var index = this.index;
		var otherData = other.data || other;
		var otherIndex = other.index || 0;

		var otherA = otherData[otherIndex + 3];
		if (otherA === 0){ //other ref is transparent
			return;
		}

        var thisA = data[index + 3];
		if (otherA === 255 || thisA === 0){
			this.set(other); //just copy, don't mix
			return;
		}

		thisA /= 255.0; //cast alpha channel to 0.0..1.0 format
		otherA /= 255.0;
		var aMul = thisA * (1 - otherA);
		var a = otherA + aMul; //new alpha
		var op1 = otherA / a;
		var op2 = aMul / a;
		data[index] = data[index++] * op1 + otherData[otherIndex + 0] * op2; //r
		data[index] = data[index++] * op1 + otherData[otherIndex + 1] * op2; //g
		data[index] = data[index++] * op1 + otherData[otherIndex + 2] * op2; //b
		data[index] = a * 255;	//a
	};
})();
(function(){
	"use strict";

	/**
	 * pxl.Layout.View
	 *
	 * @constructor
	 * @class View
	 * @param options {Object} [in]
	 * @param options.buffer {CanvasRenderingContext2D}
	 * @param options.ctx {CanvasRenderingContext2D}
	 * @param options.layout {Layout}
	 * @param options.isOwner {Boolean}
	 */
	var View = pxl.Layout.View = function(options){
		/**
		 * @property _buffer
		 * @private
		 * @type {CanvasRenderingContext2D}
		 */
		this._buffer = options.buffer;

		/**
		 * @property _ctx
		 * @private
		 * @type {CanvasRenderingContext2D}
		 */
		this._ctx = options.ctx;

		/**
		 * @property _layoutOwner
		 * @private
		 * @type {Boolean}
		 */
		this._layoutOwner = options.isOwner;

		/**
		 * @property _imagePoint
		 * @private
		 * @type {Vector2}
		 */
		this._imagePoint = new pxl.Vector2(0);

		/**
		 * @property _scale
		 * @private
		 * @type {Number}
		 */
		this._scale = pxl.MIN_ZOOM_SCALE;

		/**
		 * @property _layout
		 * @private
		 * @type {Layout}
		 */
		this._layout = options.layout;

		/**
		 * @property _boundedRender
		 * @private
		 * @type {Function}
		 */
		this._subscribe();
	};

	/**
	 * Simple factory-like method
	 * Take care about view creating and DOM manipulations
	 * Also put new instance into static "instances" list
	 *
	 * @static
	 * @method create
	 * @param options {Object} [in]
	 * @return {View}
	 */
	View.create = function(options){
		var canvas = null;
		var bufferCanvas = null;
		var layout = null;
		var isOwner = true;
		if (options.element){
			if (options.element.nodeName.toUpperCase() === "CANVAS"){
				canvas = options.element
			} else{
				canvas = options.element.appendChild(pxl.createCanvas());
			}
		} else{
			canvas = document.body.appendChild(pxl.createCanvas());
		}
		if (options.source){
			bufferCanvas = options.src._buffer.canvas;
			layout = options.src._layout;
			isOwner = false;
		} else{
			bufferCanvas = pxl.createCanvas();
			bufferCanvas.width = pxl.clamp(
				options.canvasSize.width,
				pxl.MIN_CANVAS_SIZE, pxl.MAX_CANVAS_SIZE
			);
			bufferCanvas.height = pxl.clamp(
				options.canvasSize.height,
				pxl.MIN_CANVAS_SIZE, pxl.MAX_CANVAS_SIZE
			);
			layout = new pxl.Layout(
				bufferCanvas.width, bufferCanvas.height
			).appendLayer();
		}
		var view = new View({
			"buffer": _setupContext(bufferCanvas.getContext("2d")),
			"ctx": _setupContext(canvas.getContext("2d")),
			"isOwner": isOwner,
			"layout": layout
		});
		View.instances.push(view);
		return view;
	};

	/**
	 * List of all existing View instances
	 *
	 * @property instances
	 * @static
	 * @type {Array}
	 */
	View.instances = [];

	var viewProto = View.prototype;
 
	/**
	 * Update imageData and draw.
	 *
	 * @method render
	 * @param options {Object|undefined}
	 * @chainable
	 */
	viewProto.render = function(options){
		options = options || {};
		return this.clear(options).update(options).redraw(options);
	};

	/**
	 * @method drawRect
	 * @param options {Object} [in]
	 * @param options.start {Vector2}
	 * @param options.offset {Vector2}
	 * @param options.pixel {ImageDataArray}
	 * @chainable
	 */
	viewProto.drawRect = function(options){
		var pixel = options.pixel;
		this._ctx.fillStyle = "rgba(" +
			pixel[0] + "," + 	//r
			pixel[1] + "," + 	//g
			pixel[2] + "," + 	//b
			(pixel[3] / 255) +	//a
		")";
		this._ctx.fillRect(
			options.start.x + this._imagePoint.x,
			options.start.y + this._imagePoint.y,

			options.offset.x, options.offset.y
		);
		return this;
	};

	/**
	 * Just redraw old/previous imageData.
	 *
	 * @method redraw
	 * @param options {Object} [in]
	 * @param options.start {Vector2}
	 * @param options.offset {Vector2}
	 * @chainable
	 */
	viewProto.redraw = function(options){
		if (options.start && options.offset){
			this._ctx.drawImage(
				this._buffer.canvas,
				options.start.x, options.start.y, //from
				options.offset.x, options.offset.y,

				options.start.x + this._imagePoint.x, //to
				options.start.y + this._imagePoint.y,

				options.offset.x, options.offset.y
			);
		} else{
			this._ctx.drawImage(
				this._buffer.canvas,
				this._imagePoint.x, this._imagePoint.y
			);
		}
		return this;
	};

	/**
	 * @method clear
	 * @param options {Object} [in]
	 * @param options.start {Vector2}
	 * @param options.offset {Vector2}
	 * @chainable
	 */
	viewProto.clear = function(options){
		if (options.start && options.offset){
			this._ctx.clearRect(
				options.start.x + this._imagePoint.x,
				options.start.y + this._imagePoint.y,

				options.offset.x, options.offset.y
			);
		} else{
			this._ctx.clearRect(
				0, 0, this._ctx.canvas.width, this._ctx.canvas.height
			);
		}
		return this;
	};

	/**
	 * Update the buffer from layout.
	 *
	 * @method update
	 * @param options {Object} [in]
	 * @param options.start {Vector2}
	 * @param options.offset {Vector2}
	 * @chainable
	 */
	viewProto.update = function(options){
		if (this._layout && this._layoutOwner){
			if (options.start && options.offset){
				this._buffer.putImageData(
					this._layout.getImageData(
						options.start.x, options.start.y,
						options.offset.x, options.offset.y
					),
					0, 0
				);
			} else{
				this._buffer.putImageData(this._layout.getImageData(), 0, 0);
			}
		}
		return this;
	};

	/**
	 * Transform canvas to scale offset.
	 *
	 * @method begin
	 * @chainable
	 */
	viewProto.begin = function(){
		var scale = this._scale;
		var ctx = this._ctx;
		ctx.save();
		ctx.translate(
			_offset(scale, this._ctx.canvas.width),
			_offset(scale, this._ctx.canvas.height)
		);
		ctx.scale(scale, scale);
		return this;
	};

	/**
	 * Restore.
	 *
	 * @method end
	 * @chainable
	 */
	viewProto.end = function(){
		this._ctx.restore();
		return this;
	};

	/**
	 * @method getBufferContext
	 * @return {CanvasRenderingContext2D}
	 */
	viewProto.getBufferContext = function(){
		return this._buffer;
	};

	/**
	 * @method getScale
     * @return {Number}
     */
    viewProto.getScale = function(){
        return this._scale;
    };

	/**
	 * @method getElement
     * @return {HTMLCanvasElement}
     */
    viewProto.getElement = function(){
        return this._ctx.canvas;
    };

	/**
	 * @method getLayout
     * @return {Layout}
     */
    viewProto.getLayout = function(){
        return this._layout;
    };

	/**
	 * @method getImagePoint
	 * @return {Vector2}
	 */
	viewProto.getImagePoint = function(){
		return this._imagePoint;
	};

	/**
	 * @method getScaleOffset
	 * @return {Vector2}
	 */
	viewProto.getScaleOffset = function(){
		return new pxl.Vector2(
			_offset(this._scale, this._ctx.canvas.width),
			_offset(this._scale, this._ctx.canvas.height)
		);
	};

	/**
	 * Change current scale rate value.
	 *
	 * @method setScale
	 * @param scale {Number} [in]
	 * @chainable
	 */
	viewProto.setScale = function(scale){
		this._scale = pxl.clamp(scale, pxl.MIN_ZOOM_SCALE, pxl.MAX_ZOOM_SCALE);
		return this;
	};

	/**
	 * @method setLayout
	 * @param otherLayout {Layout} [in]
	 * @chainable
	 */
	viewProto.setLayout = function(otherLayout){
		var instances = View.instances;
		this.deleteLayout();
		this._layout = otherLayout; //set to new one
		this._subscribe();
		this._layoutOwner = true;
		for (var i = 0; i < instances.length; ++i){
			if (instances[i] !== this && //looking for same layout
				otherLayout === instances[i]._layout){
				this._layoutOwner = false;
				break;
			}
		}
		return this;
	};

	/**
	 * @method setImagePoint
	 * @param x {Number} [in]
	 * @param y {Number} [in]
	 * @chainable
	 */
	viewProto.setImagePoint = function(x, y){
		return this.fitToTransition(this._imagePoint.set(x, y));
	};

	/**
	 * @method fitToTransition
	 * @param position {Vector2} [out]
	 * @chainable
	 */
	viewProto.fitToTransition = function(position){
		position.sub(this.getScaleOffset())
		.div(this._scale)
		.floor();
		return this;
	};

	/**
     * Resize and redraw.
	 *
	 * @method resizeElement
	 * @param width {Number}
	 * @param height {Number}
	 * @chainable
     */
    viewProto.resizeElement = function(width, height){
		this._ctx.canvas.style.width = width + "px";
		this._ctx.canvas.style.height = height + "px";
		this._ctx.canvas.width = width;
		this._ctx.canvas.height = height;
		_setupContext(this._ctx);
		return this.redraw({});
    };

	/**
	 * @method deleteLayout
	 * @chainable
	 */
	viewProto.deleteLayout = function(){
		var instances = View.instances;
		this._unsubscribe();
		if (this._layout && this._layoutOwner){
			for (var i = 0; i < instances.length; ++i){
				if (this._layout === instances[i]._layout){
					instances[i]._layout = null;
				}
			}
			this._layout.destroy();
			this._layout = null;
		}
		return this;
	};

    /**
     * Subscribe on events that fired when model (layout) has been changed.
	 *
	 * @method _subscribe
	 * @private
	 * @chainable
     */
    viewProto._subscribe = function(){
        if (!this._layout || this._boundedRender){
			return;
		}
		this._boundedRender = this.render.bind(this);
		this._layout.observer.subscribe(
			pxl.PIXELS_CHANGED_EVENT, this._boundedRender
		);
		return this;
    };

    /**
     * Unsubscribe from all events.
	 *
	 * @method _unsubscribe
	 * @private
	 * @chainable
     */
    viewProto._unsubscribe = function(){
		if (!this._layout){
			return;
		}
		this._layout.observer.unsubscribe(
			pxl.PIXELS_CHANGED_EVENT, this._boundedRender
		);
		this._boundedRender = null;
		return this;
    };

	/**
	 * @destructor
	 * @method destroy
	 */
	viewProto.destroy = function(){
		var instances = View.instances;
		this.deleteLayout();
		for (var i = 0; i < instances.length; ++i){
			if (this === instances[i]){
				instances.splice(i, 1);
				break;
			}
		}
	};

	//Helper
	//Disable default image smoothing
	function _setupContext(dest){
		if ("imageSmoothingEnabled" in dest){
			dest.imageSmoothingEnabled = false;
		} else if ("webkitImageSmoothingEnabled" in dest){
			dest.webkitImageSmoothingEnabled = false;
		} else if ("mozImageSmoothingEnabled" in dest){
			dest.mozImageSmoothingEnabled = false;
		} else if ("msImageSmoothingEnabled" in dest){
			dest.msImageSmoothingEnabled = false;
		}
		return dest;
	};

	//Helper
	function _offset(scale, side){
		return (side * (1 - scale)) >> 1;
	}
})();
(function(){
    "use strict";

	/**
	 * @class history
	 */
	pxl.Layout.history = {
		/**
		 * @property _MAX_TEMPORARY_STORAGE_SIZE
		 * @private
		 * @type {Number}
		 * @final
		 */
		_MAX_TEMPORARY_STORAGE_SIZE: 5,

		/**
		 * @property _container
		 * @private
		 * @type {Array}
		 */
		_container: [], //history stack

		/**
		 * Point on the current index in container
		 *
		 * @property _pointer
		 * @private
		 * @type {Number}
		 * @default 0
		 */
		_pointer: 0,

		/**
		 * @property _isRecording
		 * @private
		 * @type {Boolean}
		 * @default false
		 */
		_isRecording: false,

		/**
		 * Contain just used index pools
		 *
		 * @property _tempPoolStorage
		 * @private
		 * @type {Array}
		 */
		_tempPoolStorage: [],

		/**
		 * @property lastSession
		 * @private
		 * @type {Object|null}
		 * @default null
		 */
        lastSession: null,

		/**
		 * @method undo
		 */
		undo: function(){
			if (this._pointer){
				this._rewrite(this._container[--this._pointer]);
			}
		},

		/**
		 * @method redo
		 */
		redo: function(){
			if (this._pointer < this._container.length){
				this._rewrite(this._container[this._pointer++]);
			}
		},

		/**
		 * Take pixel colour from layer (lastSession's member)
		 * Save in history
		 *
		 * @method cache
		 * @param pixel {Pixel}
		 */
		cache: function(pixel){
			if (this._isRecording){
				var pixelMap = this.lastSession.pixelMap;
				var color = pixel.toString();
				if (!(color in pixelMap)){
					this.lastSession.assoc.push(color);
					pixelMap[color] = (this._tempPoolStorage.length
						? this._tempPoolStorage.pop() //re-use index pools
						: new pxl.PrimitivePool(Number)
					);
				}
				pixelMap[color].push(pixel.index);
			}
		},

		/**
		 * @method isEmptySession
		 * @return {Boolean}
		 */
		isEmptySession: function(){
			for (var _ in this._container[this._pointer].pixelMap){
				return true;
			}
			return false;
		},

		/**
		 * Start recording the Layer
		 *
		 * @method rec
		 * @param layer {Layer|undefined}
		 */
		rec: function(layer){
			if (!this.lastSession){
				this.lastSession = {
					"pixelMap": {},
					"assoc": [],
					"layer": layer
				};
			}
			this._isRecording = true;
		},

		/**
		 * Stop recording the current Layer and save it's pixels
		 *
		 * @method stop
		 */
		stop: function(){
			if (!this.lastSession.assoc.length){
				return; //empty session (no colours in assoc queue)
			}

			var key = "";
			var pixelMap = this.lastSession.pixelMap;
			for (key in pixelMap){
				pixelMap[key].shrink(); //reduce unnecessary memory using
			}

			if (this._pointer < pxl.MAX_HISTORY_SIZE){ //prevent overflow
				this._container[this._pointer++] = this.lastSession;
				this._container.splice(this._pointer, this._container.length);
				this.lastSession = null;
			} else{
				this._container.push(this.lastSession);
				this.lastSession = this._container.shift();
			}

			if (this.lastSession &&
				this._tempPoolStorage.length < this._MAX_TEMPORARY_STORAGE_SIZE){
				pixelMap = this.lastSession.pixelMap;
				for (key in pixelMap){
					pixelMap[key].reduce();
					this._tempPoolStorage.push(pixelMap[key]); //take index pools for next re-use
				}
			}

			this.lastSession = null;
			this._isRecording = false;
		},

		/**
		 * @method getCurrentSession
		 * @return {Object|null}
		 */
		getCurrentSession: function(){
			if (this._container.length){
				return (this._pointer
					? this._container[this._pointer - 1]
					: this._container[this._pointer]
				);				
			}
			return null;
		},

		/**
		 * Remove sessions with deleted layers
		 *
		 * @method clean
		 */
		clean: function(){
			var container = this._container;
			for (var i = 0; i < container.length; ++i){
				if (!container[i].layer || container[i].layer.data === null){
					container.splice(i, 1);
				}
			}
		},

		/**
		 * Used by undo and redo methods
		 *
		 * @method _rewrite
		 * @private
		 * @param session {Object}
		 */
		_rewrite: function(session){
			var pixel = new pxl.Layout.Layer.Pixel(session.layer.data);
			var tokenPixel = new pxl.ImageDataArray(4);
			var pixelMap = session.pixelMap;
			var indexes = null;
			var length = 0;
			var i = 0;
			var swapedPixelMap = {};
			var swappedAssoc = [];
			var usedIndexes = [];
			var tokenIndex = 0;
			var color = "";
			while (session.assoc.length){
				color = session.assoc.pop();
				tokenPixel.set(color.split(","));
				indexes = pixelMap[color]._container; //god forgive me!
				length = pixelMap[color].size();
				for (i = 0; i < length; ++i){
					tokenIndex = pixel.index = indexes[i];

					//swap current pixel's colour with another one
					if (!(tokenIndex in usedIndexes)){
						usedIndexes[tokenIndex] = false; //mark index as already used
						color = pixel.toString();
						if (!(color in swapedPixelMap)){
							swappedAssoc.push(color);
							swapedPixelMap[color] = (this._tempPoolStorage.length
								? this._tempPoolStorage.pop() //re-use index pools
								: new pxl.PrimitivePool(Number)
							);
						}
						swapedPixelMap[color].push(tokenIndex);
					}

					pixel.set(tokenPixel);
				}
			}
			session.pixelMap = swapedPixelMap;
			session.assoc = swappedAssoc;
		},
	};
})();
(function(){
	"use strict";

	var history = pxl.Layout.history;

	/**
	 * @class controller
	 */
	pxl.Layout.controller = {

		/**
		 * @property _settings
		 * @private
		 * @type {Object}
		 */
		_settings: {
			"current": new pxl.Vector2,
			"previous": new pxl.Vector2,
			"pixel": new pxl.ImageDataArray([0, 0, 0, 255]), //black
			"pixelSize": pxl.MIN_PEN_SIZE
		},

		/**
		 * @method updateUserPosition
		 * @param x {Number}
		 * @param y {Number}
		 * @chainable
		 */
		updateUserPosition: function(x, y){
			this._settings.previous.set(this._settings.current);
			this._settings.current.set(x, y).abs().floor();
			return this;
		},

		/**
		 * Put the position where plot the pixel;
		 * If there are no parameters,
		 * the position would be taken from last updated user position.
		 *
		 * @see updateUserPosition
		 * @method plotPixel
		 * @param x {Number|undefined}
		 * @param y {Number|undefined}
		 */
		plotPixel: (function(){ //anonymous
			var _options = {
				"start": new pxl.Vector2,
				"offset": new pxl.Vector2,
				"pixel": null,
				"isMix": true
			};
			return function(x, y){
				if (arguments.length){
					_options.start.set(x, y);
				} else{
					_options.start.set(this._settings.current);
				}				
				_options.offset.set(this._settings.pixelSize);
				_options.pixel = this._settings.pixel;
				pxl.activeView.getLayout().plot(_options);
			};
		})(),

		/**
		 * Bresenham algo: http://members.chello.at/easyfilter/bresenham.js
		 * Put the start and end positions to plot the line;
		 * If there are no parameters,
		 * the start and end would be taken from last updated user position.
		 *
		 * @see updateUserPosition()
		 * @method plotLine
		 * @param x0 {Number|undefined}
		 * @param y0 {Number|undefined}
		 * @param x1 {Number|undefined}
		 * @param y1 {Number|undefined}
		 */
		plotLine: function(x0, y0, x1, y1){
			if (!arguments.length){
				x0 = this._settings.current.x;
				y0 = this._settings.current.y;
				x1 = this._settings.previous.x;
				y1 = this._settings.previous.y;
			}
			var dx = Math.abs(x1 - x0);
			var dy = -Math.abs(y1 - y0);
			var sx = x0 < x1 ? 1 : -1;
			var sy = y0 < y1 ? 1 : -1;
			var err = dx + dy;
			var e2 = 0;
			for (;;){
				this.plotPixel(x0, y0);
				if (x0 === x1 && y0 === y1) break;
				e2 = err + err;
				if (e2 >= dy){
					err += dy;
					x0 += sx;
				}
				if (e2 <= dx){
					err += dx;
					y0 += sy;
				}
			}
		},

		/**
		 * Put the position where you are going to fill;
		 * If there are no parameters,
		 * the position would be taken from last updated user position.
		 *
		 * @see updateUserPosition
		 * @method fill
		 * @param x {Number}
		 * @param y {Number}
		 */
		fill: function(x, y){
			var position = null;
			if (arguments.length){
				position = new pxl.Vector2(x, y);
			} else{
				position = new pxl.Vector2(this._settings.current);
			}
			pxl.activeView.fitToTransition(position);
			//position.sub(pxl.activeView.getImagePoint());
			pxl.activeView.getLayout().fill({
				"position": position,
				"pixel": this._settings.pixel,
				"isMix": true
			});
		},

		/**
		 * Carry the current pixel according to "userHolder" object.
		 *
		 * @method carryPixel
		 * @chainable
		 */
		carryPixel: (function(){ //anonymous
			var _options = {
				"start": new pxl.Vector2,
				"offset": new pxl.Vector2(pxl.MIN_PEN_SIZE),
				"pixel": null
			};
			return function(){
				var activeView = pxl.activeView;
				var scaleOffset = activeView.getScaleOffset();
				var scale = activeView.getScale();

				activeView.fitToTransition(
					_options.start.set(this._settings.previous)
				);
				_options.start.sub(activeView.getImagePoint());

				activeView
				.clear(_options)
				.redraw(_options);

				_options.offset.set(this._settings.pixelSize); //update offset

				activeView.fitToTransition(
					_options.start.set(this._settings.current)
				);
				_options.start.sub(activeView.getImagePoint());

				_options.pixel = this._settings.pixel;
				activeView.drawRect(_options);

				return this;
			}
		})(),

		/**
		 * @method undo
		 * @chainable
		 */
		undo: _undo_redo("undo"),

		/**
		 * @method redo
		 * @chainable
		 */
		redo: _undo_redo("redo"),

		/**
		 * @method rescale
		 * @param ds {Number} deltascale
		 * @chainable
		 */
		rescale: function(ds){
			var options = {};
			pxl.activeView.clear(options)
			.setScale(pxl.activeView.getScale() + ds)
			.begin()
			.redraw(options)
			.end();
			return this;
		},

		/**
		 * @method setPixelSize
		 * @param newSize {Number}
		 * @chainable
		 */
		setPixelSize: function(newSize){
			this._settings.pixelSize = pxl.clamp(
				newSize, pxl.MIN_PEN_SIZE, pxl.MAX_PEN_SIZE
			);
			return this;
		},

		/**
		 * @method setColor
		 * @param r {Number}
		 * @param g {Number}
		 * @param b {Number}
		 * @param a {Number}
		 * @chainable
		 */
		setColor: function(r, g, b, a){
			this._settings.pixel.set(Array.prototype.slice.call(arguments));
			return this;
		},

		/**
		 * @method record
		 * @param callback {Function}
		 * @chainable
		 */
		record: function(callback){
			history.rec(pxl.activeView.getLayout().activeLayer);
			callback.call(this);
			history.stop();
			return this;
		},

		/**
		 * @method draw
		 * @param callback {Function}
		 * @chainable
		 */
		draw: function(callback){
			pxl.activeView.begin();
			callback.call(this);
			pxl.activeView.end();
			return this;
		}
	};

	//Helper:
	function _undo_redo(_method){ //anonymous
		return function(){
			var session = history.getCurrentSession();
			if (session){
				history[_method]();
				session.layer.getLayout().mergeLayers().observer.notify(
					pxl.PIXELS_CHANGED_EVENT, {}
				);
			}
			return pxl.Layout.controller;
		};
	}
})();