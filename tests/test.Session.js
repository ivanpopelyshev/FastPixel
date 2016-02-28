var expect = chai.expect;

describe("Sessions", function(){
	describe("dynamic session (check instance)", function(){
		it("should be OK", function(){
			var SessionDynamic = pxl.Layout.history.SessionDynamic;
			var Session = pxl.Layout.history.Session;
			
			var session = new SessionDynamic(null);
			expect(session instanceof SessionDynamic).to.equal(true);
			expect(session instanceof Session).to.equal(true);
		});
	});

	describe("empty dynamic session", function(){
		it("should be OK", function(){
			var session = new pxl.Layout.history.SessionDynamic(
				new pxl.Layout.Layer(1, null));

			expect(session.isEmpty()).to.equal(true);
		});
	});

	describe("dynamic session (check rewrite (index))", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(1);
			
			var oldRGBA = pxl.RGBA(255, 255, 255, 255);
			
			layer.setAt(0, oldRGBA);

			var session = new pxl.Layout.history.SessionDynamic(layer);
			session.cache(0);

			layer.setAt(0, pxl.RGBA(11, 22, 33, 44)); //some randomly choosed values

			session.rewrite();
			
			expect(layer.pixelFromIndex(0)).to.equal(oldRGBA);
		});
	});

	describe("dynamic session (check rewrite (options))", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(1, 1);
			layout.activeLayer = layout.insertLayer();

			var layer = layout.activeLayer;

			var oldRGBA = pxl.RGBA(255, 255, 255, 255);
			
			layer.setAt(0, oldRGBA);

			var session = new pxl.Layout.history.SessionDynamic(layer);
			session.cache({
				"start": new pxl.Point(0, 0),
				"offset": new pxl.Point(1, 1)
			});

			layer.setAt(0, pxl.RGBA(11, 22, 33, 44)); //some randomly choosed values

			session.rewrite();
			
			expect(layer.pixelFromIndex(0)).to.equal(oldRGBA);
		});
	});

	describe("static session (check instance)", function(){
		it("should be OK", function(){
			var SessionStatic = pxl.Layout.history.SessionStatic;
			var Session = pxl.Layout.history.Session;
			
			var layout = new pxl.Layout(8, 16);
			layout.activeLayer = layout.insertLayer();
			
			var session = new SessionStatic(layout.activeLayer);
			expect(session instanceof SessionStatic).to.equal(true);
			expect(session instanceof Session).to.equal(true);
		});
	});

	describe("empty static session", function(){
		it("should be OK", function(){
			var session = new pxl.Layout.history.SessionStatic(
				new pxl.Layout.Layer(1, null));

			expect(session.isEmpty()).to.equal(true);
		});
	});

	describe("static session (check rewrite)", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(4, new pxl.Layout(2, 2));
			
			var i = 0;
			var oldRGBA = pxl.RGBA(255, 255, 255, 255);
			for (; i < layer.data.length; ++i){
				layer.data[i] = oldRGBA;
			}

			var session = new pxl.Layout.history.SessionStatic(layer);
			session.cache(pxl.emptyOptions); //get whole layer

			for (i = 0; i < layer.data.length; ++i){
				layer.data[i] = pxl.RGBA(0, 1, 2, 3);
			}

			session.rewrite();

			for (i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(oldRGBA);
			}
		});
	});

});