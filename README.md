# FastPixel

Fast &amp; flexible MVC-based API for creating awesome pixel-art tool!

Stable version! (v. 0.1.0)

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
Few of them available online by links below:
- [Pixel carrying][]
- [Color replacing][]
- [Channel setting][]

## Dependencies

No! At all! Everything is you need is just a one file: [pxl.js][] or [pxl.min.js][]

## Short description

API is completely synchronous & single thread (no timers and no workers).

"Model" is a close cooperation of Layout and Layer classes.

The View component has obvious name "View".

The "Controller" have to be implemented by developer. By default it null and called as "controller".

## Feedback

For any questions/propositions/e.t.c you can contact me at <kurzgame@gmail.com>

[examples]: ./examples
[pxl.js]: ./pxl.js
[pxl.min.js]: ./pxl.min.js
[Pixel carrying]: https://cdn.rawgit.com/kurzgame/FastPixel/master/examples/carry%20pixel.html
[Color replacing]: https://cdn.rawgit.com/kurzgame/FastPixel/master/examples/color%20replace.html
[Channel setting]: https://cdn.rawgit.com/kurzgame/FastPixel/master/examples/setting%20channel.html
