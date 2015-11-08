# FastPixel

Fast &amp; flexible API for creating awesome pixel-art tool

Currently in progress (unstable beta).

## It is just works!

```javascript
//creating new view instance:
pxl.activeView = pxl.Layout.View.create({
	canvasSize: {
		width: 128,
		height: 128
	},
	element: document.querySelector("CANVAS")
});

//draw line from 25:25 to 50:100
pxl.Layout.controller.plotLine(25, 25, 50, 100);
```

Look at [examples][] to see more examples!

## Dependencies

No! At all! Everything is you need is just a one file: [pxl.js][] or [pxl.min.js][]

## Modules

API is based on different modules, separated by files (thanks to gulp).
There are three absolutely independence modules:
- [Vector2][]
- [Observer][]
- [PrimitivePool][]

Other have different types of dependencies
(Layout can't work without Layer and Layer can't work without Pixel)

Main logic is based on MVC design pattern.
So, it is possible to create few view instances that will listen for changes in one model, too example.

## Feedback

For any questions/propositions/e.t.c you can contact me at <kurzgame@gmail.com>

[examples]: ./examples
[pxl.js]: ./pxl.js
[pxl.js]: ./pxl.min.js
[Vector2]: ./public/js/pxl/Vector2/Vector2.js
[Observer]: ./public/js/pxl/Observer/Observer.js
[PrimitivePool]: ./public/js/pxl/PrimitivePool/PrimitivePool.js
