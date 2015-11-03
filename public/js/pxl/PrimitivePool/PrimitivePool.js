;(function(parent){
	"use strict";

	if (!parent){
		return;
	}

	/**
	 * Warn: this container is for primitive types only (Boolean, Number, String);
	 * For performance reason it also don't check for types during push(),
	 * so make sure you push same type as you set in constructor;
	 * Grows up as usual array but this one is better to re-use (GC friendly).
	 *
	 * @constructor
	 * @class PrimitivePool
	 * @param ctor {String|Number|Boolean} [in]
	 */
	var PrimitivePool = parent.PrimitivePool = function(ctor){
		/**
		 * @property _container
		 * @private
		 * @type {Array}
		 */
		this._container = [typeof ctor === "function" ? ctor() : ctor]; //tell interpreter which type we going to use

		/**
		 * @property _size
		 * @private
		 * @type {Number}
		 * @default 0
		 */
		this._size = 0;
	};

	var poolProto = PrimitivePool.prototype;

	/**
	 * Get the current pool's "occupancy".
	 *
	 * @method size
	 * @return {Number}
	 */
	poolProto.size = function(){
		return this._size;
	};

	/**
	 * @method push
	 * @param primitive {String|Number|Boolean} [in]
	 */
	poolProto.push = function(primitive){
		if (this._size === this._container.length){
			this._size = this._container.push(primitive);
		} else{
			this._container[this._size++] = primitive;
		}
	};

	/**
	 * Pop the last available element (or null if pool is empty).
	 *
	 * @method pop
	 * @return {String|Number|Boolean|null}
	 */
	poolProto.pop = function(){
		return (this._size === 0 ? null : this._container[--this._size]);
	};

	/**
	 * Get available element by index (or null if index is out of size).
	 *
	 * @method at
	 * @param index {Number} [in]
	 * @return {String|Number|Boolean|null}
	 */
	poolProto.at = function(index){
		return (index < this._size || index < 0 ? this._container[index] : null);
	};

	/**
	 * Get the last available element (or null if pool is empty).
	 *
	 * @method back
	 * @return {String|Number|Boolean|null}
	 */
	poolProto.back = function(){
		return (this._size === 0 ? null : this._container[this._size - 1]);
	};

	/**
	 * Completely reduce size (memory is still occupied).
	 *
	 * @method reduce
	 */
	poolProto.reduce = function(){
		this._size = 0;
	};

	/**
	 * Reduce unused memory.
	 *
	 * @method shrink
	 */
	poolProto.shrink = function(){
		this._container.length = this._size;
	};

	/**
	 * Deallocate whole data.
	 *
	 * @method free
	 */
	poolProto.free = function(){
		this._container.length = this._size = 0;
	};
})(pxl);