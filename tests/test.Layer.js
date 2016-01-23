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
			var data = new pxl.createImageData(8, 16).data;
			data[0] = 255;
			data[4] = 255;
			data[8] = 255;

			var layer = new pxl.Layout.Layer(data.buffer);
			
			layer.data[16] = 255;

			expect(layer.data[0]).to.equal(data[0]);
			expect(layer.data[4]).to.equal(data[4]);
			expect(layer.data[8]).to.equal(data[8]);
			expect(layer.data[16]).to.equal(data[16]);
	
			expect(layer.data.length).to.equal(8 * 16 * 4);
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
				layer.data[i] = Math.floor(Math.random() * 256); //fill with random values
			}

			layer.reset();

			for (i = 0; i < layer.data.length; ++i){
				expect(layer.data[i]).to.equal(0);
			}
		});
	});

	describe("copy layer", function(){
		it("should be OK", function(){
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
		it("should be OK", function(){
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
		it("should be OK", function(){
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
		it("should be OK", function(){
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
		it("should be OK", function(){
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
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"position": new pxl.Point(5, 5),
				"pixel": new pxl.ImageDataArray([255, 255, 255, 255]),
				"isMix": false,
				"start": new pxl.Point(4, 5),
				"offset": new pxl.Point(2, 2)
			};

			layer.fill(options);

			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer.data[i]).is.equal(255);

					++i;
				}
			});
		});
	});

	describe("set pixel", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"pixel": new pxl.ImageDataArray([255, 255, 255, 255]),
				"isMix": false
			};

			layer.set(options);
			
			for (var i = 0; i < layer.data.length; i += 4){
				expect(layer.data[i]).to.equal(255);
			}
		});
	});

	describe("set pixel (within area)", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(2, 2),
				"pixel": new pxl.ImageDataArray([255, 255, 255, 255]),
				"isMix": false
			};

			layer.set(options);
			
			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer.data[i]).is.equal(255);

					++i;
				}
			});
		});
	});

	describe("replace color", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"pixel": new pxl.ImageDataArray([255, 255, 255, 255]),
				"oldPixel": new pxl.ImageDataArray([0, 0, 0, 0])
			};

			layer.colorReplace(options);
			
			for (var i = 0; i < layer.data.length; i += 4){
				expect(layer.data[i]).to.equal(255);
			}
		});
	});

	describe("replace color (within area)", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"start": new pxl.Point(2, 2),
				"offset": new pxl.Point(2, 2),
				"pixel": new pxl.ImageDataArray([255, 255, 255, 255]),
				"oldPixel": new pxl.ImageDataArray([0, 0, 0, 0])
			};

			layer.colorReplace(options);

			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer.data[i]).is.equal(255);

					++i;
				}
			});
		});
	});

	describe("set channel", function(){
		it("should be OK", function(){
			var layout = new pxl.Layout(8, 16);
			var layer = new pxl.Layout.Layer(8 * 16, layout);

			var options = {
				"channelOffset": 2,
				"value": 255
			};

			layer.setChannel(options);

			for (var i = 0; i < layer.data.length; i += 4){
				expect(layer.data[i + 2]).to.equal(255);
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
				"channelOffset": 2,
				"value": 255
			};

			layer.setChannel(options);

			layout.__process(options, function(i, length){
				while (i < length){
					expect(layer.data[i + 2]).is.equal(255);

					i += 4;
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
					expect(layer.data[i++]).is.equal(data[index++]);
				}
			});
		});
	});

	describe("set color", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16);

			layer.setAt(4, 255, 255, 255, 255);
			
			expect(layer.data[4]).is.equal(255);
			expect(layer.data[5]).is.equal(255);
			expect(layer.data[6]).is.equal(255);
			expect(layer.data[7]).is.equal(255);
		});
	});

	describe("compare color", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16);

			layer.setAt(4, 255, 255, 255, 255);
			
			expect(layer.compareAt(4, 255, 255, 255, 255)).is.equal(true);
		});
	});

	describe("pixel from position", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16, new pxl.Layout(8, 16));
			
			layer.setAt(9 * 4, 255, 255, 255, 255);
			
			var tokenPixel = layer.pixelFromPosition(new pxl.Point(1, 1));
			
			expect(tokenPixel[0]).to.equal(255);
			expect(tokenPixel[1]).to.equal(255);
			expect(tokenPixel[2]).to.equal(255);
			expect(tokenPixel[3]).to.equal(255);
		});
	});

	describe("pixel from index", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16);
			
			layer.setAt(9 * 4, 255, 255, 255, 255);
			
			var tokenPixel = layer.pixelFromIndex(9);
			
			expect(tokenPixel[0]).to.equal(255);
			expect(tokenPixel[1]).to.equal(255);
			expect(tokenPixel[2]).to.equal(255);
			expect(tokenPixel[3]).to.equal(255);
		});
	});

	describe("pixel at index", function(){
		it("should be OK", function(){
			var layer = new pxl.Layout.Layer(8 * 16);
			
			layer.setAt(9 * 4, 255, 255, 255, 255);
			
			var tokenPixel = layer.pixelAt(9 * 4);
			
			expect(tokenPixel[0]).to.equal(255);
			expect(tokenPixel[1]).to.equal(255);
			expect(tokenPixel[2]).to.equal(255);
			expect(tokenPixel[3]).to.equal(255);
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