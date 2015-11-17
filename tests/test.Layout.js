var expect = chai.expect;

describe("Layout", function(){
	describe("constructor with sizes", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);

			expect(layout.getWidth()).to.equal(8);
			expect(layout.getHeight()).to.equal(16);
			expect(layout.getImageData().data.length).to.equal(8 * 16 * 4);
		});
	});

	describe("constructor with imageData", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(pxl.createImageData(8, 16));

			expect(layout.getWidth()).to.equal(8);
			expect(layout.getHeight()).to.equal(16);
			expect(layout.getImageData().data.length).to.equal(8 * 16 * 4);
		});
	});

	describe("append new layer", function(){
		it("should properly added", function(){
			var layout = new pxl.Layout(8, 16);
			layout.appendLayer();

			expect(layout.layerList.length).to.equal(1);
			expect(layout.activeLayer.data.length).to.equal(8 * 16 * 4);
		});
	});

	describe("delete active layer", function(){
		it("should properly removed", function(){
			var layout = new pxl.Layout(8, 16);
			layout.appendLayer();
			layout.deleteLayer();

			expect(layout.layerList.length).to.equal(0);
			expect(layout.activeLayer).to.equal(null);
		});
	});

	describe("index from position", function(){
		it("should be equal to 9", function(){
			var layout = new pxl.Layout(8, 16);

			expect(layout.indexAt(new pxl.Vector2(1, 1))).to.equal(9);
		});
	});

	describe("position from index", function(){
		it("should be equal to 1:1", function(){
			var layout = new pxl.Layout(8, 16);

			expect(layout.positionFrom(9).cmp(new pxl.Vector2(1, 1))).to.equal(true);
		});
	});

	describe("visible layer list", function(){
		it("two layers are visible", function(){
			var layout = new pxl.Layout(8, 16);
			layout.appendLayer();
			layout.appendLayer();
			layout.activeLayer.isVisible = false;
			layout.appendLayer();

			expect(layout.visibleLayers().length).to.equal(2);
		});
	});

	describe("point within layout", function(){
		it("point have to be within layout", function(){
			var layout = new pxl.Layout(8, 16);

			expect(layout.isWithinLayout(new pxl.Vector2(1, 4))).to.equal(true);
		});
	});

});