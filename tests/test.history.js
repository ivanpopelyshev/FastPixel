var expect = chai.expect;

describe("history", function(){
	describe("empty history", function(){
		it("should be OK", function(){
			expect(pxl.Layout.history.isHistoryEmpty()).to.equal(true);
		});
	});
	
	describe("empty history", function(){
		it("should be OK", function(){
			var history = pxl.Layout.history;

			var layout = new pxl.Layout(8, 16);
			layout.appendLayer();

			history.record(layout, history.STATIC_SHOT);

			history.cache();

			history.stop();

			expect(history.isHistoryEmpty()).to.equal(true);
		});
	});

});