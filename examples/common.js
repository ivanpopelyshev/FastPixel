var canvas = document.querySelector("#canvas");

document.addEventListener("mousedown", userDownMouse, false);
document.addEventListener("touchstart", userDownTouch, false);
document.addEventListener("wheel", userWheel, false);
document.addEventListener("keypress", userKey, false);
canvas.addEventListener("mousemove", userMove, false);

function userDownMouse(e){
	fill(Math.floor(e.pageX), Math.floor(e.pageY));
};

function userDownTouch(e){
	fill(Math.floor(e.pageX), Math.floor(e.pageY));
};

function userMove(e){
	controller.updateUserPosition(e.pageX, e.pageY).draw(function(){
		this.carryPixel(); //draw pixel near cursor
	});
};

function userWheel(e){
	var dt = e.deltaY || e.detail || e.wheelDelta;
	controller.rescale(dt > 0 ? -1 : 1); //change scale by mouse wheel
};

function userKey(e){
	if (e.keyCode === 121) controller.redo();
	else if (e.keyCode === 122) controller.undo();
};

function fill(x, y){
	controller.setColor(
		(Math.random() * 255) | 0,
		(Math.random() * 255) | 0,
		(Math.random() * 255) | 0,
		(Math.random() * 255) | 0
	).draw(function(){
		this.record(function(){
			this.fill(x, y);
		});
	}).setColor(0, 0, 0, 255);
}