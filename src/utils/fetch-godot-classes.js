const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://docs.godotengine.org/en/stable/classes/';

async function fetchAndParse() {
	try {
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);

		const hyperlinkedItems = [];
		$('div[itemprop="articleBody"] a:not([href*="#"])').each((index, element) => {
			const text = $(element).text().trim();
			if (text) {
				hyperlinkedItems.push(text);
			}
		});

		const csvText = hyperlinkedItems.join('\n');
		fs.writeFileSync('src/instance/global-class-list.csv', csvText);

		console.log('CSV file generated successfully!');
	} catch (error) {
		console.error('Error fetching or parsing page:', error);
	}
}

module.exports = { fetchAndParse };