;(function(parent){
    "use strict";

	if (!parent){
		return;
	}

    /**
     * @constructor
	 * @class Point
     * @param x {Number|undefined}
     * @param y {Number|undefined}
     */
    var Point = parent.Point = function(x, y){
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
	 * @property
	 * @type {Number}
	 */
	Point.EPSILON = 1e-10;

    var pointProto = Point.prototype;

	/**
	 * Return string is JSON format.
	 *
	 * @method toString
	 * @return {String}
	 */
	pointProto.toString = function(){
		return '{"x":' + this.x + ',"y":' + this.y + '}';
	};

	/**
	 * Add two Point instances;
	 * or add Point instance with numbers.
	 *
	 * @method add
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.add = function(param1, param2){
        if (param1 instanceof Point){
            this.x += param1.x;
            this.y += param1.y;
        } else{
            this.x += param1;
            this.y += (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Substract one Point instance from another;
	 * or substrast number from Point instance.
	 *
	 * @method sub
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.sub = function(param1, param2){
        if (param1 instanceof Point){
            this.x -= param1.x;
            this.y -= param1.y;
        } else{
            this.x -= param1;
            this.y -= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Multiply two Point instances;
	 * or multiply Point instance by numbers.
	 *
	 * @method mul
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.mul = function(param1, param2){
        if (param1 instanceof Point){
            this.x *= param1.x;
            this.y *= param1.y;
        } else{
            this.x *= param1;
            this.y *= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Divide one Point instance by another;
	 * or divide Point instance by numbers.
	 *
	 * @method div
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.div = function(param1, param2){
        if (param1 instanceof Point){
            this.x /= param1.x;
            this.y /= param1.y;
        } else{
            this.x /= param1;
            this.y /= (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Copy Point instance;
	 * or set new values for Point instance.
	 *
	 * @method set
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @chainable
     */
    pointProto.set = function(param1, param2){
        if (param1 instanceof Point){
            this.x = param1.x;
            this.y = param1.y;
        } else{
            this.x = param1;
            this.y = (typeof param2 === "number" ? param2 : param1);
        }
		return this;
    };

	/**
	 * Compare two Point instances
	 * or compare Point instance properties with numbers.
	 *
	 * @method cmp
     * @param param1 {Point|Number}
     * @param param2 {Number|undefined}
	 * @return {Boolean}
     */
    pointProto.cmp = function(param1, param2){
        if (param1 instanceof Point){
            return (abs(this.x - param1.x) < Point.EPSILON &&
                    abs(this.y - param1.y) < Point.EPSILON);
        }
        return (
			abs(this.x - param1) < Point.EPSILON &&
			abs(this.y - (typeof param2 === "number" ? param2 : param1)) <
			Point.EPSILON
		);
    };

	/**
	 * Make Point instance properties absolute.
	 *
	 * @method abs
	 * @chainable
	 */
	pointProto.abs = function(){
		this.x = abs(this.x);
		this.y = abs(this.y);
		return this;
	};

	/**
	 * Make Point instance properties negative.
	 *
	 * @method neg
	 * @chainable
	 */
	pointProto.neg = function(){
		this.x = -abs(this.x);
		this.y = -abs(this.y);
		return this;
	};

	/**
	 * Swap properties between Point instances.
	 *
	 * @method swap
	 * @param other {Point}
	 * @chainable
	 */
	pointProto.swap = function(other){
		var tmp = other.x;
		other.x = this.x;
		this.x = tmp;
		tmp = other.y;
		other.y = this.y;
		this.y = tmp;
		return this;
	};

	/**
	 * Round down Point instance properties.
	 *
	 * @method floor
	 * @chainable
	 */
	pointProto.floor = function(){
		this.x = _floor(this.x);
		this.y = _floor(this.y);
		return this;
	};

	/**
	 * Round up Point instance properties.
	 *
	 * @method ceil
	 * @chainable
	 */
	pointProto.ceil = function(){
		this.x = _ceil(this.x);
		this.y = _ceil(this.y);
		return this;
	};

	/**
	 * Round Point instance properties.
	 *
	 * @method round
	 * @chainable
	 */
	pointProto.round = function(){
		this.x = _round(this.x);
		this.y = _round(this.y);
		return this;
	};

	/**
	 * Check properties for NaN.
	 *
	 * @method hasNaN
	 * @return {Boolean}
	 */
	pointProto.hasNaN = function(){
		return isNaN(this.x) || isNaN(this.y);
	};

	/**
	 * Check properties for Infinity.
	 *
	 * @method hasInfinity
	 * @return {Boolean}
	 */
	pointProto.hasInfinity = function(){
		return !isFinite(this.x) || !isFinite(this.y);
	};

    /**
	 * Make new Point instance with same properties.
	 *
	 * @method clone
     * @return {Point}
     */
	pointProto.clone = function(){
		return new Point(this);
	};

	//Helpers:

	//correctly floor down if negative
	function _floor(n){
        var flooredN = n | 0;
        return (flooredN !== n && flooredN < 0 ? --flooredN : flooredN);
	};

	//faster than Math.round
	function _round(n){
		return (n + 0.5) | 0;
	};

	//
	function _ceil(n){
        var ceiledN = n | 0;
		return (n === ceiledN ? n : ceiledN + 1);
	};

	//faster than Math.abs
	function abs(n){
		return n < 0 || n === -0 ? -n : n;
	};
})(pxl);