const gulp = require('gulp');

const generator = require('./src');

const index = require('./src/lib/index');
const topics = require('./src/lib/topics');
const articles = require('./src/lib/articles');

gulp.task('index', done => {
	index();
	done();
});

gulp.task('topics', done => {
	topics();
	done();
});

gulp.task('articles', done => {
	articles();
	done();
});

gulp.task('build', done => {
	generator();
	done();
});

gulp.task('watch', () => {
	gulp.watch('./src/templates/index/**/*', gulp.series('index'));
	gulp.watch('./src/templates/topic/**/*', gulp.series('topics'));
	gulp.watch('./src/templates/article/**/*', gulp.series('articles'));

	gulp.watch('./content/topics/*/meta.json', gulp.series('index'));
	gulp.watch('./content/topics/*/*/meta.json', gulp.series('topics'));
	gulp.watch('./content/topics/**/*.md', gulp.series('articles'));
});

gulp.task('default', gulp.series('build', 'watch'));
