const axios = require('axios');
const cheerio = require('cheerio');

const user_agent ='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36';
const maxContentSize = 5 * 1024 * 1024; // 5 MB

function scrapeURL(url, user_agent, maxContentSize=5 * 1024 * 1024) {
    if(url != null) {
        return axios.get(url, {timeout: 15000, headers: {'User-Agent':user_agent,'Accept':
                'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'}, maxRedirects: 5, maxContentLength: maxContentSize,validateStatus: () => true})
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const data = [];
        $('body').each((index, element) => {
        const item = $(element).text();
        data.push(item);
        });
        return data;
        })
        .catch(error => {
            if(error.code === 'ECONNABORTED') {
                console.error('Request timed out');
            } else {
                console.error('Error fetching data:', error.message || error);
            }
            return null;
    });
        
    }
    return Promise.resolve(null);
}

function scrapeURLs(array, user_agent) {
    const promises = array.map(u => scrapeURL(u, user_agent));
    return Promise.all(promises);
}

module.exports = { scrapeURLs, user_agent };