;(function(parent){
	"use strict";

	if (!parent){
		return;
	}

	/**
	 * Grows up as usual array but this one is better to re-use (GC friendly).
	 *
	 * @constructor
	 * @class GrowingPool
	 * @param constructor {Function} [in]
	 */
	var GrowingPool = parent.GrowingPool = function(constructor){
		/**
		 * @property _container
		 * @private
		 * @type {Array}
		 */
		this._container = [new constructor]; //tell interpreter which type we going to store

		/**
		 * @property _allocator
		 * @private
		 * @type {Function}
		 */
		this._allocator = constructor;

		/**
		 * @property _size
		 * @private
		 * @type {Number}
		 * @default 0
		 */
		this._size = 0;
	};

	var poolProto = GrowingPool.prototype;

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
	 * Check whenever pool is full.
	 *
	 * @method isFull
	 * @return {Number}
	 */
	poolProto.isFull = function(){
		return this._size === this._container.length;
	};

	/**
	 * Check whenever pool's memory is empty.
	 *
	 * @method isEmpty
	 * @return {Number}
	 */
	poolProto.isEmpty = function(){
		return this._container.length === 0;
	};

	/**
	 * Expand size and return new top item
	 *
	 * @method expand
	 * @return {ANY}
	 */
	poolProto.expand = function(){
		var item = null;
		if (this._size === this._container.length){
			item = new this._allocator;
			this._size = this._container.push(item);
			return item;
		}
		return this._container[this._size++];
	};

	/**
	 * Pop the last available element (or null if pool is empty).
	 *
	 * @method pop
	 * @return {ANY|null}
	 */
	poolProto.pop = function(){
		return (this._size === 0 ? null : this._container[--this._size]);
	};

	/**
	 * Get available element by index (or null if index is out of size).
	 *
	 * @method at
	 * @param index {Number} [in]
	 * @return {ANY|null}
	 */
	poolProto.at = function(index){
		return (index < this._size || index < 0 ? this._container[index] : null);
	};

	/**
	 * Get the last available element (or null if pool is empty).
	 *
	 * @method back
	 * @return {ANY|null}
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