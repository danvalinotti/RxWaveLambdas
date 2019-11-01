var rp = require('/opt/node_modules/request-promise');
const {
    Pool,
    Client
} = require('/opt/node_modules/pg');
const request = require("request");
var db_host = process.env.DB_HOST;
var reg = process.env.REGION;


const connectionString = db_host;

function comparePrices(a, b) {
    if (a.lowestPrice === null) return 1;
    if (b.lowestPrice === null) return -1;
    if (a.lowestPrice > b.lowestPrice) return 1;
    if (b.lowestPrice >= a.lowestPrice) return -1;
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
    pharmacy: "testname",
    price: 0,
    program_id: 0,
    recommended_price: 0,
    rank: 0,
    uncPrice: null
}

//let results =""
let url1 = ""
let url2 = "";
let data = []
var len = 0;
var wrxbody = {}
var query2 = ""
var values = ""
exports.myhandler = async function abc() {
    var res1 = await client.query("SELECT drug_id FROM shuffle_drugs where flag = 'pending' and region = '" + reg + "'");
    for (var i = 0; i < res1.rows.length; i++) {
        for (var j = 0; j < res1.rows[i].drug_id.length; j++) {

            listDrugs.push(res1.rows[i].drug_id[j]);

        }
    }
    var a = 0;
    len = listDrugs.length;
    console.log(listDrugs);
    for (var k = 0; k < len; k++) {
        var drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 0 and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and drug_id :: int = " + listDrugs[k]);

        if (drugUrlList.rows.length > 0) {
            //console.log("********************"+a);

            DrugId = parseInt(drugUrlList.rows[0].drug_id);
            var dname = drugUrlList.rows[0].drug_name
            var dquantity = drugUrlList.rows[0].quantity
            var dndc = drugUrlList.rows[0].ndc
            var lat = drugUrlList.rows[0].latitude
            var lng = drugUrlList.rows[0].longitude
            var brand = drugUrlList.rows[0].brand_indicator

            wrxbody = {
                "ndc": dndc,
                "latitude": lat,
                "longitude": lng,
                "quantity": dquantity,
                "referrer": "null",
                "site_identity": "irx"
            }

            var options = {
                method: "post",
                body: wrxbody,
                json: true,
                url: "https://insiderx.com/request/pharmacies",
                headers: {
                    // "Referer":"https://www.wellrx.com/prescriptions/"+encodeURI(wrxbody.drugname)+"/08823",
                    "Cookie": "_gcl_au=1.1.923916117.1571676777; _fbp=fb.1.1571676776869.2055137922; _ga=GA1.2.930772864.1571676778; _gid=GA1.2.1882699394.1571676778; _gat_UA-113293481-1=1; _hjid=d6e7565b-1525-4271-8198-042e450e45ac; _hjIncludedInSample=1; geocoords=40.7350747%2C-74.17390569999998; AWSALB=mSNItEQ6fXmxXUsxt5mlUriIXhzEHmbChrsjCmQCdVdp42tXWv07gpOMfIQjeOlkAmbeYVCzgbur0wS6jc3a92h9ZKJJb9cNCF7qpmn5FKV9PH3VfDW/CsYPWDt2",
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "application/json",
                    "csrf-token": "Hi6yGXfg-vppErZsd2KXvKmH9LxjPBNJeK48",

                }
            }

            try {

                await rp(options).then(async function (response) {
                    var jsondata1 = response;
                    var CVSPrice = {};
                    CVSPrice.price = null;
                    CVSPrice.pharmacy = null;
                    CVSPrice.rank = 0;
                    CVSPrice.uncPrice = null;
                    CVSPrice.lowestPrice = null;
                    var WalmartPrice = {};
                    WalmartPrice.price = null;
                    WalmartPrice.pharmacy = null;
                    WalmartPrice.rank = 0;
                    WalmartPrice.uncPrice = null;
                    WalmartPrice.lowestPrice = null;
                    var WalgreenPrice = {};
                    WalgreenPrice.price = null;
                    WalgreenPrice.pharmacy = null;
                    WalgreenPrice.rank = 0;
                    WalgreenPrice.uncPrice = null;
                    WalgreenPrice.lowestPrice = null;
                    var KrogerPrice = {};
                    KrogerPrice.uncPrice = null;
                    KrogerPrice.price = null;
                    KrogerPrice.pharmacy = null;
                    KrogerPrice.rank = 0;
                    KrogerPrice.lowestPrice = null;
                    var OtherPrice = {};
                    OtherPrice.price = null;
                    OtherPrice.pharmacy = null;
                    OtherPrice.rank = 0;
                    OtherPrice.uncPrice = null;
                    OtherPrice.lowestPrice = null;

                    jsondata1.prices.forEach(function (value) {
                        if (value != null) {
                            if (value.pharmacy.name.toUpperCase().includes("CVS")) {

                                if (CVSPrice.price == null || CVSPrice.lowestPrice > parseFloat(value.price)) {
                                    CVSPrice.price = parseFloat(value.price);
                                    CVSPrice.pharmacy = value.pharmacy.name;
                                    CVSPrice.uncPrice = null;
                                    CVSPrice.lowestPrice = parseFloat(value.price);
                                    if (value.uncPrice != undefined && value.uncPrice != null) {
                                        CVSPrice.uncPrice = parseFloat(value.uncPrice)
                                    }


                                }
                                if (value.uncPrice != undefined && value.uncPrice != null && CVSPrice.lowestPrice > parseFloat(value.uncPrice)) {
                                    CVSPrice.price = parseFloat(value.price);
                                    CVSPrice.pharmacy = value.pharmacy.name;
                                    CVSPrice.uncPrice = parseFloat(value.uncPrice);
                                    CVSPrice.lowestPrice = parseFloat(value.uncPrice);

                                }
                            } else if (value.pharmacy.name.toUpperCase().includes("WAL-MART")) {
                                if (WalmartPrice.price == null || WalmartPrice.lowestPrice > parseFloat(value.price)) {
                                    WalmartPrice.price = parseFloat(value.price);
                                    WalmartPrice.pharmacy = value.pharmacy.name;
                                    WalmartPrice.uncPrice = null;
                                    WalmartPrice.lowestPrice = parseFloat(value.price);
                                    if (value.uncPrice != undefined && value.uncPrice != null) {
                                        WalmartPrice.uncPrice = parseFloat(value.uncPrice)
                                    }


                                }
                                if (value.uncPrice != undefined && value.uncPrice != null && WalmartPrice.lowestPrice > parseFloat(value.uncPrice)) {
                                    WalmartPrice.price = parseFloat(value.price);
                                    WalmartPrice.pharmacy = value.pharmacy.name;
                                    WalmartPrice.uncPrice = parseFloat(value.uncPrice);
                                    WalmartPrice.lowestPrice = parseFloat(value.uncPrice);

                                }

                            } else if (value.pharmacy.name.toUpperCase().includes("WALGREENS")) {
                                if (WalgreenPrice.lowestPrice == null || WalgreenPrice.lowestPrice > parseFloat(value.price)) {
                                    WalgreenPrice.price = parseFloat(value.price);
                                    WalgreenPrice.pharmacy = value.pharmacy.name;
                                    WalgreenPrice.uncPrice = null;
                                    WalgreenPrice.lowestPrice = parseFloat(value.price);
                                    if (value.uncPrice != undefined && value.uncPrice != null) {
                                        WalgreenPrice.uncPrice = parseFloat(value.uncPrice)
                                    }


                                }
                                if (value.uncPrice != undefined && value.uncPrice != null && WalgreenPrice.price > parseFloat(value.uncPrice)) {
                                    WalgreenPrice.price = parseFloat(value.price);
                                    WalgreenPrice.pharmacy = value.pharmacy.name;
                                    WalgreenPrice.uncPrice = parseFloat(value.uncPrice);
                                    WalgreenPrice.lowestPrice = parseFloat(value.uncPrice);

                                }
                            } else if (value.pharmacy.name.toUpperCase().includes("KROGER")) {
                                if (KrogerPrice.price == null || KrogerPrice.price > parseFloat(value.price)) {
                                    KrogerPrice.price = parseFloat(value.price);
                                    KrogerPrice.pharmacy = value.pharmacy.name;
                                    KrogerPrice.uncPrice = null;
                                    KrogerPrice.lowestPrice = parseFloat(value.price);
                                    if (value.uncPrice != undefined && value.uncPrice != null) {
                                        KrogerPrice.uncPrice = parseFloat(value.uncPrice)
                                    }


                                }
                                if (value.uncPrice != undefined && value.uncPrice != null && KrogerPrice.price > parseFloat(value.uncPrice)) {
                                    KrogerPrice.price = parseFloat(value.price);
                                    KrogerPrice.pharmacy = value.pharmacy.name;
                                    KrogerPrice.uncPrice = parseFloat(value.uncPrice);
                                    KrogerPrice.lowestPrice = parseFloat(value.uncPrice);
                                }
                            } else {
                                if (OtherPrice.price == null || OtherPrice.lowestPrice > parseFloat(value.price)) {
                                    OtherPrice.price = parseFloat(value.price);
                                    OtherPrice.pharmacy = value.pharmacy.name;
                                    OtherPrice.uncPrice = null;
                                    OtherPrice.lowestPrice = parseFloat(value.price);
                                    if (value.uncPrice != undefined && value.uncPrice != null) {
                                        OtherPrice.uncPrice = parseFloat(value.uncPrice)

                                    }


                                }
                                if (value.uncPrice != undefined && value.uncPrice != null && OtherPrice.lowestPrice > parseFloat(value.uncPrice)) {
                                    OtherPrice.price = parseFloat(value.price);
                                    OtherPrice.pharmacy = value.pharmacy.name;
                                    OtherPrice.uncPrice = parseFloat(value.uncPrice);
                                    OtherPrice.lowestPrice = parseFloat(value.uncPrice);
                                }
                            }


                        }
                    });

                    // "Ranks" are actually just assignment to which pharmacy the price is from vvv
                    var pricesArr = [WalgreenPrice, WalmartPrice, CVSPrice, OtherPrice, KrogerPrice];
                    console.log(pricesArr)
                    pricesArr.sort(comparePrices)

                    pricesArr[0].rank = 0;
                    pricesArr[1].rank = 1;
                    pricesArr[2].rank = 2;
                    pricesArr[3].rank = 3;
                    pricesArr[4].rank = 4;

                    // console.log(pricesArr)
                    pricesArr.forEach(async function (price) {
                        pricingData1.price = price.price;
                        pricingData1.pharmacy = price.pharmacy;
                        pricingData1.rank = price.rank
                        pricingData1.uncPrice = price.uncPrice
                        query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price, rank,unc_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *';
                        values = [pricingData1.average_price, pricingData1.createdat, pricingData1.difference, DrugId, pricingData1.lowest_market_price, pricingData1.pharmacy, pricingData1.price, pricingData1.program_id, pricingData1.recommended_price, pricingData1.rank, pricingData1.uncPrice];
                        await client.query(query2, values)
                            .then(res => {})
                            .catch(e => {
                                console.log(e)
                            })

                    });



                }).catch(function (err) {
                    console.log(err);
                    // Crawling failed or Cheerio choked...
                });;


            } catch (e) {}

        } else {
            console.log("fault drugs" + k + "drug-id" + DrugId)
        }
    }
    console.log("good drugs:" + a + "drugid:" + DrugId)

}


//exports.myhandler()