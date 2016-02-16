var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cache = require("gulp-cache");

var FILE_LIST = [
	"./src/js/pxl/pxl.js",
	"./src/js/pxl/Point/Point.js",
	"./src/js/pxl/Observer/Observer.js",
	"./src/js/pxl/bresenham/bresenham.js",
	"./src/js/pxl/RGBA/RGBA.js",
	"./src/js/pxl/View/View.js",
	"./src/js/pxl/Layout/Layout.js",
	"./src/js/pxl/Layout/Layer/Layer.js",
	"./src/js/pxl/Layout/history/history.js",
	"./src/js/pxl/Layout/history/Session/Session.js"	
];

var APP_NAME = "pxl";

gulp.task("default", function(){
	return 	gulp.src(FILE_LIST)
			.pipe(concat(APP_NAME + ".js"))
			.pipe(gulp.dest("./"));
});

gulp.task("compress", function(){
	return  gulp.src(FILE_LIST)
			.pipe(concat(APP_NAME + ".min.js"))
			.pipe(uglify())
			.pipe(gulp.dest("./"));
});

gulp.task("watch", function(){
	gulp.watch("./src/js/pxl/**/*.js", ["default"]);
});

gulp.task("clear", function(done){
	return cache.clearAll(done);
});