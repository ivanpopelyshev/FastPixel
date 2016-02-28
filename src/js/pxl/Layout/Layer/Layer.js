(function(){
	"use strict";

	/**
	 * A wrapper for Uint32Array;
	 * Note: most of the features require the layout.
	 *
	 * @constructor
	 * @class Layer
	 * @throws {RangeError} "Buffer limit has been reached!"
	 * @param source {Array|TypedArray|ArrayBuffer|Number}
	 * @param layout {Layout|undefined}
	 * @param name {String|undefined}
	 * @example
		var layer = new pxl.Layout.Layer(8 * 16, layout, "Background"); //suppose that layout is 8x16
		//or
		var layer = new pxl.Layout.Layer([255, 255, 255, 255], layout);
	 */
	var Layer = pxl.Layout.Layer = function(source, layout, name){
		/**
		 * @property data
		 * @type {Uint32Array}
		 */
		this.data = new Uint32Array(source);

		if (this.data.length >
			Layer.MAX_BUFFER_SIZE / this.data.BYTES_PER_ELEMENT){
			this.data = null; //free memory
			throw new RangeError("Buffer limit has been reached!");
		}

		/**
		 * @property name
		 * @type {String}
		 * @default ""
		 */
		this.name = name || "";

		/**
		 * @property isVisible
		 * @type {Boolean}
		 * @default true
		 */
		this.isVisible = true;

		/**
		 * @property _layout
		 * @private
		 * @type {Layout|null}
		 * @default null
		 */
		this._layout = layout || null;

		Object.seal(this);
	};

	/**
	 * Strict limitation, but that's enough for pixel-art.
	 *
	 * @property MAX_BUFFER_SIZE
	 * @type {Number}
	 * @static
	 * @final
	 * @default 2048x2048x4
	 */
	Layer.MAX_BUFFER_SIZE = 2048 * 2048 * 4;

	var layerProto = Layer.prototype;

	/**
	 * Reset the data to default (completelly fill with zeroes).
	 *
	 * @method reset
	 */
	layerProto.reset = function(){
		this._fillLine(0, 0, this.data.length);
	};

	/**
	 * Warn: layers have to be from same layout or at least have equal size.
	 *
	 * @method copyFrom
	 * @param other {Layer} [in]
	 * @param fullCopy {Boolean|undefined} [in]
	 */
	layerProto.copyFrom = function(other, fullCopy){
		this.data.set(other.data);
		if (fullCopy === true){
			this.name = other.name;
			this._layout = other._layout;
			this.isVisible = other.isVisible;
		}
	};

	/**
	 * Merge each pixel of two layers;
	 * Or apply merging to pixels within start and offset area;
	 * 
	 * Warn: layer have to be from same layout! Or at least have a same size!
	 *
	 * @method merge
     * @param options {Object}[in]
	 * @param options.isMix {Boolean}
	 * @param options.other {Layer}
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
     */
	layerProto.merge = function(options){
		var self = this;
		var data = this.data;
		var otherData = options.other.data;
		var alphaBlend = pxl.RGBA.alphaBlend;
		if (options.isMix === true){
			this._layout.__process(options, function(i, length){
				while (i < length){
					data[i] = alphaBlend(data[i], otherData[i++]);
				}
			});
		} else{
			if (options.start && options.offset){
				this._layout.__process(options, function(i, length){
					data.set(otherData.subarray(i, length), i);
				});
			} else{
				this.data.set(otherData); //much faster
			}
		}
	};

	/**
	 * Replace specific color by the new one on whole layer;
	 * Or just on area within start and offset options.
	 *
	 * @method replace
	 * @param options {Object} [in]
	 * @param options.pixel {Number}
	 * @param options.oldPixel {Number}
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 */
	layerProto.replace = function(options){
		var data = this.data;
		var rgba = options.pixel;
		var oldRGBA = options.oldPixel;
		this._layout.__process(options, function(i, length){
			for (; i < length; ++i){
				if (data[i] === oldRGBA){
					data[i] = rgba;
				}
			}
		});
	};

	/**
	 * Set new color for layer;
	 * Or just for area within start and offset options.
	 *
	 * @method set
	 * @param options {Object} [in]
	 * @param options.pixel {Number}
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @param options.isMix {Boolean}
	 */
	layerProto.set = function(options){
		var self = this;
		var data = this.data;
		var rgba = options.pixel;
		var alphaBlend = pxl.RGBA.alphaBlend;
		if (options.isMix === true){
			this._layout.__process(options, function(i, length){
				while (i < length){
					data[i] = alphaBlend(data[i++], rgba);
				}
			});
		} else{
			this._layout.__process(options, function(i, length){
				self._fillLine(rgba, i, length);
			});
		}
	};

	/**
	 * Change specific channel for layer;
	 * Or channel for area within start and offset options.
	 *
	 * @method setChannel
	 * @param options {Object} [in]
	 * @param options.channelOffset {Number} 0..3 (rgba index)
	 * @param options.value {Number} 0..255 (byte)
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 */
	layerProto.setChannel = function(options){
		var data = this.data;
		var value = options.value;
		var channelOffset = pxl.clamp(options.channelOffset, 0, 3);
		this._layout.__process(options, function(i, length){
			var tmp8BitRepresentation = new Uint8Array(
				data.subarray(i, length).buffer);
			length = tmp8BitRepresentation.length;
			for (i = channelOffset; i < length; i += 4){
				tmp8BitRepresentation[i] = value;
			}
		});
	};

	/**
	 * Scan-line fill (with custom stack);
	 * Can be applyed for area within start and offset options.
	 *
	 * Look at: http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
	 *
	 * @method fill
	 * @param options {Object} [in]
	 * @param options.position {Point}
	 * @param options.pixel {Number}
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @param options.isMix {Boolean|undefined}
	 */
	layerProto.fill = function(options){
		var layout = this._layout;
		var data = this.data;
		var startIndex = 0;
		var leftIndexOffset = 0;
		var rightIndexOffset = layout.getWidth();
		var endIndex = data.length;
		var pixel = options.pixel;
		var index = layout.indexAt(options.position);
		if (data[index] === pixel){
			return;	//stop, don't fill on equal color
		}
		if (options.start && options.offset){
			var endPoint = new pxl.Point(
				options.start).add(options.offset).floor();
			if (options.position.x < options.start.x ||
				options.position.y < options.start.y ||
				options.position.x > endPoint.x ||
				options.position.y > endPoint.y){
				return;	//stop, out of range
			}
			leftIndexOffset = options.start.x | 0;
			rightIndexOffset = options.offset.x | 0;
			startIndex = layout.indexAt(options.start);
			endIndex = layout.indexAt(endPoint);
		}
		if (index < startIndex || index >= endIndex ){
			return;	//stop, out of layout
		}
		var begin = 0;
		var width = layout.getWidth();
		var borderUp = false;
		var borderDown = false;
		var oldRGBA = this.pixelFromIndex(index); //pixel before changes
		var rgba = data[index] = (options.isMix === true
			? pxl.RGBA.alphaBlend(data[index], pixel)
			: pixel); //pixel after changes
		var upIndex = 0;
		var downIndex = 0;
		var stepsBack = 0;
		var leftBorderIndex = 0;
		var rightBorderIndex = 0;
		var stack = [index];
		do{
			index = stack.pop();

			leftBorderIndex = leftIndexOffset + ((index / width) | 0) * width;
			rightBorderIndex = leftBorderIndex + rightIndexOffset;

			stepsBack = 0;

			//Go to the left:
			while(--index >= leftBorderIndex && data[index] === oldRGBA){
				++stepsBack;
			}

			begin = ++index;
			borderUp = borderDown = false;

			//Go to the right:
			for (;;){
				upIndex = index - width;
				downIndex = width + index++;

				if (upIndex > startIndex){
					if (data[upIndex] === oldRGBA){
						if(borderUp === false){
							stack.push(upIndex);
							borderUp = true;
						}
					} else{
						borderUp = false;
					}
				}

				if (downIndex < endIndex){
					if (data[downIndex] === oldRGBA){
						if(borderDown === false){
							stack.push(downIndex);
							borderDown = true;
						}
					} else{
						borderDown = false;
					}
				}

				if (stepsBack === 0){
					if (index >= rightBorderIndex || data[index] !== oldRGBA){
						break;
					}
				} else{
					--stepsBack;
				}
			}

			//It's time to fill the whole detected line:
			this._fillLine(rgba, begin, index);

		} while(stack.length);
	};

	/**
	 * @method insertData
	 * @param options {Object} [in]
	 * @param data {TypedArray}
	 * @param options.start {Point}
	 * @param options.offset {Point}
	 */
	layerProto.insertData = function(options){
		var index = 0;
		var data = this.data;
		var otherData = (options.data.constructor === Uint32Array
			? options.data
			: new Uint32Array(options.data.buffer)); //should not be too slow
		this._layout.__process(options, function(i, length){
			data.set(otherData.subarray(index, index += length - i), i);
		});
	};

	/**
	 * @method setAt
	 * @param i {Number} index where to apply.
	 * @param rgba {Number}
	 */
	layerProto.setAt = function(i, rgba){
		this.data[i] = rgba;
	};

	/**
	 * @method pixelFromPosition
	 * @param position {Point} [in]
	 * @return {Number}
	 */
	layerProto.pixelFromPosition = function(position){
		return this.pixelFromIndex(this._layout.indexAt(position));
	};

	/**
	 * Warn: index without color-offset!
	 *
	 * @method pixelFromIndex
	 * @param index {Number} [in]
	 * @return {Number}
	 */
	layerProto.pixelFromIndex = function(index){
		return this.data[index];
	};

	/**
	 * @method generateImageData
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @return {ImageData}
	 */
	layerProto.generateImageData = function(options){
		var layout = this._layout;
		var imageData = (options.start && options.offset
			? pxl.createImageData(options.offset.x, options.offset.y)
			: pxl.createImageData(layout.getWidth(), layout.getHeight())
		);
		void this._generateData(
			new Uint32Array(imageData.data.buffer), this.data, options);
		return imageData;
	};

	/**
	 * @method cloneData
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @return {Uint32Array}
	 */
	layerProto.cloneData = function(options){
		return this._generateData(null, this.data, options);
	};

	/**
	 * @method getLayout
	 * @return {Layout}
	 */
	layerProto.getLayout = function(){
		return this._layout;
	};

	/**
	 * @method _generateData
	 * @private
	 * @param destData {Uint32Array|null} [out]
	 * @param sourceData {Uint32Array} [in]
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @return {Uint32Array}
	 */
	layerProto._generateData = function(destData, sourceData, options){
		var index = 0;
		if (options.start && options.offset){
			destData = destData || new Uint32Array(
				(options.offset.x | 0) * (options.offset.y | 0));
			this._layout.__process(options, function(i, length){
				destData.set(sourceData.subarray(i, length), index);
				index += length - i;
			});
		} else{
			if (destData){
				destData.set(sourceData);
			} else{
				destData = new Uint32Array(sourceData); //copy constructor
			}
		}
		return destData;
	};

	/**
	 * 
	 *
	 * @param rgba {Number}
	 * @param begin {Number}
	 * @param end {Number}
	 * @method _fillLine
	 * @private
	 */
	if ("fill" in Uint32Array.prototype){ //ES6, much faster
		layerProto._fillLine = function(rgba, begin, end){
			this.data.fill(rgba, begin, end);
		};
	} else{
		layerProto._fillLine = function(rgba, begin, end){
			var data = this.data;
			while (begin < end){
				data[begin++] = rgba;
			}
		};
	}

	/**
	 * 
	 *
	 * @param target {Number}
	 * @param begin {Number}
	 * @param end {Number}
	 * @method _copyWithin
	 * @private
	 */
	if ("copyWithin" in Uint32Array.prototype){ //ES6, much faster
		layerProto._copyWithin = function(target, begin, end){
			this.data.copyWithin(target, begin, end);
		};
	} else{
		layerProto._copyWithin = function(target, begin, end){
			var data = this.data;
			end = end || data.length;
			while (begin < end){
				data[target++] = data[begin++];
			}
		};
	}

	/**
	 * 
	 *
	 * @param start {Number|undefined}
	 * @param end {Number|undefined}
	 * @method _reverseLine
	 * @private
	 */
	layerProto._reverseLine = function(start, end){
		var data = this.data;
		if (arguments.length === 0 && "reverse" in Uint32Array.prototype){
			data.reverse(); //ES6, unfortunatly it doesn't take a range
		} else{
			var tmp = 0;
			start = start || 0;
			end = end || data.length;
			while (start < --end){ //end not included!
				var tmp = data[end];
				data[end] = data[start];
				data[start++] = tmp;
			}
		}
	};

	/**
	 * Destructor.
	 * Tip: don't forget to clean the history cache.
	 *
	 * @method destroy
	 */
	layerProto.destroy = function(){
		this._layout = this.data = null;
		this.isVisible = false;
	};

})();