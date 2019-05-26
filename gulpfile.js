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
	highlight: (code, language) => {
		console.log('language');
		console.log(language);

		const highlightedCode = highlight.highlight(language, code);

		console.log('highlightedCode.language');
		console.log(highlightedCode.language);

		// console.log('highlightedCode.relevance');
		// console.log(highlightedCode.relevance);

		console.log('highlightedCode.value');
		console.log(highlightedCode.value);

		return highlightedCode.value;
	}
});

const isDirectory = source => lstatSync(source).isDirectory();

const getDirectories = source =>
	readdirSync(source)
		.map(name => join(source, name))
		.filter(isDirectory);

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

		const topicLink = new InjectString(topicTemplate, {
			stripTags: true,
			tag: 'link',
			delimiters: ['{{{', '}}}'],
			newlines: false
		});

		let generatedTopic = topicLink.replace(topicDirName + '/index.html');

		const topicTitle = new InjectString(generatedTopic, {
			stripTags: true,
			tag: 'title',
			delimiters: ['{{{', '}}}'],
			newlines: false
		});

		generatedTopic = topicTitle.replace(meta.title);

		const topicDescription = new InjectString(generatedTopic, {
			stripTags: true,
			tag: 'description',
			delimiters: ['{{{', '}}}'],
			newlines: false
		});

		generatedTopic = topicDescription.replace(meta.description);

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

			const articleLink = new InjectString(articleTemplate, {
				stripTags: true,
				tag: 'link',
				delimiters: ['{{{', '}}}'],
				newlines: false
			});

			let generatedArticle = articleLink.replace(
				articleDirName + '/' + meta.pages[0] + '.html'
			);

			const articleTitle = new InjectString(generatedArticle, {
				stripTags: true,
				tag: 'title',
				delimiters: ['{{{', '}}}'],
				newlines: false
			});

			generatedArticle = articleTitle.replace(meta.title);

			const articleDescription = new InjectString(generatedArticle, {
				stripTags: true,
				tag: 'description',
				delimiters: ['{{{', '}}}'],
				newlines: false
			});

			generatedArticle = articleDescription.replace(meta.description);

			articles.push({
				output: generatedArticle,
				meta: {
					...meta,
					articleDirName
				}
			});
		}

		let breadcrumb = readFileSync(
			'./src/templates/topic/breadcrumb.html',
			'utf8'
		);

		console.log(breadcrumb);

		let breadcrumbInjectTitle = new InjectString(breadcrumb, {
			stripTags: true,
			tag: 'title',
			delimiters: ['{{{', '}}}'],
			newlines: false
		});

		breadcrumb = breadcrumbInjectTitle.replace(topicMeta.title);

		let output = readFileSync('./src/templates/topic/header.html', 'utf8');

		let outputInjectBreadcrumb = new InjectString(output, {
			stripTags: true,
			tag: 'breadcrumb',
			delimiters: ['{{{', '}}}'],
			newlines: false
		});

		output = outputInjectBreadcrumb.replace(breadcrumb);

		let outputInjectTitle = new InjectString(output, {
			stripTags: true,
			tag: 'title',
			delimiters: ['{{{', '}}}'],
			newlines: false
		});

		output = outputInjectTitle.replace(topicMeta.title);

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

			const pageTemplate = readFileSync(
				'./src/templates/article/page.html',
				'utf8'
			);

			for (let page of meta.pages) {
				// parse markdwon to html

				let breadcrumb = readFileSync(
					'./src/templates/article/breadcrumb.html',
					'utf8'
				);

				let breadcrumbInjectTopicLink = new InjectString(breadcrumb, {
					stripTags: true,
					tag: 'topic-link',
					delimiters: ['{{{', '}}}'],
					newlines: false
				});
				breadcrumb = breadcrumbInjectTopicLink.replace('/' + topicDirName);

				let breadcrumbInjectTopicTitle = new InjectString(breadcrumb, {
					stripTags: true,
					tag: 'topic-title',
					delimiters: ['{{{', '}}}'],
					newlines: false
				});
				breadcrumb = breadcrumbInjectTopicTitle.replace(topicMeta.title);

				let breadcrumbInjectArticleTitle = new InjectString(breadcrumb, {
					stripTags: true,
					tag: 'article-title',
					delimiters: ['{{{', '}}}'],
					newlines: false
				});
				breadcrumb = breadcrumbInjectArticleTitle.replace(meta.title);

				console.log(breadcrumb);

				let output = readFileSync(
					'./src/templates/article/header.html',
					'utf8'
				);

				let outputInjectBreadcrumb = new InjectString(output, {
					stripTags: true,
					tag: 'breadcrumb',
					delimiters: ['{{{', '}}}'],
					newlines: false
				});
				output = outputInjectBreadcrumb.replace(breadcrumb);

				// parse title
				const pageTitle = titleCase(page.replace(/-/g, ' '));

				let pageTemplateInjectTitle = new InjectString(pageTemplate, {
					stripTags: true,
					tag: 'title',
					delimiters: ['{{{', '}}}'],
					newlines: false
				});
				let content = pageTemplateInjectTitle.replace(pageTitle);

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

				// inject markdown
				let pageTemplateInjectMarkdown = new InjectString(content, {
					stripTags: true,
					tag: 'markdown',
					delimiters: ['{{{', '}}}'],
					newlines: false
				});
				content = pageTemplateInjectMarkdown.replace(markdown);

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
						let navPageActive = '';

						// set nav item active
						if (page === navPage) navPageActive = 'active';

						// inject values
						let navItem = injector({
							source: navItemTemplate,
							input: navPageActive,
							tag: 'active'
						});
						navItem = injector({
							source: navItem,
							input: navPageLink,
							tag: 'link'
						});
						navItem = injector({
							source: navItem,
							input: navPageTitle,
							tag: 'title'
						});

						navItems += navItem;
					}

					// add nav items to nav
					outputNav = injector({
						source: navTemplate,
						input: navItems,
						tag: 'items'
					});
				}

				console.log('outputNav');
				console.log(outputNav);
				console.log('content');
				console.log(content);

				// inject nav
				let pageTemplateInjectNav = new InjectString(content, {
					stripTags: true,
					tag: 'nav',
					delimiters: ['{{{', '}}}'],
					newlines: false
				});
				content = pageTemplateInjectNav.replace(outputNav);

				// add page content to nav
				output += content;

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

// injects a number of key-value pairs into a template file using inject-string
// @param template - the template string
// @param fields - an object where the property names should match the tag inside the template string where the value of said properties should be stored
// @returns - a string with the injected fields
function injector(template, fields) {
	// get tags from object keys in fields object
	const tags = Object.keys(fields);

	for (const tag of tags) {
		template = inject(template, tag, fields[tag]);
	}

	return template;
}

function inject(template, tag, value) {
	const injectObject = new InjectString(template, {
		stripTags: true,
		tag: tag,
		delimiters: ['{{{', '}}}'],
		newlines: false
	});

	return injectObject.replace(value);
}

gulp.task('build', gulp.series('index', 'topics', 'articles'));
