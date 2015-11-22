var expect = chai.expect;

describe("Observer", function(){
	describe("subscribe", function(){
		it("new item should be added to the _eventBook", function(){
			var observer = new pxl.Observer;
			observer.subscribe("test", function(eventObject){/*...*/});

			expect("test" in observer._eventBook).to.equal(true);
		});
	});

	describe("notify", function(){
		it("event should fired", function(){
			var observer = new pxl.Observer;
			observer.subscribe("test", function(eventObject){
				expect(eventObject.message).to.equal("Hello, World!");
			});
			observer.notify("test", {message: "Hello, World!"});
		});
	});

	describe("unsubscribe", function(){
		it("existing item should removed and test not crashed", function(){
			var observer = new pxl.Observer;
			observer.subscribe("test", testMethod);
	
			observer.unsubscribe("test", testMethod);

			observer.notify("test", {});

			expect(true).to.equal(true);

			function testMethod(eventObject){
				expect(false).to.equal(true);
			}
		});
	});

});