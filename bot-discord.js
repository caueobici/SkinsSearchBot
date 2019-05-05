const cheer = require('cheerio');
const rp = require('request-promise');
const fs = require('fs');
const Discord = require('discord.js');

const token = JSON.parse(fs.readFileSync('auth.json'))["token"];
const client = new Discord.Client();
const skins = JSON.parse(fs.readFileSync('skins.json'));
const guns = { 'ak-47': ['ak47', 'ak-47', 'ak 47', 'ak'], 'm4a4': ['m4a4', 'm4'], 'm4a1-s': ['m4a1', 'm4', 'm4a1s', 'm4a1 s', 'm4a1-s'], 'desert eagle': ['deagle', 'desert eagle', 'desert-eagle'], 'usp-s': ['usp', 'usp-s', 'usp s'], 'p2000': ['p2000'], 'glock-18': ['glock', 'glock 18', 'glock18', 'glock-18'], 'cz75-auto': ['cz', 'cz75', 'cz75auto', 'cz-75', 'cz75-auto', 'cz 75', 'cz75 auto', 'cz 75 auto'], 'dual berettas': ['dual beretas', 'dual berettas', 'berettas duplas', 'beretas duplas'], 'r8 revolver': ['r8', 'revolver', 'r8 revolver', 'r8-revolver'], 'p250': ['p250'], 'tec-9': ['tec9', 'tec 9', 'tec', 'tec-9'], 'five-seven': ['five seven', 'five-seven', 'fiveseven', '57'], 'nova': ['nova'], 'xm1014': ['xm1014', 'xm'], 'mag-7': ['mag 7', 'mag7', 'mag-7'], 'sawed-off': ['sawed off', 'sawed-off'], 'negev': ['negev'], 'm249': ['m249'], 'galil ar': ['galil ar', 'galil', 'galil-ar'], 'famas': ['famas'], 'ssg 08': ['ssg', 'ssg 08', 'ssg-08', 'ssg08', 'scout'], 'sg 553': ['sg553', 'sg-553', 'sg 553', 'sg'], 'aug': ['aug'], 'awp': ['awp'], 'g3sg1': ['g3', 'g3sg1'], 'scar-20': ['scar', 'scar 20', 'scar-20'], 'pp-bizon': ['pp-bizon', 'pp bizon', 'bizon'], 'mp7': ['mp7'], 'mp5-sd': ['mp5', 'mp5sd', 'mp5 sd', 'mp5-sd'], 'ump-45': ['ump', 'ump45', 'ump 45', 'ump-45'], 'mp9': ['mp9'], 'mac-10': ['mac10', 'mac 10', 'mac-10'], 'p90': ['p90', 'p 90', 'p-90'], 'gloves': ['glove', 'gloves']};
const symbols = JSON.parse(fs.readFileSync('symbols.json'));

let skin;
let skinObj;
let relevance;
let rel;
let final;
let errors;
let status;
let skins_name_show;
let description;
let options;
let embed;
let color;
let st;
let souvenir;
let currency = JSON.parse(fs.readFileSync('server-currency.json'));
let euro;
let currencies = undefined;
let currency_value;

function getValue(currency1){
    currencies = JSON.parse(fs.readFileSync('currencies.json'));
    euro = 1/currencies['rates']['USD'];

    currency_value = currencies['rates'][currency1];
}

function getLink(url, channel, skinObj, currency1) {
    options = {
        uri: url,
        transform: function (body) {
            return cheer.load(body)
        }
    }

    rp(options)
        .then(function($){
            getPrices($, channel, skinObj, currency1);
        })
}

function getPrices($, channel, skinObj, currency1) {
    souvenir = "Unavaiable";
    st = "Unavaiable";
    let value;

    $('#prices div.btn-group-sm.btn-group-justified').each(async function (index1, element1) {
        if (index1 == 0) {
            null;
        }
        else {
            let name = "";
            if ($(this).find('.price-details-st').text() != '') {
                name += $(this).find('.price-details-st').text();
                name += ' ' + $(this).find('.pull-left').next('.pull-left').text();
            }
            else {
                name = $(this).find('.pull-left').text();
            }

            let price = $(this).find('.pull-right').text();
            
            let index = name.toLowerCase().search('souvenir');
            let index1 = name.toLowerCase().search('stattrak');

            let money_index = price.indexOf('$');

            if (money_index >= 0 & currency1 != 'USD'){
                let dollar = price.slice(money_index + 1, price.length);
                dollar = dollar.replace(',', '');
                dollar = parseFloat(dollar);

                if (!currencies){
                    getValue(currency1);
                }
                
                value = dollar * euro * currency_value;

                value = value.toFixed(2);

                price = symbols[currency1] + ' ' + value;
                
            }

            if (index >= 0){
                name = name.replace('Souvenir', 'Souvenir');
                souvenir = "Avaiable";
            }

            if (index1 >= 0){
                st = "Avaiable";
            }

            description += name + ': ' + price + '\n';
            
        }

    });

    currencies = undefined;
    currency_value = undefined;

    sendEmbed(channel, skinObj);
}

function size(object) {
    return Object.keys(object).length;
}

function name_right(words) {
    for (var i = 0; i < words.length; i++) {
        for (var j = 0; j < Object.keys(guns).length; j++) {
            for (var k = 0; k < Object.keys(guns)[j].length; k++) {
                if (words[i] == guns[Object.keys(guns)[j]][k]) {
                    words[i] = Object.keys(guns)[j];
                }
            }
        }
    }
}

function getSkin(skin_name, channel, currency1) {
    skin_name = skin_name.toLowerCase();
    skin_words = skin_name.split(' ');
    relevance = 0;
    final = [];

    name_right(skin_words);


    for (var i = 0; i < size(skins); i++) {
        rel = 0;
        errors = 0;

        for (var j = 0; j < skin_words.length; j++) {
            if (skins[Object.keys(skins)[i]].name.toLowerCase().search(skin_words[j]) >= 0) {
                rel += 1 / skin_words.length;
            }
            else {
                errors++;
            }
        }

        rel -= errors/skin_words.length/rel;

        if (rel > relevance & rel != 0) {
            relevance = rel;
            final = [];
            final.push(skins[Object.keys(skins)[i]]);
        }
        else if (rel == relevance & rel != 0) {
            final.push(skins[Object.keys(skins)[i]]);
        }

        if (i == size(skins) - 1) {
            sendMessage(channel, currency1);
        }

    }
}

function sendMessage(channel, currency1) {
    if (final.length > 1) {
        channel.send(final.length + 'found, want to see the name of all of them(.Y/.N)');
        channel.send('For more details, enter the entire name of the skin');
        status = 'waiting';
        return null;
    }
    else if (final.length == 0){
        channel.send("No skin found\nTry to search for it again");
        return null;
    }

    else{
        skinObj = final[0];
    }

    embed = new Discord.RichEmbed();
    description = '';

    description += 'Quality: ' + skinObj.quality.replace('\n', '') + '\n';

    if (skinObj.quality != 'Covert Knife\n\n' & skinObj.quality != "Extraordinary Gloves") {
        description += 'Weapon: ' + skinObj.weapon + '\n';
        if (skinObj.quality.search('Covert') >= 0) {
            color = 0xeb4b4b;
        }
        else if (skinObj.quality.search('Classified') >= 0) {
            color = 0xd32ce6;
        }
        else if (skinObj.quality.search('Restricted') >= 0) {
            color = 0x8847ff;
        }
        else if (skinObj.quality.search('Mil-Spec') >= 0) {
            color = 0x1155dd;
        }
        else if (skinObj.quality.search('Industrial') >= 0) {
            color = 0x87c7ff;
        }
        else if (skinObj.quality.search('Contraband') >= 0){
            color = 0xffdd28;
        }

        else {
            color = 0xafafaf;
        }

    }
    else if (skinObj.quality == 'Covert Knife\n\n'){
        description += 'Knife: ' + skinObj.weapon + '\n';
        color = 0xffdd28;
    }

    else{
        description += 'Gloves';
        color = 0xffdd28;
    }

    description += '\nPrices:\n\n';

    getLink(skinObj.skinurl, channel, skinObj, currency1);
    
}

function sendEmbed(channel, skinObj){
    description += '\nStatTrak ' + st;
    description += '\nSouvenir ' + souvenir;

    embed.setTitle(skinObj.name);
    embed.setDescription(description);
    embed.setColor(color);
    embed.setImage(skinObj.img);

    channel.send(embed);

}

client.on('ready', () => {
    console.log('I am ready');
    console.log(size(skins) + ' skins loaded');
    console.log('My bot is in ' + client.guilds.size +' servers')
    status = 'normal';
});

client.on('message', message => {
    if (!currency[message.guild.id]){
        currency[message.guild.id] = 'USD';
        
        fs.writeFileSync('server-currency.json', JSON.stringify(currency));
    }
    let currency1 = currency[message.guild.id];

    if (message.content.startsWith('.search ')) {
        skin = message.content.slice(8);
        skinObj = getSkin(skin, message.channel, currency1);
    }
    else if (message.content.replace(/\s/g, '') === '.search') {
        message.channel.send('Enter the name of skin you want to search');
    }
    else if (message.content.toLowerCase() === '.y' & status === 'waiting') {
        skins_name_show = '';
        for (var i in final) {
            skins_name_show += final[i].name + '\n';
        }
        message.channel.send(skins_name_show);
        status = 'normal';
    }
    else if (message.content.toLowerCase() === '.n' & status === 'waiting') {
        message.channel.send('Try to type .search [skin name] again to find the skin you are looking for');
        status = 'normal';
    }

    else if (message.content.toLowerCase() === '.help'){
        embedHelp = new Discord.RichEmbed()
            .setDescription(".search [skin name] --> Search a skin\n\n.currency --> shows the actual configured currency\n.currency list --> shows the avaiable currencies\n.currency [currency] (e.g: .currency GBP)\n\n.help --> shows this message")
            .setColor(0xffa500)
        message.channel.send(embedHelp);
    }

    else if (message.content.toLowerCase().startsWith('.currency')){
        if (message.content.replace(/\s/g, '').length == 9){
            message.channel.send('Currency selected: ' + currency1);
        }
        else if (message.content.search('list') >= 0){
            let curEmbed = new Discord.RichEmbed();
            let mes = '';
            for (var a = 0; a < Object.keys(symbols).length; a++){
                mes += Object.keys(symbols)[a] + '\n';
            }
            curEmbed.setColor(0x008000);
            curEmbed.setTitle('Currencies');
            curEmbed.setDescription(mes);
            message.channel.send(curEmbed);
        }
        else if (message.content.length == 13){
            let validate = false;
            let in_currency = message.content.toUpperCase().slice(10, 14);
            for (var a = 0; a < Object.keys(symbols).length; a++){
                if (in_currency == Object.keys(symbols)[a]){
                    validate = true;
                }
            }
            if (validate){
                currency[message.guild.id] = in_currency;
                message.channel.send('Currency changed to ' + in_currency);
                fs.writeFileSync('server-currency.json', JSON.stringify(currency));
            }
            else{
                message.channel.send(in_currency + ' currency not found');
            }
            
        }
    }

});


client.login(token);
