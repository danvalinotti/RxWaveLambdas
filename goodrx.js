// GOOD RX //
const {Client} = require('/opt/node_modules/pg');
var rp = require('/opt/node_modules/request-promise');
var db_host = process.env.DB_HOST;
var reg = process.env.REGION;

function DateFunction(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
}

async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

async function getGoodRxPrices(url, options, drugId, query, values, client) {
    return await rp(options).then(async function(response) {
        var data = response;
        
        if (data != undefined) {
            var results = data.results;
                        
            var lowestPrice =  parseFloat(results[0].prices[0].price) ;
            var lowestPharmacy=results[0].pharmacy.name;
            
            const pricingData = {
                //id : "",
                average_price : 0.0,
                createdat : DateFunction(),  
                difference : 0.0,
                lowest_market_price : 0.0,
                drug_details_id : drugId,
                pharmacy : lowestPharmacy,
                price : lowestPrice,
                program_id : 6,
                recommended_price : 0.0,   
            };
            
            // console.log("pricingData"+pricingData);
            
            console.log("DRUG_DETAILS_ID: " + pricingData.drug_details_id);
            
            query = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;'
            values = [
                pricingData.average_price,
                pricingData.createdat,
                pricingData.difference,
                pricingData.drug_details_id,
                pricingData.lowest_market_price,
                pricingData.pharmacy,
                pricingData.price,
                pricingData.program_id,
                pricingData.recommended_price
            ];
            
            console.log(url);
            console.log(pricingData.price);
            
            // console.log(values[0]);
            
            // PLACE PRICE RESULT INTO PUBLIC_PRICE TABLE
            await client.query(query, values)
                .then((response) => {
                    // console.log("Success: " + drugId);
                    return response;
                })
                .catch((error) => console.log(error));   
        }
    }).catch(function(error) { 
        console.log("Failure: " + drugId);
        console.log("URL: " + url)
        return "ERROR";    
    })
}

exports.handler = async function(event) {
    var drugId = "";
    var url = "";
    var query2 = "";
    var values = "";
    
    // CONNECT TO POSTGRES DB
    const connectionString = db_host;
    const client = new Client({
        connectionString: connectionString
    });
    client.connect();
    
    let drugList = [];
    
    var response = await client.query("SELECT drug_id FROM shuffle_drugs where flag = 'pending' and region = '" + reg + "';");
    for (var i = 0; i < response.rows.length; i++) {
        for (var j = 0; j < response.rows[i].drug_id.length; j++) {
            drugList.push(response.rows[i].drug_id[j]);
        }
    }
    
    var a = 0;
    let len = drugList.length;
        // console.log(len);
        
    let priceCount = 0;
    
    for (var k = 0; k < len; k++) {
        // console.log(drugList[k]);
        var req = await client.query("SELECT * FROM drug_request where program_id = 6 and good_rx_id is not null and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and drug_id :: int = " + drugList[k]);
        // console.log(req.rows.length);
        if(req.rows.length >= 1) {
            drugId = req.rows[0].drug_id;
            // console.log("CHECKING:::" + drugId);
            var drugName = req.rows[0].drug_name;
            var latitude = req.rows[0].latitude;
            var longitude = req.rows[0].longitude;
            var brand = req.rows[0].brand_indicator;
            var quantity = req.rows[0].quantity;
            var grxId = req.rows[0].good_rx_id;
            
            url = `https://goodrx.com/api/v4/drugs/${grxId}/prices?location=${longitude},${latitude}&location_type=LAT_LNG_GEO_IP&quantity=${quantity}`;
            
            const options = {
                url: url,
                method: 'GET',
                json: true,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Connection": "keep-alive",
                    "User-Agent": "PostmanRuntime/7.16.3"
                }
            };
            
            if (priceCount % 30 === 0) {
                console.log("About to be blocked, waiting...")
                await sleep(60000);
                console.log("Waited 1min")
            }
            
            try {
                // MAKE GOODRX API REQUEST
                var res;
                res = await getGoodRxPrices(url, options, drugId, query2, values, client);
                
                priceCount = priceCount + 1;
            } catch (error) {
                console.log(error);
            }
        } 
        
        // var query3 = 'SELECT * FROM public_price WHERE program_id = 6';
        // await client.query(query3).then((response) => {
        //     console.log(response.rows.length)
        // }).catch((error) => console.log(error));
    // }
} console.log(priceCount);
}