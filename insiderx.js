// PRODUCTION IMPORTS
const rp = require('/opt/node_modules/request-promise');
const {
    Client
} = require('/opt/node_modules/pg');

// DEV IMPORTS
// const rp = require('request-promise');
// const { Client } = require('pg');

let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
let reg = process.env.REGION || "virginia";
const client = new Client({
    connectionString: db_host
});

function comparePrices(a, b) {
    if (a.lowestPrice === null) return 1;
    if (b.lowestPrice === null) return -1;
    if (a.lowestPrice > b.lowestPrice) return 1;
    if (b.lowestPrice >= a.lowestPrice) return -1;
}

let kroger_names = [
    "KROGER AFFILIATES",
    "BAKER'S",
    "CITY MARKET",
    "COPPS FOOD CENTER",
    "DILLONS",
    "FOOD4LESS",
    "FRED MEYER",
    "FRY'S",
    "GENE MADDY",
    "GERBES PHARMACY",
    "HARRIS TEETER",
    "JAY C",
    "KING SOOPERS",
    "KROGER",
    "MARIANO'S",
    "METRO MARKET",
    "OWEN'S",
    "PAYLESS",
    "PICK 'N SAVE",
    "QFC",
    "RALPHS",
    "SCOTT'S",
    "SMITH'S",
];

function isKroger(pharmacy) {
    for (let name of kroger_names) {
        if (pharmacy.includes(name) || name.includes(pharmacy)) {
            return true;
        }
    }

    return false;
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
client.connect();
let listDrugs = [];
let pricingData1 = {
    //id : "",
    average_price: 0,
    createdat: DateFunction(),
    difference: 0,
    drug_details_id: 0,
    lowest_market_price: 0,
    pharmacy: "testname",
    price: 0,
    program_id: 0,
    recommended_price: 0,
    rank: 0,
    uncPrice: null
};

let len = 0;
let wrxbody = {};
let query2 = "";
let values = "";

async function handler(event, context) {
    // Retrieve applicable drugs from 'shuffle_drugs' table
    let res1 = await client.query("SELECT request_id FROM shuffle_drugs where insiderx_flag = 'pending' and region = '" + reg + "'");
    for (let i = 0; i < res1.rows.length; i++) {
        // Record all request ids for region
        listDrugs.push(res1.rows[i]["request_id"]);
    }

    let a = 0;
    len = listDrugs.length;
    for (let k = 0; k < len; k++) {
        let drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 0 and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and drug_id :: int = " + listDrugs[k]);

        if (drugUrlList.rows.length > 0) {
            DrugId = parseInt(drugUrlList.rows[0]["drug_id"]);
            let dquantity = drugUrlList.rows[0].quantity;
            let dndc = drugUrlList.rows[0].ndc;
            let lat = drugUrlList.rows[0].latitude;
            let lng = drugUrlList.rows[0].longitude;

            wrxbody = {
                "ndc": dndc,
                "latitude": lat,
                "longitude": lng,
                "quantity": dquantity,
                "referrer": "null",
                "site_identity": "irx"
            };

            let options = {
                method: "post",
                body: wrxbody,
                json: true,
                url: "https://insiderx.com/request/pharmacies",
                headers: {
                    "Cookie": "_gcl_au=1.1.923916117.1571676777; _fbp=fb.1.1571676776869.2055137922; _ga=GA1.2.930772864.1571676778; _gid=GA1.2.1882699394.1571676778; _gat_UA-113293481-1=1; _hjid=d6e7565b-1525-4271-8198-042e450e45ac; _hjIncludedInSample=1; geocoords=40.7350747%2C-74.17390569999998; AWSALB=mSNItEQ6fXmxXUsxt5mlUriIXhzEHmbChrsjCmQCdVdp42tXWv07gpOMfIQjeOlkAmbeYVCzgbur0wS6jc3a92h9ZKJJb9cNCF7qpmn5FKV9PH3VfDW/CsYPWDt2",
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "application/json",
                    "csrf-token": "Hi6yGXfg-vppErZsd2KXvKmH9LxjPBNJeK48",
                }
            };

            try {

                await rp(options).then(async function (response) {
                    let jsondata1 = response;
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

                    const otherPrices = [];

                    for (const value of jsondata1["prices"]) {
                        let pharmIndex = '';

                        // Some price entries will use pharmacyChain instead of pharmacy
                        if (value.pharmacy) {
                            pharmIndex = "pharmacy";
                        } else {
                            pharmIndex = "pharmacyChain";
                        }

                        // CVS Prices
                        if (value[pharmIndex].name.toUpperCase().includes("CVS")) {

                            if (CVSPrice.price == null || CVSPrice.lowestPrice > parseFloat(value.price)) {
                                CVSPrice.price = parseFloat(value.price);
                                CVSPrice.pharmacy = value[pharmIndex].name;
                                CVSPrice.uncPrice = null;
                                CVSPrice.lowestPrice = parseFloat(value.price);
                                if (value.uncPrice !== undefined && value.uncPrice !== null) {
                                    CVSPrice.uncPrice = parseFloat(value.uncPrice)
                                }
                            }
                            if (value.uncPrice !== undefined && value.uncPrice !== null && CVSPrice.lowestPrice > parseFloat(value.uncPrice)) {
                                CVSPrice.price = parseFloat(value.price);
                                CVSPrice.pharmacy = value[pharmIndex].name;
                                CVSPrice.uncPrice = parseFloat(value.uncPrice);
                                CVSPrice.lowestPrice = parseFloat(value.uncPrice);
                            }

                            // Walmart Prices
                        } else if (value[pharmIndex].name.toUpperCase().includes("WAL-MART")) {
                            if (WalmartPrice.price == null || WalmartPrice.lowestPrice > parseFloat(value.price)) {
                                WalmartPrice.price = parseFloat(value.price);
                                WalmartPrice.pharmacy = value[pharmIndex].name;
                                WalmartPrice.uncPrice = null;
                                WalmartPrice.lowestPrice = parseFloat(value.price);
                                if (value.uncPrice !== undefined && value.uncPrice !== null) {
                                    WalmartPrice.uncPrice = parseFloat(value.uncPrice)
                                }
                            }
                            if (value.uncPrice !== undefined && value.uncPrice !== null && WalmartPrice.lowestPrice > parseFloat(value.uncPrice)) {
                                WalmartPrice.price = parseFloat(value.price);
                                WalmartPrice.pharmacy = value[pharmIndex].name;
                                WalmartPrice.uncPrice = parseFloat(value.uncPrice);
                                WalmartPrice.lowestPrice = parseFloat(value.uncPrice);
                            }

                            // Walgreens Prices
                        } else if (value[pharmIndex].name.toUpperCase().includes("WALGREENS")) {
                            if (WalgreenPrice.lowestPrice == null || WalgreenPrice.lowestPrice > parseFloat(value.price)) {
                                WalgreenPrice.price = parseFloat(value.price);
                                WalgreenPrice.pharmacy = value[pharmIndex].name;
                                WalgreenPrice.uncPrice = null;
                                WalgreenPrice.lowestPrice = parseFloat(value.price);
                                if (value.uncPrice !== undefined && value.uncPrice !== null) {
                                    WalgreenPrice.uncPrice = parseFloat(value.uncPrice)
                                }


                            }
                            if (value.uncPrice !== undefined && value.uncPrice !== null && WalgreenPrice.price > parseFloat(value.uncPrice)) {
                                WalgreenPrice.price = parseFloat(value.price);
                                WalgreenPrice.pharmacy = value[pharmIndex].name;
                                WalgreenPrice.uncPrice = parseFloat(value.uncPrice);
                                WalgreenPrice.lowestPrice = parseFloat(value.uncPrice);

                            }
                            // Other Prices
                        } else if (isKroger(value[pharmIndex].name.toUpperCase())) {
                            console.log("KROGER PRICE FOUND: " + value[pharmIndex].name.toUpperCase());
                            if (KrogerPrice.price == null || KrogerPrice.price > parseFloat(value.price)) {
                                KrogerPrice.price = parseFloat(value.price);
                                KrogerPrice.pharmacy = value[pharmIndex].name;
                                KrogerPrice.uncPrice = null;
                                KrogerPrice.lowestPrice = parseFloat(value.price);
                                if (value.uncPrice !== undefined && value.uncPrice !== null) {
                                    KrogerPrice.uncPrice = parseFloat(value.uncPrice)
                                }
                            }
                            if (value.uncPrice !== undefined && value.uncPrice !== null && KrogerPrice.price > parseFloat(value.uncPrice)) {
                                KrogerPrice.price = parseFloat(value.price);
                                KrogerPrice.pharmacy = value[pharmIndex].name;
                                KrogerPrice.uncPrice = parseFloat(value.uncPrice);
                                KrogerPrice.lowestPrice = parseFloat(value.uncPrice);
                            }
                        } else {
                            otherPrices.push({
                                price: parseFloat(value.price),
                                pharmacy: value[pharmIndex].name,
                                uncPrice: value.uncPrice ? value.uncPrice : null,
                                lowestPrice: parseFloat(value.price)
                            });
                        }
                    }

                    let pricesArr = [WalgreenPrice, WalmartPrice, CVSPrice, KrogerPrice, OtherPrice];
                    // console.log(pricesArr);
                    // console.log("///////////////////////////////////////");
                    otherPrices.sort(comparePrices);

                    let other_i = 0;
                    // console.log(otherPrices.length);
                    while (pricesArr.find((e) => e.price === undefined || e.price === null) !== undefined && other_i < otherPrices.length) {
                        let i = pricesArr.findIndex((e) => e.price === undefined || e.price === null);
                        console.log("REPLACED EMPTY VALUE WITH " + otherPrices[other_i].pharmacy);
                        pricesArr[i] = otherPrices[other_i];

                        other_i += 1;
                    }
                    // pricesArr.sort(comparePrices);

                    pricesArr[0].rank = 0;
                    pricesArr[1].rank = 1;
                    pricesArr[2].rank = 2;
                    pricesArr[3].rank = 3;
                    pricesArr[4].rank = 4;

                    // console.log(pricesArr);
                    for (const price of pricesArr) {
                        pricingData1.price = price.price;
                        pricingData1.pharmacy = price.pharmacy;
                        pricingData1.rank = price.rank;
                        pricingData1.uncPrice = price.uncPrice;


                        query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price, rank,unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
                        values = [pricingData1.average_price, DateFunction(), pricingData1.difference, DrugId, pricingData1.lowest_market_price, pricingData1.pharmacy, pricingData1.price, pricingData1.program_id, pricingData1.recommended_price, pricingData1.rank, pricingData1.uncPrice];
                        await client.query(query2, values)
                            .catch(e => {
                                console.log(e)
                            })

                    }

                    let query3 = 'UPDATE shuffle_drugs SET insiderx_flag = \'completed\' WHERE request_id = $1';
                    values = [DrugId];
                    await client.query(query3, values)
                        .then(() => {
                            console.log('Updated shuffle_drugs' + DrugId);
                        }).catch((error) => console.log(error));

                    if (context && context.getRemainingTimeInMillis() < 30000) {
                        process.exit();
                    }

                }).catch(function (err) {
                    console.log(err);
                });
            } catch (e) {
                let query3 = 'UPDATE shuffle_drugs SET insiderx_flag = \'failed\' WHERE request_id = $1';
                values = [DrugId];
                await client.query(query3, values)
                    .then(() => {
                        console.log('Updated FAILED shuffle_drugs' + DrugId);
                    }).catch((error) => console.log(error));

                if (context && context.getRemainingTimeInMillis() < 30000) {
                    process.exit();
                }
            }

        } else {
            console.log("fault drugs" + k + "drug-id" + DrugId)
        }
    }
    console.log("good drugs:" + a + "drugid:" + DrugId);
    process.exit(0);
}

exports.myhandler = handler;
// module.exports = handler;