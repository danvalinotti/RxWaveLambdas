const {Pool} = require('pg');
const fetch = require('node-fetch');
const fs = require('fs');
const zipcodes = require('zipcodes');
const pool = new Pool({
    user: 'cheetahdb',
    host: 'prod-privdb.cl9r4vrjkocy.us-east-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'Galaxy123',
    post: 5432
});

async function generateRequests() {
    try {
        const missingDrugs = await pool.query(`select * from (
            select distinct on (dm.ndc) ndc, dm.* from drug_master as dm 
                where id not in (
                    select distinct j.drug_details_id from (
                        select 
                            p.drug_details_id, r.price_id, r.report_id, p.id
                            from price as p
                        left join report_drugs as r
                            on r.price_id = p.id
                            where r.report_id = 134
                            order by drug_details_id
                    ) as j
                )
            ) as k order by k.name;`);
        var drugs_file = fs.readFileSync('drugs.json');
        var drugs = JSON.parse(drugs_file);
        console.log(missingDrugs.rows.length);
        // let row = missingDrugs.rows[0];

        try {
            missingDrugs.rows.forEach(async (row) => {
                var drugs_entry = drugs.filter(function(item) {
                    // console.log(item.ndc, row.ndc)
                    return item.ndc === row.ndc 
                })[0];
    
                for (let i = 0; i < 7; i++) {
                    const req = {
                        drugId: row.id,
                        programId: i,
                        longitude: zipcodes.lookup(row.zip_code).longitude,
                        latitude: zipcodes.lookup(row.zip_code).latitude,
                        ndc: row.ndc,
                        quantity: row.quantity,
                        zipcode: row.zip_code,
                        drugName: row.name,
                        brandIndicator: drugs_entry.brandIndicator,
                        gsn: row.gsn,
                        good_rx_id: drugs_entry.goodRxId
                    }
    
                    console.log(JSON.stringify(req));
    
                    fetch('http://localhost:8081/request/create', {
                        method: 'POST',
                        body: JSON.stringify(req),
                        headers: { 'Content-Type': 'application/json' },
                    }).then((res) => {
                        console.log(res.status);
                    }).catch((error) => {
                        console.log(error);
                    })
                }
            });
        } catch (error) {
            console.log(error);
        }
    } catch(error) {
        console.log(error);
    }
}

generateRequests();