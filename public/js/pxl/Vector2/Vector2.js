;(function(parent){
    "use strict";

	if (!parent){
		return;
	}

    /**
     * @constructor
	 * @class Vector2
     * @param x {Number|undefined}
     * @param y {Number|undefined}
     */
    var Vector2 = parent.Vector2 = function(x, y){
        this.set(x || 0, y);

		/**
		 * @property x
		 * @type {Number}
		 * @default 0
		 */

		/**
		 * @property y
		 * @type {Number}
		 * @default 0
		 */
    };

	/**
	 * Floating point error for comparison method.
	 *
	 * @static
	 * @type {Number}
	 */
	Vector2.EPSILON = 1e-10;

    var vector2Proto = Vector2.prototype;

	/**
	 * Return string is JSON format.
	 *
	 * @method toString
	 * @return {String}
	 */
	vector2Proto.toString = function(){
		return '{"x":' + this.x + ',"y":' + this.y + '}';
	};

	/**
	 * Add two Vector2 instances;
	 * or add Vector2 instance and numbers.
	 *
	 * @method add
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.add = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x += param1.x;
            this.y += param1.y;
        } else{
            this.x += param1;
            this.y += (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Substrust one Vector2 instance from another;
	 * or substrust number from Vector2 instance.
	 *
	 * @method sub
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.sub = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x -= param1.x;
            this.y -= param1.y;
        } else{
            this.x -= param1;
            this.y -= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Multiply two Vector2 instances;
	 * or multiply Vector2 instance by numbers.
	 *
	 * @method mul
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.mul = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x *= param1.x;
            this.y *= param1.y;
        } else{
            this.x *= param1;
            this.y *= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Divide one Vector2 instance by another;
	 * or divide Vector2 instance by numbers.
	 *
	 * @method div
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.div = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x /= param1.x;
            this.y /= param1.y;
        } else{
            this.x /= param1;
            this.y /= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Copy Vector2 instance;
	 * or set new values for Vector2 instance.
	 *
	 * @method set
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    vector2Proto.set = function(param1, param2){
        if (param1 instanceof Vector2){
            this.x = param1.x;
            this.y = param1.y;
        } else{
            this.x = param1;
            this.y = (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Compare two Vector2 instances
	 * or compare Vector2 instance properties with numbers.
	 *
	 * @method cmp
     * @param param1 {Vector2|Number}
     * @param param2 {Number|undefined}
	 * @return {Boolean}
     */
    vector2Proto.cmp = function(param1, param2){
		var EPSILON = Vector2.EPSILON;
        if (param1 instanceof Vector2){
            return (Math.abs(this.x - param1.x) < EPSILON &&
                    Math.abs(this.y - param1.y) < EPSILON);
        }
        return (
			Math.abs(this.x - param1) < EPSILON &&
			Math.abs(
				this.y - (typeof param2 === "number" ? param2 : param1)
			) < EPSILON
		);
    };

	/**
	 * Make Vector2 instance properties absolute.
	 *
	 * @method abs
	 * @chainable
	 */
	vector2Proto.abs = function(){
		if (this.x < 0){
			this.x = -this.x;
		}
		if (this.y < 0){
			this.y = -this.y;
		}
		return this;
	};

	/**
	 * Make Vector2 instance properties negative.
	 *
	 * @method neg
	 * @chainable
	 */
	vector2Proto.neg = function(){
		if (this.x >= 0){
			this.x = -this.x;
		}
		if (this.y >= 0){
			this.y = -this.y;
		}
		return this;
	};

	/**
	 * Swap properties between Vector2 instances.
	 *
	 * @method swap
	 * @param other {Vector2}
	 * @chainable
	 */
	vector2Proto.swap = function(other){
		var tmp = other.x;
		other.x = this.x;
		this.x = tmp;
		tmp = other.y;
		other.y = this.y;
		this.y = tmp;
		return this;
	};

	/**
	 * Round down Vector2 instance properties.
	 *
	 * @method floor
	 * @chainable
	 */
	vector2Proto.floor = function(){
		this.x = _floor(this.x);
		this.y = _floor(this.y);
		return this;
	};

	/**
	 * Round up Vector2 instance properties.
	 *
	 * @method ceil
	 * @chainable
	 */
	vector2Proto.ceil = function(){
		this.x = _ceil(this.x);
		this.y = _ceil(this.y);
		return this;
	};

	/**
	 * Round Vector2 instance properties.
	 *
	 * @method round
	 * @chainable
	 */
	vector2Proto.round = function(){
		this.x = _round(this.x);
		this.y = _round(this.y);
		return this;
	};

	/**
	 * Check for NaN value inside properties.
	 *
	 * @method hasNaN
	 * @return {Boolean}
	 */
	vector2Proto.hasNaN = function(){
		return this.x !== this.x || this.y !== this.y;
	};

	/**
	 * Check for Infinity value inside properties.
	 *
	 * @method hasInfinity
	 * @return {Boolean}
	 */
	vector2Proto.hasInfinity = function(){
		return !isFinite(this.x) || !isFinite(this.y);
	};

    /**
	 * Return new Vector2 instance with same properties.
	 *
	 * @method clone
     * @return {Vector2}
     */
	vector2Proto.clone = function(){
		return new Vector2(this);
	};

	//Helpers:

	//correctly floor down if negative
	function _floor(n){
		return (n < 0 ? (n | 0) - 1 : n | 0);
	};

	//faster than Math.round
	function _round(n){
		return (n + 0.5) | 0;
	};

	//
	function _ceil(n){
		return (n === (n | 0) ? n : (n | 0) + 1);
	};
})(pxl);