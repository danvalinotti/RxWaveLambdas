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
    program_id: 3,
    recommended_price: 0,
    rank: 0
}

//let results =""
let url = ""
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
    console.log(len)
    console.log(listDrugs)
    // const a = len;
    for (let k = 0; k < len; k++) {
        //console.log("listdrugs2:"+k)
        //if(k<=len){
        var drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 3 and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and brand_indicator is not null and drug_id :: int =" + listDrugs[k]);
        if (drugUrlList.rows != 0) {
            url = "https://rxsavings.medimpact.com/web/rxcard/home?p_p_id=com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view" +
                "&p_p_cacheability=cacheLevelPage&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_cmd=get_drug_detail" +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_quantity=" + drugUrlList.rows[0].quantity +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_gsn=" + drugUrlList.rows[0].gsn +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_brandGenericFlag=" + drugUrlList.rows[0].brand_indicator +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_lat=" + drugUrlList.rows[0].latitude +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_lng=" + drugUrlList.rows[0].longitude +
                "&_com_cashcard_portal_portlet_CashCardPortlet_INSTANCE_wVwgc3hAI7xv_numdrugs=1";
            await rp(url)
                .then(async function (response) {
                    //console.log(url)
                    let jsondata = JSON.parse(response);
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
                    jsondata.drugs.locatedDrug.forEach(function (value) {
                        if (value != null) {

                            if (value.pharmacy.name.toUpperCase().includes("CVS")) {

                                if (CVSPrice.price == null || CVSPrice.price > parseFloat(value.pricing.price)) {
                                    CVSPrice.price = parseFloat(value.pricing.price);
                                    CVSPrice.pharmacy = value.pharmacy.name;
                                }

                            } else if (value.pharmacy.name.toUpperCase().includes("WALMART")) {
                                if (WalmartPrice.price == null || WalmartPrice.price > parseFloat(value.pricing.price)) {
                                    WalmartPrice.price = parseFloat(value.pricing.price);
                                    WalmartPrice.pharmacy = value.pharmacy.name;
                                }

                            } else if (value.pharmacy.name.toUpperCase().includes("WALGREENS")) {
                                if (WalgreenPrice.price == null || WalgreenPrice.price > parseFloat(value.pricing.price)) {
                                    WalgreenPrice.price = parseFloat(value.pricing.price);
                                    WalgreenPrice.pharmacy = value.pharmacy.name;
                                }

                            } else if (value.pharmacy.name.toUpperCase().includes("KROGER")) {
                                if (KrogerPrice.price == null || KrogerPrice.price > parseFloat(value.pricing.price)) {
                                    KrogerPrice.price = parseFloat(value.pricing.price);
                                    KrogerPrice.pharmacy = value.pharmacy.name;
                                }

                            } else {
                                if (OtherPrice.price == null || OtherPrice.price > parseFloat(value.pricing.price)) {
                                    OtherPrice.price = parseFloat(value.pricing.price);
                                    OtherPrice.pharmacy = value.pharmacy.name;
                                }

                            }

                        }
                    });
                    var pricesArr = [WalgreenPrice, WalmartPrice, CVSPrice, OtherPrice, KrogerPrice];
                    console.log(pricesArr)
                    pricesArr.sort(comparePrices)

                    pricesArr[0].rank = 0;
                    pricesArr[1].rank = 1;
                    pricesArr[2].rank = 2;
                    pricesArr[3].rank = 3;
                    pricesArr[4].rank = 4;

                    pricesArr.forEach(async function (price) {
                        pricingData1.price = price.price;
                        pricingData1.pharmacy = price.pharmacy;
                        pricingData1.rank = price.rank
                        //console.log("price="+pricingData1.price);
                        const query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price,rank,unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
                        const values = [pricingData1.average_price, pricingData1.createdat, pricingData1.difference, drugUrlList.rows[0].drug_id, pricingData1.lowest_market_price, pricingData1.pharmacy, pricingData1.price, pricingData1.program_id, pricingData1.recommended_price, pricingData1.rank, null];
                        await client.query(query2, values)
                            .then(res => {})
                            .catch(e => {
                                console.log("errr")
                            })
                    });
                })
                .catch(function (err) {
                    console.log(url)
                    console.log(err)
                });
        } else {
            continue
        }
    }
}
//exports.myhandler();