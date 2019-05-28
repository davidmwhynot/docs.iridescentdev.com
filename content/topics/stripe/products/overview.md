# Products Overview

Beatae culpa architecto et voluptatem magnam repellendus soluta debitis voluptatem. Ex sint quam. Et sequi porro et voluptatibus eos dolorem quidem.

Et voluptatum temporibus qui neque unde quasi enim et. Corrupti illum est ut quis. Labore quod qui nam quaerat suscipit recusandae. Quo quis commodi id facilis eius corrupti voluptas. Labore exercitationem itaque consequatur molestiae earum magnam ducimus tenetur.

- list item 1
- list item 2
- list item 3

Soluta incidunt saepe nemo qui non iusto iure. Quia quam officiis aut porro quia quis ducimus et incidunt. Blanditiis velit et incidunt et voluptas. Odit soluta qui ex suscipit maxime praesentium similique nesciunt voluptas. Maiores maiores et modi eius ipsa earum velit rerum perferendis. Perspiciatis beatae in quia harum consequatur.

Culpa nihil nihil neque temporibus qui. Quaerat velit tempora consectetur voluptas. Sed sit consequuntur nisi. Ut consectetur est molestiae illo. Optio aut eaque libero provident fugiat.

```js
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
```

Voluptates quis in nisi qui velit omnis quia laudantium possimus. Blanditiis rerum dicta laboriosam reprehenderit error. Autem nam libero. Et omnis alias ut rerum reprehenderit ex et ea. Consequatur qui in autem consequuntur ut hic rerum quibusdam quae. Molestiae aut illum libero.

Error porro ullam cupiditate voluptatem aspernatur consequatur. Et aut dolore et nulla nesciunt. Esse cum iure. Earum veniam dolores molestias aut recusandae quia culpa.

![A city](https://lorempixel.com/640/480/city 'A city')

Eum corporis earum rem sed assumenda aut expedita eaque. Itaque veritatis quidem quo quia. Eius rerum est sint repellat laboriosam distinctio sunt est repellat. Ducimus voluptatem odio.

Tenetur rerum aut sunt. Sit ut sit a nisi ratione. Facere laboriosam eveniet et iure nulla consequatur in repellat omnis. Laborum quia explicabo officia molestias possimus totam maiores magni et. Tenetur qui eum non dolore non ratione veritatis. Dolorem nobis rerum aut totam ut non voluptatum laboriosam aut.

Exercitationem voluptates ut aut. Laboriosam et soluta. Iusto cum quo laudantium unde. Quas quasi sit sunt voluptas iure laborum aut aut ad. Sint iure beatae. Nihil consectetur officiis hic.
