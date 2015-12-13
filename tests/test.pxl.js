var expect = chai.expect;

describe("pxl", function(){
	describe("support", function(){
		it("should be supported by your browser!", function(){
			expect(pxl.isSupported).to.equal(true);
		});
	});

	describe("ImagaDataArray constructor", function(){
		it("typed arrays should have buffer", function(){
			var typedArray = new pxl.ImageDataArray([255, 255, 255, 255]);

			expect(typeof typedArray.buffer).to.equal("object");
		});
	});

	describe("clamp method", function(){
		it("number should be clamped to minimum border", function(){
			var num = 3.14;

			expect(pxl.clamp(num, 4, 10)).to.equal(4);
		});
	});

	describe("create imageData", function(){
		it("new imageData 8x8 instance should be created", function(){
			var imageData = pxl.createImageData(8, 8);

			expect(imageData.width).to.equal(8);
			expect(imageData.height).to.equal(8);
		});
	});

	describe("create canvas element", function(){
		it("each DOM object has nodeName property", function(){
			var canvas = pxl.createCanvas();

			expect(canvas.nodeName.toLowerCase()).to.equal("canvas");
		});
	});

});