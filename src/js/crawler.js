const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch and parse content from a URL using the proxy
async function analysePatterns(url) {
    try {
        const { data: html } = await axios.get(`http://localhost:3000/proxy?url=${encodeURIComponent(url)}`);
        const $ = cheerio.load(html);

        const fileData = [];

        const codeLines = $('div.react-file-line');

        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];

            const pl_v = $(line).find('.pl-v').text();
            const pl_k = $(line).find('.pl-k').text();
            const pl_s = $(line).find('.pl-s').text();

            const data = pl_v + pl_k + pl_s;
            console.log(data);
            fileData.push(data);
            console.log(data);
        }

        return fileData;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function fetchData(){
    try {
        const data = await analysePatterns('https://github.com/nightzjp/spider_dj/blob/2c3de79c97f02d0235598a0783c451a51d236722/.env#L6');
        console.log(data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fetchData();