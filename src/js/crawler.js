//Antes de executar instalar axios e cheerio com npm install axios cheerio

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const query = "path:**/.env db_password= db_host="
const url = 'https://github.com/search?q=path%3A**%2F.env%20db_password%3D%20db_host%3D&type=code';

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

        const $ = cheerio.load(html);
        $('a').each((index, element) => {
            console.log($(element).attr('href'));
        });

    } catch (error) {
        console.error('Erro ao baixar a página:', error);
    }
}

//Filtra os urls com ficheiros .env
async function findFileUrl() {
    console.log("Sleeping..")
}

//Guarda o conteúdo dos ficheiros .env
async function getFileContent() {
    console.log("Sleeping...")
}

downloadPage();
findFileUrl();
getFileContent();
