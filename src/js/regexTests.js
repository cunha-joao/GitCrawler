const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

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

function isValidConfigData(data) {
    const requiredFields = {
        'DB_HOST': false,
        'DB_USER': false,
        'DB_PASSWORD': false,
        'DB_NAME': false
    };

    data.forEach(line => {
        if (line.includes('DB_HOST')) requiredFields['DB_HOST'] = true;
        if (line.includes('DB_USER')) requiredFields['DB_USER'] = true;
        if (line.includes('DB_PASSWORD')) requiredFields['DB_PASSWORD'] = true;
        if (line.includes('DB_NAME')) requiredFields['DB_NAME'] = true;
    });

    return Object.values(requiredFields).every(field => field);
}

function buildDbConnectionCommands(configArray) {
    let config = {};
    
    configArray.forEach(item => {
        let [key, value] = item.split('=');
        key = key.trim();
        value = value.replace(/"/g, '').trim();
        config[key] = value;
    });

    const mysqlConnection = `mysql -h ${config['DB_HOST']} -u ${config['DB_USER']} -p${config['DB_PASSWORD']} ${config['DB_NAME']}`;
    const postgreConnection = `PGPASSWORD=${config['DB_PASSWORD']} psql -h ${config['DB_HOST']} -U ${config['DB_USER']} -d ${config['DB_NAME']}`;

    return {
        mysql: mysqlConnection,
        postgresql: postgreConnection
    };
}


module.exports = {
    getData,
    getDbConfigData,
    analyseConfigData,
    isValidConfigData,
    buildDbConnectionCommands
};


// Example usage:
const test2 = [
    'DB_PASSWORD="No"',
    'DB_HOST="172.16.0.1"',
    'DB_USER="user"',
    'DB_NAME="aName"',
];

const test1 = [
    'DB_PASSWORD=No',
    'DB_HOST=172.16.0.1',
    'DB_USER=user',
    'DB_NAME=aName',
];

//Para testar o regex
/*
const test1 = [
    'DATABASE_URL="xx"',
    'DB_password="Yes"',
    'DB_HOST="1.1.1.1"',
    'DB_PORT="XD"',
    'DB_USER="user"',
    ];

const test2 = [
    'DB_PASSWORD="No"',
    'DB_HOST="172.16.0.1"',
    'DB_USER="user"',
    'DB_NAME="aName"',
    ];

const test3 = [
    'DATABASE_URL="xx"',
    'DB_PASSWORD=Yes',
    'DB_HOST=',
    'DB_PORT="XD"',
    "DB_USER='user'",
    'DB_NAME="aName"',
    ];

const test4 = [
    'DATABASE_URL="xx"',
    'DB_PASSWORD="No"',
    'SECRET_DB_HOST="1.1.1.1"',
    'DB_PORT="XD"',
    'DB_USER="user"',
    'DB_NAME="aName"',
    ];

*/

async function main() {
    try {
        buildDbConnectionCommands(test1);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();

