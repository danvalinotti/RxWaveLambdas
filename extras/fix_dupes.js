const {Pool} = require('pg');
const pool = new Pool({
    user: 'cheetahdb',
    host: 'prod-privdb.cl9r4vrjkocy.us-east-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'Galaxy123',
    post: 5432
});

const query = `select distinct j.drug_details_id from (
                    select 
                        p.drug_details_id, r.price_id, r.report_id, p.id
                        from price as p
                    left join report_drugs as r
                        on r.price_id = p.id
                        where r.report_id = 133
                        order by drug_details_id
                ) as j;`

async function findDupes() {
    try {
        let dupes = [];
        const res = await pool.query({
            text: query
        });
        let count = 0;

        res.rows.forEach((row, index, array) => {
            pool.query({
                text: `select count(*) filter (
                            where program_id = 6
                            and rank = 1
                            and drug_details_id = ${row.drug_details_id}
                            and createdat > '2019-10-23 00:00:00'
                        ) from price`
            }).then((check) => {
                const res = {
                    id: row.drug_details_id,
                    count: check.rows[0].count
                };
                if (res.count > 1) {
                    console.log('added new ' + res.id);
                    dupes.push(res);
                }
            }).then(() => {
                count++;
                if (count === array.length) {
                    console.log(dupes);
                    console.log(dupes.length);
                }
            }).catch((error) => {
                console.log(error);
            });
        });

        console.log(dupes);
        await pool.end();
    } catch (error) {
        console.log(error);
    }
}

findDupes().then(() => process.exit()).catch((err) => console.log(err));