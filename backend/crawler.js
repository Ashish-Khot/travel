const axios = require('axios');
const cheerio = require('cheerio');

// Crawl Wikipedia for destination info (robust)
async function crawlDestinations(search) {
  if (!search) return [];
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(search)}`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const name = $('h1').first().text().trim();
    // Find first non-empty <p> after infobox
    let description = '';
    $('table.infobox').nextAll('p').each((i, el) => {
      const text = $(el).text().trim();
      if (text && !description) description = text;
    });
    if (!description) {
      // fallback: first non-empty <p> on page
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text && !description) description = text;
      });
    }
    let image = $('table.infobox img').first().attr('src');
    if (image && !image.startsWith('http')) image = 'https:' + image;
    if (!image) image = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';
    if (!name || !description) return [];
    return [{ name, description, image }];
  } catch (err) {
    console.error('Crawling failed:', err);
    return [];
  }
}

module.exports = { crawlDestinations };