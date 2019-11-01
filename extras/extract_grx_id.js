const fetch = require('fetch-retry');
const fs = require('fs');
const generateUrl = require('./genUrl.js');
const mongoose = require('mongoose');
mongoose.connect('mongodb://54.81.21.172:27017/rxwave_testing',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;
const GoodRxIdSchema = new Schema({
    id: ObjectId,
    drugName: String,
    drugForm: String,
    dosageStrength: String,
    dosageStrengthNum: {type: Number, default: 0},
    dosageStrengthUnit: {type: String, default: ''},
    volumeNum: {type: Number, default: 0},
    volumeUnit: {type: String, default: ''},
    quantity: Number,
    gsn: String,
    ndc: String,
    goodRxId: String,
    url: String
});
const GoodRxIdModel = mongoose.model('GoodRxId', GoodRxIdSchema);

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
    let drugs = JSON.parse(fs.readFileSync('full_drug_list.json'));
    fs.truncateSync('grx_ids.json');
    console.log('id file cleared');
    let count = 1;
    let fails = [];
    // let ids = [];

    // let promiseChain = Promise.resolve();
    for (let drug of drugs) {
        const res = await fetchId(drug, count);
        console.log(count);
        count += 1;

        if (res.drugName !== undefined) {
            let model = new GoodRxIdModel(res);
            // console.log(model);
            model.save(function(err, res) {
                console.log(`Error: ${err}`);
                // console.log(res);
                if (err) {
                    return console.log(err);
                } else {
                    return console.log(`Saved '${model.drugName}' to DB`)
                }
            });
        } else {
            fails.push(res);
            console.log(`Did NOT save to DB.`);
        }
    }

    try {
        const writeText = JSON.stringify(fails);
        fs.writeFile('grx_ids.json', writeText, function(err, result) {
            if (err) console.log(err);
            console.log("Write complete");
            process.exit();
        });
    } catch (error) {
        console.log(error);
    }
}

async function fetchId(drug, count) {
    const res = generateUrl(drug);
    let response;
    let model = res.model;
    await fetch(res.url, {
        method: 'get',
        headers: {
            "Referer": "https://www.google.com/",
            "Upgrade-Insecure-Requests": "1",
            "Cookie": "goodrx-v2=ae0381ab4763e0de30e8c3e201a7ae3ffe2703d6L72rXzd91LTmni0JkBjS2Qbt+i1dSgah9qe5cgvkXO0GGuQxeCVp1LnXVH9HXJaJe8G9R4mR+GXYC8ribgTcJQzAKEL42FrUV6VuICrUc5OFk/Ucb/ganXk7GHg5qayGKCZSIuJXxdaEbs+Zpuy2eX5oCKFHboGZQu4A0/Bc8fKVZJLM9iFViUsshVT5U4jt79bCX99iGwelUEAosM9VuBLrpOTpDjH8c8VBjT5GWEwYt4PyUffoYghHvk99BDHFx6f8tMnjWLA0b1qreaFObGTOJYG5mOwk1dALPgTVZMfn62xx5Gdsh0aJQzNvt/XqquqvYhblgJ3GXa2BOf2HNAegLL59g0Da06HlChiphaQ6TH5L6zrfRn0iEyPFhhrEkIPqfSX6z7QNKdQmCk/pcV2uE4OmWO1SGFN/xYkyG9vv0zs31LJmTtCaAqJOWQZll+w=; grx_unique_id=610b6199cdd94d38bb8640586b13bc04; c=; kw=; gclid=; closedWalmartFluShot=true; _pxhd=e8aaf476a43332757480989ddc3aa5d6337c426317cd0466dba237cbca8abb07:f6c8c241-fbe7-11e9-b7d1-3f5eb470d34f; myrx_exp_ab_variant=experiment; csrf_token=e99e695676ae41c3ba5aa76f933a207c; ppa_exp_ab_variant=experiment",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        retryOn: function(attempt, error, response) {
            if (error !== null || response.status == 403) {
                console.log(`HTTP ${response.status}, retrying in 60s...`);
            }
        },
        retryDelay: 60000,
        retries: 1
    }).then((response) => response.text())
    .then((text) => extractId(text))
    .then((id) => {
        response = id;
        // console.log("Waiting 7.5s...")
    })
    .catch((error) => console.log(error));
    let t = 7500;
    if (count % 99 === 0) {
        t = 60000;
    }

    console.log(`Waiting ${t / 1000.0}s...`)
    return timeout(t).then(() => {
        model.goodRxId = response;
        // console.log(model);
        return model;
    });
}

function extractId(text) {
    const start_index = text.indexOf("drug_id=") + 8;
    const end_index = start_index + text.substring(start_index).indexOf("&");

    if (end_index - start_index < 15) {
        let id = text.substring(start_index, end_index);
        // console.log(id);
        return id;
    } else {
        return null;
    }
}

test();