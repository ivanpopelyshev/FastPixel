var expect = chai.expect;

describe("Layout", function(){
	describe("constructor with sizes", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			
			expect(layout.getWidth()).to.equal(8);
			expect(layout.getHeight()).to.equal(16);
		});
	});

	describe("constructor with imageData", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(pxl.createImageData(8, 16));
			
			expect(layout.getWidth()).to.equal(8);
			expect(layout.getHeight()).to.equal(16);
		});
	});

	describe("insert new layer", function(){
		it("should properly added", function(){
			var layout = new pxl.Layout(8, 16);
			layout.activeLayer = layout.insertLayer();

			expect(layout.layerList.length).to.equal(1);
			expect(layout.layerList[0].data.length).to.equal(8 * 16);
		});
	});

	describe("try to insert new layer out of range", function(){
		it("shouldn't be added", function(){
			var layout = new pxl.Layout(8, 16);
			layout.insertLayer(666);
			layout.insertLayer(-1);

			expect(layout.layerList.length).to.equal(0);
		});
	});

	describe("insert new layer by index", function(){
		it("should properly added", function(){
			var layout = new pxl.Layout(8, 16);
			layout.insertLayer(0);
			layout.insertLayer(1);

			expect(layout.layerList.length).to.equal(2);
		});
	});

	describe("set active layer to", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			layout.insertLayer();
			layout.insertLayer();
			layout.insertLayer();
			
			expect(layout.setActiveTo(666).activeLayer).to.equal(null);
			
			layout.setActiveTo(1);
			expect(layout.activeLayer instanceof pxl.Layout.Layer).to.equal(true);
		});
	});

	describe("remove all layers", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			layout.activeLayer = layout.insertLayer();
			layout.insertLayer();
			layout.insertLayer();
			
			layout.removeAllLayers();

			expect(layout.layerList.length).to.equal(0);
			expect(layout.activeLayer).to.equal(null);
		});
	});

	describe("delete active layer", function(){
		it("should properly removed", function(){
			var layout = new pxl.Layout(8, 16);
			layout.activeLayer = layout.insertLayer();
			var nonActive = layout.insertLayer();
			
			layout.deleteLayer();

			expect(layout.layerList.length).to.equal(1);
			expect(layout.activeLayer).to.equal(null);
			expect(layout.getVisibleLayers()[0] === nonActive).to.equal(true);
		});
	});

	describe("index from position", function(){
		it("should be equal to 9", function(){
			var layout = new pxl.Layout(8, 16);

			expect(layout.indexAt(new pxl.Point(1, 1))).to.equal(9);
		});
	});

	describe("position from index", function(){
		it("should be equal to 2:1", function(){
			var layout = new pxl.Layout(8, 16);

			expect(layout.positionFrom(10).cmp(new pxl.Point(2, 1))).to.equal(true);
		});
	});

	describe("get ImageData", function(){
		it("returns ImageData of dataLayer property", function(){
			var layout = new pxl.Layout(8, 16);

			var imageData = layout.getImageData(pxl.emptyOptions);
			expect(imageData.width).to.equal(8);
			expect(imageData.height).to.equal(16);
		});
	});

	describe("get part of ImageData", function(){
		it("returns ImageData of dataLayer property", function(){
			var layout = new pxl.Layout(8, 16);

			var imageData = layout.getImageData({
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(4, 7)
			});
			expect(imageData.width).to.equal(4);
			expect(imageData.height).to.equal(7);
		});
	});

	describe("visible layer list", function(){
		it("two layers are visible", function(){
			var layout = new pxl.Layout(8, 16);
		
			layout.insertLayer();
			layout.activeLayer = layout.insertLayer();
			layout.insertLayer();
			
			layout.activeLayer.isVisible = false;

			expect(layout.getVisibleLayers().length).to.equal(2);
		});
	});

	describe("fix the range", function(){
		it("have to be fixed properly", function(){
			var layout = new pxl.Layout(8, 16);

			var oldStart = new pxl.Point(2, 2);
			var oldOffset = new pxl.Point(4, 4);

			var options = {
				"start": new pxl.Point(oldStart),
				"offset": new pxl.Point(oldOffset)
			};
			expect(layout.fixRange(options)).to.equal(true); //everything is OK here and no changes
			expect(options.start.cmp(oldStart)).to.equal(true);
			expect(options.offset.cmp(oldOffset)).to.equal(true);
			

			oldStart.set(-1, 0); //let's move our start point here
			options.start.set(oldStart);

			expect(layout.fixRange(options)).to.equal(true); //Ok, and will be changed
			expect(options.start.cmp(oldStart)).to.equal(false);
			expect(options.offset.cmp(oldOffset)).to.equal(false);
		});
	});

	describe("__process single pixel", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(5, 5);

			layout.__process({
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(1, 1)
			}, function(i, length){
				while (i < length){
					expect(i++).to.equal(12);
				}
			});
		});
	});

	describe("__process whole layout", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(2, 2);

			var count = 0;
			var indexes = [0, 1, 2, 3];

			layout.__process({
				"start": new pxl.Point(0, 0),
				"offset": new pxl.Point(2, 2)
			}, function(i, length){
				while (i < length){
					expect(indexes[count++]).to.equal(i++);
				}
			});
		});
	});

	describe("destroy", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);

			layout.insertLayer();
			layout.insertLayer();
			
			layout.destroy();
			
			expect(layout.layerList.length).to.equal(0);
			expect(layout.activeLayer).to.equal(null);
			expect(layout.dataLayer).to.equal(null);
		});
	});

});