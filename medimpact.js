// PRODUCTION IMPORTS
const rp = require('/opt/node_modules/request-promise');
const {Client} = require('/opt/node_modules/pg');

// DEV IMPORTS
// const rp = require('request-promise');
// const { Client } = require('pg');

let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
let reg = process.env.REGION || "virginia";
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

let listDrugs = [];
let pricingData1 = {
    //id : "",
    average_price: 0,
    createdat: DateFunction(),
    difference: 0,
    drug_details_id: 0,
    lowest_market_price: 0,
    pharmacy: "",
    price: 0,
    program_id: 3,
    recommended_price: 0,
    rank: 0
};
let url = "";
let len = 0;
let DrugId = "";

async function handler(event, context) {
    // Get drug requests from shuffle_drugs
    let res1 = await client.query("SELECT request_id FROM shuffle_drugs where medimpact_flag = 'pending' and region = '" + reg + "'");
    for (let i = 0; i < res1.rows.length; i++) {
        listDrugs.push(res1.rows[i]["request_id"]);
    }
    len = listDrugs.length;
    for (let k = 0; k < len; k++) {
        // Select drug requests from drug_request table
        let drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 3 and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and brand_indicator is not null and drug_id :: int =" + listDrugs[k]);

        if (drugUrlList.rows !== 0) {
            url = "https://rxsavings.medimpact.com/web/rxcard/home?p_p_id=com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view" +
                "&p_p_cacheability=cacheLevelPage&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_cmd=get_drug_detail" +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_quantity=" + drugUrlList.rows[0].quantity +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_drugName=" + drugUrlList.rows[0].drug_name.toUpperCase() +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_brandGenericFlag=" + drugUrlList.rows[0]["brand_indicator"] +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_lat=" + drugUrlList.rows[0].latitude +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_lng=" + drugUrlList.rows[0].longitude +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_numdrugs=1";

            try {
                await rp(url)
                    .then(async function (response) {
                        let otherPrices = [];
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

                        jsondata["drugs"]["locatedDrug"].forEach(function (value) {
                            if (value != null) {

                                if (value.pharmacy.name.toUpperCase().includes("CVS")) {

                                    if (CVSPrice.price == null || CVSPrice.price > parseFloat(value["pricing"].price)) {
                                        CVSPrice.price = parseFloat(value["pricing"].price);
                                        CVSPrice.pharmacy = value.pharmacy.name;
                                    }

                                } else if (value.pharmacy.name.toUpperCase().includes("WALMART")) {
                                    if (WalmartPrice.price == null || WalmartPrice.price > parseFloat(value["pricing"].price)) {
                                        WalmartPrice.price = parseFloat(value["pricing"].price);
                                        WalmartPrice.pharmacy = value.pharmacy.name;
                                    }

                                } else if (value.pharmacy.name.toUpperCase().includes("WALGREENS")) {
                                    if (WalgreenPrice.price == null || WalgreenPrice.price > parseFloat(value["pricing"].price)) {
                                        WalgreenPrice.price = parseFloat(value["pricing"].price);
                                        WalgreenPrice.pharmacy = value.pharmacy.name;
                                    }

                                } else if (isKroger(value.pharmacy.name.toUpperCase())) {
                                    if (KrogerPrice.price == null || KrogerPrice.price > parseFloat(value["pricing"].price)) {
                                        KrogerPrice.price = parseFloat(value["pricing"].price);
                                        KrogerPrice.pharmacy = value.pharmacy.name;
                                    }

                                } else {
                                    if (OtherPrice.price == null || OtherPrice.price > parseFloat(value["pricing"].price)) {
                                        otherPrices.push({
                                            price: parseFloat(value["pricing"].price),
                                            pharmacy: value.pharmacy.name
                                        });
                                    }
                                }
                            }
                        });
                        let pricesArr = [WalgreenPrice, WalmartPrice, CVSPrice, OtherPrice, KrogerPrice];
                        // console.log(pricesArr);

                        otherPrices.sort(comparePrices);
                        let other_i = 0;
                        while (pricesArr.find((e) => e.price === undefined || e.price === null) !== undefined && other_i < otherPrices.length) {
                            let i = pricesArr.findIndex((e) => e.price === undefined || e.price === null);
                            console.log("REPLACED EMPTY VALUE WITH " + otherPrices[other_i].pharmacy);
                            pricesArr[i] = otherPrices[other_i];
                            other_i += 1;
                        }

                        pricesArr[0].rank = 0;
                        pricesArr[1].rank = 1;
                        pricesArr[2].rank = 2;
                        pricesArr[3].rank = 3;
                        pricesArr[4].rank = 4;

                        for (const price of pricesArr) {
                            pricingData1.price = price.price;
                            pricingData1.pharmacy = price.pharmacy;
                            pricingData1.rank = price.rank;
                            //console.log("price="+pricingData1.price);
                            const query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price,rank,unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
                            const values = [pricingData1.average_price, DateFunction(), pricingData1.difference, drugUrlList.rows[0]["drug_id"], pricingData1.lowest_market_price, pricingData1.pharmacy, pricingData1.price, pricingData1.program_id, pricingData1.recommended_price, pricingData1.rank, null];
                            await client.query(query2, values)
                                .catch(e => {
                                    console.log(e)
                                })
                        }

                        DrugId = drugUrlList.rows[0]["drug_id"];
                        let query3 = 'UPDATE shuffle_drugs SET medimpact_flag = \'completed\' WHERE request_id = $1';
                        let values = [DrugId];
                        await client.query(query3, values)
                            .then(() => {
                                console.log('Updated shuffle_drugs' + DrugId);
                            }).catch((error) => console.log(error));

                        if (context && context.getRemainingTimeInMillis() < 30000) {
                            process.exit(0);
                        }
                    })
                    .catch(function (err) {
                        console.log(err)
                    });
            } catch (error) {
                console.log(error.error);
                DrugId = drugUrlList.rows[0]["drug_id"];
                let query3 = 'UPDATE shuffle_drugs SET medimpact_flag = \'failed\' WHERE request_id = $1';
                let values = [DrugId];
                await client.query(query3, values)
                    .then(() => {
                        console.log('Updated FAILED shuffle_drugs' + DrugId);
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