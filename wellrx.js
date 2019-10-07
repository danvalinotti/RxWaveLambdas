//well rx
var rp = require('/opt/node_modules/request-promise');
const {Pool, Client} = require('/opt/node_modules/pg');
const request = require("request");
var db_host = process.env.DB_HOST;
var reg = process.env.REGION;

// const connectionString = 'postgresql://postgres:secret@10.80.1.121:5432/apid'
const connectionString = db_host;
function DateFunction(){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
}
var DrugId=""
const client=new Client({
    connectionString:connectionString
})
client.connect()
var listDrugs = [];
let pricingData1 = {
    //id : "",
    average_price : 0,
    createdat : DateFunction(),  
    difference : 0,
    drug_details_id : 0,
    lowest_market_price : 0,
    pharmacy : "testname",
    price : 0,
    program_id : 2,
    recommended_price : 0,   
}

//let results =""
let url1 = ""
let url2="";
let data = []
var len=0;
var wrxbody ={}
var query2=""
var values=""
exports.myhandler = async function abc(){
   var res1 = await client.query("SELECT drug_id FROM shuffle_drugs where flag = 'pending' and region = '"+reg+"'");
    for(var i=0; i< res1.rows.length ; i++){
        for(var j=0; j < res1.rows[i].drug_id.length; j++){
            //console.log("print ((((((((((((((((((("+res1.rows[i].drug_id[j]);
            listDrugs.push(res1.rows[i].drug_id[j]);
            //console.log("listdrugs:"+listDrugs)
        }
    }
    var a=0;
len = listDrugs.length;
console.log(len);
    for(var k=0; k < len ; k++){
       var drugUrlList = await client.query("SELECT * FROM drug_request where program_id = 2 and drug_name is not null and latitude is not null and longitude is not null and quantity is not null and drug_id :: int = "+listDrugs[k]);
       //console.log("oooooooooo"+drugUrlList.rows[0])
       
       
       if(drugUrlList.rows.length == 1 ){
          //console.log("********************"+a);
         
          DrugId = parseInt(drugUrlList.rows[0].drug_id);
             var dname=drugUrlList.rows[0].drug_name
             var dquantity = drugUrlList.rows[0].quantity
             var dgsn = drugUrlList.rows[0].gsn
              var lat = drugUrlList.rows[0].latitude
               var lng = drugUrlList.rows[0].longitude
                var brand = drugUrlList.rows[0].brand_indicator
       
         wrxbody ={
                    "GSN": dgsn, 
                    "lat": lat, 
                    "lng": lng, 
                    "numdrugs":"1", 
                    "quantity": dquantity,
                    "bgIndicator": brand, 
                    "bReference": dname, 
                    "ncpdps":"null",
                    "BN" : dname
                    }
                   
        var options = {
                    method: "post",
                    body: wrxbody, 
                    json: true, 
                    url: "https://www.wellrx.com/prescriptions/get-specific-drug",
                    headers: {
                        "Referer":"https://www.wellrx.com/prescriptions/"+encodeURI(wrxbody.drugname)+"/08823",
                        "Cookie":"ASP.NET_SessionId=hhwdg4zuhanzhvjbolrt43nl; __RequestVerificationToken=0dDfwZUlbQb4Mx3YjklcUV7bsEtr1hDoB-1t-b0F0k8olH2In-PRv07otVdGMVQMOeFEvd0EjIbfUYwmuYqzqql4-841; b1pi=!YcqCmwW1QEAHZ+EvLnpW7/Jj8QPM13OWFfo2ARrP6I6T4awkdPoTDp8HQ9YJSNx6YfdGFUS2UrlCIW4=; _ga=GA1.2.924180074.1565322424; _gid=GA1.2.1254852102.1565322424; _gcl_au=1.1.2015609251.1565322426; _fbp=fb.1.1565322426258.1245358800; wrxBannerID=4; _gat=1",
                        "X-Requested-With":"XMLHttpRequest",
                        "Accept":"application/json"
                    }
                   }
try 
{
    
   await rp(options).then(async function(response){
    var jsondata1 = response;
    var DataDrugs = jsondata1.Drugs;
    if(DataDrugs != undefined && DataDrugs.length > 0){
         a++;
    pricingData1.price = DataDrugs[0].Price;
    pricingData1.pharmacy = DataDrugs[0].PharmacyName;
    query2 = 'INSERT INTO public_price(average_price, createdat, difference, drug_details_id, lowest_market_price, pharmacy, price, program_id, recommended_price) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *';
    values = [pricingData1.average_price, pricingData1.createdat, pricingData1.difference, DrugId, pricingData1.lowest_market_price,pricingData1.pharmacy,pricingData1.price,pricingData1.program_id,pricingData1.recommended_price];
    await client.query(query2, values)
                    .then(res => {
                    })
                    .catch(e => {console.log("errr")})
    
     }else {
    console.log("else"+DrugId)
     }
                //console.log("body"+JSON.stringify(body));
        

 }).catch(function (err) {
     console.log(err);
        // Crawling failed or Cheerio choked...
    });;
       
} catch (e) {}

}
else{console.log("fault drugs"+k+"drug-id"+DrugId)}
}
console.log("good drugs:"+a+"drugid:"+DrugId)
}
//exports.myhandler()