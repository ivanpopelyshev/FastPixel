var expect = chai.expect;

describe("View", function(){
	describe("constructor", function(){
		it("should be OK", function(){
			var view = new pxl.View(
				pxl.createCanvas().getContext("2d"),
				pxl.createCanvas().getContext("2d"),
				new pxl.Layout(8, 16),
				true
			);
			expect(view.getScale()).to.equal(1);
			expect(view.getImagePoint().cmp(0)).to.equal(true);
			expect(pxl.View.instances.length).to.equal(0);
		});
	});

	describe("create from element", function(){
		it("should be OK", function(){
			var canvas = pxl.createCanvas();
			canvas.width = 64;
			canvas.height = 48;
			
			var view = pxl.View.create({
				"element": canvas,
				"canvasSize": {
					"width": 64,
					"height": 48
				}
			});
			
			expect(view.getScale()).to.equal(1);
			expect(view.getImagePoint().cmp(0)).to.equal(true);
			expect(pxl.View.instances.length).to.equal(1);
			
			pxl.View.instances.length = 0;
		});
	});

	describe("create from source", function(){
		it("should be OK", function(){
			var canvas = pxl.createCanvas();
			canvas.width = 64;
			canvas.height = 48;
			
			var viewSource = new pxl.View(
				pxl.createCanvas().getContext("2d"),
				pxl.createCanvas().getContext("2d"),
				new pxl.Layout(8, 16),
				true
			);
			
			var view = pxl.View.create({
				"element": canvas,
				"source": viewSource
			});
			
			expect(view.getScale()).to.equal(1);
			expect(view.getImagePoint().cmp(0)).to.equal(true);
			expect(view.getLayout()).to.equal(viewSource.getLayout()); //both has same layout
			expect(pxl.View.instances.length).to.equal(1);
			
			pxl.View.instances.length = 0;
		});
	});

	describe("get scale offset", function(){
		it("should be OK", function(){
			var width = 8;
			var height = 16;
			
			var view = new pxl.View(
				pxl.createCanvas().getContext("2d"),
				pxl.createCanvas().getContext("2d"),
				new pxl.Layout(width, height),
				true
			);
			
			expect(view.getScaleOffset().cmp(0)).to.equal(true);
			
			view.setScale(2);
			
			expect(view.getScaleOffset().cmp(-1, -1)).to.equal(true);
		});
	});

});