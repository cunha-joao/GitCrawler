const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { HttpsProxyAgent } = require('https-proxy-agent');

// Configuração do proxy local
const proxyUrl = 'http://localhost:8000';
const agent = new HttpsProxyAgent(proxyUrl);

async function getFileUrls(searchUrl) {
    try {
        const { data: html } = await axios.get(searchUrl, { httpsAgent: agent });
        const $ = cheerio.load(html);

        const fileUrls = [];

        $('a[href*="/blob/"]').each((i, element) => {
            const href = $(element).attr('href');
            if (href && href.includes('/blob/') && href.endsWith('.env')) {
                const fileUrl = 'https://github.com' + href;
                fileUrls.push(fileUrl.replace('/blob/', '/raw/'));
            }
        });

        return fileUrls;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function analysePatterns(url) {
    try {
        const { data: fileContent } = await axios.get(url, { httpsAgent: agent });
        return fileContent;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function fetchData(query) {
    const searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=code`;

    try {
        const fileUrls = await getFileUrls(searchUrl);
        const allData = [];

        for (const fileUrl of fileUrls) {
            const fileContent = await analysePatterns(fileUrl);
            if (fileContent) {
                allData.push({ fileUrl, fileContent });
            }
            await delay(1000); // Delay of 1 second between requests
        }

        await saveToCsv(allData);

        console.log('Data saved to CSV file successfully.');
        return allData;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function saveToCsv(data) {
    const csvWriter = createCsvWriter({
        path: 'env_files_data.csv',
        header: [
            { id: 'fileUrl', title: 'File URL' },
            { id: 'fileContent', title: 'File Content' }
        ]
    });

    await csvWriter.writeRecords(data);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const query = '.env db_host db_password';
fetchData(query);
