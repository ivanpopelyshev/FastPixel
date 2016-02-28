if (pxl.isSupported()){
	var View = pxl.View;

	View.activeView = View.create({
		"layoutSize": {
			width: 128,
			height: 128
		},
		"element": document.querySelector("CANVAS")
	});

	var r = 255;
	var g = 0;
	var b = 255;
	var a = 255;

	var options = {
		"start": new pxl.Point(0, 0),
		"offset": new pxl.Point(32),
		"pixel": pxl.RGBA(r, g, b, a)
	};

	View.activeView.drawRect(options);

} else{
	alert("Not supported!");
}
