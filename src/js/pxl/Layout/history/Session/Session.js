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

		/**
		 * @property _list
		 * @protected
		 * @type {Array}
		 * @default []
		 */
		this._list = [];
	};

	var sessionProto = Session.prototype;

	/**
	 * @method isEmpty
	 * @return {Boolean}
	 */
	sessionProto.isEmpty = function(){
		return this._list.length === 0;
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
		 * @property _sessionMap
		 * @private
		 * @type {Array}
		 * @default []
		 */
		this._sessionMap = {};
	};

	pxl.extend(SessionDynamic, Session);
	
	var sessionDynamicProto = SessionDynamic.prototype;

	/**
	 * Will cache an index and the color from one.
	 *
	 * @method push
	 * @param index {Number} [in]
	 */
	sessionDynamicProto.push = function(index){
		var data = this.layer.data;
		var color = data[index] + ","
					+ data[index + 1] + ","
					+ data[index + 2] + ","
					+ data[index + 3];
		if (color in this._sessionMap){
			this._sessionMap[color].push(index);
		} else{
			this._list.push(color);
			this._sessionMap[color] = [index];
		}
	};

	/**
	 * Swap data from session to current layer's data.
	 *
	 * @method rewrite
	 */
	sessionDynamicProto.rewrite = function(){
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
		while (this._list.length){
			color = this._list.pop();
			pixel = color.split(",");
			r = pixel[0];
			g = pixel[1];
			b = pixel[2];
			a = pixel[3];
			indexes = this._sessionMap[color];
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
		this._sessionMap = swappedMap;
		this._list = swappedOrder;
	};

	/**
	 * @constructor
	 * @class SessionStatic
	 * @extends Session
	 * @param layer {Layer} [in/out]
	 */
	var SessionStatic = pxl.Layout.history.SessionStatic = function(layer){
		Session.call(this, layer);
	};

	pxl.extend(SessionStatic, Session);

	var sessionStaticProto = SessionStatic.prototype;

	/**
	 * Will cache the whole token array.
	 *
	 * @method push
	 * @param options {Object} [in]
	 */
	sessionStaticProto.push = function(options){
		var layout = this.layer.getLayout();
		if (options.start && options.offset){
			this._list.push({
				"data": this.layer.cloneData(options),
				"start": new pxl.Point(options.start),
				"offset": new pxl.Point(options.offset)
			});
		} else{
			this._list.push({
				"data": this.layer.cloneData(options),
				"start": new pxl.Point(0, 0),
				"offset": new pxl.Point(layout.getWidth(), layout.getHeight())
			});
		}
	};

	/**
	 * Swap data from session to current layer's data.
	 *
	 * @method rewrite
	 */
	sessionStaticProto.rewrite = function(){
		var lastData = this._list[this._list.length - 1];
		var tokenData = this.layer.cloneData(lastData);
		this.layer.insertData(lastData);
		lastData.data = tokenData;
	};
})();