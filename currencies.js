const fs = require('fs');
const rp = require('request-promise');
const cheer = require('cheerio');
const time = 1000 * 60 * 60; //1 Hour

const link = 'http://data.fixer.io/api/latest?access_key=0a6d7c738d5297e0840407d28f6c7b97&format=1';

const options = {
    uri: link,
    transform: function(body){
        return cheer.load(body);
    }
}

function update(){
    rp(options)
        .then($ => {
            var currencies = $('body').text();
            fs.writeFileSync('currencies.json', currencies);
        })

}

update();
setInterval(update, time);