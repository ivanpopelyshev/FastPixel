;(function(parent){
	"use strict";

	if (!parent){
		return;
	}

	/**
	 * Look at: http://members.chello.at/easyfilter/bresenham.js
	 *
	 * @class bresenham
	 */
	var bresenham = parent.bresenham = {
		/**
		 * @method line
		 * @param x0 {Number}
		 * @param y0 {Number}
		 * @param x1 {Number}
		 * @param y1 {Number}
		 * @param callback {Function}
		 */
		line: function(x0, y0, x1, y1, callback){
			var dx = x1 - x0;
			if (dx < 0){
				dx = -dx;
			}
			var dy = y1 - y0;
			if (dy >= 0){
				dy = -dy;
			}
			var sx = x0 < x1 ? 1 : -1;
			var sy = y0 < y1 ? 1 : -1;
			var err = dx + dy;
			var e2 = 0;
			for (;;){
				callback(x0, y0);
				if (x0 === x1 && y0 === y1) break;
				e2 = err << 1;
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
		 * @method rectangle
		 * @param x0 {Number}
		 * @param y0 {Number}
		 * @param x1 {Number}
		 * @param y1 {Number}
		 * @param callback {Function}
		 */
		rectangle: function(x0, y0, x1, y1, callback){
			var tmp = 0;
			if (x0 === x1 || y0 === y1){
				if (x0 === x1 && y0 === y1){
					callback(x0, y0);
				} else{
					bresenham.line(x0, y0, x1, y0, callback);
				}
			} else{
				if (x1 < x0){
					tmp = x0;
					x0 = x1;
					x1 = tmp;
				}
				if (y1 < y0){
					tmp = y0;
					y0 = y1;
					y1 = tmp;
				}
				bresenham.line(x0, y0, x1 - 1, y0, callback);
				bresenham.line(x1, y0, x1, y1 - 1, callback);
				bresenham.line(x1, y1, x0 + 1, y1, callback);
				bresenham.line(x0, y1, x0, y0 + 1, callback);
			}
		},

		/**
		 * Ellipse inside rectangle.
		 *
		 * @method ellipse
		 * @param x0 {Number}
		 * @param y0 {Number}
		 * @param x1 {Number}
		 * @param y1 {Number}
		 * @param callback {Function}
		 */
		ellipse: function(x0, y0, x1, y1, callback){
			var a = x1 - x0;
			var powA = a * a;
			if (a < 0){
				a = -a;
			}
			var b = y1 - y0;
			var powB = b * b;
			if (b < 0){
				b = -b;
			}
			var b1 = b & 1;
			var dx = (1 - a) * powB << 2;
			var dy = (1 + b1) * powA << 2;
			var err = dx + dy + b1 * powA;
			var e2 = 0;
			if (x0 > x1){
				x0 = x1;
				x1 += a;
			}
			if (y0 > y1){
				y0 = y1;
			}
			y0 += (b + 1) >> 1;
			y1 = y0 - b1;
			a = powA << 3;
			b1 = powB << 3;
			do{
				callback(x1, y0);
				callback(x0, y0);
				callback(x0, y1);
				callback(x1, y1);
				e2 = err << 1;
				if (e2 <= dy){
					++y0;
					--y1;
					err += dy += a;
				}
				if (e2 >= dx || (err << 1) > dy){
					++x0;
					--x1;
					err += dx += b1;
				}
			} while(x0 <= x1);
			while (y0 - y1 <= b){
				callback(x0 - 1, y0);
				callback(x1 + 1, y0++);
				callback(x0 - 1, y1);
				callback(x1 + 1, y1--);
			}
		}
	}

	Object.freeze(bresenham);

})(pxl);