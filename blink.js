// PRODUCTION IMPORTS
// const rp = require('/opt/node_modules/request-promise');
// const {Client} = require('/opt/node_modules/pg');

// DEV IMPORTS
const rp = require('request-promise');
const {
    Client
} = require('pg');
let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
let reg = process.env.REGION || "virginia";
const client = new Client({
    connectionString: db_host
});
client.connect();

function comparePrices(a, b) {
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    if (a.price > b.price) return 1;
    if (b.price >= a.price) return -1;
}

/**
 * @return {string}
 */
function DateFunction() {
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;
}
let DrugId = "";
let listDrugs = [];
let pricingData1 = {
    average_price: 0,
    createdat: DateFunction(),
    difference: 0,
    drug_details_id: 0,
    lowest_market_price: 0,
    pharmacy: "",
    price: 0,
    program_id: 5,
    recommended_price: 0,
    unc_price_flag: false
};

let url1 = "";
let len = 0;

async function handler(event, context) {
    let res1 = await client.query("SELECT request_id FROM shuffle_drugs where blink_flag = 'pending' and region = '" + reg + "'");

    for (let i = 0; i < res1.rows.length; i++) {
        listDrugs.push(res1.rows[i]["request_id"]);
    }
    len = listDrugs.length;
    for (let k = 0; k < len; k++) {
        let drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 5 and quantity is not null and good_rx_id is not null and drug_id :: int =" + listDrugs[k]);
        if (drugUrlList.rows.length === 1) {
            drugUrlList.rows[0].drug_name = drugUrlList.rows[0].drug_name.replace(' ', '-');
            drugUrlList.rows[0].drug_name = drugUrlList.rows[0].drug_name.replace('/', '-');
            url1 = "https://www.blinkhealth.com/api/v2/user/drugs/detail/" + drugUrlList.rows[0].drug_name + "/dosage/" + drugUrlList.rows[0]["good_rx_id"] + "/quantity/" + drugUrlList.rows[0].quantity;

            let CVSPrice = {};
            CVSPrice.price = null;
            CVSPrice.pharmacy = null;
            CVSPrice.rank = 0;
            let WalmartPrice = {};
            WalmartPrice.price = null;
            WalmartPrice.pharmacy = null;
            WalmartPrice.rank = 0;
            let WalgreenPrice = {};
            WalgreenPrice.price = null;
            WalgreenPrice.pharmacy = null;
            WalgreenPrice.rank = 0;
            let KrogerPrice = {};
            KrogerPrice.price = null;
            KrogerPrice.pharmacy = null;
            KrogerPrice.rank = 0;
            let OtherPrice = {};
            OtherPrice.price = null;
            OtherPrice.pharmacy = null;
            OtherPrice.rank = 0;

            try {
                await rp(url1)
                    .then(async function (response) {
                        let jsondata = JSON.parse(response);
                        let edlpPrice = jsondata.result.price["edlp"]["raw_value"];

                        let url2 = "https://www.blinkhealth.com/api/v2/pharmacies/full?limit=20&search=" + drugUrlList.rows[0]["zipcode"] + "&allow_out_of_network=false&c_app=rx&c_platform=web&c_timestamp=1569270466508";
                        await rp(url2).then(async function (r) {
                            console.log(r);
                            console.log(url2);
                            r = JSON.parse(r);
                            r.result.results.forEach(function (value) {
                                console.log("value");
                                console.log(value);
                                if (value != null && value["in_network"] === true) {
                                    if (value.name.toUpperCase().includes("CVS")) {
                                        CVSPrice.price = edlpPrice;
                                        CVSPrice.pharmacy = value.name;
                                    } else if (value.name.toUpperCase().includes("WALMART")) {

                                        WalmartPrice.price = edlpPrice;
                                        WalmartPrice.pharmacy = value.name;


                                    } else if (value.name.toUpperCase().includes("WALGREENS")) {

                                        WalgreenPrice.price = edlpPrice;
                                        WalgreenPrice.pharmacy = value.name;


                                    } else if (value.name.toUpperCase().includes("KROGER")) {

                                        KrogerPrice.price = edlpPrice;
                                        KrogerPrice.pharmacy = value.name;


                                    } else {

                                        OtherPrice.price = edlpPrice;
                                        OtherPrice.pharmacy = value.name;


                                    }

                                }
                            });
                            let pricesArr = [WalgreenPrice, WalmartPrice, CVSPrice, OtherPrice, KrogerPrice];
                            console.log("pricesArr");
                            console.log(pricesArr);

                            pricesArr.sort(comparePrices);

                            pricesArr[0].rank = 0;
                            pricesArr[1].rank = 1;
                            pricesArr[2].rank = 2;
                            pricesArr[3].rank = 3;
                            pricesArr[4].rank = 4;

                            console.log(pricesArr);
                            for (const price of pricesArr) {
                                pricingData1.price = price.price;
                                pricingData1.pharmacy = price.pharmacy;
                                pricingData1.rank = price.rank;

                                const query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price,rank, unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
                                const values = [pricingData1.average_price, pricingData1.createdat, pricingData1.difference, drugUrlList.rows[0]["drug_id"], pricingData1.lowest_market_price, pricingData1.pharmacy, pricingData1.price, pricingData1.program_id, pricingData1.recommended_price, pricingData1.rank, null];
                                await client.query(query2, values)
                                    .catch(e => {
                                        console.log(e)
                                    })
                            }

                            DrugId = drugUrlList.rows[0]["drug_id"];
                            let query3 = 'UPDATE shuffle_drugs SET blink_flag = \'completed\' WHERE request_id = $1';
                            let values = [DrugId];
                            await client.query(query3, values)
                                .then(() => {
                                    console.log('Updated shuffle_drugs' + DrugId);
                                }).catch((error) => console.log(error));

                            if (context.getRemainingTimeInMillis() < 30000) {
                                process.exit(0);
                            }
                        });
                    })
                    .catch(function (err) {
                        console.log(err)
                    });
            } catch (error) {
                console.log(error.error);
                DrugId = drugUrlList.rows[0]["drug_id"];
                let query3 = 'UPDATE shuffle_drugs SET blink_flag = \'failed\' WHERE request_id = $1';
                let values = [DrugId];
                await client.query(query3, values)
                    .then(() => {
                        console.log('Updated shuffle_drugs' + DrugId);
                    }).catch((error) => console.log(error));

                if (context.getRemainingTimeInMillis() < 30000) {
                    process.exit(0);
                }
            }

        }
    }

    process.exit(0);
}

exports.myhandler = handler;
module.exports = handler;