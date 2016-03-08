var expect = chai.expect;

describe("pxl", function(){
	describe("support", function(){
		it("should be supported by your browser!", function(){
			expect(pxl.isSupported()).to.equal(true);
		});
	});

	describe("ImagaDataArray constructor", function(){
		it("typed arrays should have buffer", function(){
			var typedArray = new pxl.ImageDataArray([255, 255, 255, 255]);

			expect(typeof typedArray.buffer).to.equal("object");
		});
	});

	describe("clamp method", function(){
		it("number should be clamped correctly", function(){
			expect(pxl.clamp(3.14, 4, 10)).to.equal(4);
			expect(pxl.clamp(11, 4, 10)).to.equal(10);
			expect(pxl.clamp(6, 4, 10)).to.equal(6);
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

	describe("extend", function(){
		it("should be OK", function(){
			function A(){};
			function B(){
				A.call(this);
			};
			pxl.extend(B, A);
			
			expect(new B instanceof B).to.equal(true);
			expect(new B instanceof A).to.equal(true);
		});
	});

	describe("imageData from image", function(){
		it("should be OK", function(){
			var img = new Image;
			img.onload = function(){
				var imageData = pxl.imageDataFromImage(this);
				
				expect(imageData.width).to.equal(this.width);
				expect(imageData.height).to.equal(this.height);
			};
			img.onerror = function(){
				expect(false).to.equal(true);
			};
			img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAARCAYAAADUryzEAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNmlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjarY6xSsNQFEDPi6LiUCsEcXB4kygotupgxqQtRRCs1SHJ1qShSmkSXl7VfoSjWwcXd7/AyVFwUPwC/0Bx6uAQIYODCJ7p3MPlcsGo2HWnYZRhEGvVbjrS9Xw5+8QMUwDQCbPUbrUOAOIkjvjB5ysC4HnTrjsN/sZ8mCoNTIDtbpSFICpA/0KnGsQYMIN+qkHcAaY6addAPAClXu4vQCnI/Q0oKdfzQXwAZs/1fDDmADPIfQUwdXSpAWpJOlJnvVMtq5ZlSbubBJE8HmU6GmRyPw4TlSaqo6MukP8HwGK+2G46cq1qWXvr/DOu58vc3o8QgFh6LFpBOFTn3yqMnd/n4sZ4GQ5vYXpStN0ruNmAheuirVahvAX34y/Axk/96FpPYgAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAUggAARVYAAA6lwAAF2/XWh+QAAAAlElEQVR42qSU0Q2AIAxEGaUr8MmfXwzAQizhHE7BDq7gFucX5tQWNCW5hCbwuB6EACB4ZA7JESxtjQmQHFFqQqkJW1tQalIhKoA3M8QFcDuwcrgAz8A6hOdcdxgA2/JMkiOGDmaaXuN+rDd9DpEBW1su/bqFke0hQHK8nciPSHOhArhnhmk5qABXCwyx6hfA+x+cAwCOTXVFLcLAjAAAAABJRU5ErkJggg==";
		});
	});

	describe("empty options", function(){
		it("should be OK", function(){
			try{
				pxl.emptyOptions.newKey = true;
				delete pxl.emptyOptions.newKey;
			} catch(err){
				expect(true).to.equal(true);
			}
			
		});
	});

	describe("fix range", function(){
		it("should be OK", function(){
			var source = {
				start: new pxl.Point(1, 2),
				offset: new pxl.Point(8, 8)
			};
			var destination = {
				start: new pxl.Point(0),
				offset: new pxl.Point(8, 8)
			};
			
			if (pxl.fixRange(source, destination)){
				expect(source.start.cmp(new pxl.Point(1, 2))).to.equal(true);
				expect(source.offset.cmp(new pxl.Point(7, 6))).to.equal(true);
			} else{
				expect(false).to.equal(true);
			}
			
		});
	});

	describe("fix range", function(){
		it("should be OK", function(){
			var source = {
				start: new pxl.Point(1, 2),
				offset: new pxl.Point(8, 8)
			};
			var destination = {
				start: new pxl.Point(4, 4),
				offset: new pxl.Point(8, 8)
			};
			
			if (pxl.fixRange(source, destination)){
				expect(source.start.cmp(new pxl.Point(4, 4))).to.equal(true);
				expect(source.offset.cmp(new pxl.Point(5, 6))).to.equal(true);
			} else{
				expect(false).to.equal(true);
			}
			
		});
	});

	describe("fix range", function(){
		it("should be OK", function(){
			var source = {
				start: new pxl.Point(-1, -2),
				offset: new pxl.Point(14, 16)
			};
			var destination = {
				start: new pxl.Point(0, 0),
				offset: new pxl.Point(8, 8)
			};
			
			if (pxl.fixRange(source, destination)){
				expect(source.start.cmp(destination.start)).to.equal(true);
				expect(source.offset.cmp(destination.offset)).to.equal(true);
			} else{
				expect(false).to.equal(true);
			}
			
		});
	});

	describe("fix range", function(){
		it("should be OK", function(){
			var source = {
				start: new pxl.Point(8, 8),
				offset: new pxl.Point(1, 1)
			};
			var destination = {
				start: new pxl.Point(0, 0),
				offset: new pxl.Point(8, 8)
			};
			
			if (pxl.fixRange(source, destination)){
				
			} else{
				expect(true).to.equal(true);
			}
			
		});
	});

	describe("fix range", function(){
		it("should be OK", function(){
			var source = {
				start: new pxl.Point(2, 2),
				offset: new pxl.Point(6, 6)
			};
			var destination = new pxl.Layout(8, 16);
			
			if (pxl.fixRange(source, destination)){
				expect(source.start.cmp(new pxl.Point(2, 2))).to.equal(true);
				expect(source.offset.cmp(new pxl.Point(6, 6))).to.equal(true);
			} else{
				expect(false).to.equal(true);
			}
			
		});
	});

});