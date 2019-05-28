const titleCase = require('title-case');
const marked = require('marked');
const highlight = require('highlight.js');

const { mkdirSync, writeFileSync, readFileSync } = require('fs');

const { injector, getDirectories } = require('./utils');

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

const build = () => {
	const topicDirs = getDirectories('./content/topics');

	for (let topic of topicDirs) {
		topic = topic.replace(/\\/g, '/');

		const topicMeta = require('../../' + topic + '/meta.json');

		const topicDirName = topic.match(/\w+?$/g)[0];

		const articleDirs = getDirectories('./content/topics/' + topicDirName);

		for (let article of articleDirs) {
			article = article.replace(/\\/g, '/');

			const meta = require('../../' + article + '/meta.json');

			const articleDirName = article.match(/\w+?$/g)[0];

			for (let page of meta.pages) {
				// construct page navigation
				let outputNav = ' ';
				let outputBottomNav = ' ';
				// do we need a navigation? articles with one page do not need a navigation...
				if (meta.pages.length > 1) {
					// construct page side nav
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

					// construct page bottom nav
					const bottomNavTemplate = readFileSync(
						'./src/templates/article/nav-bottom.html',
						'utf8'
					);

					const bottomNavPreviousTemplate = readFileSync(
						'./src/templates/article/nav-bottom-previous.html',
						'utf8'
					);
					const bottomNavNextTemplate = readFileSync(
						'./src/templates/article/nav-bottom-next.html',
						'utf8'
					);

					let outputPrevious = ' ';
					let outputNext = ' ';

					// two special cases...
					// one for the first page of the article, and one for the last page of the article
					const currentPageIndex = meta.pages.indexOf(page);
					if (currentPageIndex === 0) {
						// first page
						const nextPageLink =
							'/' +
							topicDirName +
							'/' +
							articleDirName +
							'/' +
							meta.pages[1] +
							'.html';

						outputNext = injector(bottomNavNextTemplate, {
							link: nextPageLink
						});
					} else if (currentPageIndex === meta.pages.length - 1) {
						// last page
						const previousPageLink =
							'/' +
							topicDirName +
							'/' +
							articleDirName +
							'/' +
							meta.pages[currentPageIndex - 1] +
							'.html';

						outputPrevious = injector(bottomNavPreviousTemplate, {
							link: previousPageLink
						});
					} else {
						// middle page
						const previousPageLink =
							'/' +
							topicDirName +
							'/' +
							articleDirName +
							'/' +
							meta.pages[currentPageIndex - 1] +
							'.html';
						const nextPageLink =
							'/' +
							topicDirName +
							'/' +
							articleDirName +
							'/' +
							meta.pages[currentPageIndex + 1] +
							'.html';

						outputNext = injector(bottomNavNextTemplate, {
							link: nextPageLink
						});
						outputPrevious = injector(bottomNavPreviousTemplate, {
							link: previousPageLink
						});
					}

					outputBottomNav = injector(bottomNavTemplate, {
						previous: outputPrevious,
						next: outputNext
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
					bottomNav: outputBottomNav,
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
};

module.exports = build;
