const { Client } = require('pg');
let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
const client = new Client({
    connectionString: db_host
});
client.connect();
let regions = ["virginia", "ohio", "oregon", "california", "central"];;
let _randomNo = _randomnumber(10, 15);

function _randomnumber(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let sum = 0, counter = 0;
let ShuffleData = [];
let flag = "pending";

//funtion to handle shuffle
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

let data = [];

const handler = (event, context, callback) => {
    client.query('SELECT drug_id FROM drug_request where program_id = 4', (err, res) => { // program_id 4 is for singlecare

        console.log(err, null);

        console.log("reslen:" + (res.rows).length);

        for (let j = 0; j < (res.rows).length; j++) {

            data.push(res.rows[j]);

        }

        console.log("random number" + _randomNo);


        //_shuffledata = shuffle(res);

        console.log("datalength" + data.length);

        // console.log(data)

        ShuffleData = shuffle(data);

        console.log(ShuffleData);

        //console.log(typeof(data))

        //callback(null, data)

        console.log("rrrrrrrrrrrrrrrrr::" + ShuffleData[0]["drug_id"]);


        let Shuffle_Data = [];

        for (let k = 0; k < ShuffleData.length; k++) {

            Shuffle_Data.push(ShuffleData[k]["drug_id"]);

        }

        //console.log(_shuffle_data)

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
                const query2 = 'INSERT INTO shuffle_drugs(region,request_id,insiderx_flag, wellrx_flag, medimpact_flag, singlecare_flag, blink_flag, goodrx_flag, usp_flag) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *';
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
        console.log(counter)
    });
};

exports.handler = handler;
// module.exports = handler;