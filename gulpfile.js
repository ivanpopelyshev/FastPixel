var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cache = require("gulp-cache");

var FILE_LIST = [
	"./public/js/pxl/pxl.js",
	"./public/js/pxl/Vector2/Vector2.js",
	"./public/js/pxl/Observer/Observer.js",
	"./public/js/pxl/GrovingPool/GrovingPool.js",
	"./public/js/pxl/Layout/Layout.js",
	"./public/js/pxl/Layout/Layer/Layer.js",
	"./public/js/pxl/Layout/Layer/Pixel/Pixel.js",
	"./public/js/pxl/Layout/View/View.js",
	"./public/js/pxl/Layout/history/history.js",
	"./public/js/pxl/Layout/controller/controller.js"
];

var APP_NAME = "pxl";

gulp.task("default", function(){
	return 	gulp.src(FILE_LIST)
			.pipe(concat(APP_NAME + ".js"))
			.pipe(gulp.dest("./"));
});

gulp.task("compress", function(){
  return gulp.src(FILE_LIST)
		.pipe(concat(APP_NAME + ".min.js"))
		.pipe(uglify())
		.pipe(gulp.dest("./"));
});

gulp.task("watch", function(){
	gulp.watch("./public/js/pxl/**/*.js", ["default"]);
});

gulp.task("clear", function(done){
	return cache.clearAll(done);
});