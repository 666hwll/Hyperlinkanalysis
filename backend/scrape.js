const axios = require('axios');
const cheerio = require('cheerio');
// const puppeteer = require('puppeteer');

const logger = require('./logger');

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
        logger.info("Scraped data: ",data);
        return data;
        })
        .catch(error => {
            if(error.code === 'ECONNABORTED') {
                console.error('Request timed out');
                logger.error(`Request timed out: ${error}`);
            } else {
                console.error('Error fetching data:', error.message || error);
                logger.error(`Error fetching data: ${error.message || error}`);
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

/* IF i ever wanted to scrape dynamically loaded content, npm install puppeteer
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    const content = await page.content();
    const $ = cheerio.load(content);
    const data = [];
    $('selector').each((index, element) => {
    const item = $(element).text();
    data.push(item);
    });
    console.log(data);
    await browser.close();
})();
*/

module.exports = { scrapeURLs, user_agent };

/* EXPLAINATION at https://medium.com/@datajournal/web-scraping-with-node-js-d1d4bb6e25b2

Handling Common Challenges
Web scraping often involves overcoming various challenges:

Anti-Scraping Mechanisms: Websites might have measures to prevent scraping. Using headless browsers like Puppeteer and rotating user agents/IP addresses can help.
Rate Limiting: Respect the website’s robots.txt file and avoid sending too many requests in a short period.
CAPTCHAs: Encountering CAPTCHAs can be tricky. CATPCHA solving services can help solve them programmatically.
Advanced Techniques
For more advanced scraping tasks, consider the following:

Rotating Proxies: Use a pool of proxies to avoid getting blocked. Libraries like proxy-chain can help manage proxies.
Data Storage: Store the scraped data in databases like MongoDB or PostgreSQL for further analysis.
Error Handling: Implement robust error handling to manage network issues and unexpected HTML structures.
Best Practices
Here are some best practices to keep in mind:

Respect Website Policies: Always check the website’s terms of service and robots.txt file.
Minimize Server Load: Avoid sending too many requests in a short time. Implement delays between requests if necessary.
Keep Your Code Modular: Break your code into smaller, reusable functions for better maintainability.
Conclusion
Web scraping with Node.js is a powerful way to gather data from the web. With libraries like axios, cheerio, and Puppeteer, you can build efficient and scalable scrapers. Remember to follow best practices, respect website policies, and handle dynamic content appropriately. Happy scraping!

*/