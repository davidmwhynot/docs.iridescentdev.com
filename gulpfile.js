const marked = require('marked');
const gulp = require('gulp');
const InjectString = require('inject-string');
const highlight = require('highlight.js');
const titleCase = require('title-case');

const {
	mkdirSync,
	writeFileSync,
	readFileSync,
	lstatSync,
	readdirSync
} = require('fs');

const { join } = require('path');

marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: true,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false,
	xhtml: false,
	highlight: (code, language) => highlight.highlight(language, code).value
});

const isDirectory = source => lstatSync(source).isDirectory();

const getDirectories = source =>
	readdirSync(source)
		.map(name => join(source, name))
		.filter(isDirectory);

// injects a number of key-value pairs into a template file using inject-string
// @param template - the template string
// @param fields - an object where the property names should match the tag inside the template string where the value of said properties should be stored
// @returns - a string with the injected fields
const injector = (template, fields) => {
	// get tags from object keys in fields object
	const tags = Object.keys(fields);

	for (const tag of tags) {
		template = inject(template, tag, fields[tag]);
	}

	return template;
};

const inject = (template, tag, value) => {
	const injectObject = new InjectString(template, {
		stripTags: true,
		tag: tag,
		delimiters: ['{{{', '}}}'],
		newlines: false
	});

	return injectObject.replace(value);
};

// TASK: index
gulp.task('index', done => {
	const topics = [];

	const topicDirs = getDirectories('./content/topics');

	for (let topic of topicDirs) {
		topic = topic.replace(/\\/g, '/');

		const meta = require('./' + topic + '/meta.json');

		const topicDirName = topic.match(/\w+?$/g)[0];

		const topicTemplate = readFileSync(
			'./src/templates/index/topic.html',
			'utf8'
		);

		const topicLink = topicDirName + '/index.html';

		const generatedTopic = injector(topicTemplate, {
			link: topicLink,
			title: meta.title,
			description: meta.description
		});

		topics.push({
			output: generatedTopic,
			meta: {
				...meta,
				topicDirName
			}
		});
	}

	let output = readFileSync('./src/templates/index/header.html', 'utf8');

	for (let topic of topics) {
		output += topic.output;
	}

	output += readFileSync('./src/templates/index/footer.html', 'utf8');

	console.log('output');
	console.log(output);

	mkdirSync('./dist', {
		recursive: true
	});

	writeFileSync('./dist/index.html', output);

	done();
});

// TASK: topics
gulp.task('topics', done => {
	const topicDirs = getDirectories('./content/topics');

	for (let topic of topicDirs) {
		const articles = [];

		topic = topic.replace(/\\/g, '/');

		const topicMeta = require('./' + topic + '/meta.json');

		const topicDirName = topic.match(/\w+?$/g)[0];

		const articleDirs = getDirectories('./content/topics/' + topicDirName);

		for (let article of articleDirs) {
			article = article.replace(/\\/g, '/');

			const meta = require('./' + article + '/meta.json');

			const articleDirName = article.match(/\w+?$/g)[0];

			const articleTemplate = readFileSync(
				'./src/templates/topic/article.html',
				'utf8'
			);

			const articleLink = articleDirName + '/' + meta.pages[0] + '.html';

			const generatedArticle = injector(articleTemplate, {
				link: articleLink,
				title: meta.title,
				description: meta.description
			});

			articles.push({
				output: generatedArticle,
				meta: {
					...meta,
					articleDirName
				}
			});
		}

		const breadcrumbTemplate = readFileSync(
			'./src/templates/topic/breadcrumb.html',
			'utf8'
		);

		const breadcrumb = injector(breadcrumbTemplate, {
			title: topicMeta.title
		});

		let headerTemplate = readFileSync(
			'./src/templates/topic/header.html',
			'utf8'
		);

		let output = injector(headerTemplate, {
			breadcrumb: breadcrumb,
			title: topicMeta.title
		});

		for (let article of articles) {
			output += article.output;
		}

		output += readFileSync('./src/templates/topic/footer.html', 'utf8');

		console.log('output');
		console.log(output);

		mkdirSync('./dist/' + topicDirName, {
			recursive: true
		});

		writeFileSync('./dist/' + topicDirName + '/index.html', output);
	}

	done();
});

// TASK: articles
gulp.task('articles', done => {
	const topicDirs = getDirectories('./content/topics');

	for (let topic of topicDirs) {
		topic = topic.replace(/\\/g, '/');

		const topicMeta = require('./' + topic + '/meta.json');

		const topicDirName = topic.match(/\w+?$/g)[0];

		const articleDirs = getDirectories('./content/topics/' + topicDirName);

		for (let article of articleDirs) {
			article = article.replace(/\\/g, '/');

			const meta = require('./' + article + '/meta.json');

			const articleDirName = article.match(/\w+?$/g)[0];

			for (let page of meta.pages) {
				// construct page navigation
				let outputNav = ' ';

				// do we need a navigation? articles with one page do not need a navigation...
				if (meta.pages.length > 1) {
					// get page nav template
					const navTemplate = readFileSync(
						'./src/templates/article/nav.html',
						'utf8'
					);

					// get nav item template
					const navItemTemplate = readFileSync(
						'./src/templates/article/nav-item.html',
						'utf8'
					);

					// initialize nav items
					let navItems = '';

					for (navPage of meta.pages) {
						// create nav item link
						const navPageLink =
							'/' +
							topicDirName +
							'/' +
							articleDirName +
							'/' +
							navPage +
							'.html';

						// create nav item title
						const navPageTitle = titleCase(navPage.replace(/-/g, ' '));

						// initialize nav item active
						let navPageCurrent = '';

						// set nav item active
						if (page === navPage) navPageCurrent = 'disabled';
						console.log('page:');
						console.log(page);
						console.log('navPage:');
						console.log(navPage);
						console.log('navPageCurrent:');
						console.log(navPageCurrent);

						let navItem = injector(navItemTemplate, {
							current: navPageCurrent,
							link: navPageLink,
							title: navPageTitle
						});

						navItems += navItem;
					}

					// add nav items to nav
					outputNav = injector(navTemplate, {
						items: navItems
					});
				}

				// get page markdown
				const pageMarkdown = readFileSync(
					'./content/topics/' +
						topicDirName +
						'/' +
						articleDirName +
						'/' +
						page +
						'.md',
					'utf8'
				);

				// parse page markdown
				const markdown = marked(pageMarkdown);

				// parse page title
				const pageTitle = titleCase(page.replace(/-/g, ' '));

				// generate page content from page template
				const pageTemplate = readFileSync(
					'./src/templates/article/page.html',
					'utf8'
				);

				// inject tags into content
				const content = injector(pageTemplate, {
					nav: outputNav,
					title: pageTitle,
					markdown: markdown
				});

				// generate breadcrumb
				const breadcrumbTemplate = readFileSync(
					'./src/templates/article/breadcrumb.html',
					'utf8'
				);

				const breadcrumbTopicLink = '/' + topicDirName;

				const breadcrumb = injector(breadcrumbTemplate, {
					topicLink: breadcrumbTopicLink,
					topicTitle: topicMeta.title,
					articleTitle: meta.title
				});

				// generate output starting with header template
				const headerTemplate = readFileSync(
					'./src/templates/article/header.html',
					'utf8'
				);

				let output = injector(headerTemplate, {
					breadcrumb: breadcrumb
				});

				// add page content to output
				output += content;

				// add footer to output
				output += readFileSync('./src/templates/article/footer.html', 'utf8');

				mkdirSync('./dist/' + topicDirName + '/' + articleDirName, {
					recursive: true
				});

				writeFileSync(
					'./dist/' +
						topicDirName +
						'/' +
						articleDirName +
						'/' +
						page +
						'.html',
					output
				);
			}
		}
	}

	done();
});

gulp.task('build', gulp.series('index', 'topics', 'articles'));
