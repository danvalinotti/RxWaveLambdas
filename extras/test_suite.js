process.env.DB_HOST = "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
process.env.REGION = "ohio";
const {Pool, Client} = require('pg');
const insideRxHandler = require('../insiderx').myhandler;
const pool = new Pool({
    user: 'cheetahdb',
    host: 'prod-privdb.cl9r4vrjkocy.us-east-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'Galaxy123',
    post: 5432
});

function search(id, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === id) {
            return i;
        }
    }

    return -1;
}

async function runSuite() {
    // await insideRxHandler().then(() => {
    //     console.log("Done");
    // })
    // setTimeout(() => {
    //     console.log("Ended process");
    //     process.exit();
    // }, 300000)
    try {
        let drug_ids = [];
        const res = await pool.query({
            text: `select 
                p.id, d.name, p.average_price,
                p.createdat, p.drug_details_id,
                p.pharmacy, p.price, p.program_id,
                p.rank, p.unc_price_flag,
                r.report_id, r.price_id,
                d.id
            from 
                price as p
            left join report_drugs as r
                on p.id = r.price_id
            left join drug_master as d
                on d.id = p.drug_details_id	
            where r.report_id = 130
                order by d.name asc, p.program_id asc;`,
            rowMode: 'array'
        });
    
        res.rows.forEach((row) => {
            const i = search(row[12], drug_ids);
            if (i === -1) {
                drug_ids.push({
                    id: row[12],
                    prices: 1,
                    programs: [0,0,0,0,0,0,0]
                });
                const j = search(row[12], drug_ids);
                drug_ids[j].programs[row[7]] += 1;
            } else {
                drug_ids[i].programs[row[7]] += 1;
                drug_ids[i].prices += 1;
            }
        });

        drug_ids.forEach((drug) => {
            console.log(drug);
        })
    } catch (error) {
        console.log(error);
    }
    
    await pool.end();
}

runSuite().then(() => {
    process.exit();
});
