const fs = require('fs');
const rp = require('request-promise');
const cheer = require('cheerio');

const link = 'https://justforex.com/pt/education/currencies';

let currencies = {};

const options = {
    uri: link,
    transform: function(body){
        return cheer.load(body);
    }
}

function symbols($){
    $('tbody tr').each(function (index, element){
        let cur = $(this).find('td').first().text(); 
        let symbol = $(this).find('td').eq(1).text();

        currencies[cur] = symbol;

        console.log(cur)
        console.log(symbol)

    })
    currencies = JSON.stringify(currencies)
    write();
}

function write(){
    fs.writeFileSync('symbols.json', currencies);
}


rp(options)
    .then($ => {
        symbols($);
    })