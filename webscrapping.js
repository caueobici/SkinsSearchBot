const cheer = require('cheerio');
const rp = require('request-promise');
const fs = require('fs');
const links = ['https://csgostash.com/weapon/CZ75-Auto', 'https://csgostash.com/weapon/Desert+Eagle', 'https://csgostash.com/weapon/Dual+Berettas', 'https://csgostash.com/weapon/Five-SeveN', 'https://csgostash.com/weapon/Glock-18', 'https://csgostash.com/weapon/P2000', 'https://csgostash.com/weapon/P250', 'https://csgostash.com/weapon/R8+Revolver', 'https://csgostash.com/weapon/Tec-9', 'https://csgostash.com/weapon/USP-S', 'https://csgostash.com/weapon/AK-47', 'https://csgostash.com/weapon/AUG', 'https://csgostash.com/weapon/AWP', 'https://csgostash.com/weapon/FAMAS', 'https://csgostash.com/weapon/G3SG1', 'https://csgostash.com/weapon/Galil+AR', 'https://csgostash.com/weapon/M4A1-S', 'https://csgostash.com/weapon/M4A4', 'https://csgostash.com/weapon/SCAR-20', 'https://csgostash.com/weapon/SG+553', 'https://csgostash.com/weapon/SSG+08', 'https://csgostash.com/weapon/MAC-10', 'https://csgostash.com/weapon/MP5-SD', 'https://csgostash.com/weapon/MP7', 'https://csgostash.com/weapon/MP9', 'https://csgostash.com/weapon/PP-Bizon', 'https://csgostash.com/weapon/P90', 'https://csgostash.com/weapon/UMP-45', 'https://csgostash.com/weapon/MAG-7', 'https://csgostash.com/weapon/Nova', 'https://csgostash.com/weapon/Sawed-Off', 'https://csgostash.com/weapon/XM1014', 'https://csgostash.com/weapon/M249', 'https://csgostash.com/weapon/Negev', 'https://csgostash.com/weapon/Navaja+Knife', 'https://csgostash.com/weapon/Bayonet', 'https://csgostash.com/weapon/Karambit', 'https://csgostash.com/weapon/Stiletto+Knife', 'https://csgostash.com/weapon/Talon+Knife', 'https://csgostash.com/weapon/Ursus+Knife', 'https://csgostash.com/weapon/Bowie+Knife', 'https://csgostash.com/weapon/Butterfly+Knife', 'https://csgostash.com/weapon/Falchion+Knife', 'https://csgostash.com/weapon/Flip+Knife', 'https://csgostash.com/weapon/Gut+Knife', 'https://csgostash.com/weapon/Huntsman+Knife', 'https://csgostash.com/weapon/M9+Bayonet', 'https://csgostash.com/weapon/Shadow+Daggers', 'https://csgostash.com/gloves'];
let options;
let skins_links = [];
let skins = [];
let case_name, case_name1;
let case_names = [];
let interval, interval2, interval3;
let errors = [];
let jsonFile = {};
let case_number = 0;

function getSkins() {
    url = links.shift();
    if (!url) {
        clearInterval(interval);
        interval2 = setInterval(final, 300);
        return null
    }

    case_name = "";
    let z = "";
    cont = 1;
    while (z != '/') {
        z = url[url.length - cont];
        if (z == '-' | z == '+') {
            z = ' ';
            case_name += z;
        }
        else if (z != '/') {
            case_name += z;
        }

        cont++;
    }
    case_name = case_name.split("").reverse().join("");

    case_names.push(case_name);

    getHTML(url, 1);
}

function getHTML(url, type) {
    options = {
        uri: url,
        transform: function (body) {
            return cheer.load(body)
        }
    };

    rp(options)
        .then(($) => {
            if (type == 1) {
                Scrap($)
            }
            else {
                skinScrap($, url)
            }

        })

        .catch((err) => {
            console.log(err)
            console.log(url)
            errors.push(url)
        });
}


function Scrap($) {
    skins_links.push([])

    if (skins_links.length - 1 != case_names.indexOf('gloves')) {
        $('.well.result-box').each(function (index, element) {
            let x = $(this).find('a').next().next().attr('href');
            if (x != undefined) {
                skins_links[skins_links.length - 1].push(x);
            }
        });
    }
    else {
        $('.well.result-box').each(function (index, element) {
            let x = $(this).find('a').attr('href');
            if (x != undefined) {
                skins_links[skins_links.length - 1].push(x);
            }
        });
        case_names[skins_links.length - 1] = 'Gloves';
    }
    console.log(case_name + ' completed')
}

function skinScrap($, skin_url) {
    let name;

    if (case_name1 == 'Gloves') {

        name = $('.well.result-box h2').text();
    }
    else {

        name = $('.well.result-box h2').find('a').next().prev().text() + " | " + $('.well.result-box h2').find('a').next().text();

    }

    let quality = $('.quality p').text();

    let img = $('.main-skin-img').attr('src');

    skin = { name: name, quality: quality, img: img, skinurl: skin_url, weapon: case_name1 };

    skins.push(skin);
}

function final() {
    case_name1 = case_names[case_number];
    url = skins_links[0].shift();
    if (url) {
        console.log('url ' + (skins_links[0].length) + ' ' + skins_links.length)
        getHTML(url, 2);
    }
    else if (skins_links.length > 1) {
        skins_links.shift();
        case_number++;

    }
    else {
        clearInterval(interval2);
        interval3 = setInterval(putJson, 100);
    }
}

function putJson() {
    skin = skins.shift();

    if (!skin) {
        clearInterval(interval3);
        return addJson()
    }

    jsonFile[skin.name] = skin;
    console.log(skin.name + ' added to jsonFile object')
}

function addJson() {
    let jsonFinal = JSON.stringify(jsonFile);
    fs.writeFileSync('skins.json', jsonFinal);

    console.log(errors);
}

<<<<<<< HEAD
interval = setInterval(getSkins, 3500);
=======
interval = setInterval(getSkins, 3000);
>>>>>>> b246d495d74345a7bc7edae99d90bc7da8121b22
