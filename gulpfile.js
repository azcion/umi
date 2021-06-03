const { src, dest, watch } = require('gulp');

//#region css
const sass = require('gulp-sass');
sass.compiler = require('sass');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

function css() {
	return src('./src/css/*.scss')
		.pipe(sourcemaps.init())
		.pipe(
			sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError)
		)
		.pipe(postcss([require('precss'), require('autoprefixer')]))
		.pipe(concat('style.min.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(dest('./dist/css/'));
}

exports.css = css;
//#endregion

//#region js
const terser = require('gulp-terser');

function js() {
	return src('./src/js/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('script.min.js'))
		.pipe(terser())
		.pipe(sourcemaps.write('./'))
		.pipe(dest('./dist/js/'));
}

exports.js = js;
//#endregion

//#region html
const pug = require('gulp-pug-3');
const fs = require('fs');
const data = require('gulp-data');
const prettier = require('gulp-prettier');

function html() {
	return src('./src/pug/views/*.pug')
		.pipe(
			data(function () {
				return JSON.parse(fs.readFileSync('./src/pug/data/lang.json'));
			})
		)
		.pipe(pug())
		.pipe(
			prettier({
				printWidth: 120,
				proseWrap: 'never'
			})
		)
		.pipe(dest('./dist'));
}

exports.html = html;
//#endregion

exports.watch = function () {
	watch('./src/css/*.scss', css);
	watch('./src/pug/**/*.pug', html);
	watch('./src/js/*.js', js);
};
