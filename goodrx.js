// PRODUCTION IMPORTS
const rp = require('/opt/node_modules/request-promise');
const {Client} = require('/opt/node_modules/pg');

// DEV IMPORTS
// const rp = require('request-promise');
// const {
//     Client
// } = require('pg');
let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
let reg = process.env.REGION || "california";
const client = new Client({
    connectionString: db_host
});
client.connect();

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

function comparePrices(a, b) {
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    if (a.price > b.price) return 1;
    if (b.price >= a.price) return -1;
}


async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

async function getGoodRxPrices(url, options, drugId, query, values, client) {
    return await rp(options).then(async function (response) {
        let data = response;

        if (data !== undefined) {
            let results = data.results;
            // console.log(results);
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

            results.forEach(function (value) {
                if (value != null) {

                    if (value.pharmacy.name.toUpperCase().includes("CVS")) {

                        if (CVSPrice.price == null || CVSPrice.price > parseFloat(value["prices"][0].price)) {
                            CVSPrice.price = parseFloat(value["prices"][0].price);
                            CVSPrice.pharmacy = value.pharmacy.name;
                        }

                    } else if (value.pharmacy.name.toUpperCase().includes("WALMART")) {
                        if (WalmartPrice.price == null || WalmartPrice.price > parseFloat(value["prices"][0].price)) {
                            WalmartPrice.price = parseFloat(value["prices"][0].price);
                            WalmartPrice.pharmacy = value.pharmacy.name;
                        }

                    } else if (value.pharmacy.name.toUpperCase().includes("WALGREENS")) {
                        if (WalgreenPrice.price == null || WalgreenPrice.price > parseFloat(value["prices"][0].price)) {
                            WalgreenPrice.price = parseFloat(value["prices"][0].price);
                            WalgreenPrice.pharmacy = value.pharmacy.name;
                        }

                    } else if (isKroger(value.pharmacy.name.toUpperCase())) {
                        console.log("KROGER PHARMACY FOUND - " + value.pharmacy.name.toUpperCase());
                        if (KrogerPrice.price == null || KrogerPrice.price > parseFloat(value["prices"][0].price)) {
                            KrogerPrice.price = parseFloat(value["prices"][0].price);
                            KrogerPrice.pharmacy = value.pharmacy.name;
                        }

                    } else {
                        if (OtherPrice.price == null || OtherPrice.price > parseFloat(value["prices"][0].price)) {
                            OtherPrice.price = parseFloat(value["prices"][0].price);
                            OtherPrice.pharmacy = value.pharmacy.name;
                        }

                    }

                }
            });
            let pricesArr = [WalgreenPrice, WalmartPrice, CVSPrice, OtherPrice, KrogerPrice];
            // console.log(pricesArr);
            pricesArr.sort(comparePrices);

            pricesArr[0].rank = 0;
            pricesArr[1].rank = 1;
            pricesArr[2].rank = 2;
            pricesArr[3].rank = 3;
            pricesArr[4].rank = 4;
            for (const price of pricesArr) {
                const pricingData = {
                    //id : "",
                    average_price: 0.0,
                    createdat: DateFunction(),
                    difference: 0.0,
                    lowest_market_price: 0.0,
                    drug_details_id: drugId,
                    pharmacy: price.pharmacy,
                    price: price.price,
                    program_id: 6,
                    recommended_price: 0.0,
                    rank: price.rank,
                };

                // console.log("pricingData"+pricingData);

                console.log("DRUG_DETAILS_ID: " + pricingData.drug_details_id);

                query = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price,rank,unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *;';
                values = [
                    pricingData.average_price,
                    pricingData.createdat,
                    pricingData.difference,
                    pricingData.drug_details_id,
                    pricingData.lowest_market_price,
                    pricingData.pharmacy,
                    pricingData.price,
                    pricingData.program_id,
                    pricingData.recommended_price,
                    pricingData.rank,
                    null
                ];

                // console.log(values[0]);

                // PLACE PRICE RESULT INTO PUBLIC_PRICE TABLE
                await client.query(query, values)
                    .then((response) => {
                        // console.log("Success: " + drugId);
                        return response;
                    })
                    .catch((error) => console.log(error));
            }


            let query3 = 'UPDATE shuffle_drugs SET goodrx_flag = \'completed\' WHERE request_id = $1';
            values = [drugId];
            await client.query(query3, values)
                .then(() => {
                    console.log('Updated shuffle_drugs' + drugId);
                }).catch((error) => console.log(error));
        }
    }).catch(async function (error) {
        console.log(error);
        let query3 = 'UPDATE shuffle_drugs SET goodrx_flag = \'failed\' WHERE request_id = $1';
        values = [drugId];
        await client.query(query3, values)
            .then(() => {
                console.log('Updated shuffle_drugs' + drugId);
            }).catch((error) => console.log(error));
    })
}

async function handler(event, context) {
    let drugId = "";
    let url = "";
    let query2 = "";
    let values = "";

    // CONNECT TO POSTGRES DB
    const client = new Client({
        connectionString: db_host
    });
    client.connect();

    let drugList = [];

    let response = await client.query("SELECT request_id FROM shuffle_drugs where goodrx_flag = 'pending' and region = '" + reg + "';");
    for (let i = 0; i < response.rows.length; i++) {
        drugList.push(response.rows[i]["request_id"]);
    }
    let len = drugList.length;
    let priceCount = 0;

    for (let k = 0; k < len; k++) {
        let req = await client.query("SELECT * FROM drug_request where program_id = 6 and good_rx_id is not null and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and drug_id :: int = " + drugList[k]);

        if (req.rows.length >= 1) {
            drugId = req.rows[0]["drug_id"];
            let latitude = req.rows[0].latitude;
            let longitude = req.rows[0].longitude;
            let quantity = req.rows[0].quantity;
            let grxId = req.rows[0]["good_rx_id"];

            url = `https://goodrx.com/api/v4/drugs/${grxId}/prices?location=${longitude},${latitude}&location_type=LAT_LNG_GEO_IP&quantity=${quantity}`;

            const options = {
                url: url,
                method: 'GET',
                json: true,
                headers: {
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36",
                    "Content-Type":"application/json",
                    "Accept":"*/*",
                    "Connection":"keep-alive",
                    "Cookie":"csrf_token=fe98f437e90b4d798574680b10487142; _pxhd=3029431ae7e9e099afa91d3c46a652ec1f8e2594d437eac053f9d3461839d9e5:6e1a5f20-ff1c-11e9-a55a-5d27e4ca1dac; myrx_exp_ab_variant=experiment; grx_unique_id=1cabceffcf8041b3882405d2c0f78ba7; c=; kw=; gclid=; ppa_exp_ab_variant=experiment; variantCookie=2; _pxvid=6e1a5f20-ff1c-11e9-a55a-5d27e4ca1dac; _ga=GA1.2.582319787.1572883324; _gid=GA1.2.795690922.1572883324; rsci_vid=bdd4752a-4d8b-ff9a-ae56-bb95c9ee40b7; cto_lwid=e3ea55d1-7366-4c08-bb46-68b4220cea95; _fbp=fb.1.1572883323932.209847031; __gads=ID=147bd9857967132f:T=1572883324:S=ALNI_MblLtrALre5ioKcEwnH3SDYtl3TnQ; ki_r=; _dc_gtm_UA-24914838-1=1; _gat_UA-24914838-1=1; _pxff_tm=1; ki_t=1572883327213%3B1572883327213%3B1572890257995%3B1%3B19; goodrx-v2=d63898ad263b0de82d9f0d380360950628e342945EU2x5f7quHYLluTi6EB7qG7TaxB7XJX4Sw4XnfiyturibtwO+QAte+2pKwtkOJJOU43mBdIf0HYn8qm2YmXz66VB2fcHydjc70nJqVVB3DAAk5euZ+2u76/36w+tyKdpSRrjGEq8XAdwcv3xbn93NZxL/a0R1+k5+vS6kbTorRHglx1aSXxb57DWWY+JZ2NnJ/OF3Ji+mqjv3yvUKWGhTYBd9yZG4FkOtl+oezGIxGRo7ZJ470SEU71s3gdG1OA0xnfSqcd5P+M13g4i5sVtl0PR0HmZZMSIIMNXzsBemKfa811nts1x18lJF/6kiIHyPfUbvKzk0gQQ3qlH3IkkV+P5sVxYSlpO/YWPpvi3fn8+nRFul6SRpCdfdVpZ80QmU3vbfAsCr5mlBKcWFKerAc=",
                    "Upgrade-Insecure-Requests":1
                }
            };

            if ((priceCount + 1) % 30 === 0) {
                console.log("About to be blocked, waiting...");
                await sleep(60000);
                console.log("Waited 1min")
            }

            try {
                // MAKE GOODRX API REQUEST
                let res;
                res = await getGoodRxPrices(url, options, drugId, query2, values, client);

                priceCount = priceCount + 1;
            } catch (error) {
                console.log(error);
            }
            if (context && context.getRemainingTimeInMillis() < 30000) {
                process.exit(0);
            }
        }
    }
    console.log(priceCount);
    process.exit(0);
}

exports.myhandler = handler;
// module.exports = handler;