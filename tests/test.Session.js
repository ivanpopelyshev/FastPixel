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

	describe("dynamic session (check rewrite (index))", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(1);
			
			var oldR = 255;
			var oldG = 255;
			var oldB = 255;
			var oldA = 255;
			
			layer.setAt(0, oldR, oldG, oldB, oldA);

			var session = new pxl.Layout.history.SessionDynamic(layer);
			session.cache(0);

			layer.setAt(0, 123, 55, 244, 100); //some randomly choosed values

			session.rewrite();
			
			expect(layer.compareAt(0, oldR, oldG, oldB, oldA)).to.equal(true);
		});
	});

	describe("dynamic session (check rewrite (options))", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(1, 1);
			layout.appendLayer();

			var layer = layout.activeLayer;

			var oldR = 255;
			var oldG = 255;
			var oldB = 255;
			var oldA = 255;
			
			layer.setAt(0, oldR, oldG, oldB, oldA);

			var session = new pxl.Layout.history.SessionDynamic(layer);
			session.cache({
				"start": new pxl.Point(0, 0),
				"offset": new pxl.Point(1, 1)
			});

			layer.setAt(0, 123, 55, 244, 100); //some randomly choosed values

			session.rewrite();
			
			expect(layer.compareAt(0, oldR, oldG, oldB, oldA)).to.equal(true);
		});
	});

	describe("static session (check instance)", function(){
		it("should be OK", function(){
			var SessionStatic = pxl.Layout.history.SessionStatic;
			var Session = pxl.Layout.history.Session;
			
			var session = new SessionStatic(null);
			expect(session instanceof SessionStatic).to.equal(true);
			expect(session instanceof Session).to.equal(true);
		});
	});

	describe("static session (check rewrite)", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(4, new pxl.Layout(2, 2));
			
			var i = 0;
			var oldValue = 255;
			for (; i < layer.data.length; ++i){
				layer.data[i] = oldValue;
			}

			var session = new pxl.Layout.history.SessionStatic(layer);
			session.cache({}); //get whole layer

			for (i = 0; i < layer.data.length; ++i){
				layer.data[i] = Math.random() * 256;
			}

			session.rewrite();

			for (i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(oldValue);
			}
		});
	});

});