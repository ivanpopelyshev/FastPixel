var expect = chai.expect;

describe("Layer", function(){
	describe("constructor with sizes", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer({
				"source": 8 * 16
			});

			expect(layer.data.length).to.equal(8 * 16 * 4);
		});
	});

	describe("constructor with image buffer", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer({
				"source": new pxl.createImageData(8, 16).data.buffer
			});

			expect(layer.data.length).to.equal(8 * 16 * 4);
		});
	});

	describe("default name", function(){
		it("should be empty", function(){
			var layer = new pxl.Layout.Layer({"source": 8 * 16});

			expect(layer.name).to.equal("");
		});
	});

	describe("specify name", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer({
				"source": 8 * 16,
				"name": "Test-Layer"
			});

			expect(layer.name).to.equal("Test-Layer");
		});
	});

	describe("initial visibility", function(){
		it("should be visible", function(){
			var layer = new pxl.Layout.Layer({"source": 8 * 16});

			expect(layer.isVisible).to.equal(true);
		});
	});

	describe("reset layer", function(){
		it("each pixel have to be equal to 0", function(){
			var layer = new pxl.Layout.Layer({"source": 8 * 16});
			
			var i = 0;
			for (i = 0; i < layer.data.length; ++i){
				layer.data[i] = Math.floor(Math.random() * 255);
			}

			layer.reset();

			for (i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(0);
			}
		});
	});

	describe("copy layer", function(){
		it("each pixel prom layer1 have to be copied to layer2", function(){
			var layer1 = new pxl.Layout.Layer({"source": 8 * 16});
			var layer2 = new pxl.Layout.Layer({"source": 8 * 16});
			
			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = Math.floor(Math.random() * 255);
			}

			layer2.copy(layer1);

			for (i = 0; i < layer1.data.length; ++i){
				expect(layer1.data[i]).to.equal(layer2.data[i]);
			}
		});
	});

	describe("full copy layer", function(){
		it("all properties are copied from layer1 to layer2", function(){
			var layer1 = new pxl.Layout.Layer({
				"source": 8 * 16,
				"name": "Origin"
			});
			var layer2 = new pxl.Layout.Layer({"source": 8 * 16});
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

	describe("merge layers", function(){
		it("each pixel prom layer1 have to be mixed to layer2", function(){
			var layer1 = new pxl.Layout.Layer({
				"source": 8 * 16,
				"name": "Origin"
			});
			var layer2 = new pxl.Layout.Layer({"source": 8 * 16});
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

});