(function(){
	"use strict";

	var history = pxl.Layout.history;

	/**
	 * @class controller
	 */
	pxl.Layout.controller = {

		/**
		 * @property _settings
		 * @private
		 * @type {Object}
		 */
		_settings: {
			"current": new pxl.Vector2,
			"previous": new pxl.Vector2,
			"pixel": new pxl.ImageDataArray([0, 0, 0, 255]), //black
			"pixelSize": pxl.MIN_PEN_SIZE
		},

		/**
		 * @method updateUserPosition
		 * @param x {Number}
		 * @param y {Number}
		 * @chainable
		 */
		updateUserPosition: function(x, y){
			this._settings.previous.set(this._settings.current);
			pxl.activeView.fitToTransition(
				this._settings.current.set(x, y).abs().floor()
			);
			this._settings.current.sub(pxl.activeView.getImagePoint());
			return this;
		},

		/**
		 * @method updateUserPosition
		 * @return {Boolean}
		 */
		positionChanged: function(){
			return !this._settings.previous.cmp(this._settings.current);
		},

		/**
		 * Put the position where plot the pixel;
		 * If there are no parameters,
		 * the position would be taken from last updated user position.
		 *
		 * @see updateUserPosition
		 * @method plotPixel
		 * @param x {Number|undefined}
		 * @param y {Number|undefined}
		 */
		plotPixel: (function(){ //anonymous
			var _options = {
				"start": new pxl.Vector2,
				"offset": new pxl.Vector2,
				"pixel": null,
				"isMix": true
			};
			return function(x, y){
				if (arguments.length){
					_options.start.set(x, y);
				} else{
					_options.start.set(this._settings.current);
				}				
				_options.offset.set(this._settings.pixelSize);
				_options.pixel = this._settings.pixel;
				pxl.activeView.getLayout().plot(_options);
			};
		})(),

		/**
		 * Bresenham algo: http://members.chello.at/easyfilter/bresenham.js
		 * Put the start and end positions to plot the line;
		 * If there are no parameters,
		 * the start and end would be taken from last updated user position.
		 *
		 * @see updateUserPosition()
		 * @method plotLine
		 * @param x0 {Number|undefined}
		 * @param y0 {Number|undefined}
		 * @param x1 {Number|undefined}
		 * @param y1 {Number|undefined}
		 */
		plotLine: function(x0, y0, x1, y1){
			if (!arguments.length){
				x0 = this._settings.current.x;
				y0 = this._settings.current.y;
				x1 = this._settings.previous.x;
				y1 = this._settings.previous.y;
			}
			var dx = Math.abs(x1 - x0);
			var dy = -Math.abs(y1 - y0);
			var sx = x0 < x1 ? 1 : -1;
			var sy = y0 < y1 ? 1 : -1;
			var err = dx + dy;
			var e2 = 0;
			for (;;){
				this.plotPixel(x0, y0);
				if (x0 === x1 && y0 === y1) break;
				e2 = err + err;
				if (e2 >= dy){
					err += dy;
					x0 += sx;
				}
				if (e2 <= dx){
					err += dx;
					y0 += sy;
				}
			}
		},

		/**
		 * Put the position where you are going to fill;
		 * If there are no parameters,
		 * the position would be taken from last updated user position.
		 *
		 * @see updateUserPosition
		 * @method fill
		 * @param x {Number}
		 * @param y {Number}
		 */
		fill: function(x, y){
			var position = null;
			if (arguments.length){
				position = new pxl.Vector2(x, y);
			} else{
				position = new pxl.Vector2(this._settings.current);
			}
			pxl.activeView.fitToTransition(position);
			//position.sub(pxl.activeView.getImagePoint());
			pxl.activeView.getLayout().fill({
				"position": position,
				"pixel": this._settings.pixel,
				"isMix": true
			});
		},

		/**
		 * Carry the current pixel according to "userHolder" object.
		 *
		 * @method carryPixel
		 * @chainable
		 */
		carryPixel: (function(){ //anonymous
			var _options = {
				"start": new pxl.Vector2,
				"offset": new pxl.Vector2(pxl.MIN_PEN_SIZE),
				"pixel": null
			};
			return function(){
				var activeView = pxl.activeView;
				var scaleOffset = activeView.getScaleOffset();
				var scale = activeView.getScale();

				_options.start.set(this._settings.previous);

				activeView.clear(_options).redraw(_options);

				_options.offset.set(this._settings.pixelSize); //update offset
				_options.start.set(this._settings.current);

				_options.pixel = this._settings.pixel;
				activeView.drawRect(_options);

				return this;
			}
		})(),

		/**
		 * @method undo
		 * @chainable
		 */
		undo: _undo_redo("undo"),

		/**
		 * @method redo
		 * @chainable
		 */
		redo: _undo_redo("redo"),

		/**
		 * @method rescale
		 * @param ds {Number} deltascale
		 * @chainable
		 */
		rescale: function(ds){
			var options = {};
			pxl.activeView.clear(options)
			.setScale(pxl.activeView.getScale() + ds)
			.begin()
			.redraw(options)
			.end();
			return this;
		},

		/**
		 * @method setPixelSize
		 * @param newSize {Number}
		 * @chainable
		 */
		setPixelSize: function(newSize){
			this._settings.pixelSize = pxl.clamp(
				newSize, pxl.MIN_PEN_SIZE, pxl.MAX_PEN_SIZE
			);
			return this;
		},

		/**
		 * @method setColor
		 * @param r {Number}
		 * @param g {Number}
		 * @param b {Number}
		 * @param a {Number}
		 * @chainable
		 */
		setColor: function(r, g, b, a){
			this._settings.pixel.set(Array.prototype.slice.call(arguments));
			return this;
		},

		/**
		 * @method record
		 * @param callback {Function}
		 * @chainable
		 */
		record: function(callback){
			history.rec(pxl.activeView.getLayout().activeLayer);
			callback.call(this);
			history.stop();
			return this;
		},

		/**
		 * @method draw
		 * @param callback {Function}
		 * @chainable
		 */
		draw: function(callback){
			pxl.activeView.begin();
			callback.call(this);
			pxl.activeView.end();
			return this;
		}
	};

	//Helper:
	function _undo_redo(_method){ //anonymous
		return function(){
			var session = history.getCurrentSession();
			if (session){
				history[_method]();
				session.layer.getLayout().mergeLayers().observer.notify(
					pxl.PIXELS_CHANGED_EVENT, {}
				);
			}
			return pxl.Layout.controller;
		};
	}
})();