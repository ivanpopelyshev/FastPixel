;(function(parent){
	"use strict";

	if (!parent){
		return;
	}

	/**
	 * For performance reason it don't check for types matching during push(),
	 * so make sure you push same type as you set in constructor;
	 * Grows up as usual array but this one is better to re-use (GC friendly).
	 *
	 * @constructor
	 * @class GrovingPool
	 * @param ctor {Function} [in] constructor
	 */
	var GrovingPool = parent.GrovingPool = function(ctor){
		/**
		 * @property _container
		 * @private
		 * @type {Array}
		 */
		this._container = [ctor()]; //tell interpreter which type we going to store

		/**
		 * @property _size
		 * @private
		 * @type {Number}
		 * @default 0
		 */
		this._size = 0;
	};

	var poolProto = GrovingPool.prototype;

	/**
	 * Get the current occupied size.
	 *
	 * @method size
	 * @return {Number}
	 */
	poolProto.size = function(){
		return this._size;
	};

	/**
	 * Method don't check for type matching, so be careful!
	 *
	 * @method push
	 * @param object {*} [in]
	 */
	poolProto.push = function(object){
		if (this._size === this._container.length){
			this._size = this._container.push(object);
		} else{
			this._container[this._size++] = object;
		}
	};

	/**
	 * Pop the last available element (or null if pool is empty).
	 *
	 * @method pop
	 * @return {*|null}
	 */
	poolProto.pop = function(){
		return (this._size === 0 ? null : this._container[--this._size]);
	};

	/**
	 * Get available element by index (or null if index is out of size).
	 *
	 * @method at
	 * @param index {Number} [in]
	 * @return {*|null}
	 */
	poolProto.at = function(index){
		return (index < this._size || index < 0 ? this._container[index] : null);
	};

	/**
	 * Get the last available element (or null if pool is empty).
	 *
	 * @method back
	 * @return {*|null}
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