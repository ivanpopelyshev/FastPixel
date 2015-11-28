var common = {

	/**
	 * @property settings
	 * @private
	 * @type {Object}
	 */
	settings: {
		"current": new pxl.Vector2,
		"previous": new pxl.Vector2,
		"pixel": new pxl.ImageDataArray([0, 0, 0, 255]), //black
		"pixelSize": 1
	},

	/**
	 * @method updateUserPosition
	 * @param x {Number}
	 * @param y {Number}
	 * @chainable
	 */
	updateUserPosition: function(x, y){
		common.settings.previous.set(common.settings.current);
		pxl.activeView.fitToTransition(
			common.settings.current.set(x, y).abs().floor()
		);
		common.settings.current.sub(pxl.activeView.getImagePoint());
		return common;
	},

	/**
	 * Inform: is previous user position not equal to current.
	 *
	 * @method positionUpdated
	 * @return {Boolean}
	 */
	positionUpdated: function(){
		return !common.settings.previous.cmp(common.settings.current);
	},

	/**
	 * Check whenever coordinates are within layout;
	 * If there are no arguments the position from last user update would be taken.
	 *
	 * @method isWithinLayout
	 * @param x {Number|undefined}
	 * @param y {Number|undefined}
	 * @return {Boolean}
	 */
	isWithinLayout: function(x, y){
		var layout = pxl.activeView.getLayout();
		if (!arguments.length){
			x = common.settings.current.x;
			y = common.settings.current.y;
		}
		return (
			x >= 0 && x < layout.getWidth() &&
			y >= 0 && y < layout.getHeight()
		);
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
	plotPixel: function(x, y){
		var layout = pxl.activeView.getLayout();
		var options = {
			"start": new pxl.Vector2,
			"offset": new pxl.Vector2(common.settings.pixelSize),
			"indexes": null, 
			"pixel": common.settings.pixel,
			"isMix": true,
			"isNotifyView": true
		};
		if (arguments.length){
			options.start.set(x, y);
		} else{
			options.start.set(common.settings.current);
		}
		options.indexes = layout.indexesAt(options); //trick: compute pixel indexes here
		layout.plot(options);
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
		var position = (arguments.length
			? new pxl.Vector2(x, y)
			: new pxl.Vector2(common.settings.current)
		);
		pxl.activeView.fitToTransition(position);
		pxl.activeView.getLayout().fill({
			"position": position,
			"pixel": common.settings.pixel,
			"isMix": true,
			"isNotifyView": true
		});
	},

	/**
	 * Put the position from which colour to replacement will be taken;
	 * If there are no parameters,
	 * the position would be taken from last updated user position.
	 *
	 * @see updateUserPosition
	 * @method colorReplace
	 * @param x {Number}
	 * @param y {Number}
	 */
	colorReplace: function(x, y){
		var position = (arguments.length
			? new pxl.Vector2(x, y)
			: new pxl.Vector2(common.settings.current)
		);
		var layout = pxl.activeView.getLayout();
		pxl.activeView.fitToTransition(position);
		layout.colorReplace({
			"position": position,
			"oldPixel": layout.dataLayer.pixelFromPosition(position),
			"pixel": common.settings.pixel,
			"isMix": false,
			"isNotifyView": true
		});
	},

	/**
	 * Carry the current pixel according to last updated user position.
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

			_options.start.set(this.settings.previous);

			activeView.clear(_options).redraw(_options);

			_options.offset.set(this.settings.pixelSize); //update offset
			_options.start.set(this.settings.current);

			_options.pixel = this.settings.pixel;
			activeView.drawRect(_options);

			return this;
		}
	})(),

	/**
	 * @method undo
	 * @chainable
	 */
	undo: function(){
		var session = pxl.Layout.history.getCurrentSession();
		if (session){
			pxl.Layout.history.undo();
			session.layer.getLayout().mergeLayers({"isNotifyView": true});
		}
		return pxl.Layout.controller;
	},

	/**
	 * @method redo
	 * @chainable
	 */
	redo: function(){
		var session = pxl.Layout.history.getCurrentSession();
		if (session){
			pxl.Layout.history.redo();
			session.layer.getLayout().mergeLayers({"isNotifyView": true});
		}
		return pxl.Layout.controller;
	},

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
		return common;
	},

	/**
	 * @method setPixelSize
	 * @param newSize {Number}
	 * @chainable
	 */
	setPixelSize: function(newSize){
		common.settings.pixelSize = pxl.clamp(newSize, 1, 5);
		return common;
	},

	/**
	 * @method setColor
	 * @param color {Array}
	 * @chainable
	 */
	setColor: function(color){
		common.settings.pixel.set(color);
		return common;
	},

	/**
	 * @method startRecord
	 * @chainable
	 */
	startRecord: function(){
		pxl.Layout.history.record(pxl.activeView.getLayout().activeLayer);
		return common;
	},

	/**
	 * @method stopRecord
	 * @chainable
	 */
	stopRecord: function(){
		pxl.Layout.history.stop();
		return common;
	},

	/**
	 * Using startRecord and stopRecord inside.
	 *
	 * @method record
	 * @param callback {Function}
	 * @chainable
	 */
	record: function(callback){
		callback.call(common.startRecord());
		return common.stopRecord();
	},

	/**
	 * @method startDraw
	 * @chainable
	 */
	startDraw: function(){
		pxl.activeView.begin();
		return common;
	},

	/**
	 * @method stopDraw
	 * @chainable
	 */
	stopDraw: function(){
		pxl.activeView.end();
		return common;
	},

	/**
	 * Using startDraw and stopDraw inside.
	 *
	 * @method draw
	 * @param callback {Function}
	 * @chainable
	 */
	draw: function(callback){
		callback.call(common.startDraw());
		return common.stopDraw();
	},

	/**
	 * @method removeActiveView
	 * @chainable
	 */
	removeActiveView: function(){
		pxl.activeView.clear({});
		pxl.activeView.destroy();
		pxl.activeView = null;
		return common;
	},

	/**
	 * @method moveView
	 * @chainable
	 */
	moveView: function(x, y){
		pxl.activeView.setImagePoint(x, y).redraw({});
		return common;
	}
};