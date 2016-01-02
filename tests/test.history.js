var expect = chai.expect;

describe("history", function(){
	describe("empty history", function(){
		it("should be OK", function(){
			expect(pxl.Layout.history.isHistoryEmpty()).to.equal(true);
		});
	});
	
	describe("full history", function(){
		it("should be OK", function(){
			var history = pxl.Layout.history;

			var layout = new pxl.Layout(8, 16);
			layout.appendLayer();

			for (var i = 0; i < history.MAX_HISTORY_SIZE; ++i){
				history.record(layout, history.DYNAMIC_SHOT);
				history.cache(0);
				history.stop();
			}
			expect(history.isHistoryFull()).to.equal(true);
			
			history.free();
		});
	});

	describe("is recording", function(){
		it("should be OK", function(){
			var history = pxl.Layout.history;
			
			history.record(new pxl.Layout(8, 16), history.DYNAMIC_SHOT);
			expect(pxl.Layout.history.isRecording()).to.equal(true);
			history.stop();
			
			history.free();
		});
	});
	
});