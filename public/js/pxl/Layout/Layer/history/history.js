(function(){
    "use strict";

	/**
	 * @class history
	 */
	pxl.Layout.Layer.history = {
		/**
		 * @property MAX_HISTORY_SIZE
		 * @type {Number}
		 * @final
		 * @default 20
		 */
		MAX_HISTORY_SIZE: 20,

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
		 * @property isRecording
		 * @private
		 * @type {Boolean}
		 * @default false
		 */
		isRecording: false,

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
		 * @method getSession
		 * @param layer {Layer}
		 */
		getSession: function(layer){
			if (this._lastSession === null){
				this._lastSession = new pxl.Layout.Layer.history.Session(layer);
			}
			return this._lastSession;
		},

		/**
		 * Start Layer recording.
		 *
		 * @method rec
		 * @throws {Error} Raise an error if already is under recording.
		 * @param layer {Layer|undefined}
		 */
		record: function(layer){
			if (this.isRecording === true){
				throw new Error;
			}
			this.isRecording = true;
		},

		/**
		 * Stop recording and save session.
		 *
		 * @method stop
		 */
		stop: function(){
			if (this._lastSession.isEmpty() === false){
				if (this._pointer < this.MAX_HISTORY_SIZE){ //prevent overflow
					this._stack[this._pointer++] = this._lastSession;
					this._stack.splice(this._pointer, this._stack.length);
				} else{
					this._stack.push(this._lastSession);
					this._stack.shift();
				}
			}
			this.isRecording = false;
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