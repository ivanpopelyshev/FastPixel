# FastPixel

Fast &amp; flexible API for creating awesome pixel-art tool

Currently in progress (stable beta).

## It is just works!

```javascript
//create view instance and make it active:
pxl.View.activeView = pxl.View.create({
	canvasSize: {
		width: 128,
		height: 128
	},
	element: document.querySelector("CANVAS")
});

//draws line from 25:25 to 50:100
pxl.bresenham.line(25, 25, 50, 100, function(x, y){
	pxl.View.activeView.getLayout().set({
		"start": new pxl.Vector2(x, y), //position where to apply
		"offset": new pxl.Vector2(1), //size of the pixel
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
There are few absolutely independence modules:
- [Vector2][]
- [Observer][]
- [brezenham][]

Other have different kinds of dependencies
(Layout can't work without Layer and Layer can't work without history)

Main logic is based on MVC design pattern.
So, it is possible to create few view instances that will listen for changes in one model, too example.

## Feedback

For any questions/propositions/e.t.c you can contact me at <kurzgame@gmail.com>

[examples]: ./examples
[pxl.js]: ./pxl.js
[pxl.min.js]: ./pxl.min.js
[Vector2]: ./public/js/pxl/Vector2/Vector2.js
[Observer]: ./public/js/pxl/Observer/Observer.js
[brezenham]: ./public/js/pxl/brezenham/brezenham.js
