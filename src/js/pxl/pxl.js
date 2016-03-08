;var pxl = (function(document){
	"use strict";

	var _isBigEndian = void 0;
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
		if (!(_imgDataCtor === Uint8ClampedArray ||
			_imgDataCtor === Uint8Array)){
			throw new Error;
		}
		if (!((new _imgDataCtor).buffer)){
			throw new Error;
		}
		_isBigEndian = new Uint32Array(
			new Uint8Array([0xA1, 0xB2, 0xC3, 0xD4]).buffer)[0] === 0xA1B2C3D4;
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
		RGBA: null,
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
		 * TypedArray constructor that uses by ImageData. Depends on a browser.
		 *
		 * @example
			var data = pxl.ImageDataArray(4);
		 * @property ImageDataArray
		 * @type {Uint8ClampedArray|Uint8Array}
		 */
		ImageDataArray: _imgDataCtor,

		/**
		 * Is API supported on current browser.
		 *
		 * @method isSupported
		 * @type {Boolean}
		 */
		isSupported: function(){
			return _isSupported;
		},

		/**
		 * Helps to detect current endianness.
		 * "true" if big endian and to "false" if little endian.
		 * Also may be equal to undefined if API isn't supported.
		 *
		 * @method isBigEndian
		 * @type {Boolean|undefined}
		 * @final
		 */
		isBigEndian: function(){
			return _isBigEndian;
		},

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
		 * @example
			var img = new Image;
			img.src = ""; //Some valid url or a base64 string
			var imageData = pxl.imageDataFromImage(img);
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
		 * @method enableAntialiasing
		 * @param ctx {CanvasRenderingContext2D} [out]
		 */
		enableAntialiasing: function(ctx){
			_setAntialiasing(ctx, true);
		},

		/**
		 * @method disableAntialiasing
		 * @param ctx {CanvasRenderingContext2D} [out]
		 */
		disableAntialiasing: function(ctx){
			_setAntialiasing(ctx, false);
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
		 * @example
			var options = {start: new pxl.Point(-1, 0), offset: new pxl.Point(100, 100)};
			pxl.fixRange(options, layout);
			//in 8x16 layout, the options would fixed to: {start: {x: 0, y: 0},	offset: {x: 8, y: 16}};
		 * @method fixRange
		 * @param src {Object} [out]
		 * @param src.start {Point}
		 * @param src.offset {Point}
		 * @param dest {Object|Layout} [in]
		 * @param dest.start {Point|undefiend}
		 * @param dest.offset {Point|undefined}
		 * @return {Boolean} Returns false value if range can't be fixed.
		 */
		fixRange: function(src, dest){
			var srcStart = src.start;
			var srcOffset = src.offset;
			var destStartX = 0;
			var destStartY = 0;
			var destWidth = 0;
			var destHeight = 0;
			if (dest instanceof pxl.Layout){
				destWidth = dest.getWidth();
				destHeight = dest.getHeight();
			} else{
				destStartX = dest.start.x;
				destStartY = dest.start.y;
				destWidth = destStartX + dest.offset.x;
				destHeight = destStartY + dest.offset.y;
			}

			if (srcStart.x >= destWidth ||
				srcStart.y >= destHeight) return false; //unfixed things

			if (srcStart.x < destStartX){
				srcOffset.x -= Math.abs(destStartX - srcStart.x);
				srcStart.x = destStartX;
			}
			if (srcStart.y < destStartY){
				srcOffset.y -= Math.abs(destStartY - srcStart.y);
				srcStart.y = destStartY;
			}
			if (srcStart.x + srcOffset.x > destWidth){
				srcOffset.x = destWidth - srcStart.x;
			}
			if (srcStart.y + srcOffset.y > destHeight){
				srcOffset.y = destHeight - srcStart.y;
			}

			return !(srcOffset.x <= destStartX || srcOffset.y <= destStartY); //is still bad?
		}
	};

	Object.seal(_pxl);

	return _pxl;

	//Helpers:

	function _setAntialiasing(ctx, value){
		if ("imageSmoothingEnabled" in ctx){
			ctx.imageSmoothingEnabled = value;
		} else if ("webkitImageSmoothingEnabled" in ctx){
			ctx.webkitImageSmoothingEnabled = value;
		} else if ("mozImageSmoothingEnabled" in ctx){
			ctx.mozImageSmoothingEnabled = value;
		} else if ("msImageSmoothingEnabled" in ctx){
			ctx.msImageSmoothingEnabled = value;
		}
	};

})(document);