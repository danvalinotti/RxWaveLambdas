var request = require("/opt/node_modules/request");
var rp = require('/opt/node_modules/request-promise');
const {
    Pool,
    Client
} = require('/opt/node_modules/pg');
var db_host = process.env.DB_HOST;
var reg = process.env.REGION;

// const connectionString = 'postgresql://postgres:secret@10.80.1.121:5432/apid'
const connectionString = db_host;

function comparePrices(a, b) {
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    if (a.price > b.price) return 1;
    if (b.price >= a.price) return -1;
}

function DateFunction() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    return dateTime;
}
var DrugId = ""
const client = new Client({
    connectionString: connectionString
})
client.connect()
var listDrugs = [];
let pricingData1 = {
    //id : "",
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
}

//let results =""
let url1 = ""
let data = []
var len = 0;
exports.myhandler = async function abc() {
    var res1 = await client.query("SELECT drug_id FROM shuffle_drugs where flag = 'pending' and region = '" + reg + "'");

    for (var i = 0; i < res1.rows.length; i++) {
        for (var j = 0; j < res1.rows[i].drug_id.length; j++) {
            //console.log("print ((((((((((((((((((("+res1.rows[i].drug_id[j]);
            listDrugs.push(res1.rows[i].drug_id[j]);
            //console.log("listdrugs:"+listDrugs)
        }
    }
    len = listDrugs.length;
    // console.log(listDrugs)
    // const a = len;
    for (let k = 0; k < len; k++) {
        //console.log("listdrugs2:"+k)
        //if(k<=len){
        // console.log(listDrugs[k]);
        var drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 5 and quantity is not null and good_rx_id is not null and drug_id :: int =" + listDrugs[k]);
        if (drugUrlList.rows.length == 1) {
            drugUrlList.rows[0].drug_name = drugUrlList.rows[0].drug_name.replace(' ', '-')
            drugUrlList.rows[0].drug_name = drugUrlList.rows[0].drug_name.replace('/', '-')
            url1 = "https://www.blinkhealth.com/api/v2/user/drugs/detail/" + drugUrlList.rows[0].drug_name + "/dosage/" + drugUrlList.rows[0].good_rx_id + "/quantity/" + drugUrlList.rows[0].quantity;

            var CVSPrice = {};
            CVSPrice.price = null;
            CVSPrice.pharmacy = null;
            CVSPrice.rank = 0;
            var WalmartPrice = {};
            WalmartPrice.price = null;
            WalmartPrice.pharmacy = null;
            WalmartPrice.rank = 0;
            var WalgreenPrice = {};
            WalgreenPrice.price = null;
            WalgreenPrice.pharmacy = null;
            WalgreenPrice.rank = 0;
            var KrogerPrice = {};
            KrogerPrice.price = null;
            KrogerPrice.pharmacy = null;
            KrogerPrice.rank = 0;
            var OtherPrice = {};
            OtherPrice.price = null;
            OtherPrice.pharmacy = null;
            OtherPrice.rank = 0;

            //https://www.blinkhealth.com/api/v2/drugs/detail/lipitor/dosage/209964/quantity/234
            await rp(url1)
                .then(async function (response) {
                    let jsondata = JSON.parse(response);
                    var edlpPrice = jsondata.result.price.edlp.raw_value;

                    var url2 = "https://www.blinkhealth.com/api/v2/pharmacies/full?limit=20&search=" + drugUrlList.rows[0].zipcode + "&allow_out_of_network=false&c_app=rx&c_platform=web&c_timestamp=1569270466508";
                    await rp(url2).then(async function (r) {
                        console.log(r)
                        console.log(url2)
                        r = JSON.parse(r);
                        r.result.results.forEach(function (value) {
                            console.log("value")
                            console.log(value)
                            if (value != null && value.in_network == true) {
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
                        var pricesArr = [WalgreenPrice, WalmartPrice, CVSPrice, OtherPrice, KrogerPrice];
                        console.log("pricesArr")
                        console.log(pricesArr)

                        pricesArr.sort(comparePrices)

                        pricesArr[0].rank = 0;
                        pricesArr[1].rank = 1;
                        pricesArr[2].rank = 2;
                        pricesArr[3].rank = 3;
                        pricesArr[4].rank = 4;

                        console.log(pricesArr)
                        pricesArr.forEach(async function (price) {
                            pricingData1.price = price.price;
                            pricingData1.pharmacy = price.pharmacy;
                            pricingData1.rank = price.rank;

                            // console.log(url1)
                            let jsondata = JSON.parse(response);

                            console.log("price=" + pricingData1.price);
                            const query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price,rank, unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
                            const values = [pricingData1.average_price, pricingData1.createdat, pricingData1.difference, drugUrlList.rows[0].drug_id, pricingData1.lowest_market_price, pricingData1.pharmacy, pricingData1.price, pricingData1.program_id, pricingData1.recommended_price, pricingData1.rank, null];
                            await client.query(query2, values)
                                .then(res => {})
                                .catch(e => {
                                    console.log("errr")
                                })
                        });
                    });
                })
                .catch(function (err) {
                    console.log(err)
                });
        } else {
            continue
        }
    }
}
//exports.myhandler();