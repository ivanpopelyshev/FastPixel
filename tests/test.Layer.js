var expect = chai.expect;

describe("Layer", function(){
	describe("constructor with sizes", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16);

			var data = layer.data;
			for (var i = 0; i < data.length; ++i){
				expect(data[i]).to.equal(0);
			}
			
			expect(layer.data.length).to.equal(8 * 16 * 4);
		});
	});

	describe("constructor with image buffer", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(
				new pxl.createImageData(8, 16).data.buffer);

			var data = layer.data;
			for (var i = 0; i < data.length; ++i){
				expect(data[i]).to.equal(0);
			}
	
			expect(layer.data.length).to.equal(8 * 16 * 4);
		});
	});

	describe("default name", function(){
		it("should be empty", function(){
			var layer = new pxl.Layout.Layer(8 * 16);

			expect(layer.name).to.equal("");
		});
	});

	describe("specify name", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16, null, "Test-Layer");

			expect(layer.name).to.equal("Test-Layer");
		});
	});

	describe("initial visibility", function(){
		it("should be visible", function(){
			var layer = new pxl.Layout.Layer(8 * 16);

			expect(layer.isVisible).to.equal(true);
		});
	});

	describe("reset layer", function(){
		it("each pixel have to be equal to 0", function(){
			var layer = new pxl.Layout.Layer(8 * 16);
			
			var i = 0;
			for (i = 0; i < layer.data.length; ++i){
				layer.data[i] = Math.floor(Math.random() * 256); //fill with random values
			}

			layer.reset();

			for (i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(0);
			}
		});
	});

	describe("copy layer", function(){
		it("each pixel prom layer1 have to be copied to layer2", function(){
			var layer1 = new pxl.Layout.Layer(8 * 16);
			var layer2 = new pxl.Layout.Layer(8 * 16);

			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = Math.floor(Math.random() * 256); //fill with random values
			}

			layer2.copy(layer1);

			for (i = 0; i < layer1.data.length; ++i){
				expect(layer1.data[i]).to.equal(layer2.data[i]);
			}
		});
	});

	describe("full copy layer", function(){
		it("all properties are copied from layer1 to layer2", function(){
			var layer1 = new pxl.Layout.Layer(8 * 16, null, "Origin");
			var layer2 = new pxl.Layout.Layer(8 * 16);
			layer2.isVisible = false;
			
			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = Math.floor(Math.random() * 255);
			}

			layer2.copy(layer1, true);

			for (i = 0; i < layer1.data.length; ++i){
				expect(layer1.data[i]).to.equal(layer2.data[i]);
			}

			expect(layer1.name).to.equal(layer2.name);
			expect(layer1.isVisible).to.equal(layer2.isVisible);
		});
	});

	describe("merge whole layers (no mix)", function(){
		it("each pixel prom layer1 have to be copied to layer2", function(){
			var layer1 = new pxl.Layout.Layer(8 * 16);
			var layer2 = new pxl.Layout.Layer(8 * 16);
			
			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = Math.floor(Math.random() * 256);
			}

			layer2.merge({
				"other": layer1,
				"isMix": false
			});

			for (i = 0; i < layer1.data.length; ++i){
				expect(layer1.data[i]).to.equal(layer2.data[i]);
			}
		});
	});

	describe("merge layers (with mix, but no start/offset)", function(){
		it("each pixel prom layer1 have to be mixed to layer2", function(){
			var COLOR1 = 200;
			var COLOR2 = 155;
			
			var layer1 = new pxl.Layout.Layer(8 * 16);
			var layer2 = new pxl.Layout.Layer(8 * 16, new pxl.Layout(8, 16)); //mix option is require layout

			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = COLOR1;
			}

			for (i = 0; i < layer2.data.length; ++i){
				layer2.data[i] = COLOR2;
			}

			layer2.merge({
				"other": layer1,
				"isMix": true
			});

			for (i = 0; i < layer2.data.length; ++i){
				expect(layer2.data[i]).to.not.equal(layer1.data[i]);
			}
		});
	});

	describe("merge layers (no mix, within start/offset)", function(){
		it("each pixel from area within start/offset of layer1 have to be copied to same area to layer2", function(){
			var layout = new pxl.Layout(8, 16);
			var layer1 = new pxl.Layout.Layer(8 * 16, layout);
			var layer2 = new pxl.Layout.Layer(8 * 16, layout);

			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = Math.floor(Math.random() * 255);
			}

			var options = {
				"other": layer1,
				"isMix": false,
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(2, 2)
			};

			layer2.merge(options);

			expect(true).is.equal(true);
		});
	});

	describe("flood fill", function(){
		it("flood fill whole layer", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			layer.fill({
				"position": new pxl.Point(2, 2),
				"pixel": new pxl.ImageDataArray([222, 111, 0, 255]),
				"isMix": false
			});

			for (var i = 0; i < layer.data.length; i += 4){
				expect(layer.data[i]).to.equal(222);
				expect(layer.data[i + 1]).to.equal(111);
				expect(layer.data[i + 2]).to.equal(0);
				expect(layer.data[i + 3]).to.equal(255);
			}
		});
	});

	describe("flood fill within area", function(){
		it("flood fill whole layer", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"position": new pxl.Point(5, 5),
				"pixel": new pxl.ImageDataArray([222, 111, 25, 255]),
				"isMix": false,
				"start": new pxl.Point(4, 5),
				"offset": new pxl.Point(2, 2)
			};
			layer.fill(options);

			
			//check pixel outside the area:
			expect(layer.data[500]).to.equal(0);
		});
	});

	describe("plot pixel", function(){
		it("flood fill whole layer", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"position": new pxl.Point(5, 5),
				"pixel": new pxl.ImageDataArray([222, 111, 25, 255]),
				"isMix": false,
				"start": new pxl.Point(4, 5),
				"offset": new pxl.Point(2, 2)
			};
			layer.fill(options);
			
			//check pixel outside the area:
			expect(layer.data[500]).to.equal(0);
		});
	});

});