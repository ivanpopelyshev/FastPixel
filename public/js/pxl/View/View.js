(function(){
	"use strict";

	/**
	 * @constructor
	 * @class View
	 * @param ctx {CanvasRenderingContext2D}
	 * @param buffer {CanvasRenderingContext2D}
	 * @param layout {Layout}
	 * @param isOwner {Boolean}
	 */
	var View = pxl.View = function(ctx, buffer, layout, isOwner){
		/**
		 * @property _buffer
		 * @private
		 * @type {CanvasRenderingContext2D}
		 */
		this._buffer = buffer;

		/**
		 * @property _ctx
		 * @private
		 * @type {CanvasRenderingContext2D}
		 */
		this._ctx = ctx;

		/**
		 * @property _layoutOwner
		 * @private
		 * @type {Boolean}
		 */
		this._layoutOwner = isOwner;

		/**
		 * @property _imagePoint
		 * @private
		 * @type {Point}
		 */
		this._imagePoint = new pxl.Point;

		/**
		 * @property _scale
		 * @private
		 * @type {Number}
		 * @default 1
		 */
		this._scale = 1;

		/**
		 * @property _layout
		 * @private
		 * @type {Layout}
		 */
		this._layout = layout;

		/**
		 * @property _boundedRender
		 * @private
		 * @type {Function}
		 */
		this._subscribe();
	};

	/**
	 * Simple factory-like method;
	 * Take care about view creating and DOM manipulations;
	 * Also put new instance into static "instances" list.
	 *
	 * @static
	 * @method create
	 * @param options {Object} [in]
	 * @param options.element {HTMLCanvasElement|HTML*Element} The canvas for drawing, or any other element as a parent.
	 * @param options.source {View|undefined} New instance will listen all changes on source.
	 * @param options.canvasSize {Object|undefined} Size of the model.
	 * @param options.canvasSize.width {Number}
	 * @param options.canvasSize.height {Number}
	 * @return {View}
	 */
	View.create = function(options){
		var canvas = null;
		var bufferCanvas = null;
		var layout = null;
		var isOwner = true;
		if (options.element){
			if (options.element.nodeName.toUpperCase() === "CANVAS"){
				canvas = options.element;
			} else{
				canvas = options.element.appendChild(pxl.createCanvas());
			}
		} else{
			canvas = document.body.appendChild(pxl.createCanvas());
		}
		if (options.source){
			bufferCanvas = options.source._buffer.canvas;
			layout = options.source._layout;
			isOwner = false;
		} else{
			bufferCanvas = pxl.createCanvas();
			bufferCanvas.width = options.canvasSize.width;
			bufferCanvas.height = options.canvasSize.height;
			layout = new pxl.Layout(bufferCanvas.width, bufferCanvas.height);
		}
		var view = new View(
			_setupContext(canvas.getContext("2d")),
			_setupContext(bufferCanvas.getContext("2d")),
			layout,
			isOwner
		);
		View.instances.push(view);
		return view;
	};

	/**
	 * List of all existing View instances.
	 *
	 * @property instances
	 * @static
	 * @type {Array}
	 * @default []
	 */
	View.instances = [];

	/**
	 * Reference onto the currently active view instance.
	 *
	 * @property activeView
	 * @type {View|null}
	 * @static
	 * @default null
	 */
	View.activeView = null;

	var viewProto = View.prototype;
 
	/**
	 * Clear canvas and update imageData and draw.
	 *
	 * @see clear
	 * @see update
	 * @see redraw
	 * @method render
	 * @param options {Object} [in]
	 * @chainable
	 */
	viewProto.render = function(options){
		return this.clear(options).update(options).redraw(options);
	};

	/**
	 * Draw rectangle at canvas element directly.
	 *
	 * @method drawRect
	 * @param options {Object} [in]
	 * @param options.start {Point}
	 * @param options.offset {Point}
	 * @param options.pixel {ImageDataArray|Array}
	 * @chainable
	 */
	viewProto.drawRect = function(options){
		var pixel = options.pixel;
		this._ctx.fillStyle = "rgba(" +
			pixel[0] + "," + 	//r
			pixel[1] + "," + 	//g
			pixel[2] + "," + 	//b
			(pixel[3] / 255) +	//a, somehow its require 0.0..1.0 format
		")";
		this._ctx.fillRect(
			options.start.x + this._imagePoint.x,
			options.start.y + this._imagePoint.y,

			options.offset.x, options.offset.y
		);
		return this;
	};

	/**
	 * Just redraw from old/previous imageData condition.
	 *
	 * @method redraw
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @chainable
	 */
	viewProto.redraw = function(options){
		if (options.start && options.offset){
			this._ctx.drawImage(
				this._buffer.canvas,

				options.start.x, options.start.y, //from
				options.offset.x, options.offset.y,

				options.start.x + this._imagePoint.x, //to
				options.start.y + this._imagePoint.y,

				options.offset.x, options.offset.y
			);
		} else{
			this._ctx.drawImage(
				this._buffer.canvas, this._imagePoint.x, this._imagePoint.y);
		}
		return this;
	};

	/**
	 * Clear canvas element directly.
	 *
	 * @method clear
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @chainable
	 */
	viewProto.clear = function(options){
		if (options.start && options.offset){
			this._ctx.clearRect(
				options.start.x + this._imagePoint.x,
				options.start.y + this._imagePoint.y,

				options.offset.x, options.offset.y
			);
		} else{
			this._ctx.clearRect(
				0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
		}
		return this;
	};

	/**
	 * Update the buffer from layout (model).
	 *
	 * @method update
	 * @param options {Object} [in]
	 * @param options.start {Point|undefined}
	 * @param options.offset {Point|undefined}
	 * @chainable
	 */
	viewProto.update = function(options){
		if (this._layoutOwner){
			if (options.start && options.offset){
				this._buffer.putImageData(
					this._layout.getImageData(options),
					options.start.x, options.start.y,
					0, 0,
					options.offset.x, options.offset.y
				);
			} else{
				this._buffer.putImageData(
					this._layout.getImageData(options), 0, 0);
			}
		}
		return this;
	};

	/**
	 * Transform canvas according to scale & translate.
	 *
	 * @method begin
	 * @chainable
	 */
	viewProto.begin = function(){
		var scale = this._scale;
		var ctx = this._ctx;
		ctx.save();
		ctx.translate(
			_offset(scale, this._ctx.canvas.width),
			_offset(scale, this._ctx.canvas.height)
		);
		ctx.scale(scale, scale);
		return this;
	};

	/**
	 * Restore context.
	 *
	 * @method end
	 * @chainable
	 */
	viewProto.end = function(){
		this._ctx.restore();
		return this;
	};

	/**
	 * @method getBufferContext
	 * @return {CanvasRenderingContext2D}
	 */
	viewProto.getBufferContext = function(){
		return this._buffer;
	};

	/**
	 * @method getScale
     * @return {Number}
     */
    viewProto.getScale = function(){
        return this._scale;
    };

	/**
	 * @method getElement
     * @return {HTMLCanvasElement}
     */
    viewProto.getElement = function(){
        return this._ctx.canvas;
    };

	/**
	 * @method getLayout
     * @return {Layout}
     */
    viewProto.getLayout = function(){
        return this._layout;
    };

	/**
	 * @method getImagePoint
	 * @return {Point}
	 */
	viewProto.getImagePoint = function(){
		return this._imagePoint;
	};

	/**
	 * @method getScaleOffset
	 * @return {Point}
	 */
	viewProto.getScaleOffset = function(){
		return new pxl.Point(
			_offset(this._scale, this._ctx.canvas.width),
			_offset(this._scale, this._ctx.canvas.height)
		);
	};

	/**
	 * Change current scale rate value;
	 * Only an integer part will be taken.
	 *
	 * Warn: scale can't be lower then 1.
	 *
	 * @method setScale
	 * @param value {Number} [in]
	 * @chainable
	 */
	viewProto.setScale = function(value){
		if (value >= 1){
			this._scale = value | 0;
		}
		return this;
	};

	/**
	 * @method setLayout
	 * @param otherLayout {Layout} [in]
	 * @chainable
	 */
	viewProto.setLayout = function(otherLayout){
		var instances = View.instances;
		this.deleteLayout();
		this._layout = otherLayout; //set to new one
		this._subscribe();
		this._layoutOwner = true;
		for (var i = 0; i < instances.length; ++i){
			if (instances[i] !== this && //looking for same layout
				otherLayout === instances[i]._layout){
				this._layoutOwner = false; //two views can't own same layout
				break;
			}
		}
		return this;
	};

	/**
	 * @method setImagePoint
	 * @param x {Number} [in]
	 * @param y {Number} [in]
	 * @chainable
	 */
	viewProto.setImagePoint = function(x, y){
		return this.fitToTransition(this._imagePoint.set(x, y));
	};

	/**
	 * Transform position according to the current scale offset.
	 *
	 * @method fitToTransition
	 * @param position {Point} [out]
	 * @chainable
	 */
	viewProto.fitToTransition = function(position){
		position.sub(this.getScaleOffset())
		.div(this._scale)
		.floor();
		return this;
	};

	/**
     * Resize and redraw.
	 *
	 * @method resizeElement
	 * @param width {Number}
	 * @param height {Number}
	 * @chainable
     */
    viewProto.resizeElement = function(width, height){
		this._ctx.canvas.style.width = width + "px";
		this._ctx.canvas.style.height = height + "px";
		this._ctx.canvas.width = width;
		this._ctx.canvas.height = height;
		_setupContext(this._ctx);
		return this.redraw({});
    };

	/**
	 * @method deleteLayout
	 * @chainable
	 */
	viewProto.deleteLayout = function(){
		var instances = View.instances;
		this._unsubscribe();
		if (this._layoutOwner){
			for (var i = 0; i < instances.length; ++i){
				if (this !== instances[i] &&
					this._layout === instances[i]._layout){
					instances[i]._unsubscribe();
					_removeLayout(instances[i]);
				}
			}
			this._layout.destroy();
			_removeLayout(this);
		}
		return this;
	};

    /**
     * Listen for events that fired when layout (model) has been changed.
	 *
	 * @method _subscribe
	 * @private
	 * @chainable
     */
    viewProto._subscribe = function(){
        if (!this._boundedRender){
			this._boundedRender = this.render.bind(this);
			this._layout.observer.subscribe(
				pxl.Layout.PIXELS_CHANGED_EVENT, this._boundedRender);
		}
		return this;
    };

    /**
     * Stop listen the layout (model) changes.
	 *
	 * @method _unsubscribe
	 * @private
	 * @chainable
     */
    viewProto._unsubscribe = function(){
		this._layout.observer.unsubscribe(
			pxl.Layout.PIXELS_CHANGED_EVENT, this._boundedRender);
		this._boundedRender = null;
		return this;
    };

	/**
	 * Destructor.
	 *
	 * @method destroy
	 */
	viewProto.destroy = function(){
		var instances = View.instances;
		this.deleteLayout();
		for (var i = 0; i < instances.length; ++i){
			if (this === instances[i]){
				instances.splice(i, 1);
				break;
			}
		}
	};

	//Helpers:

	//Disable default image smoothing
	function _setupContext(dest){
		if ("imageSmoothingEnabled" in dest){
			dest.imageSmoothingEnabled = false;
		} else if ("webkitImageSmoothingEnabled" in dest){
			dest.webkitImageSmoothingEnabled = false;
		} else if ("mozImageSmoothingEnabled" in dest){
			dest.mozImageSmoothingEnabled = false;
		} else if ("msImageSmoothingEnabled" in dest){
			dest.msImageSmoothingEnabled = false;
		}
		return dest;
	};

	//remove _layout and _buffer properties
	function _removeLayout(view){
		view._buffer = view._layout = null;
	}

	function _offset(scale, side){
		return (side * (1 - scale)) >> 1;
	}
})();