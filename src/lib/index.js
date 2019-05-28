const { mkdirSync, writeFileSync, readFileSync } = require('fs');

const { injector, getDirectories } = require('./utils');

const build = () => {
	const topics = [];

	const topicDirs = getDirectories('./content/topics');

	for (let topic of topicDirs) {
		topic = topic.replace(/\\/g, '/');

		const meta = require('../../' + topic + '/meta.json');

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
};

module.exports = build;
