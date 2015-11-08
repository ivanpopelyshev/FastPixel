var expect = chai.expect;

describe("Vector2", function(){
	describe("default constructor", function(){
		it("Both x and y properties are 0 by default", function(){
			var vec = new pxl.Vector2;

			expect(vec.x).to.equal(0);
			expect(vec.y).to.equal(0);
		});
	});

	describe("constructor with one argument", function(){
		it("Both x and y properties are equal to 1", function(){
			var vec = new pxl.Vector2(1);

			expect(vec.x).to.equal(1);
			expect(vec.y).to.equal(1);
		});
	});

	describe("constructor with two arguments", function(){
		it("x and y properties are different", function(){
			var vec = new pxl.Vector2(1, 2);

			expect(vec.x).to.equal(1);
			expect(vec.y).to.equal(2);
		});
	});

	describe("stringify an instance", function(){
		it("have to be in JSON format", function(){
			var vec = new pxl.Vector2(1, 2);

			expect(vec + "").to.equal('{"x":1,"y":2}');
		});
	});

	describe("add two Vector2 instances", function(){
		it("Add corresponding properties", function(){
			var vec = new pxl.Vector2(2);
			vec.add(new pxl.Vector2(2, 1));

			expect(vec.x).to.equal(4);
			expect(vec.y).to.equal(3);
		});
	});

	describe("add number to Vector2 instance", function(){
		it("Both x and y properties are added with number", function(){
			var vec = new pxl.Vector2(2, 3);
			vec.add(2);

			expect(vec.x).to.equal(4);
			expect(vec.y).to.equal(5);
		});
	});

	describe("add numbers to Vector2 instance", function(){
		it("x added with first argument, and y with second one", function(){
			var vec = new pxl.Vector2(2, 3);
			vec.add(2, 1);

			expect(vec.x).to.equal(4);
			expect(vec.y).to.equal(4);
		});
	});

	describe("sub two Vector2 instances", function(){
		it("Add corresponding properties", function(){
			var vec = new pxl.Vector2(2);
			vec.sub(new pxl.Vector2(2, 1));

			expect(vec.x).to.equal(0);
			expect(vec.y).to.equal(1);
		});
	});

	describe("sub number from Vector2 instance", function(){
		it("Both x and y properties are substracted with number", function(){
			var vec = new pxl.Vector2(2, 3);
			vec.sub(2);

			expect(vec.x).to.equal(0);
			expect(vec.y).to.equal(1);
		});
	});

	describe("sub numbers from Vector2 instance", function(){
		it("x sub'ed with first argument, and y with second one", function(){
			var vec = new pxl.Vector2(2, 3);
			vec.sub(2, 1);

			expect(vec.x).to.equal(0);
			expect(vec.y).to.equal(2);
		});
	});

	describe("multiply two Vector2 instances", function(){
		it("multiply corresponding properties", function(){
			var vec = new pxl.Vector2(2);
			vec.mul(new pxl.Vector2(2, 1));

			expect(vec.x).to.equal(4);
			expect(vec.y).to.equal(2);
		});
	});

	describe("multiply Vector2 instance by number", function(){
		it("Both x and y properties are multiplied by number", function(){
			var vec = new pxl.Vector2(2, 1);
			vec.mul(2);

			expect(vec.x).to.equal(4);
			expect(vec.y).to.equal(2);
		});
	});

	describe("multiply Vector2 instance by numbers", function(){
		it("multiply corresponding properties by numbers", function(){
			var vec = new pxl.Vector2(2, 2);
			vec.mul(2, 1);

			expect(vec.x).to.equal(4);
			expect(vec.y).to.equal(2);
		});
	});

	describe("divide two Vector2 instances", function(){
		it("divide corresponding properties", function(){
			var vec = new pxl.Vector2(2);
			vec.div(new pxl.Vector2(2, 1));

			expect(vec.x).to.equal(1);
			expect(vec.y).to.equal(2);
		});
	});

	describe("divide Vector2 instance by number", function(){
		it("Both x and y properties are divided by number", function(){
			var vec = new pxl.Vector2(2, 4);
			vec.div(2);

			expect(vec.x).to.equal(1);
			expect(vec.y).to.equal(2);
		});
	});

	describe("divide Vector2 instance by numbers", function(){
		it("divide corresponding properties by numbers", function(){
			var vec = new pxl.Vector2(2, 2);
			vec.div(2, 1);

			expect(vec.x).to.equal(1);
			expect(vec.y).to.equal(2);
		});
	});

	describe("copy Vector2 instance", function(){
		it("instances have to be equal after setting", function(){
			var vec = new pxl.Vector2;
			vec.set(new pxl.Vector2(2, 1));

			expect(vec.x).to.equal(2);
			expect(vec.y).to.equal(1);
		});
	});

	describe("set properties to number", function(){
		it("Both x and y properties are setting to the number", function(){
			var vec = new pxl.Vector2;
			vec.set(2);

			expect(vec.x).to.equal(2);
			expect(vec.y).to.equal(2);
		});
	});

	describe("set properties to numbers", function(){
		it("set corresponding properties to the numbers", function(){
			var vec = new pxl.Vector2;
			vec.set(2, 1);

			expect(vec.x).to.equal(2);
			expect(vec.y).to.equal(1);
		});
	});

	describe("compare Vector2 instance", function(){
		it("instances are not equal", function(){
			var vec = new pxl.Vector2(2);

			expect(vec.cmp(new pxl.Vector2(2, 1))).to.equal(false);
		});
	});

	describe("compare properties with number", function(){
		it("Both x and y properties are equal to the number", function(){
			var vec = new pxl.Vector2;

			expect(vec.cmp(0)).to.equal(true);
		});
	});

	describe("compare properties with numbers", function(){
		it("compare corresponding properties to the numbers", function(){
			var vec = new pxl.Vector2(2, 1);

			expect(vec.cmp(2, 1)).to.equal(true);
		});
	});

	describe("make instance absolute", function(){
		it("each property have to be positive", function(){
			var vec = new pxl.Vector2(-1);
			vec.abs();

			expect(vec.x >= 0).to.equal(true);
			expect(vec.y >= 0).to.equal(true);
		});
	});

	describe("make instance negative", function(){
		it("each property have to be negative", function(){
			var vec = new pxl.Vector2(1);
			vec.neg();

			expect(vec.x < 0).to.equal(true);
			expect(vec.y < 0).to.equal(true);
		});
	});

	describe("swap two Vector2 instances", function(){
		it("corresponding properties have to be swapped", function(){
			var vec1 = new pxl.Vector2(1, 2);
			var vec2 = new pxl.Vector2(3, 4);
			
			vec1.swap(vec2);
			
			expect(vec1.cmp(3, 4)).to.equal(true);
			expect(vec2.cmp(1, 2)).to.equal(true);
		});
	});

	describe("round down Vector2 instance", function(){
		it("each property have to be rounded", function(){
			var vec = new pxl.Vector2(3.14, 9.8);
			vec.floor();
			
			expect(vec.cmp(3, 9)).to.equal(true);
		});
	});

	describe("round up Vector2 instance", function(){
		it("each property have to be rounded", function(){
			var vec = new pxl.Vector2(3.14, 9.8);
			vec.ceil();
			
			expect(vec.cmp(4, 10)).to.equal(true);
		});
	});

	describe("round Vector2 instance", function(){
		it("each property have to be rounded", function(){
			var vec = new pxl.Vector2(3.14, 9.8);
			vec.round();

			expect(vec.cmp(3, 10)).to.equal(true);
		});
	});

	describe("check for NaN", function(){
		it("at least one of the properties have to be NaN", function(){
			var vec = new pxl.Vector2(1, 2);
			vec.mul("Hello, World!");

			expect(vec.hasNaN()).to.equal(true);
		});
	});

	describe("check for Infinity", function(){
		it("at least one of the properties have to be infinite", function(){
			var vec = new pxl.Vector2(1, 2);
			vec.div(0);

			expect(vec.hasInfinity()).to.equal(true);
		});
	});

	describe("clone instance", function(){
		it("new instance with same properties have to be created", function(){
			var vec1 = new pxl.Vector2(1, 2);
			var vec2 = vec1.clone();

			expect(vec2.cmp(1, 2)).to.equal(true);
		});
	});

});