var expect = chai.expect;

describe("GrovingPool", function(){
	describe("create new instance", function(){
		it("size should be equal to zero", function(){
			var pool = new pxl.GrovingPool(Object);
			
			expect(pool.size()).to.equal(0);
		});
	});

	describe("expand pool", function(){
		it("size should be expanded", function(){
			var pool = new pxl.GrovingPool(Object);
			pool.expand();

			expect(pool.size()).to.equal(1);
		});
	});

	describe("pop just added item", function(){
		it("size should be decreased", function(){
			var pool = new pxl.GrovingPool(Object);
			pool.expand()["key"] = "value";

			expect(pool.pop().key).to.equal("value");
			expect(pool.size()).to.equal(0);
		});
	});

	describe("pop on empty pool", function(){
		it("return null if there are no items", function(){
			var pool = new pxl.GrovingPool(Object);

			expect(pool.pop()).to.equal(null);
			expect(pool.size()).to.equal(0);
		});
	});

	describe("get item by index", function(){
		it("return desired item if index is correct", function(){
			var pool = new pxl.GrovingPool(Object);
			pool.expand()["key"] = "value";

			expect(pool.at(0).key).to.equal("value");
		});
	});

	describe("get last item", function(){
		it("return the item from back", function(){
			var pool = new pxl.GrovingPool(Object);
			pool.expand()["key1"] = "value1";
			pool.expand()["key2"] = "value2";
			pool.expand()["key3"] = "value3";

			expect(pool.back().key3).to.equal("value3");
		});
	});

	describe("get last item on empty pool", function(){
		it("return null if there are no items", function(){
			var pool = new pxl.GrovingPool(Object);

			expect(pool.back()).to.equal(null);
		});
	});

	describe("reduce the size", function(){
		it("size should be completely reduced", function(){
			var pool = new pxl.GrovingPool(Object);
			pool.expand()["key1"] = "value1";
			pool.expand()["key2"] = "value2";
			pool.expand()["key3"] = "value3";

			pool.reduce();

			expect(pool.size()).to.equal(0);
		});
	});

	describe("shrink pool instance to fit", function(){
		it("pool's content from last usage should be shrunk to the current size", function(){
			var pool = new pxl.GrovingPool(Object);
			pool.expand()["key1"] = "value1";
			pool.expand()["key2"] = "value2";
			pool.expand()["key3"] = "value3";

			pool.shrink();

			pool.expand()["key4"] = "value4";

			expect(pool.back().key4).to.equal("value4");
		});
	});

	describe("free memory", function(){
		it("size should be completely reduced", function(){
			var pool = new pxl.GrovingPool(Object);
			pool.expand()["key1"] = "value1";
			pool.expand()["key2"] = "value2";
			pool.expand()["key3"] = "value3";

			pool.free();
			
			expect(pool.size()).to.equal(0);
		});
	});

});