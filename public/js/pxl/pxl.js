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
			_ctx.getImageData(0, 0, 1, 1).data
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
	 * @main pxl
	 * @author Kurz Studious
	 */
	return{
		/**
		 * @property MIN_ZOOM_SCALE
		 * @type {Number}
		 * @final
		 */
		MIN_ZOOM_SCALE: 1,

		/**
		 * @property MAX_ZOOM_SCALE
		 * @type {Number}
		 * @final
		 */
		MAX_ZOOM_SCALE: 64,

		/**
		 * @property MIN_PEN_SIZE
		 * @type {Number}
		 * @final
		 */
		MIN_PEN_SIZE: 1,

		/**
		 * @property MAX_PEN_SIZE
		 * @type {Number}
		 * @final
		 */
		MAX_PEN_SIZE: 5,

		/**
		 * @property MIN_CANVAS_SIZE
		 * @type {Number}
		 * @final
		 */
        MIN_CANVAS_SIZE: 8,

		/**
		 * Strict limitation, but that's enough for pixel-art
		 *
		 * @property MAX_CANVAS_SIZE
		 * @type {Number}
		 * @final
		 */
        MAX_CANVAS_SIZE: 1024,

		/**
		 * Maximum layer count per layout
		 *
		 * @property MAX_LAYER_COUNT
		 * @type {Number}
		 * @final
		 */
		MAX_LAYER_COUNT: 8,

		/**
		 * @property MAX_HISTORY_SIZE
		 * @type {Number}
		 * @final
		 */
		MAX_HISTORY_SIZE: 20,

		/**
		 * View-model event name.
		 *
		 * @property PIXELS_CHANGED_EVENT
		 * @type {String}
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