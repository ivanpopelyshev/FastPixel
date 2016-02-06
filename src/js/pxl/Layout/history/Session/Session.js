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
		 * Reference on the layer.
		 *
		 * @property layer
		 * @type {Layer}
		 */
		this.layer = layer;

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
	 * Will cache an index and the color of that index.
	 *
	 * @method cache
	 * @param param {Object|Number} [in] Pass the usual options or an index of the pixel.
	 */
	sessionDynamicProto.cache = function(param){
		var data = this.layer.data;
        var indexMap = this._indexMap;
        if (param.constructor === Number){
            _cachePixel(param);
	    } else if(param.start && param.offset){
			if (param.offset.x === 1 && param.offset.y === 1){
				_cachePixel(this.layer.getLayout().indexAt(param.start));
			} else{
				this.layer.getLayout().__process(param, _processLine);
			}
		} else{
			this.layer.getLayout().__process(pxl.emptyOptions, _processLine);
		}

		//Helpers:
        function _cachePixel(index){
			if (!(index in indexMap)){
				indexMap[index] = pxl.toRGBA(data[index],
											 data[index + 1],
											 data[index + 2],
											 data[index + 3]);
			}
		};

		function _processLine(i, length){
			while (i < length){
				_cachePixel(i);
				i += 4;
			}
		};
	};

	/**
	 * Swap data from session to current layer's data.
	 *
	 * @method rewrite
	 */
	sessionDynamicProto.rewrite = function(){
		var colorMap = {};
		var packedColor = 0;
		var tokenColor = null;
		var layer = this.layer;
		var indexMap = this._indexMap;
		for (var index in indexMap){
			packedColor = indexMap[index];
			if (packedColor in colorMap){
				tokenColor = colorMap[packedColor];
			} else{
				tokenColor = [pxl.getR(packedColor),
							  pxl.getG(packedColor),
							  pxl.getB(packedColor),
							  pxl.getA(packedColor)];
				colorMap[packedColor] = tokenColor;
			}
			layer.setAt(+index, //cast to Number, since "index" is a String
						tokenColor[0],
						tokenColor[1],
						tokenColor[2],
						tokenColor[3]);
		}
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
	 * Will cache the whole token array.
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