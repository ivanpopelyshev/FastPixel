;var pxl = (function(document){
	"use strict";

	var _isSupported = true;
	var _imgDataCtor = null;
	var _emptyOptions = {};
	var _canvas = null;
	var _ctx = null;

	try{
		Object.seal(_emptyOptions);
		_canvas = document.createElement("CANVAS");
		_canvas.width = _canvas.height = 1; //reduce the amount of memory
		_ctx = _canvas.getContext("2d");
		_imgDataCtor = Object.getPrototypeOf( //ES5
			_ctx.getImageData(0, 0, 1, 1).data).constructor;
		if (!((new _imgDataCtor).buffer)){
			throw new Error; //Array or CanvasPixelArray doesn't have a buffer
		}
	} catch(err){
		_isSupported = false;
	}

	/**
	 * @class pxl
	 * @module pxl
	 * @main
	 */
	var _pxl = {
		//Not "linked" yet objects:
		Layout: null,
		View: null,
		Point: null,
		Observer: null,
		bresenham: null,

		/**
		 * User defined type.
		 *
		 * @property controller
		 * @default null
		 */
		controller: null,

		/**
		 * Helpful in case when method can take an object without options.
		 *
		 * @property emptyOptions
		 * @type {Object}
		 * @final
		 * @default {}
		 */
		emptyOptions: _emptyOptions,

		/**
		 * Type of an array that uses by ImageData. Depends on browser.
		 *
		 * @example
			var data = pxl.ImageDataArray(4);
		 * @property ImageDataArray
		 * @type {Uint8ClampedArray|Uint8Array|Uint16Array|Uint32Array}
		 */
		ImageDataArray: _imgDataCtor,

		/**
		 * Is API supported on current browser.
		 *
		 * @property isSupported
		 * @type {Boolean}
		 */
		isSupported: _isSupported,

		/**
		 * More safest and fastest method to create ImageData.
		 *
		 * @example
			var imgData = pxl.createImageData(8, 16);
		 * @method createImageData
		 * @param arguments[0] {ImageData|Number} [in]
		 * @param arguments[1] {undefined|Number} [in]
		 * @return {ImageData}
		 */
		createImageData: function(){
			return _ctx.createImageData.apply(_ctx, arguments);
		},

		/**
		 * Clamp a number to min/max borders.
		 *
		 * @example
			var number = pxl.clamp(5, 6, 8); //returns 6
		 * @method clamp
		 * @param dest {Number} [in]
		 * @param min {Number} [in]
		 * @param max {Number} [in]
		 * @return {Number}
		 */
		clamp: function(dest, min, max){
			return (dest > max ? max : (dest < min ? min : dest));
		},

		/**
		 * More safest and fastest method to create canvas elements.
		 *
		 * @method createCanvas
		 * @return {HTMLCanvasElement}
		 */
		createCanvas: function(){
			return _canvas.cloneNode();
		},

		/**
		 * @method extend
		 * @param child {Function} [out]
		 * @param parent {Function} [in]
		 */
		extend: function(child, parent){
			var F = function(){};
			F.prototype = parent.prototype;
			child.prototype = new F;
			child.prototype.constructor = child;
		},

		/**
		 * @method imageDataFromImg
		 * @param img {Image} [in]
		 * @return {ImageData}
		 */
		imageDataFromImage: function(img){
			var imageData = null;
			_canvas.width = img.width;
			_canvas.height = img.height;
			_ctx.drawImage(img, 0, 0);
			imageData = _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
			_canvas.width = _canvas.height = 1; //reduce the amount of memory
			return imageData;
		},

		/**
		 * Warn: make sure that parameters are fit to range 0..255!
		 *
		 * @method toRGBA
		 * @param r {Number} [in]
		 * @param g {Number} [in]
		 * @param b {Number} [in]
		 * @param a {Number} [in]
		 * @return {Number}
		 */
		toRGBA: function(r, g, b, a){
			return r | (g << 8) | (b << 16) | (a << 24);
		},

		/**
		 * @method getR
		 * @param rgba {Number} [in]
		 * @return {Number}
		 */
		getR: function(rgba){
			return rgba & 0xFF;
		},

		/**
		 * @method getG
		 * @param rgba {Number} [in]
		 * @return {Number}
		 */
		getG: function(rgba){
			return (rgba & 0xFF00) >> 8;
		},

		/**
		 * @method getB
		 * @param rgba {Number} [in]
		 * @return {Number}
		 */
		getB: function(rgba){
			return (rgba & 0xFF0000) >> 16;
		},

		/**
		 * @method getA
		 * @param rgba {Number} [in]
		 * @return {Number}
		 */
		getA: function(rgba){
			return (rgba < 0 //detect is there a sign.
				? 0xFF - ~((rgba & 0xFF000000) >> 24) //invert negative
				: (rgba & 0xFF000000) >> 24); //usual case
		}
	}

	Object.seal(_pxl);

	return _pxl;

})(document);