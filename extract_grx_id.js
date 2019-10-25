const fetch = require('node-fetch');
const fs = require('fs');
const zipcodes = require('zipcodes');
const sleep = require('sleep-async')().Promise;
const headers = {
    "User-Agent": "PostmanRuntime/7.18.0",
    "Accept": "*/*",
    "Cache-Control": "no-cache",
    "Host": "www.goodrx.com",
    "Connection": "keep-alive"
}
const referrers = [
    "https://www.google.com",
    "https://www.bing.com",
    "https://www.stackoverflow.com",
    "https://www.goodrx.com"
];
const userAgents = [
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)"
];

function getId(drug) {
    const url = generateUrl(drug);
    // const userAgent = userAgents[getRandomArbitrary(0, userAgents.length - 1)];
    // const referrer = referrers[getRandomArbitrary(0, referrers.length - 1)];
    return new Promise(function(resolve, reject) {
        fetch(url, {
            method: 'get',
            headers: {
                "Accept": "*/*",
                "Cache-Control": "no-cache",
            }
        }).then((response) => response.text())
        .then((text) => resolve(extractId(text)))
        .catch((error) => reject(error));
    });
}


async function test() {
    let drugs = JSON.parse(fs.readFileSync('drugs.json'));
    let ids = [];

    // let promiseChain = Promise.resolve();
    for (let drug of drugs) {
        const url = generateUrl(drug);
        const userAgent = userAgents[getRandomArbitrary(0, userAgents.length - 1)];
        const referrer = referrers[getRandomArbitrary(0, referrers.length - 1)];

        let id = await fetch(url, {
            method: 'get',
	    headers: {
		"Connection": "keep-alive",
		"host": "www.goodrx.com",
		"Referer": "https://www.goodrx.com",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"
	    }
        }).then((response) => response.text())
        .then((text) => extractId(text))
        .catch((error) => console.log(error))
        console.log(id);

	setTimeout(() => {
	    ids.push(id)
	}, 5000);
        
        // promiseChain = promiseChain.then(waitForResponse(url));

        // fetches.push(setTimeout(()=>{}, 5000))
    }

    // await Promise.all(drugs.reduce(async (promise, drug) => {
    //     try {
    //         const id = await getDrugId(drug);
    //         console.log('sleep 5 ' + id)
    //         setTimeout(function() {
    //             console.log(id);
    //             ids.push(id);
    //         }, 5000);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }));
    // Promise.all(fetches).then(function() {
        console.log("NUM IDS: " + ids.length)
    // })

}

function generateUrl(drug) {
    const base = "https://www.goodrx.com/";
    let url = base + drug.drugName.toLowerCase().split(" ")[0];
    let label_override = "?label_override=" + drug.drugName.toLowerCase().split(" ")[0];
    let form = "&form=" + drug.drugForm.toLowerCase().replace(/\ +/g, "-");
    let dosage = "&dosage=" + drug.dosageStrength.toLowerCase().replace(/\ m+/g, "m").replace(/\ +/g, "-");
    let quantity = "&quantity=" + drug.quantity;

    return url + label_override + form + dosage + quantity;
}

function extractId(text) {
    const start_index = text.indexOf("drug_id=") + 8;
    const end_index = start_index + text.substring(start_index).indexOf("&");

    if (end_index - start_index < 15 ) {
        let id = text.substring(start_index, end_index);
        // console.log(id);
        return id;
    } else {
        return null;
    }
}

async function getDrugId (drug) {
    const url = generateUrl(drug);
    const userAgent = userAgents[getRandomArbitrary(0, userAgents.length - 1)];
    const referrer = referrers[getRandomArbitrary(0, referrers.length - 1)];
    // console.log("Referrer: " + referrer, "UserAgent: "+ userAgent);

    const response = await fetch(url, {
        method: 'get',
        headers: {
            "User-Agent": userAgent,
            "Accept": "*/*",
            "Cache-Control": "no-cache",
            "Referrer": referrer
        }
    });
    const text = await response.text();
    const id = extractId(text);
    // if (id === null) {
    //     // console.log("Referrer: " + referrer, "UserAgent: "+ userAgent);
    // }
    return id;
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

test();
