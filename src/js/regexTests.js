const axios = require('axios');
const cheerio = require('cheerio');

async function getData(url) {
    try {
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        const fileData = [];

        const codeLines = $('div.react-file-line');

        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];

            const pl_v = $(line).find('.pl-v').text();
            const pl_k = $(line).find('.pl-k').text();
            const pl_s = $(line).find('.pl-s').text();

            const data = pl_v + pl_k + pl_s;

            fileData.push(data);
            
        }

        return fileData;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

function getDbConfigData(fileData) {
    const patternRegex = /DB_(USER|HOST|PASSWORD|NAME)=(?:"([^"]+)"|'([^']+)'|([^'"\s]+))/;
    const validData = [];

    fileData.forEach(line => {
        let match = line.match(patternRegex);
        
        if (match !== null) {
            validData.push(line)
        }
    });

    //console.log("Valid DB configuration lines with public DB_HOST:", validData);
    return validData;
}

function isPrivateIP(ip) {
    var privateIPv4Regex = /^(?:10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/;
    var privateIPv6Regex = /^(?:fc|fd|fe80|::1)/;

    if (privateIPv4Regex.test(ip)) {
        return true;
    }

    if (privateIPv6Regex.test(ip)) {
        return true;
    }

    return false;
}

function analyseConfigData(validData) {
    const regexPattern = /DB_HOST=(?:"([^"]+)"|'([^']+)'|([^'"\s]+))/;
    let isPrivate = false;

    validData.forEach(line => {
        let match = line.match(regexPattern);

        if (match !== null) {
            const dbHostIP = match[1] || match[2] || match[3];
            isPrivate = isPrivateIP(dbHostIP);
        }
    });

    if(isPrivate) validData = [];

    return validData;
}

const test1 = [
    'DATABASE_URL="xx"',
    'DB_PASSWORD="Yes"',
    'DB_HOST="1.1.1.1"',
    'DB_PORT="XD"',
    'DB_USER="user"',
    'DB_NAME="aName"',
    ];

const test2 = [
    'DATABASE_URL="xx"',
    'DB_PASSWORD="No"',
    'DB_HOST="172.16.0.1"',
    'DB_PORT="XD"',
    'DB_USER="user"',
    'DB_NAME="aName"',
    ];

const test3 = [
    'DATABASE_URL="xx"',
    'DB_PASSWORD=Yes',
    'DB_HOST="2001:4860:4860::8888"',
    'DB_PORT="XD"',
    "DB_USER='user'",
    'DB_NAME="aName"',
    ];

const test4 = [
    'DATABASE_URL="xx"',
    'DB_PASSWORD="No"',
    'DB_HOST="fd12:3456:789a:1::1"',
    'DB_PORT="XD"',
    'DB_USER="user"',
    'DB_NAME="aName"',
    ];



function main() {
    try {
        let validData1 = [];
        data1 = getDbConfigData(test1);
        validData1 = analyseConfigData(data1);
        console.log("Valid Data1: " + validData1);

        let validData2 = [];
        data2 = getDbConfigData(test2);
        validData2 = analyseConfigData(data2);
        console.log("Valid Data2: " + validData2);

        let validData3 = [];
        data3 = getDbConfigData(test3);
        validData3 = analyseConfigData(data3);
        console.log("Valid Data3: " + validData3);

        let validData4 = [];
        data4 = getDbConfigData(test4);
        validData4 = analyseConfigData(data4);
        console.log("Valid Data4: " + validData4);

        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();

