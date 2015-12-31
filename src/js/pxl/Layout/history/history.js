(function(){
    "use strict";

	/**
	 * @class history
	 */
	pxl.Layout.history = {
		/**
		 * @property MAX_HISTORY_SIZE
		 * @type {Number}
		 * @final
		 * @default 30
		 */
		MAX_HISTORY_SIZE: 30,

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
		 * Point on the current index in container
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
		 * @method isHistoryEmpty
		 * @return {Boolean}
		 */
		isHistoryEmpty: function(){
			return this._stack.length === 0;
		},

		/**
		 * @method isHistoryFull
		 * @return {Boolean}
		 */
		isHistoryFull: function(){
			return this._stack.length === this.MAX_HISTORY_SIZE;
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
			if (this._pointer !== 0){
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
		 * @param param {Object|Number}
		 */
		cache: function(param){
			this._lastSession.push(param);
		},

		/**
		 * Start Layer recording.
		 *
		 * @method record
		 * @throws {Error} Raise an error if already is under recording; Or if flag is unknown.
		 * @param layout {Layout}
		 * @param flag {Number} STATIC_SHOT or DYNAMIC_SHOT
		 */
		record: function(layout, flag){
			if (this._isRecording === true){
				throw new Error;
			}
			if (flag === pxl.Layout.history.STATIC_SHOT){
				this._lastSession = new pxl.Layout.history.SessionStatic(
					layout.activeLayer);
			} else if (flag === pxl.Layout.history.DYNAMIC_SHOT){
				this._lastSession = new pxl.Layout.history.SessionDynamic(
					layout.activeLayer);
			} else{
				throw new Error;
			}
			this._isRecording = true;
		},

		/**
		 * Stop recording and save session.
		 *
		 * @throws {Error} Raise an error if recording has not been started.
		 * @method stop
		 */
		stop: function(){
			if (this._isRecording !== true){
				throw new Error;
			}
			if (this._lastSession.isEmpty() === false){
				if (this._pointer < this.MAX_HISTORY_SIZE){ //prevent overflow
					this._stack[this._pointer++] = this._lastSession;
					this._stack.splice(this._pointer, this._stack.length);
				} else{
					this._stack.push(this._lastSession);
					this._stack.shift();
				}
			}
			this._isRecording = false;
			this._lastSession = null;
		},

		/**
		 * Remove sessions with deleted/empty layers.
		 *
		 * @method clean
		 */
		clean: function(){
			var container = this._stack;
			var tokenSession = null;
			var i = 0;
			while (i < container.length){
				tokenSession = container[i];
				if (!tokenSession.layer || tokenSession.layer.data === null){
					//correctly move the pointer:
					if (tokenSession === container[this._pointer]){
						if (container.length > 1){
							if (this._pointer !== 0){
								--this._pointer;
							}
						} else{
							this._pointer = 0;
						}
					}
					container.splice(i, 1);
					continue;
				}
				++i;
			}
		}
	};
})();