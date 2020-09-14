const fs = require('fs');
const rp = require('request-promise');
const cheer = require('cheerio');
const time = 1000 * 60 * 60; //1 Hour

const access_key = "ACCESS_KEY"

const link = 'http://data.fixer.io/api/latest?access_key=' + access_key + '&format=1';

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