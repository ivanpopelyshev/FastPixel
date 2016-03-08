# FastPixel 1.0.0 (Invader)

Very fast &amp; flexible MVC-based API for creating awesome pixel-art tool!

The [documentation][] should help you orient with code!

The brand new [wiki][] section is available now!

Few examples are available online by links below:
- [Pixel carrying][]
- [Color replacing][]
- [Channel setting][]
- [Bucket-fill][]

There are even more at [examples][] folder!

## Browser capability

Tested and works well on: IE11+, Chrome42+, FireFox36+, iOS8+ Safari  
In general, it may work on older versions! The only restriction: ECMAScript 5 is required.

## Dependencies

No! At all! Everything is you need is just a one file: [pxl.js][] or [pxl.min.js][]

## Short description

API is completely synchronous & single thread (no timers and no workers).

"Model" is a close cooperation of Layout and Layer classes.  
The "View" component implemented in View class.  
The "Controller" have to be implemented by developer. By default it is null and called as "controller".

## Feedback

For any questions/propositions/e.t.c you can contact me at <kurzgame@gmail.com>

[examples]: ./examples
[pxl.js]: ./pxl.js
[pxl.min.js]: ./pxl.min.js
[Pixel carrying]: https://cdn.rawgit.com/kurzgame/FastPixel/master/examples/carry%20pixel.html
[Color replacing]: https://cdn.rawgit.com/kurzgame/FastPixel/master/examples/color%20replace.html
[Channel setting]: https://cdn.rawgit.com/kurzgame/FastPixel/master/examples/setting%20channel.html
[Bucket-fill]: https://cdn.rawgit.com/kurzgame/FastPixel/master/examples/bucket%20tool.html
[documentation]: https://rawgit.com/kurzgame/FastPixel/master/docs/index.html
[wiki]: https://github.com/kurzgame/FastPixel/wiki
