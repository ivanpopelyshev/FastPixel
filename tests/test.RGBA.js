var expect = chai.expect;

describe("RGBA", function(){

	describe("pack/unpack RGBA", function(){
		it("should be OK", function(){
			var packedRGBA = pxl.RGBA(0, 111, 222, 255);			
			expect(pxl.RGBA.getR(packedRGBA)).to.equal(0);
			expect(pxl.RGBA.getG(packedRGBA)).to.equal(111);
			expect(pxl.RGBA.getB(packedRGBA)).to.equal(222);
			expect(pxl.RGBA.getA(packedRGBA)).to.equal(255);
		});
	});

	describe("unsigned 32bit", function(){
		it("should be unsigned", function(){
			var rgba = pxl.RGBA(255, 255, 255, 255);
			expect(rgba).to.equal(0xFFFFFFFF);
			expect(rgba < 0).to.equal(false);
		});
	});

	describe("alpha blending", function(){
		it("should be OK", function(){
			var bottom = pxl.RGBA(81, 188, 87, 25);
			var top = pxl.RGBA(239, 133, 11, 204);

			var mix = pxl.RGBA.alphaBlend(bottom, top);
			var expectedR = 235;
			var expectedG = 134;
			var expectedB = 13;
			var expectedA = 209;

			expect(compareWithEpsilon( pxl.RGBA.getR(mix), expectedR ) ).to.equal(true);
			
			expect(compareWithEpsilon( pxl.RGBA.getG(mix), expectedG )).to.equal(true);
			
			expect(compareWithEpsilon( pxl.RGBA.getB(mix), expectedB )).to.equal(true);
			
			expect(compareWithEpsilon( pxl.RGBA.getA(mix), expectedA )).to.equal(true);

			function compareWithEpsilon(one, two){
				var res = Math.abs(one - two);
				var epsilon = 1;
				return res <= epsilon;
			}
		});
	});

});