// PRODUCTION IMPORTS
const rp = require('/opt/node_modules/request-promise');
const {Client} = require('/opt/node_modules/pg');

// DEV IMPORTS
// const {
//     Client
// } = require('pg');
let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
const client = new Client({
    connectionString: db_host
});
client.connect();

let regions = ["virginia", "ohio", "oregon", "california", "central"];
let _randomNo = _randomnumber(10, 15);
let sum = 0,
    counter = 0;
let ShuffleData = [];
let data = [];

function _randomnumber(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

'use strict';

function shuffle(arr, options) {

    if (!Array.isArray(arr)) {
        throw new Error('shuffle expect an array as parameter.');
    }

    options = options || {};

    let collection = arr,
        len = arr.length,
        rng = options["rng"] || Math.random,
        random,
        temp;

    if (options.copy === true) {
        collection = arr.slice();
    }

    while (len) {
        random = Math.floor(rng() * len);
        len -= 1;
        temp = collection[len];
        collection[len] = collection[random];
        collection[random] = temp;
    }

    return collection;
}

const handler = (event, context, callback) => {

    client.query('SELECT drug_id FROM drug_request where program_id = 4', (err, res) => {
        console.log(err, null);
        console.log("reslen:" + (res.rows).length);
        for (let j = 0; j < (res.rows).length; j++) {
            data.push(res.rows[j]);
        }
        console.log("random number" + _randomNo);


        console.log("datalength" + data.length);
        ShuffleData = shuffle(data);
        console.log(ShuffleData);
        console.log("rrrrrrrrrrrrrrrrr::" + ShuffleData[0]["drug_id"]);

        let Shuffle_Data = [];
        for (let k = 0; k < ShuffleData.length; k++) {
            Shuffle_Data.push(ShuffleData[k]["drug_id"]);
        }

        const truncate = 'truncate table shuffle_drugs';
        client.query(truncate, (error) => {
            if (error) {
                throw error;
            }
        });
        for (let i = 0, j = 0; i < Shuffle_Data.length;) {
            sum += _randomNo;
            let regionArr1 = Shuffle_Data.slice(i, sum);
            console.log(regionArr1);
            for (let k = 0; k < regionArr1.length; k++) {
                const query2 = 'INSERT INTO shuffle_drugs(region,request_id,insiderx_flag, wellrx_flag, medimpact_flag, singlecare_flag, blink_flag, goodrx_flag, usp_flag)' +
                    'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *';
                const values = [regions[j], regionArr1[k], 'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'];
                client.query(query2, values, (error) => {
                    if (error) {
                        throw error;
                    }
                });
            }

            i = i + _randomNo;
            if (j >= regions.length - 1) {
                j = 0
            } else {
                j++
            }
            counter++
        }
        process.exit();
    });

};

exports.handler = handler;
// module.exports = handler;