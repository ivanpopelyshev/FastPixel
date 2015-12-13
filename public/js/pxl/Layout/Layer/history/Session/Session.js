(function(){
	"use strict";

	var history = pxl.Layout.Layer.history;

	/**
	 * @constructor
	 * @class Session
	 * @param layer {Layer}
	 */
	var Session = history.Session = function(layer){
		this.layer = layer;
		this._colorMap = {};
		this._colorOrder = [];
	};

	var sessionProto = Session.prototype;

	/**
	 * @method isEmpty
	 * @return {Boolean}
	 */
	sessionProto.isEmpty = function(){
		return this._colorOrder.length === 0;
	};

	/**
	 * Have to be called once, before started color processing;
	 * Only for operations with single color.
	 *
	 * @method initColor
	 * @param r {Number}
	 * @param g {Number}
	 * @param b {Number}
	 * @param a {Number}
	 */
	sessionProto.initColor = function(r, g, b, a){
		var color = r + "," + g + "," + b + "," + a;
		this._colorOrder.push(color);
		this._colorMap[color] = [];
	};

	/**
	 * It is recommended to use this during processing multiple colors.
	 *
	 * @method pushPixel
	 * @param index {Number}
	 * @param r {Number}
	 * @param g {Number}
	 * @param b {Number}
	 * @param a {Number}
	 */
	sessionProto.pushPixel = function(index, r, g, b, a){
		if (history.isRecording){
			var color = r + "," + g + "," + b + "," + a;
			if (color in this._colorMap){
				this._colorMap[color].push(index);
			} else{
				this._colorOrder.push(color);
				this._colorMap[color] = [index];
			}
		}
	};

	/**
	 * Only for operations with single color. Used only after initColor() method.
	 *
	 * @method pushIndex
	 * @param index {Number}
	 */
	sessionProto.pushIndex = function(index){
		if (history.isRecording){
			this._colorMap[this._colorOrder[0]].push(index);
		}
	};

	/**
	 * @method rewrite
	 */
	sessionProto.rewrite = function(){
		var pixel = null;
		var data = this.layer.data;
		var indexes = null;
		var color = null;
		var tokenIndex = 0;
		var length = 0;
		var i = 0;
		var r = 0;
		var g = 0;
		var b = 0;
		var a = 0;
		var usedIndexes = {};
		var swappedMap = {};
		var swappedOrder = [];
		while (this._colorOrder.length){
			color = this._colorOrder.pop();
			pixel = color.split(",");
			r = pixel[0];
			g = pixel[1];
			b = pixel[2];
			a = pixel[3];
			indexes = this._colorMap[color];
			length = indexes.length;
			for (i = 0; i < length; ++i){
				tokenIndex = indexes[i];
				if (!(tokenIndex in usedIndexes)){
					usedIndexes[tokenIndex] = false;
					color = data[tokenIndex] + "," +
							data[tokenIndex + 1] + "," +
							data[tokenIndex + 2] + "," +
							data[tokenIndex + 3];
					if (color in swappedMap){
						swappedMap[color].push(tokenIndex);
					} else{
						swappedOrder.push(color);
						swappedMap[color] = [tokenIndex];
					}
				}
				data[tokenIndex] = r;
				data[tokenIndex + 1] = g;
				data[tokenIndex + 2] = b;
				data[tokenIndex + 3] = a;
			}
		}
		this._colorMap = swappedMap;
		this._colorOrder = swappedOrder;
	};
})();