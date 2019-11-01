const {Pool} = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: '100.25.217.246',
    database: 'rxwavedb_qa',
    password: 'secret',
    post: 5432
});

async function getMarketPrices(leading, table, reportId, date) {
    try {
        let entries = [];
        const leadingPrices = await pool.query(
            `select 
                p.id, d.name, d.dosage_strength, d.quantity, d.ndc, p.recommended_price,
                p.price, p.average_price, p.drug_details_id,p.pharmacy, p.program_id,p.rank, p.unc_price,
                d.zip_code,r.report_id, r.price_id,d.id as dm_id
                from price as p 
                left join report_drugs as r 
                on p.id = r.price_id 
                left join drug_master as d 
                on d.id = p.drug_details_id 
                where r.report_id = ${reportId}
                and p.program_id = 0 and p.price ${leading ? `=` : `>`} p.recommended_price order by d.name asc`
        );

        leadingPrices.rows.forEach(async (leadPrice) => {
            try {
                const allPrices = await pool.query(
                    `select * from price
                        where drug_details_id = ${leadPrice.drug_details_id}
                        and createdat > '${date}'
                        and rank = 0
                    order by program_id asc;`
                );
    
                let entry = {
                    drugId: leadPrice.dm_id,
                    priceIds: []
                };
    
                allPrices.rows.forEach((price) => {
                    entry.priceIds.push(price.id);
                });
    
                entries.push(entry);
    
                const insert = `insert into ${table} (drug_id, price_ids, report_id)
                values ($1, $2, $3) returning *;`
                // console.log(insert);
    
                await pool.query(
                     insert, 
                     [entry.drugId, entry.priceIds, reportId],
                     (err, result) => {
                        if (err) {
                            console.log(err.stack);
                        }
                    });
            } catch(error) {
                console.log(error);
            }
        }); // end foreach

        
        const priceIds = await pool.query(`select price_ids from ${table} where id = 750`);
        const q = `select * from price where id=ANY(ARRAY[${priceIds.rows[0].price_ids}]) order by createdat, program_id limit 7;`
        console.log(q);
        const prices = await pool.query(`select * from price where id=ANY(ARRAY[${priceIds.rows[0].price_ids}]) order by program_id`);
        console.log(prices.rows);
    } catch (error) {
        console.log(error);
    }
}

// async function getLeadingDrugs() {
//     try {
//         const leadingPrices = await pool.query(query);

//         leadingPrices.rows.forEach(async (leadPrice) => {
//             const allPrices = await pool.query(
//                 `select * from price
//                     where drug_details_id = ${leadPrice.drug_details_id}
//                     and createdat > '2019-10-06: 00:00:00'
//                     and rank = 0
//                 order by program_id asc;`
//             );

//             let entry = {
//                 drugId: leadPrice.dm_id,
//                 priceIds: []
//             };

//             allPrices.rows.forEach((price) => {
//                 entry.priceIds.push(price.id);
//             });

//             entries.push(entry);

//             pool.query(
//                 `insert into leading_drugs (drug_id, price_ids)
//                  values ($1, $2) returning *;`, 
//                  [entry.drugId, entry.priceIds],
//                  (err, result) => {
//                     if (err) {
//                         console.log(err.stack);
//                     }

//                 });
//         }); // end foreach
        
//         const priceIds = await pool.query(`select price_ids from leading_drugs where id = 339`);
//         const select = `select * from price where id=ANY(ARRAY[${priceIds.rows[0].price_ids}]) `;
//         console.log(select);
//         // console.log(priceIds.rows[0].price_ids);
//         const prices = await pool.query(`select * from price where id=ANY(ARRAY[${priceIds.rows[0].price_ids}]) order by program_id`);
//         console.log(prices.rows);
//     } catch (error) {
//         console.log(error);
//     }
// }



getMarketPrices(false, `trailing_drugs`, 16, '2019-10-06 00:00:00');