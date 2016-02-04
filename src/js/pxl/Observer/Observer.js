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