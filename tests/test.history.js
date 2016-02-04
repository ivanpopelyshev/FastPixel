var expect = chai.expect;

describe("history", function(){
	describe("empty history", function(){
		it("should be OK", function(){
			expect(pxl.Layout.history.getHistorySize()).to.equal(0);
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

	describe("history size", function(){
		it("should be OK", function(){
			var history = pxl.Layout.history;
			
			history.record(new pxl.Layout(8, 16), history.STATIC_SHOT);
			history.stop();

			expect(pxl.Layout.history.getHistorySize()).to.equal(0); //empty sessions don't pass

			history.free();
		});
	});

	describe("reset recording", function(){
		it("should be OK", function(){
			var history = pxl.Layout.history;
			
			history.record(new pxl.Layout(8, 16), history.DYNAMIC_SHOT);

			history.resetRecording();

			expect(pxl.Layout.history.isRecording()).to.equal(false);
			expect(pxl.Layout.history.getHistorySize()).to.equal(0);

			history.free();
		});
	});

});