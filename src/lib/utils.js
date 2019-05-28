const InjectString = require('inject-string');

const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const inject = (template, tag, value) => {
	const injectObject = new InjectString(template, {
		stripTags: true,
		tag: tag,
		delimiters: ['{{{', '}}}'],
		newlines: false
	});

	return injectObject.replace(value);
};

const isDirectory = source => lstatSync(source).isDirectory();

module.exports = {
	// injects a number of key-value pairs into a template file using inject-string
	// @param template - the template string
	// @param fields - an object where the property names should match the tag inside the template string where the value of said properties should be stored
	// @returns - a string with the injected fields
	injector: (template, fields) => {
		// get tags from object keys in fields object
		const tags = Object.keys(fields);

		for (const tag of tags) {
			template = inject(template, tag, fields[tag]);
		}

		return template;
	},
	getDirectories: source =>
		readdirSync(source)
			.map(name => join(source, name))
			.filter(isDirectory)
};
