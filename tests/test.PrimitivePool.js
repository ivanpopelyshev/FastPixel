var expect = chai.expect;

describe("PrimitivePool", function(){
	describe("create new instance", function(){
		it("size should be equal to zero", function(){
			var pool = new pxl.PrimitivePool(Number);
			
			expect(pool.size()).to.equal(0);
		});
	});

	describe("push new item", function(){
		it("size should be expanded", function(){
			var pool = new pxl.PrimitivePool(Number);
			pool.push(0);

			expect(pool.size()).to.equal(1);
		});
	});

	describe("pop just added item", function(){
		it("size should be decreased", function(){
			var pool = new pxl.PrimitivePool(Number);
			pool.push(1);

			expect(pool.pop()).to.equal(1);
			expect(pool.size()).to.equal(0);
		});
	});

	describe("pop on empty pool", function(){
		it("return null if there are no items", function(){
			var pool = new pxl.PrimitivePool(Number);

			expect(pool.pop()).to.equal(null);
			expect(pool.size()).to.equal(0);
		});
	});

	describe("get item by index", function(){
		it("return desired item if index is correct", function(){
			var pool = new pxl.PrimitivePool(Number);
			pool.push(3.14);

			expect(pool.at(0)).to.equal(3.14);
		});
	});

	describe("get last item", function(){
		it("return the item from back", function(){
			var pool = new pxl.PrimitivePool(Number);
			pool.push(3.14);
			pool.push(9.8);
			pool.push(666);

			expect(pool.back()).to.equal(666);
		});
	});

	describe("get last item on empty pool", function(){
		it("return null if there are no items", function(){
			var pool = new pxl.PrimitivePool(Number);

			expect(pool.back()).to.equal(null);
		});
	});

	describe("reduce the size", function(){
		it("size should be completely reduced", function(){
			var pool = new pxl.PrimitivePool(Number);
			pool.push(3.14);
			pool.push(9.8);
			pool.push(666);
			pool.reduce();

			expect(pool.size()).to.equal(0);
		});
	});

	describe("shrink pool instance to fit", function(){
		it("pool's content from last usage should be shrunk to the current size", function(){
			var pool = new pxl.PrimitivePool(Number);
			pool.push(3.14);
			pool.push(9.8);
			pool.push(666);

			pool.reduce();

			pool.push(999);

			expect(pool.size()).to.equal(1);
		});
	});

	describe("free memory", function(){
		it("size should be completely reduced", function(){
			var pool = new pxl.PrimitivePool(Number);
			pool.push(3.14);
			pool.push(9.8);
			pool.push(666);
			pool.free();
			
			expect(pool.size()).to.equal(0);
		});
	});

});