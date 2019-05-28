const titleCase = require('title-case');

const { mkdirSync, writeFileSync, readFileSync } = require('fs');

const { injector, getDirectories } = require('./utils');

const build = () => {
	const topicDirs = getDirectories('./content/topics');

	for (let topic of topicDirs) {
		const articles = [];

		topic = topic.replace(/\\/g, '/');

		const topicMeta = require('../../' + topic + '/meta.json');

		const topicDirName = topic.match(/\w+?$/g)[0];

		const articleDirs = getDirectories('./content/topics/' + topicDirName);

		for (let article of articleDirs) {
			article = article.replace(/\\/g, '/');

			const meta = require('../../' + article + '/meta.json');

			// extract article directory name
			const articleDirName = article.match(/\w+?$/g)[0];

			// generate list of pages
			let outputPagesList = ' ';

			// if therese is only one page, don't generate a list
			if (meta.pages.length > 1) {
				let pageItems = '';
				for (const page of meta.pages) {
					// build page link
					const pageLink =
						'/' + topicDirName + '/' + articleDirName + '/' + page + '.html';

					// format page title
					const pageTitle = titleCase(page.replace(/-/g, ' '));

					// check if this is the first page
					let pageFirst = ' ';
					if (meta.pages.indexOf(page) === 0) {
						pageFirst += 'first-page';
					}

					// generate page item
					const pageItemTemplate = readFileSync(
						'./src/templates/topic/pages-item.html',
						'utf8'
					);

					// inject values into template
					const pageItem = injector(pageItemTemplate, {
						link: pageLink,
						title: pageTitle,
						first: pageFirst
					});

					pageItems += pageItem;
				}
				// get pages list template
				const pagesListTemplate = readFileSync(
					'./src/templates/topic/pages.html',
					'utf8'
				);

				// inject items into list template
				outputPagesList = injector(pagesListTemplate, {
					items: pageItems
				});
			}

			// generate article
			const articleTemplate = readFileSync(
				'./src/templates/topic/article.html',
				'utf8'
			);

			const articleLink = articleDirName + '/' + meta.pages[0] + '.html';

			const generatedArticle = injector(articleTemplate, {
				link1: articleLink,
				link2: articleLink,
				title: meta.title,
				description: meta.description,
				pages: outputPagesList
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
};

module.exports = build;
