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
		record: function(layer){
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