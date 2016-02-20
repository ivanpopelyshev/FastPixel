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
;(function(parent){
    "use strict";

	if (!parent){
		return;
	}

    /**
     * @constructor
	 * @class Point
     * @param x {Number|undefined}
     * @param y {Number|undefined}
     */
    var Point = parent.Point = function(x, y){
        this.set(x || 0, y);

		Object.seal(this);
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
	 * @property
	 * @type {Number}
	 */
	Point.EPSILON = 1e-10;

    var pointProto = Point.prototype;

	/**
	 * Return string is JSON format.
	 *
	 * @method toString
	 * @return {String}
	 */
	pointProto.toString = function(){
		return '{"x":' + this.x + ',"y":' + this.y + '}';
	};

	/**
	 * Add two Point instances;
	 * or add Point instance with numbers.
	 *
	 * @method add
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.add = function(param1, param2){
        if (param1 instanceof Point){
            this.x += param1.x;
            this.y += param1.y;
        } else{
            this.x += param1;
            this.y += (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Substract one Point instance from another;
	 * or substrast number from Point instance.
	 *
	 * @method sub
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.sub = function(param1, param2){
        if (param1 instanceof Point){
            this.x -= param1.x;
            this.y -= param1.y;
        } else{
            this.x -= param1;
            this.y -= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Multiply two Point instances;
	 * or multiply Point instance by numbers.
	 *
	 * @method mul
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.mul = function(param1, param2){
        if (param1 instanceof Point){
            this.x *= param1.x;
            this.y *= param1.y;
        } else{
            this.x *= param1;
            this.y *= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Divide one Point instance by another;
	 * or divide Point instance by numbers.
	 *
	 * @method div
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.div = function(param1, param2){
        if (param1 instanceof Point){
            this.x /= param1.x;
            this.y /= param1.y;
        } else{
            this.x /= param1;
            this.y /= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Copy Point instance;
	 * or set new values for Point instance.
	 *
	 * @method set
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.set = function(param1, param2){
        if (param1 instanceof Point){
            this.x = param1.x;
            this.y = param1.y;
        } else{
            this.x = param1;
            this.y = (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Compare two Point instances
	 * or compare Point instance properties with numbers.
	 *
	 * @method cmp
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @return {Boolean}
     */
    pointProto.cmp = function(param1, param2){
        if (param1 instanceof Point){
            return (abs(this.x - param1.x) < Point.EPSILON &&
                    abs(this.y - param1.y) < Point.EPSILON);
        }
        return (
			abs(this.x - param1) < Point.EPSILON &&
			abs(this.y - (typeof param2 === "number" ? param2 : param1)) <
			Point.EPSILON
		);
    };

	/**
	 * Make Point instance properties absolute.
	 *
	 * @method abs
	 * @chainable
	 */
	pointProto.abs = function(){
		this.x = abs(this.x);
		this.y = abs(this.y);
		return this;
	};

	/**
	 * Make Point instance properties negative.
	 *
	 * @method neg
	 * @chainable
	 */
	pointProto.neg = function(){
		this.x = -abs(this.x);
		this.y = -abs(this.y);
		return this;
	};

	/**
	 * Swap properties between Point instances.
	 *
	 * @method swap
	 * @param other {Point}
	 * @chainable
	 */
	pointProto.swap = function(other){
		var tmp = other.x;
		other.x = this.x;
		this.x = tmp;
		tmp = other.y;
		other.y = this.y;
		this.y = tmp;
		return this;
	};

	/**
	 * Round down Point instance properties.
	 *
	 * @method floor
	 * @chainable
	 */
	pointProto.floor = function(){
		this.x = _floor(this.x);
		this.y = _floor(this.y);
		return this;
	};

	/**
	 * Round up Point instance properties.
	 *
	 * @method ceil
	 * @chainable
	 */
	pointProto.ceil = function(){
		this.x = _ceil(this.x);
		this.y = _ceil(this.y);
		return this;
	};

	/**
	 * Round Point instance properties.
	 *
	 * @method round
	 * @chainable
	 */
	pointProto.round = function(){
		this.x = _round(this.x);
		this.y = _round(this.y);
		return this;
	};

	/**
	 * Check properties for NaN.
	 *
	 * @method hasNaN
	 * @return {Boolean}
	 */
	pointProto.hasNaN = function(){
		return isNaN(this.x) || isNaN(this.y);
	};

	/**
	 * Check properties for Infinity.
	 *
	 * @method hasInfinity
	 * @return {Boolean}
	 */
	pointProto.hasInfinity = function(){
		return !isFinite(this.x) || !isFinite(this.y);
	};

    /**
	 * Make new Point instance with same properties.
	 *
	 * @method clone
     * @return {Point}
     */
	pointProto.clone = function(){
		return new Point(this);
	};

	//Helpers:

	//correctly floor down if negative
	function _floor(n){
        var flooredN = n | 0;
        return (flooredN !== n && flooredN < 0 ? --flooredN : flooredN);
	};

	//faster than Math.round
	function _round(n){
		return (n + 0.5) | 0;
	};

	//
	function _ceil(n){
        var ceiledN = n | 0;
		return (n === ceiledN ? n : ceiledN + 1);
	};

	//faster than Math.abs
	function abs(n){
		return n < 0 || n === -0 ? -n : n;
	};
})(pxl);
;(function(parent){
    "use strict";

	if (!parent){
		return;
	}

	var ERR_MESSAGE = "'method' is not a function!";

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

		Object.seal(this);
    };

    var observerProto = Observer.prototype;

    /**
	 * @method subscribe
	 * @throws {Error} "'method' is not a function!"
     * @param event {String} [in] Name of event.
     * @param method {Function} [out] The method to execute when event is fired.
     */
    observerProto.subscribe = function(event, method){
		if (method instanceof Function){
			if (event in this._eventBook){
				var list = this._eventBook[event];
				if (list.indexOf(method) === -1){
					list.push(method);
				}
			} else{
				this._eventBook[event] = [method];
			}
		} else{
			throw new Error(ERR_MESSAGE);
		}
    };

    /**
	 * @method unsubscribe
	 * @throws {Error} "'method' is not a function!"
     * @param event {String} [in] Name of event.
     * @param method {Function} [in] Have to be same reference that passed in subscribe method.
     */
    observerProto.unsubscribe = function(event, method){
		if (method instanceof Function){
			if (event in this._eventBook){
				var list = this._eventBook[event];
				var index = list.indexOf(method);
				if (index !== -1){
					list.splice(index, 1);
					if (list.length === 0){
						delete this._eventBook[event];
					}
				}
			}
		} else{
			throw new Error(ERR_MESSAGE);
		}
    };

    /**
	 * @method notify
     * @param event {String} [in] Name of event.
     * @param eventMessage {*} [in/out] Specific event data.
     */
    observerProto.notify = function(event, eventMessage){
        if (event in this._eventBook){
            var list = this._eventBook[event];
            for (var i = 0; i < list.length; ++i){
                list[i](eventMessage); //callback
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
	 * Look at: http://members.chello.at/easyfilter/bresenham.js
	 *
	 * @class bresenham
	 */
	var bresenham = parent.bresenham = {
		/**
		 * @method line
		 * @param x0 {Number}
		 * @param y0 {Number}
		 * @param x1 {Number}
		 * @param y1 {Number}
		 * @param callback {Function}
		 */
		line: function(x0, y0, x1, y1, callback){
			var dx = x1 - x0;
			if (dx < 0){
				dx = -dx;
			}
			var dy = y1 - y0;
			if (dy >= 0){
				dy = -dy;
			}
			var sx = x0 < x1 ? 1 : -1;
			var sy = y0 < y1 ? 1 : -1;
			var err = dx + dy;
			var e2 = 0;
			for (;;){
				callback(x0, y0);
				if (x0 === x1 && y0 === y1) break;
				e2 = err << 1;
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
		 * @method rectangle
		 * @param x0 {Number}
		 * @param y0 {Number}
		 * @param x1 {Number}
		 * @param y1 {Number}
		 * @param callback {Function}
		 */
		rectangle: function(x0, y0, x1, y1, callback){
			var tmp = 0;
			if (x0 === x1 || y0 === y1){
				if (x0 === x1 && y0 === y1){
					callback(x0, y0);
				} else{
					bresenham.line(x0, y0, x1, y0, callback);
				}
			} else{
				if (x1 < x0){
					tmp = x0;
					x0 = x1;
					x1 = tmp;
				}
				if (y1 < y0){
					tmp = y0;
					y0 = y1;
					y1 = tmp;
				}
				bresenham.line(x0, y0, x1 - 1, y0, callback);
				bresenham.line(x1, y0, x1, y1 - 1, callback);
				bresenham.line(x1, y1, x0 + 1, y1, callback);
				bresenham.line(x0, y1, x0, y0 + 1, callback);
			}
		},

		/**
		 * Ellipse inside rectangle.
		 *
		 * @method ellipse
		 * @param x0 {Number}
		 * @param y0 {Number}
		 * @param x1 {Number}
		 * @param y1 {Number}
		 * @param callback {Function}
		 */
		ellipse: function(x0, y0, x1, y1, callback){
			var a = x1 - x0;
			var powA = a * a;
			if (a < 0){
				a = -a;
			}
			var b = y1 - y0;
			var powB = b * b;
			if (b < 0){
				b = -b;
			}
			var b1 = b & 1;
			var dx = (1 - a) * powB << 2;
			var dy = (1 + b1) * powA << 2;
			var err = dx + dy + b1 * powA;
			var e2 = 0;
			if (x0 > x1){
				x0 = x1;
				x1 += a;
			}
			if (y0 > y1){
				y0 = y1;
			}
			y0 += (b + 1) >> 1;
			y1 = y0 - b1;
			a = powA << 3;
			b1 = powB << 3;
			do{
				callback(x1, y0);
				callback(x0, y0);
				callback(x0, y1);
				callback(x1, y1);
				e2 = err << 1;
				if (e2 <= dy){
					++y0;
					--y1;
					err += dy += a;
				}
				if (e2 >= dx || (err << 1) > dy){
					++x0;
					--x1;
					err += dx += b1;
				}
			} while(x0 <= x1);
			while (y0 - y1 <= b){
				callback(x0 - 1, y0);
				callback(x1 + 1, y0++);
				callback(x0 - 1, y1);
				callback(x1 + 1, y1--);
			}
		}
	}

	Object.freeze(bresenham);

})(pxl);
(function(parent, isBigEndian){
	"use strict";

	//Shortcuts:
	var RGBA = null;
	var getR = null;
	var getG = null;
	var getB = null;
	var getA = null;

	if (!parent || isBigEndian.constructor !== Boolean){
		return;
	}

	if (isBigEndian){
		/**
		 * Channel packer;
		 * Note: each argument have to fit in 0x00..0xFF range!
		 *
		 * @example
			//The result is a 32-bit integer,
			//which compactly contains all four color channels:
			var rgba = RGBA(255, 0, 255, 0); //0xFF00FF00
		 * @class RGBA
		 * @static
		 * @param r {Number}
		 * @param g {Number}
		 * @param b {Number}
		 * @param a {Number}
		 * @return {Number}
		 */
		RGBA = parent.RGBA = function(r, g, b, a){
			return (a | (b << 8) | (g << 16) | (r << 24)) >>> 0;
		};

		/**
		 * @method getG
		 * @param rgba {Number} Have to fit in 0x00000000..0xFFFFFFFF range
		 * @return {Number}
		 */
		getR = RGBA.getR = _get3;

		/**
		 * @method getG
		 * @param rgba {Number} Have to fit in 0x00000000..0xFFFFFFFF range
		 * @return {Number}
		 */
		getG = RGBA.getG = _get2;

		/**
		 * @method getG
		 * @param rgba {Number} Have to fit in 0x00000000..0xFFFFFFFF range
		 * @return {Number}
		 */
		getB = RGBA.getB = _get1;

		/**
		 * @method getG
		 * @param rgba {Number} Have to fit in 0x00000000..0xFFFFFFFF range
		 * @return {Number}
		 */
		getA = RGBA.getA = _get0;
	} else{
		RGBA = parent.RGBA = function(r, g, b, a){
			return (r | (g << 8) | (b << 16) | (a << 24)) >>> 0;
		};

		getR = RGBA.getR = _get0;
		getG = RGBA.getG = _get1;
		getB = RGBA.getB = _get2;
		getA = RGBA.getA = _get3;
	}

	/**
	 * Mix two colors using integer alpha mixing.
	 * Note: both parameters have to fit in 0x00000000..0xFFFFFFFF range!
	 *
	 * An alpha computes by: (Atop << 8 + (0xFF - Atop) * Abottom + (0xFF >> 1)) >> 8;
	 *
	 * And other channels: ((Atop * Ctop + (((0xFF - Atop) * Abottom + (0xFF >> 1)) >> 8) * Cbottom + (0xFF >> 1)) / Amixed) | 0
	 *
	 * @method alphaBlend
	 * @param rgba1 {Number} Bottom color
	 * @param rgba2 {Number} Top color
	 * @return {Number}	
	 */
	RGBA.alphaBlend = function(rgba1, rgba2){
		var a2 = getA(rgba2);
		var opt = (0xFF - a2) * getA(rgba1) + 127;
		var aNew = ((a2 << 8) + opt) >> 8;
		opt >>= 8;
		return RGBA(
			((a2 * getR(rgba2) + opt * getR(rgba1) + 127) / aNew) | 0,
			((a2 * getG(rgba2) + opt * getG(rgba1) + 127) / aNew) | 0,
			((a2 * getB(rgba2) + opt * getB(rgba1) + 127) / aNew) | 0,
			aNew);
	};


	Object.freeze(RGBA);


	//Helpers:
	function _get0(color){
		return (color & 0xFF) >>> 0;
	};

	function _get1(color){
		return (color & 0xFF00) >>> 8;
	};

	function _get2(color){
		return (color & 0xFF0000) >>> 16;
	};

	function _get3(color){
		return (color & 0xFF000000) >>> 24;
	};

})(pxl, pxl.isBigEndian());
(function(){
	"use strict";

	/**
	 * @constructor
	 * @class View
	 * @param ctx {CanvasRenderingContext2D}
	 * @param buffer {CanvasRenderingContext2D}
	 * @param layout {Layout}
	 * @param isOwner {Boolean}
	 */
	var View = pxl.View = function(ctx, buffer, layout, isOwner){
		/**
		 * @property _buffer
		 * @private
		 * @type {CanvasRenderingContext2D}
		 */
		this._buffer = buffer;

		/**
		 * @property _ctx
		 * @private
		 * @type {CanvasRenderingContext2D}
		 */
		this._ctx = ctx;

		/**
		 * @property _layoutOwner
		 * @private
		 * @type {Boolean}
		 */
		this._layoutOwner = Boolean(isOwner);

		/**
		 * @property _imagePoint
		 * @private
		 * @type {Point}
		 */
		this._imagePoint = new pxl.Point;

		/**
		 * @property _scale
		 * @private
		 * @type {Number}
		 * @default 1
		 */
		this._scale = 1;

		/**
		 * @property _layout
		 * @private
		 * @type {Layout|null}
		 */
		this._layout = layout;

		/**
		 * @property _boundedRender
		 * @private
		 * @type {Function|null}
		 */
		this._boundedRender = null;
		this._subscribe();
		
		Object.seal(this);
	};

	/**
	 * Simple factory-like method;
	 * Take care about view creating and DOM manipulations;
	 * Also put new instance into static "instances" list.
	 *
	 * @static
	 * @method create
	 * @param options {Object} [in]
	 * @param options.element {HTMLCanvasElement|HTML*Element} The canvas for drawing, or any other element as a parent.
	 * @param options.source {View|undefined} New instance will listen all changes on source.
	 * @param options.layoutSize {Object|undefined} Size of the model.
	 * @param options.layoutSize.width {Number}
	 * @param options.layoutSize.height {Number}
	 * @return {View}
	 */
	View.create = function(options){
		var canvas = null;
		var bufferCanvas = null;
		var layout = null;
		var isOwner = true;
		var view = null;
		var ctx = null;
		var bufferCtx = null;
		if (options.element.nodeName.toUpperCase() === "CANVAS"){
			canvas = options.element;
		} else{
			canvas = options.element.appendChild(pxl.createCanvas());
		}
		if (options.source){
			bufferCanvas = options.source._buffer.canvas;
			layout = options.source._layout;
			isOwner = false;
		} else{
			bufferCanvas = pxl.createCanvas();
			bufferCanvas.width = options.layoutSize.width;
			bufferCanvas.height = options.layoutSize.height;
			layout = new pxl.Layout(bufferCanvas.width, bufferCanvas.height);
		}
		ctx = canvas.getContext("2d");
		bufferCtx = bufferCanvas.getContext("2d");
		pxl.disableAntialiasing(ctx);
		pxl.disableAntialiasing(bufferCtx);

		view = new View(ctx, bufferCtx, layout, isOwner);

		View.instances.push(view);
		return view;
	};

	/**
	 * List of all existing View instances.
	 *
	 * @property instances
	 * @static
	 * @type {Array}
	 * @default []
	 */
	View.instances = [];

	/**
	 * Reference onto the currently active view instance.
	 *
	 * @property activeView
	 * @type {View|null}
	 * @static
	 * @default null
	 */
	View.activeView = null;

	var viewProto = View.prototype;
 
	/**
	 * Clear canvas, update imageData and draw changed area.
	 *
	 * Look at: pxl.View.clear, pxl.View.update, pxl.View.redraw
	 *
	 * @method render
	 * @param options {Object} [in]
	 * @chainable
	 */
	viewProto.render = function(options){
		return this.clear(options).update(options).redraw(options);
	};

	/**
	 * Draw rectangle at canvas element directly.
	 *
	 * @method drawRect
	 * @param options {Object} [in]
	 * @param options.start {Point}
	 * @param options.offset {Point}
	 * @param options.pixel {TypedArray|Array|Number}
	 * @chainable
	 */
	viewProto.drawRect = function(options){
		var pixel = options.pixel;
		var RGBA = pxl.RGBA;
		if (options.pixel.constructor === Number){
			this._ctx.fillStyle = "rgba(" +
				RGBA.getR(pixel) + "," +
				RGBA.getG(pixel) + "," +
				RGBA.getB(pixel) + "," +
				(RGBA.getA(pixel) / 255) +
			")";
		} else{
			this._ctx.fillStyle = "rgba(" +
				pixel[0] + "," +
				pixel[1] + "," + 
				pixel[2] + "," +
				(pixel[3] / 255) +
			")";
		}
		this._ctx.fillRect(
			options.start.x + this._imagePoint.x,
			options.start.y + this._imagePoint.y,

			options.offset.x, options.offset.y
		);
		return this;
	};

	/**
	 * Just redraw from old/previous imageData condition.
	 *
	 * @method redraw
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
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
				this._buffer.canvas, this._imagePoint.x, this._imagePoint.y);
		}
		return this;
	};

	/**
	 * Clear canvas element directly.
	 *
	 * @method clear
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
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
				0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
		}
		return this;
	};

	/**
	 * Update the buffer from layout (model).
	 *
	 * @method update
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @chainable
	 */
	viewProto.update = function(options){
		if (this._layoutOwner){
			if (options.start && options.offset){
				this._buffer.putImageData(
					this._layout.getImageData(options),
					options.start.x, options.start.y,
					0, 0,
					options.offset.x, options.offset.y
				);
			} else{
				this._buffer.putImageData(
					this._layout.getImageData(options), 0, 0);
			}
		}
		return this;
	};

	/**
	 * Transform canvas according to scale & translate.
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
	 * Restore context.
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
	 * @deprecated
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
	 * @return {Point}
	 */
	viewProto.getImagePoint = function(){
		return this._imagePoint;
	};

	/**
	 * @method getScaleOffset
	 * @return {Point}
	 */
	viewProto.getScaleOffset = function(){
		return new pxl.Point(
			_offset(this._scale, this._ctx.canvas.width),
			_offset(this._scale, this._ctx.canvas.height)
		);
	};

	/**
	 * Change current scale rate value;
	 * Only an integer part will be taken.
	 *
	 * Warn: scale can't be lower then 1.
	 *
	 * @method setScale
	 * @param value {Number} [in]
	 * @chainable
	 */
	viewProto.setScale = function(value){
		if (value >= 1){
			this._scale = value | 0;
		}
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
				this._layoutOwner = false; //two views can't own same layout
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
		return this._imagePoint.set(x, y);
	};

	/**
	 *
	 * @method setAlpha
	 * @param aplha {Number} [in] Should fit the range in 0.0..1.0
	 * @chainable
	 */
	viewProto.setAlpha = function(aplha){
		this._ctx.globalAlpha = aplha;
		return this;
	};

	/**
	 * Transform position according to the current scale offset.
	 *
	 * @method fitToTransition
	 * @param position {Point} [out]
	 * @chainable
	 */
	viewProto.fitToTransition = function(position){
		position.sub(this.getScaleOffset()).div(this._scale).floor();
		return this;
	};

	/**
     * Note: changes element width/height too.
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
		pxl.disableAntialiasing(this._ctx);
		return this;
    };

	/**
	 * @method deleteLayout
	 * @chainable
	 */
	viewProto.deleteLayout = function(){
		var instances = View.instances;
		this._unsubscribe();
		if (this._layoutOwner){
			for (var i = 0; i < instances.length; ++i){
				if (this !== instances[i] &&
					this._layout === instances[i]._layout){
					instances[i]._unsubscribe();
					_removeLayout(instances[i]);
				}
			}
			this._layout.destroy();
			_removeLayout(this);
		}
		return this;
	};

    /**
     * Listen for events that fired when layout (model) has been changed.
	 *
	 * @method _subscribe
	 * @throws {Error} "View instance is already subscribed!"
	 * @private
	 * @chainable
     */
    viewProto._subscribe = function(){
        if (this._boundedRender === null){
			this._boundedRender = this.render.bind(this);
			this._layout.observer.subscribe(
				pxl.Layout.PIXELS_CHANGED_EVENT, this._boundedRender);
		} else{
			throw new Error("View instance is already subscribed!");
		}
		return this;
    };

    /**
     * Stop listen the layout (model) changes.
	 *
	 * @method _unsubscribe
	 * @private
	 * @chainable
     */
    viewProto._unsubscribe = function(){
		this._layout.observer.unsubscribe(
			pxl.Layout.PIXELS_CHANGED_EVENT, this._boundedRender);
		this._boundedRender = null;
		return this;
    };

	/**
	 * Destructor.
	 *
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

	//Helpers:

	//clear _layout and _buffer properties
	function _removeLayout(view){
		view._buffer = view._layout = null;
	}

	function _offset(scale, side){
		return (side * (1 - scale)) >> 1;
	}
})();
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
(function(){
	"use strict";

	/**
	 * A wrapper for Uint32Array;
	 * Note: most of the features require the layout.
	 *
	 * @constructor
	 * @class Layer
	 * @throws {RangeError} "Buffer limit has been reached!"
	 * @param source {Array|TypedArray|ArrayBuffer|Number}
	 * @param layout {Layout|undefined}
	 * @param name {String|undefined}
	 * @example
		var layer = new pxl.Layout.Layer(8 * 16, layout, "Background"); //suppose that layout is 8x16
		//or
		var layer = new pxl.Layout.Layer([255, 255, 255, 255], layout);
	 */
	var Layer = pxl.Layout.Layer = function(source, layout, name){
		/**
		 * @property data
		 * @type {Uint32Array}
		 */
		this.data = new Uint32Array(source);

		if (this.data.length >
			Layer.MAX_BUFFER_SIZE / this.data.BYTES_PER_ELEMENT){
			this.data = null; //free memory
			throw new RangeError("Buffer limit has been reached!");
		}

		/**
		 * @property name
		 * @type {String}
		 * @default ""
		 */
		this.name = name || "";

		/**
		 * @property isVisible
		 * @type {Boolean}
		 * @default true
		 */
		this.isVisible = true;

		/**
		 * @property _layout
		 * @private
		 * @type {Layout|null}
		 * @default null
		 */
		this._layout = layout || null;

		Object.seal(this);
	};

	/**
	 * Strict limitation, but that's enough for pixel-art.
	 *
	 * @property MAX_BUFFER_SIZE
	 * @type {Number}
	 * @static
	 * @final
	 * @default 2048x2048x4
	 */
	Layer.MAX_BUFFER_SIZE = 2048 * 2048 * 4;

	var layerProto = Layer.prototype;

	/**
	 * Reset the data to default (completelly fill with zeroes).
	 *
	 * @method reset
	 */
	layerProto.reset = function(){
		this._fillLine(0, 0, this.data.length);
	};

	/**
	 * Warn: layers have to be from same layout or at least have equal size.
	 *
	 * @method copyFrom
	 * @param other {Layer} [in]
	 * @param fullCopy {Boolean|undefined} [in]
	 */
	layerProto.copyFrom = function(other, fullCopy){
		this.data.set(other.data);
		if (fullCopy === true){
			this.name = other.name;
			this._layout = other._layout;
			this.isVisible = other.isVisible;
		}
	};

	/**
	 * Merge each pixel of two layers;
	 * Or apply merging to pixels within start and offset area;
	 * 
	 * Warn: layer have to be from same layout! Or at least have a same size!
	 *
	 * @method merge
     * @param options {Object}[in]
	 * @param options.isMix {Boolean}
	 * @param options.other {Layer}
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
     */
	layerProto.merge = function(options){
		var self = this;
		var data = this.data;
		var otherData = options.other.data;
		var alphaBlend = pxl.RGBA.alphaBlend;
		if (options.isMix === true){
			this._layout.__process(options, function(i, length){
				while (i < length){
					data[i] = alphaBlend(data[i], otherData[i++]);
				}
			});
		} else{
			if (options.start && options.offset){
				this._layout.__process(options, function(i, length){
					data.set(otherData.subarray(i, length), i);
				});
			} else{
				this.data.set(otherData); //much faster
			}
		}
	};

	/**
	 * Replace specific color by the new one on whole layer;
	 * Or just on area within start and offset options.
	 *
	 * @method replace
	 * @param options {Object} [in]
	 * @param options.pixel {Number}
	 * @param options.oldPixel {Number}
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 */
	layerProto.replace = function(options){
		var data = this.data;
		var rgba = options.pixel;
		var oldRGBA = options.oldPixel;
		this._layout.__process(options, function(i, length){
			for (; i < length; ++i){
				if (data[i] === oldRGBA){
					data[i] = rgba;
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
	 * @param options.pixel {Number}
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @param options.isMix {Boolean}
	 */
	layerProto.set = function(options){
		var self = this;
		var data = this.data;
		var rgba = options.pixel;
		var alphaBlend = pxl.RGBA.alphaBlend;
		if (options.isMix === true){
			this._layout.__process(options, function(i, length){
				while (i < length){
					data[i] = alphaBlend(data[i++], rgba);
				}
			});
		} else{
			this._layout.__process(options, function(i, length){
				self._fillLine(rgba, i, length);
			});
		}
	};

	/**
	 * Change specific channel for layer;
	 * Or channel for area within start and offset options.
	 *
	 * @method setChannel
	 * @param options {Object} [in]
	 * @param options.channelOffset {Number} 0..3 (rgba index)
	 * @param options.value {Number} 0..255 (byte)
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 */
	layerProto.setChannel = function(options){
		var data = this.data;
		var value = options.value;
		var channelOffset = pxl.clamp(options.channelOffset, 0, 3);
		this._layout.__process(options, function(i, length){
			var tmp8BitRepresentation = new Uint8Array(
				data.subarray(i, length).buffer);
			length = tmp8BitRepresentation.length;
			for (i = channelOffset; i < length; i += 4){
				tmp8BitRepresentation[i] = value;
			}
		});
	};

	/**
	 * Scan-line fill (with custom stack);
	 * Can be applyed for area within start and offset options.
	 *
	 * Look at: http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
	 *
	 * @method fill
	 * @param options {Object} [in]
	 * @param options.position {Point}
	 * @param options.pixel {Number}
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @param options.isMix {Boolean|undefined}
	 */
	layerProto.fill = function(options){
		var layout = this._layout;
		var data = this.data;
		var startIndex = 0;
		var leftIndexOffset = 0;
		var rightIndexOffset = 0;
		var endIndex = data.length;
		var pixel = options.pixel;
		var index = layout.indexAt(options.position);
		if (options.start && options.offset){
			leftIndexOffset = options.start.x;
			rightIndexOffset = options.start.x + options.offset.x;
			startIndex = layout.indexAt(options.start);
			endIndex = layout.indexAt(
				new pxl.Point(options.start).add(options.offset));
		}
		if (index < startIndex || index >= endIndex || data[index] === pixel){
			return;
		}
		var begin = 0;
		var width = layout.getWidth();
		var height = layout.getHeight();
		var borderUp = false;
		var borderDown = false;
		var oldRGBA = this.pixelFromIndex(index); //pixel before changes
		var rgba = data[index] = (options.isMix === true
			? pxl.RGBA.alphaBlend(data[index], pixel)
			: pixel); //pixel after changes
		var upIndex = 0;
		var downIndex = 0;
		var stepsBack = 0;
		var leftBorderIndex = 0;
		var rightBorderIndex = 0;
		var stack = [index];
		do{
			index = stack.pop();

			leftBorderIndex = leftIndexOffset + ((index / width) | 0) * width;
			rightBorderIndex = leftBorderIndex + width - rightIndexOffset;

			stepsBack = 0;

			//Go to the left:
			while(--index >= leftBorderIndex && data[index] === oldRGBA){
				++stepsBack;
			}

			begin = ++index;
			borderUp = borderDown = false;

			//Go to the right:
			for (;;){
				upIndex = index - width;
				downIndex = width + index++;

				if (upIndex > startIndex){
					if (data[upIndex] === oldRGBA){
						if(borderUp === false){
							stack.push(upIndex);
							borderUp = true;
						}
					} else{
						borderUp = false;
					}
				}

				if (downIndex < endIndex){
					if (data[downIndex] === oldRGBA){
						if(borderDown === false){
							stack.push(downIndex);
							borderDown = true;
						}
					} else{
						borderDown = false;
					}
				}

				if (stepsBack === 0){
					if (index >= rightBorderIndex || data[index] !== oldRGBA){
						break;
					}
				} else{
					--stepsBack;
				}
			}
			//It's time to fill the whole detected line:
			this._fillLine(rgba, begin, index);
		} while(stack.length);
	};

	/**
	 * @method insertData
	 * @param options {Object} [in]
	 * @param data {TypedArray}
	 * @param options.start {Point}
	 * @param options.offset {Point}
	 */
	layerProto.insertData = function(options){
		var index = 0;
		var data = this.data;
		var otherData = (options.data.constructor === Uint32Array
			? options.data
			: new Uint32Array(options.data.buffer)); //should not be too slow
		this._layout.__process(options, function(i, length){
			data.set(otherData.subarray(index, index += length - i), i);
		});
	};

	/**
	 * @method setAt
	 * @param i {Number} index where to apply.
	 * @param rgba {Number}
	 */
	layerProto.setAt = function(i, rgba){
		this.data[i] = rgba;
	};

	/**
	 * @method pixelFromPosition
	 * @param position {Point} [in]
	 * @return {Number}
	 */
	layerProto.pixelFromPosition = function(position){
		return this.pixelFromIndex(this._layout.indexAt(position));
	};

	/**
	 * Warn: index without color-offset!
	 *
	 * @method pixelFromIndex
	 * @param index {Number} [in]
	 * @return {Number}
	 */
	layerProto.pixelFromIndex = function(index){
		return this.data[index];
	};

	/**
	 * @method generateImageData
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @return {ImageData}
	 */
	layerProto.generateImageData = function(options){
		var layout = this._layout;
		var imageData = (options.start && options.offset
			? pxl.createImageData(options.offset.x, options.offset.y)
			: pxl.createImageData(layout.getWidth(), layout.getHeight())
		);
		void this._generateData(
			new Uint32Array(imageData.data.buffer), this.data, options);
		return imageData;
	};

	/**
	 * @method cloneData
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @return {Uint32Array}
	 */
	layerProto.cloneData = function(options){
		return this._generateData(null, this.data, options);
	};

	/**
	 * @method getLayout
	 * @return {Layout}
	 */
	layerProto.getLayout = function(){
		return this._layout;
	};

	/**
	 * @method _generateData
	 * @private
	 * @param destData {Uint32Array|null} [out]
	 * @param sourceData {Uint32Array} [in]
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @return {Uint32Array}
	 */
	layerProto._generateData = function(destData, sourceData, options){
		var index = 0;
		if (options.start && options.offset){
			destData = destData || new Uint32Array(
				(options.offset.x | 0) * (options.offset.y | 0));
			this._layout.__process(options, function(i, length){
				destData.set(sourceData.subarray(i, length), index);
				index += length - i;
			});
		} else{
			if (destData){
				destData.set(sourceData);
			} else{
				destData = new Uint32Array(sourceData); //copy constructor
			}
		}
		return destData;
	};

	/**
	 * 
	 *
	 * @param begin {Number}
	 * @param end {Number}
	 * @param rgba {Number}
	 * @method _fillLine
	 * @private
	 */
	if ("fill" in Uint32Array.prototype){ //ES6, much faster
		layerProto._fillLine = function(rgba, begin, end){
			this.data.fill(rgba, begin, end);
		};
	} else{
		layerProto._fillLine = function(rgba, begin, end){
			var data = this.data;
			while (begin < end){
				data[begin++] = rgba;
			}
		};
	}

	/**
	 * 
	 *
	 * @param start {Number|undefined}
	 * @param end {Number|undefined}
	 * @method _reverseLine
	 * @private
	 */
	layerProto._reverseLine = function(start, end){
		var data = this.data;
		if (arguments.length === 0 && "reverse" in Uint32Array.prototype){
			data.reverse(); //ES6, unfortunatly it doesn't take a range
		} else{
			var tmp = 0;
			start = start || 0;
			end = end || data.length;
			while (start < --end){ //end not included!
				var tmp = data[end];
				data[end] = data[start];
				data[start++] = tmp;
			}
		}
	};

	/**
	 * Destructor.
	 * Tip: don't forget to clean the history cache.
	 *
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
	 * @class history
	 * @static
	 */
	pxl.Layout.history = {
		Session: null,
		SessionDynamic: null,
		SessionStatic: null,

		/**
		 * Special recording flag. Cache method have to be used once on session.
		 * Use case: methods like fill or replaceColor.
		 *
		 * @property STATIC_SHOT
		 * @type {Number}
		 * @final
		 */
		STATIC_SHOT: 1,

		/**
		 * Special recording flag. Cache method may be used as many times as possible.
		 * Use case: user draw lines.
		 *
		 * @property DYNAMIC_SHOT
		 * @type {Number}
		 * @final
		 */
		DYNAMIC_SHOT: 2,

		/**
		 * @property _stack
		 * @private
		 * @type {Array}
		 * @default []
		 */
		_stack: [],

		/**
		 * Point on the current active index in container
		 *
		 * @property _pointer
		 * @private
		 * @type {Number}
		 * @default 0
		 */
		_pointer: 0,

		/**
		 * @property _lastSession
		 * @private
		 * @type {Object|null}
		 * @default null
		 */
        _lastSession: null,

		/**
		 * @property _isRecording
		 * @private
		 * @type {Boolean}
		 * @default false
		 */
		_isRecording: false,

		/**
		 * @method getHistorySize
		 * @return {Number}
		 */
		getHistorySize: function(){
			return this._stack.length;
		},

		/**
		 * @method isRecording
		 * @return {Boolean}
		 */
		isRecording: function(){
			return this._isRecording;
		},

		/**
		 * @method undo
		 */
		undo: function(){
			if (this._pointer > 0){
				this._stack[--this._pointer].rewrite();
			}
		},

		/**
		 * @method redo
		 */
		redo: function(){
			if (this._pointer < this._stack.length){
				this._stack[this._pointer++].rewrite();
			}
		},

		/**
		 * @method cache
		 * @param param {Object|Number} [in]
		 */
		cache: function(param){
			this._lastSession.cache(param);
		},

		/**
		 * Start Layer recording.
		 *
		 * @method record
		 * @throws {Error} "Recording has been started before!" | "Unknown flag!"
		 * @param layout {Layout} [in]
		 * @param flag {STATIC_SHOT|DYNAMIC_SHOT} [in]
		 */
		record: function(layout, flag){
			if (this._isRecording === true){
				throw new Error("Recording has been started before!");
			}
			if (flag === pxl.Layout.history.STATIC_SHOT){
				this._lastSession = new pxl.Layout.history.SessionStatic(
					layout.activeLayer);
			} else if (flag === pxl.Layout.history.DYNAMIC_SHOT){
				this._lastSession = new pxl.Layout.history.SessionDynamic(
					layout.activeLayer);
			} else{
				throw new Error("Unknown flag!");
			}
			this._isRecording = true;
		},

		/**
		 * Stop recording and save session;
		 * Note: empty sessions may not saved!
		 * Also, keep in mind that each session is stored in RAM.
		 *
		 * @throws {Error} "Recording has not been started!"
		 * @param forgetFirst {Boolean} [in] When new session is saved, the first one is removed.
		 * @method stop
		 */
		stop: function(forgetFirst){
			if (this._isRecording === false){
				this.resetRecording();
				throw new Error("Recording has not been started!");
			}
			if (this._lastSession.isEmpty() === false){
				if (forgetFirst === true){ //prevent overflow
					this._stack.push(this._lastSession);
					this._stack.shift();
				} else{
					this._stack[this._pointer++] = this._lastSession;
					this._stack.splice(this._pointer, this._stack.length);
				}
			}
			this.resetRecording();
		},

		/**
		 * Clear the current session.
		 *
		 * @method resetRecording
		 */
		resetRecording: function(){
			this._isRecording = false;
			this._lastSession = null;
		},

		/**
		 * Clear the whole history.
		 *
		 * @method free
		 */
		free: function(){
			this._lastSession = null;
			this._stack.length = 0;
			this._pointer = 0;
		},

		/**
		 * Remove sessions that refer to layer argument.
		 *
		 * @method deleteLayer
		 * @param layer {Layer} [in]
		 */
		deleteLayer: function(layer){
			var i = 0;
			var tokenSession = null;
			var stack = this._stack;
			while (i < stack.length){
				tokenSession = stack[i];
				if (layer === tokenSession.layer){
					if (this._pointer >= i && --this._pointer < 0){
						this._pointer = 0;
					}
					stack.splice(i, 1);
					continue; //keep going searching from current index
				}
				++i; //iterate...
			}
		}
	};

	Object.seal(pxl.Layout.history);
})();
(function(){
	"use strict";

	/**
	 * @constructor
	 * @class Session
	 * @param layer {Layer} [in/out]
	 */
	var Session = pxl.Layout.history.Session = function(layer){
		/**
		 * Reference on the layer.
		 *
		 * @property layer
		 * @type {Layer}
		 */
		this.layer = layer;
	};

	/**
	 * @constructor
	 * @class SessionDynamic
	 * @extends Session
	 * @param layer {Layer} [in/out]
	 */
	var SessionDynamic = pxl.Layout.history.SessionDynamic = function(layer){
		Session.call(this, layer);

		/**
		 * @property _indexMap
		 * @private
		 * @type {Object}
		 * @default {}
		 */
		this._indexMap = {};

		Object.seal(this);
	};

	pxl.extend(SessionDynamic, Session);

	var sessionDynamicProto = SessionDynamic.prototype;

	/**
	 * @method isEmpty
	 * @return {Boolean}
	 */
	sessionDynamicProto.isEmpty = function(){
		for (var _ in this._indexMap){
			return false;
		}
		return true;
	};

	/**
	 * Will cache the whole area from options or an index.
	 *
	 * @method cache
	 * @param param {Object|Number} [in] Pass the usual options or an index of the pixel.
	 */
	sessionDynamicProto.cache = function(param){
		var data = this.layer.data;
        var indexMap = this._indexMap;
        if (param.constructor === Number){
            _cachePixel(param);
	    } else{
			this.layer.getLayout().__process(param, function(i, length){
				while (i < length){
					_cachePixel(i++);
				}
			});
		}

		//Helpers:
        function _cachePixel(index){
			if (index in indexMap === false){
				indexMap[index] = data[index];
			}
		};
	};

	/**
	 * Swap data from session to current layer's data.
	 *
	 * @method rewrite
	 */
	sessionDynamicProto.rewrite = function(){
		var newMap = {};
		var tokenColor = 0;
		var data = this.layer.data;
		var indexMap = this._indexMap;
		for (var index in indexMap){
			newMap[index] = data[index];
			data[index] = indexMap[index];
		}
		this._indexMap = newMap;
	};

	/**
	 * @constructor
	 * @class SessionStatic
	 * @extends Session
	 * @param layer {Layer} [in/out]
	 */
	var SessionStatic = pxl.Layout.history.SessionStatic = function(layer){
		Session.call(this, layer);

        /**
    	 * @property _cached
		 * @private
		 * @type {Boolean}
		 * @default false
		 */
        this._cached = false;

        /**
         * @property _cachedOption
		 * @private
		 * @type {Object|null}
		 * @default null
		 */
        this._cachedOption = null;

		Object.seal(this);
	};

	pxl.extend(SessionStatic, Session);

	var sessionStaticProto = SessionStatic.prototype;

    /**
     * @method isEmpty
	 * @return {Boolean}
	 */
	sessionStaticProto.isEmpty = function(){
		return this._cachedOption === null;
	};

	/**
	 * Will cache the whole area from options.
	 * Warn: can be invoked only once!
	 *
	 * @method cache
	 * @throws {Error} "Static sessions can be cached only once!"
	 * @param options {Object} [in]
	 */
	sessionStaticProto.cache = function(options){
        if (this._cached === true){
            throw new Error("Static sessions can be cached only once!");
        }
        this._cached = true;
		if (options.start && options.offset){
			//process part of the data:
			this._cachedOption = {
				"data": this.layer.cloneData(options),
				"start": options.start.clone(),
				"offset": options.offset.clone()
			};
		} else{
			//process the whole data:
			this._cachedOption = {
				"data": this.layer.cloneData(options)
				//no need to store "start" and "offset" options
			};
		}
	};

	/**
	 * Swap data from session to current layer's data.
	 *
	 * @method rewrite
	 */
	sessionStaticProto.rewrite = function(){
        var cachedOption = this._cachedOption;
		var tokenData = this.layer.cloneData(cachedOption);

        //swap:
		this.layer.insertData(cachedOption);
		cachedOption.data = tokenData;
	};
})();