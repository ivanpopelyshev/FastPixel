var View = pxl.View;
var bresenham = pxl.bresenham;
var Point = pxl.Point;
var options = {
    "start": new Point,
    "offset": new Point(1),
    "pixel": pxl.RGBA(0, 0, 0, 255),
	"isNotifyView": true
};

View.activeView = View.create({
    layoutSize: { //size (in pixels) of your "off-screen" canvas
        width: 32,
        height: 32
    },
    element: document.querySelector("CANVAS")
});

var layout = View.activeView.getLayout();
layout.activeLayer = layout.insertLayer();

bresenham.ellipse(0, 0, 31, 31, function(x, y){
    options.start.set(x, y);
    layout.set(options);
});

View.activeView.setScale(3); //specify new scale first!

var imagePoint = View.activeView.getImagePoint(); //x: 0, y: 0 by default

View.activeView.fitToTransition(imagePoint);

View.activeView.setImagePoint(imagePoint); //specify new image point according to new scale offset

View
.activeView
.clear(pxl.emptyOptions)    //clear old
.begin()
.redraw(pxl.emptyOptions)   //redraw from the model
.end();
