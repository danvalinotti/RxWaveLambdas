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
    program_id: 1,
    recommended_price: 0,
    rank: 0,
};
let url = "";
let len = 0;

async function handler(event, context) {
    let res1 = await client.query("SELECT request_id FROM shuffle_drugs where usp_flag = 'pending' and region = '" + reg + "'");
    for (let i = 0; i < res1.rows.length; i++) {
        listDrugs.push(res1.rows[i]["request_id"]);
    }
    len = listDrugs.length;

    for (let k = 0; k < len; k++) {
        let drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 1 and zipcode is not null and ndc is not null and quantity is not null and brand_indicator is not null and drug_id :: int =" + listDrugs[k] + " order by drug_name");
        if (drugUrlList.rows !== 0) {
            url = "https://api.uspharmacycard.com/drug/price/147/none/" + drugUrlList.rows[0]["zipcode"] + "/" + drugUrlList.rows[0].ndc + "/" + encodeURIComponent(drugUrlList.rows[0].drug_name) + "/" + drugUrlList.rows[0]["brand_indicator"] + "/" + drugUrlList.rows[0].quantity + "/8";

            console.log(url);
            try {
                await rp(url)
                    .then(async function (response) {
                        let jsondata = JSON.parse(response);
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
                        for (const value of jsondata["priceList"]) {
                            if (value != null) {
                                let valPrice = value["discountPrice"];
                                if (value.pharmacy["pharmacyName"].toUpperCase().includes("CVS")) {

                                    if (CVSPrice.price == null || CVSPrice.price > valPrice) {
                                        CVSPrice.price = valPrice;
                                        CVSPrice.pharmacy = value.pharmacy["pharmacyName"];
                                    }

                                } else if (value.pharmacy["pharmacyName"].toUpperCase().includes("WALMART")) {
                                    if (WalmartPrice.price == null || WalmartPrice.price > valPrice) {
                                        WalmartPrice.price = valPrice;
                                        WalmartPrice.pharmacy = value.pharmacy["pharmacyName"];
                                    }

                                } else if (value.pharmacy["pharmacyName"].toUpperCase().includes("WALGREENS")) {
                                    if (WalgreenPrice.price == null || WalgreenPrice.price > valPrice) {
                                        WalgreenPrice.price = valPrice;
                                        WalgreenPrice.pharmacy = value.pharmacy["pharmacyName"];
                                    }

                                } else if (value.pharmacy["pharmacyName"].toUpperCase().includes("KROGER")) {
                                    if (KrogerPrice.price == null || KrogerPrice.price > valPrice) {
                                        KrogerPrice.price = valPrice;
                                        KrogerPrice.pharmacy = value.pharmacy["pharmacyName"];
                                    }

                                } else {
                                    if (OtherPrice.price == null || OtherPrice.price > valPrice) {
                                        OtherPrice.price = valPrice;
                                        OtherPrice.pharmacy = value.pharmacy["pharmacyName"];
                                    }

                                }

                            } else {
                                // This occurs when a drug is not found on USPharmacy - the shuffle_drugs entry is set to failed
                                DrugId = drugUrlList.rows[0]["drug_id"];
                                let query3 = 'UPDATE shuffle_drugs SET usp_flag = \'failed\' WHERE request_id = $1';
                                let values = [DrugId];
                                await client.query(query3, values)
                                    .then(() => {
                                        console.log('Updated shuffle_drugs' + DrugId);
                                    }).catch((error) => console.log(error));

                                if (context && context.getRemainingTimeInMillis() < 30000) {
                                    process.exit();
                                }
                            }
                        }
                        let pricesArr = [WalgreenPrice, WalmartPrice, CVSPrice, OtherPrice, KrogerPrice];
                        pricesArr.sort(comparePrices);

                        pricesArr[0].rank = 0;
                        pricesArr[1].rank = 1;
                        pricesArr[2].rank = 2;
                        pricesArr[3].rank = 3;
                        pricesArr[4].rank = 4;

                        for (const price of pricesArr) {
                            pricingData1.price = price.price;
                            pricingData1.pharmacy = price.pharmacy;
                            pricingData1.rank = price.rank;

                            const query2 = "INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price, rank, unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *";
                            const values = [pricingData1.average_price, pricingData1.createdat, pricingData1.difference, drugUrlList.rows[0]["drug_id"], pricingData1.lowest_market_price, pricingData1.pharmacy, pricingData1.price, pricingData1.program_id, pricingData1.recommended_price, pricingData1.rank, null];
                            await client.query(query2, values)
                                .catch(e => {
                                    console.log(e)
                                })
                        }

                        DrugId = drugUrlList.rows[0]["drug_id"];
                        let query3 = 'UPDATE shuffle_drugs SET usp_flag = \'completed\' WHERE request_id = $1';
                        let values = [DrugId];
                        await client.query(query3, values)
                            .then(() => {
                                console.log('Updated shuffle_drugs' + DrugId);
                            }).catch((error) => {
                                console.log(error)
                            });

                        if (context && context.getRemainingTimeInMillis() < 30000) {
                            process.exit();
                        }

                    })
                    .catch(function (err) {
                        console.log(err)
                    });
            } catch (error) {
                console.log(error);
                DrugId = drugUrlList.rows[0]["drug_id"];
                let query3 = 'UPDATE shuffle_drugs SET usp_flag = \'failed\' WHERE request_id = $1';
                let values = [DrugId];
                await client.query(query3, values)
                    .then(() => {
                        console.log('Updated shuffle_drugs' + DrugId);
                    }).catch((error) => console.log(error));

                if (context && context.getRemainingTimeInMillis() < 30000) {
                    process.exit();
                }
            }
        }
    }

    process.exit(0);
}

exports.myhandler = handler;
// module.exports = handler;