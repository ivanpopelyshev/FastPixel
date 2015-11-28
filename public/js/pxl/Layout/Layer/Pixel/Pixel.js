(function(){
	"use strict";

	/**
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