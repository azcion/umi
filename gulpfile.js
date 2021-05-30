const { src, dest, watch } = require('gulp');

//#region css
const sass = require('gulp-sass');
sass.compiler = require('sass');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');

function css() {
	return src('./src/css/*.scss')
		.pipe(
			sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError)
		)
		.pipe(postcss([require('precss'), require('autoprefixer')]))
		.pipe(concat('style.min.css'))
		.pipe(dest('./dist/css/'));
}

exports.css = css;
//#endregion

//#region js
function js() {
	return src('./src/js/*.js')
		.pipe(concat('script.js'))
		.pipe(dest('./dist/js/'));
}

exports.js = js;
//#endregion

//#region html
const pug = require('gulp-pug-3');
const data = require('gulp-data');
const prettier = require('gulp-prettier');
function html() {
	return src('./src/pug/views/*.pug')
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
