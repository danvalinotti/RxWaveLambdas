const {Client} = require('pg');
let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
const client = new Client({
    connectionString: db_host
});
client.connect();

// Define regions and random number for shuffling
let regions = ["virginia", "ohio", "oregon", "california", "central"];
// Random number of region entries
let _randomNo = _randomnumber(10, 15);

function _randomnumber(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const handler = (event, context, callback) => {
    let sum = 0;
    // Query pulls drug IDs from report_dm to be put in shuffle_drugs
    client.query(`SELECT DISTINCT drug_id FROM report_dm;`, (err, res) => {
        if (err) console.log(err, null);
        let shuffleData = [];

        // Extract drug_ids from response
        for (let j = 0; j < (res.rows).length; j++) {
            shuffleData.push(res.rows[j]["drug_id"]);
        }

        // Shuffle drug_ids in array
        shuffleData.sort(() => Math.random() - 0.5);

        // Truncate table before entering new data
        client.query('truncate table shuffle_drugs', (error) => {
            if (error) {
                throw error;
            }
        });

        // Loop through drug_ids to add to DB
        let dataCount = 0;
        for (let i = 0, j = 0; i < shuffleData.length;) {
            sum += _randomNo;

            // Split data into regions
            let regionArr1 = shuffleData.slice(i, sum);

            // Loop through each region's drugs
            for (let k = 0; k < regionArr1.length; k++) {
                const query2 = 'INSERT INTO shuffle_drugs(region,request_id,insiderx_flag, wellrx_flag, medimpact_flag, singlecare_flag, blink_flag, goodrx_flag, usp_flag) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *';
                const values = [regions[j], regionArr1[k], 'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'];

                // Insert data into shuffle_drugs
                client.query(query2, values, (error) => {
                    if (error) {
                        throw error;
                    }

                    // Track if all entries are mad in db
                    if (dataCount + 1 === shuffleData.length) {
                        // Differentiate between testing and production (prod has no callback)
                        if (callback) callback();
                        else process.exit();
                    } else {
                        dataCount++;
                    }
                });
            }

            // Handle size of region arrays
            i = i + _randomNo;
            if (j >= regions.length - 1) {
                j = 0
            } else {
                j++
            }
        }
    });

};

exports.handler = handler;
module.exports = handler;