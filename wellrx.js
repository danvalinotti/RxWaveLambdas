// PRODUCTION IMPORTS
const rp = require('/opt/node_modules/request-promise');
const {Client} = require('/opt/node_modules/pg');

// DEV IMPORTS
// const rp = require('request-promise');
// const {
//     Client
// } = require('pg');
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
    pharmacy: "testname",
    price: 0,
    program_id: 2,
    recommended_price: 0,
};

let len = 0;
let wrxbody = {};
let query2 = "";
let values = "";

async function handler(event, context) {
    let res1 = await client.query("SELECT request_id FROM shuffle_drugs where wellrx_flag = 'pending' and region = '" + reg + "'");
    for (let i = 0; i < res1.rows.length; i++) {
        listDrugs.push(res1.rows[i]["request_id"]);
    }
    let a = 0;
    len = listDrugs.length;
    console.log(listDrugs);
    for (let k = 0; k < len; k++) {
        let drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 2 and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and drug_id :: int = " + listDrugs[k]);

        if (drugUrlList.rows.length !== 0) {
            DrugId = parseInt(drugUrlList.rows[0]["drug_id"]);
            let dname = drugUrlList.rows[0].drug_name.replace(/\//, '-');
            let dquantity = drugUrlList.rows[0].quantity;
            let dgsn = drugUrlList.rows[0]["gsn"];
            let lat = drugUrlList.rows[0].latitude;
            let lng = drugUrlList.rows[0].longitude;
            let brand = drugUrlList.rows[0]["brand_indicator"];

            if (dgsn.length < 6) {
                for (let i = 0; i < 6 - dgsn.length; i++) {
                    dgsn = "0" + dgsn;
                }
            }

            wrxbody = {
                "GSN": dgsn,
                "lat": lat,
                "lng": lng,
                "numdrugs": "1",
                "quantity": dquantity,
                "bgIndicator": brand[0],
                "bReference": dname,
                "ncpdps": "null",
                "BN": dname
            };

            console.log(JSON.stringify(wrxbody));

            let options = {
                method: "post",
                body: wrxbody,
                json: true,
                url: "https://www.wellrx.com/prescriptions/get-specific-drug",
                headers: {
                    "Referer": "https://www.wellrx.com/prescriptions/" + encodeURI(wrxbody["drugname"]) + "/08823",
                    "Cookie": "ASP.NET_SessionId=hhwdg4zuhanzhvjbolrt43nl; __RequestVerificationToken=0dDfwZUlbQb4Mx3YjklcUV7bsEtr1hDoB-1t-b0F0k8olH2In-PRv07otVdGMVQMOeFEvd0EjIbfUYwmuYqzqql4-841; b1pi=!YcqCmwW1QEAHZ+EvLnpW7/Jj8QPM13OWFfo2ARrP6I6T4awkdPoTDp8HQ9YJSNx6YfdGFUS2UrlCIW4=; _ga=GA1.2.924180074.1565322424; _gid=GA1.2.1254852102.1565322424; _gcl_au=1.1.2015609251.1565322426; _fbp=fb.1.1565322426258.1245358800; wrxBannerID=4; _gat=1",
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "application/json"
                }
            };
            try {

                await rp(options).then(async function (response) {
                    let DataDrugs = response["Drugs"];
                    console.log(response);

                    if (DataDrugs !== undefined && DataDrugs.length > 0) {
                        a++;
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

                        DataDrugs.forEach(function (value) {
                            if (value != null) {

                                if (value["PharmacyName"].toUpperCase().includes("CVS")) {

                                    if (CVSPrice.price == null || CVSPrice.price > parseFloat(value["Price"])) {
                                        CVSPrice.price = parseFloat(value["Price"]);
                                        CVSPrice.pharmacy = value["PharmacyName"];
                                    }

                                } else if (value["PharmacyName"].toUpperCase().includes("WALMART")) {
                                    if (WalmartPrice.price == null || WalmartPrice.price > parseFloat(value["Price"])) {
                                        WalmartPrice.price = parseFloat(value["Price"]);
                                        WalmartPrice.pharmacy = value["PharmacyName"];
                                    }

                                } else if (value["PharmacyName"].toUpperCase().includes("WALGREENS")) {
                                    if (WalgreenPrice.price == null || WalgreenPrice.price > parseFloat(value["Price"])) {
                                        WalgreenPrice.price = parseFloat(value["Price"]);
                                        WalgreenPrice.pharmacy = value["PharmacyName"];
                                    }

                                } else if (value["PharmacyName"].toUpperCase().includes("KROGER")) {
                                    if (KrogerPrice.price == null || KrogerPrice.price > parseFloat(value["Price"])) {
                                        KrogerPrice.price = parseFloat(value["Price"]);
                                        KrogerPrice.pharmacy = value["PharmacyName"];
                                    }

                                } else {
                                    if (OtherPrice.price == null || OtherPrice.price > parseFloat(value["Price"])) {
                                        OtherPrice.price = parseFloat(value["Price"]);
                                        OtherPrice.pharmacy = value["PharmacyName"];
                                    }

                                }

                            }
                        });
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
                            query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price,rank, unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
                            values = [pricingData1.average_price, pricingData1.createdat, pricingData1.difference, DrugId, pricingData1.lowest_market_price, pricingData1.pharmacy, pricingData1.price, pricingData1.program_id, pricingData1.recommended_price, pricingData1.rank, null];
                            await client.query(query2, values)
                                .catch(e => {
                                    console.log(e)
                                })
                        }

                        DrugId = drugUrlList.rows[0]["drug_id"];
                        let query3 = 'UPDATE shuffle_drugs SET wellrx_flag = \'completed\' WHERE request_id = $1';
                        values = [DrugId];
                        await client.query(query3, values)
                            .then(() => {
                                console.log('Updated shuffle_drugs' + DrugId);
                            }).catch((error) => console.log(error));

                        if (context && context.getRemainingTimeInMillis() < 30000) {
                            process.exit();
                        }

                    } else {
                        console.log("else" + DrugId)
                    }
                }).catch(async function (err) {
                    console.log(err);
                });

            } catch (e) {
                DrugId = drugUrlList.rows[0]["drug_id"];
                let query3 = 'UPDATE shuffle_drugs SET wellrx_flag = \'completed\' WHERE request_id = $1';
                values = [DrugId];
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