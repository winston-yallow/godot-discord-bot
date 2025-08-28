const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const config = require('../instance/config');

const baseUrl = 'https://docs.godotengine.org/en/';

async function fetchAndParse() {
	try {
		const docVersions = config.docVersions;
		const promises = Object.values(docVersions).map((version) => {
			const url = `${baseUrl}${version.urlFragment}/classes/`;
			return axios.get(url).then(response => ({ version, response }));
		});

		const responses = await Promise.all(promises);

		responses.forEach(({ version, response }) => {
			const $ = cheerio.load(response.data);

			const hyperlinkedItems = [];
			$('div[itemprop="articleBody"] a:not([href*="#"])').each((index, element) => {
				const text = $(element).text().trim();
				if (text) {
					hyperlinkedItems.push(text);
				}
			});

			const csvText = hyperlinkedItems.join('\n');
			fs.writeFileSync(`src/instance/global-class-list-${version.urlFragment}.csv`, csvText);

			console.log(`CSV file generated successfully for version ${version.urlFragment}!`);
		});
	} catch (error) {
		console.error('Error fetching or parsing page:', error);
	}
}
module.exports = { fetchAndParse };