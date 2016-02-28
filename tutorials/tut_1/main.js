var View = pxl.View;
var bresenham = pxl.bresenham;

View.activeView = View.create({
	"layoutSize": {
		width: 128,
		height: 128
	},
	"element": document.querySelector("CANVAS")
});

var options = {
	"start": new pxl.Point,
	"offset": new pxl.Point(1),
	"pixel": pxl.RGBA(0, 0, 0, 255)
};

bresenham.line(0, 0, 127, 50, function(x, y){
	options.start.set(x, y);
	View.activeView.drawRect(options);
});

bresenham.rectangle(32, 32, 100, 100, function(x, y){
	options.start.set(x, y);
	View.activeView.drawRect(options);
});

bresenham.ellipse(20, 120, 120, 75, function(x, y){
	options.start.set(x, y);
	View.activeView.drawRect(options);
});
