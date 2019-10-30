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
const GrxIdSchema = new Schema({
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
const GrxIdModel = mongoose.model('GrxId', GrxIdSchema);

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
    let drugs = JSON.parse(fs.readFileSync('full_drug_list.json'));
    fs.truncateSync('grx_ids.json');
    console.log('id file cleared');
    // let ids = [];

    // let promiseChain = Promise.resolve();
    for (let drug of drugs) {
        const res = await fetchId(drug);
        let model = new GrxIdModel(res);
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
    }

    // console.log("NUM IDS: " + ids.length);
    // const writeText = JSON.stringify(ids);
    // fs.writeFile('grx_ids.json', writeText, function(err, result) {
    //     if (err) console.log(err);
    //     console.log("Write complete");
    // });
    // console.log(write);
}

async function fetchId(drug) {
    const res = generateUrl(drug);
    let response;
    let model = res.model;
    await fetch(res.url, {
        method: 'get',
        headers: {
            "Connection": "keep-alive",
            "host": "www.goodrx.com",
            "Referer": "https://www.goodrx.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"
        },
        retryOn: [403],
        retryDelay: 30000,
        retries: 2
    }).then((response) => response.text())
    .then((text) => extractId(text))
    .then((id) => {
        response = id;
        console.log("Waiting 7.5s...")
    })
    .catch((error) => console.log(error));

    return timeout(7500).then(() => {
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