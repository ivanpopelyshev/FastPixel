var expect = chai.expect;

describe("Layer", function(){
	describe("constructor with sizes", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16);

			var data = layer.data;
			for (var i = 0; i < data.length; ++i){
				expect(data[i]).to.equal(0);
			}
			
			expect(layer.data.length).to.equal(8 * 16);
		});
	});

	describe("constructor with image buffer", function(){
		it("should be OK", function(){
			var data = new pxl.createImageData(8, 16).data;
			data[3] = 255; //set alpha for first pixel
			data[7] = 255; //set alpha for second pixel

			var layer = new pxl.Layout.Layer(data.buffer);

			var COLOR = pxl.RGBA(0, 0, 0, 255);
			layer.data[8] = COLOR;

			expect(pxl.RGBA.getA(layer.data[0])).to.equal(data[3]); //compare alpha of first pixel
			expect(pxl.RGBA.getA(layer.data[1])).to.equal(data[7]); //compare alpha of second pixel
			expect(layer.data[8]).to.equal(COLOR);

			expect(layer.data.length).to.equal(8 * 16);
		});
	});
	
	describe("constructor with too large size", function(){
		it("should be OK", function(){
			try{
				new pxl.Layout.Layer(pxl.Layout.Layer.MAX_BUFFER_SIZE + 1);
			} catch(err){
				expect(err instanceof RangeError).to.equal(true);
				return;
			}
			
			expect(false).to.equal(true);
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
				layer.data[i] = pxl.RGBA(255, 255, 255, 255); //fill with white
			}

			layer.reset();

			for (i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(0);
			}
		});
	});

	describe("copy layer from another", function(){
		it("should be OK", function(){
			var layer1 = new pxl.Layout.Layer(8 * 16);
			var layer2 = new pxl.Layout.Layer(8 * 16);

			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = pxl.RGBA(255, 0, 255, 255); //fill with magenta
			}

			layer2.copyFrom(layer1);

			for (i = 0; i < layer1.data.length; ++i){
				expect(layer1.data[i]).to.equal(layer2.data[i]);
			}
		});
	});

	describe("full copy layer", function(){
		it("should be OK", function(){
			var layer1 = new pxl.Layout.Layer(8 * 16, null, "Origin");
			var layer2 = new pxl.Layout.Layer(8 * 16);
			layer2.isVisible = false;
			
			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = pxl.RGBA(0, 255, 255, 255); //fill with cyan
			}

			layer2.copyFrom(layer1, true);

			for (i = 0; i < layer1.data.length; ++i){
				expect(layer1.data[i]).to.equal(layer2.data[i]);
			}

			expect(layer1.name).to.equal(layer2.name);
			expect(layer1.isVisible).to.equal(layer2.isVisible);
		});
	});

	describe("merge whole layers (no mix)", function(){
		it("should be OK", function(){
			var layer1 = new pxl.Layout.Layer(8 * 16);
			var layer2 = new pxl.Layout.Layer(8 * 16);
			
			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = pxl.RGBA(0, 255, 255, 255); //fill with cyan
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
		it("should be OK", function(){
			var COLOR1 = pxl.RGBA(0, 255, 255, 100);
			var COLOR2 = pxl.RGBA(255, 0, 255, 100);

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
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer1 = new pxl.Layout.Layer(8 * 16, layout);
			var layer2 = new pxl.Layout.Layer(8 * 16, layout);

			var i = 0;
			for (i = 0; i < layer1.data.length; ++i){
				layer1.data[i] = pxl.RGBA(
					Math.floor(Math.random() * 256),
					Math.floor(Math.random() * 256),
					Math.floor(Math.random() * 256),
					Math.floor(Math.random() * 256));
			}

			var options = {
				"other": layer1,
				"isMix": false,
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(2, 2)
			};

			layer2.merge(options);

			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer2.data[i]).is.equal(layer1.data[i]);
					++i;
				}
			});
			
		});
	});

	describe("flood fill", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);
			
			var COLOR = pxl.RGBA(0, 255, 255, 100);

			layer.fill({
				"position": new pxl.Point(2, 2),
				"pixel": COLOR,
				"isMix": false
			});

			for (var i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(COLOR);
			}
		});
	});

	describe("flood fill within area", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);
			
			var COLOR = pxl.RGBA(0, 255, 255, 100);

			var options = {
				"position": new pxl.Point(5, 5),
				"pixel": COLOR,
				"isMix": false,
				"start": new pxl.Point(4, 5),
				"offset": new pxl.Point(2, 2)
			};

			layer.fill(options);

			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer.data[i++]).is.equal(COLOR);
				}
			});
		});
	});

	describe("set pixel", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);
			
			var COLOR = pxl.RGBA(0, 255, 255, 100);

			var options = {
				"pixel": COLOR,
				"isMix": false
			};

			layer.set(options);
			
			for (var i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(COLOR);
			}
		});
	});

	describe("set pixel (within area)", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);
			
			var COLOR = pxl.RGBA(0, 255, 255, 100);

			var options = {
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(2, 2),
				"pixel": COLOR,
				"isMix": false
			};

			layer.set(options);
			
			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer.data[i++]).is.equal(COLOR);
				}
			});
		});
	});

	describe("replace color", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);
			
			var COLOR = pxl.RGBA(0, 255, 255, 100);

			var options = {
				"pixel": COLOR,
				"oldPixel": 0
			};

			layer.replace(options);
			
			for (var i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(COLOR);
			}
		});
	});

	describe("replace color (within area)", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);
			
			var COLOR = pxl.RGBA(0, 255, 255, 100);

			var options = {
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(2, 2),
				"pixel": COLOR,
				"oldPixel": 0
			};

			layer.replace(options);

			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer.data[i++]).is.equal(COLOR);
				}
			});
		});
	});

	describe("set channel", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"channelOffset": 3, //alpha
				"value": 255
			};

			layer.setChannel(options);

			for (var i = 0; i < layer.data.length; ++i){
				expect(pxl.RGBA.getA(layer.data[i])).to.equal(255);
			}
		});
	});

	describe("set channel (within area)", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(2, 2),
				"channelOffset": 2, //blue
				"value": 255
			};

			layer.setChannel(options);

			layout.__process(options, function(i, length){
				while (i < length){
					expect(pxl.RGBA.getB(layer.data[i++])).to.equal(255);
				}
			});
		});
	});

	describe("insert data", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var index = 0;
			var data = new pxl.ImageDataArray([ // 2x2 white pixel
				255, 255, 255, 255, 255, 255, 255, 255,
				255, 255, 255, 255, 255, 255, 255, 255
			]);

			var options = {
				"start": new pxl.Point(0, 0),
				"offset": new pxl.Point(2, 2),
				"data": data
			};

			layer.insertData(options);

			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer.data[i++]).is.equal(pxl.RGBA(255, 255, 255, 255));
				}
			});
		});
	});

	describe("set color", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16);

			layer.setAt(4, pxl.RGBA(0, 255, 255, 100));
			
			expect(pxl.RGBA.getR(layer.data[4])).is.equal(0);
			expect(pxl.RGBA.getG(layer.data[4])).is.equal(255);
			expect(pxl.RGBA.getB(layer.data[4])).is.equal(255);
			expect(pxl.RGBA.getA(layer.data[4])).is.equal(100);
		});
	});

	describe("pixel from position", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16, new pxl.Layout(8, 16));
			
			layer.setAt(9, pxl.RGBA(0, 255, 255, 100));
			
			var tokenPixel = layer.pixelFromPosition(new pxl.Point(1, 1));
			
			expect(pxl.RGBA.getR(tokenPixel)).is.equal(0);
			expect(pxl.RGBA.getG(tokenPixel)).is.equal(255);
			expect(pxl.RGBA.getB(tokenPixel)).is.equal(255);
			expect(pxl.RGBA.getA(tokenPixel)).is.equal(100);
		});
	});

	describe("pixel from index", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16);
			
			layer.setAt(9, pxl.RGBA(0, 255, 255, 100));
			
			var tokenPixel = layer.pixelFromIndex(9);
			
			expect(pxl.RGBA.getR(tokenPixel)).is.equal(0);
			expect(pxl.RGBA.getG(tokenPixel)).is.equal(255);
			expect(pxl.RGBA.getB(tokenPixel)).is.equal(255);
			expect(pxl.RGBA.getA(tokenPixel)).is.equal(100);
		});
	});

	describe("destroy", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16, new pxl.Layout(8, 16));
			
			layer.destroy();
			
			expect(layer.data).to.equal(null);
			expect(layer.getLayout()).to.equal(null);
			expect(layer.isVisible).to.equal(false);
		});
	});

});