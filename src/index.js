const index = require('./lib/index');
const topics = require('./lib/topics');
const articles = require('./lib/articles');

const build = () => {
	index();
	topics();
	articles();
};

module.exports = build;
