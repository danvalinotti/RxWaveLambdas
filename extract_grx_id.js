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
            "Connection": "keep-alive",
            "host": "www.goodrx.com",
            "Referer": "https://www.goodrx.com",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36"
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