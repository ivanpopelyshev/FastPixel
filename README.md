# FastPixel

Fast &amp; flexible API for creating awesome pixel-art tool!

Currently in progress (stable beta).
Very close to stable release.

## It is just works!

```javascript
// Create view instance and make it active:
pxl.View.activeView = pxl.View.create({
	canvasSize: {
		width: 128,
		height: 128
	},
	element: document.querySelector("CANVAS")
});

// Get the model:
var layout = pxl.View.activeView.getLayout();

// Create the first layer:
layout.appendLayer();

// Draw line from 25:25 to 50:100
pxl.bresenham.line(25, 25, 50, 100, function(x, y){
	layout.set({
		"start": new pxl.Point(x, y), //position where to apply
		"offset": new pxl.Point(1), //size of the pixel
		"pixel": new pxl.ImageDataArray([0, 0, 0, 255]), //pixel's color (black)
		"isMix": true, //ability to mix colors
		"isNotifyView": true //update view
	});
});
```

Look at [examples][] to see more!

## Dependencies

No! At all! Everything is you need is just a one file: [pxl.js][] or [pxl.min.js][]

## Modules

API is completely synchronous & single thread (no timers and no workers).
Based on different modules, separated by files (thanks to gulp).
Also there are few absolutely independence modules:
- [Point][]
- [Observer][]
- [bresenham][]

Main logic is based on MVC design pattern.
"Model" is a group of Layout and Layer classes. The  View component has obvious name "View".
The "Controller" have to be implemented by you. By default it null and called as "controller".

## Feedback

For any questions/propositions/e.t.c you can contact me at <kurzgame@gmail.com>

[examples]: ./examples
[pxl.js]: ./pxl.js
[pxl.min.js]: ./pxl.min.js
[Point]: ./public/js/pxl/Point/Point.js
[Observer]: ./public/js/pxl/Observer/Observer.js
[bresenham]: ./public/js/pxl/bresenham/bresenham.js
