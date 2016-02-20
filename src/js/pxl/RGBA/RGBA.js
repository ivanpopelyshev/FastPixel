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