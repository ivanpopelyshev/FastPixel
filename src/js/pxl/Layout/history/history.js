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
		 * @param source {Layout|Layer} [in] activeLayer will be taken in case layout is passed.
		 * @param flag {STATIC_SHOT|DYNAMIC_SHOT} [in]
		 */
		record: function(source, flag){
			var layer = (source instanceof pxl.Layout.Layer)
				? source : source.activeLayer;
			if (this._isRecording === true){
				throw new Error("Recording has been started before!");
			}
			if (flag === pxl.Layout.history.STATIC_SHOT){
				this._lastSession = new pxl.Layout.history.SessionStatic(layer);
			} else if (flag === pxl.Layout.history.DYNAMIC_SHOT){
				this._lastSession = new pxl.Layout.history.SessionDynamic(layer);
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