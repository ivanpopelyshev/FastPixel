;(function(parent){
    "use strict";

	if (!parent){
		return;
	}

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
     * @param event {String} [in] Name of event.
     * @param method {Function} [out] The method to execute when event is fired.
     */
    observerProto.subscribe = function(event, method){
        if (event in this._eventBook){
            var list = this._eventBook[event];
			if (list.indexOf(method) === -1){
				list.push(method);
			}
        } else{
			this._eventBook[event] = [method];
		}
    };

    /**
	 * @method unsubscribe
     * @param event {String} [in] Name of event.
     * @param method {Function} [in] Have to be same reference as in subscribe method.
     */
    observerProto.unsubscribe = function(event, method){
        if (event in this._eventBook){
            var list = this._eventBook[event];
            var index = list.indexOf(method);
            if (index !== -1){
                list.splice(index, 1);
            }
        }
    };

    /**
	 * @method notify
     * @param event {String} [in][in] Name of event.
     * @param eventObj {Object} [in/out] Special event data.
     */
    observerProto.notify = function(event, eventObj){
        if (event in this._eventBook){
            var list = this._eventBook[event];
            for (var i = 0; i < list.length; ++i){
                list[i](eventObj); //callback
            }
        }
    };
})(pxl);