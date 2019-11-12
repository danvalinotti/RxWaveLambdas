const AWS = require('aws-sdk');
const xl = require('excel4node');
// const report_query = require('./report_query');
const {
    Client
} = require('pg');
const fs = require('fs');
let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
let bucket = process.env.S3_BUCKET || "rxwave-reports";
// let key = process.env.S3_KEY;

const client = new Client({
    connectionString: db_host
});
client.connect();

// Round to 2 decimal points
function round(num) {
    return Math.round(num * 100) / 100;
}

// Upload excel to S3 bucket
function upload(file, key) {
    const buffer = Buffer.from(file, 'binary');
    let s3 = new AWS.S3();
    const params = {
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    };

    console.log("Uploading to s3....");
    s3.upload(params, function(err, data) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(`Uploaded report to S3 - ${data["location"]}`);
        }
    });
}

async function handler() {
    // Create Excel Workbook object
    let wb = new xl.Workbook();
    const zips = [
        "92648",
        "30062",
        "60657",
        "07083",
        "75034"
    ];
    const pharmacies = [
        "Walgreens",
        "Wal-Mart",
        "CVS",
        "Kroger",
        "Other"
    ];

    // Get latest report ID
    let latest = await client.query("select id from report_table order by timestamp desc limit 1;\n");
    let reportId = latest.rows[0]["id"];

    for (let zip of zips) {
        console.log(`Getting prices for zip code ${zip}...`);

        try {
            // Query latest report prices for each zip code
            let data = await client.query(report_query, [reportId, zip]);
            let ws = wb.addWorksheet(zip, {});

            // Report sheet styles
            let style = wb.createStyle({
                font: {
                    color: "#FFFFFF"
                },
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    bgColor: '#5b9ad5',
                    fgColor: '#5b9ad5'
                }
            });
            ws.column(1).setWidth(30);
            ws.column(3).setWidth(30);
            ws.column(4).setWidth(10);
            ws.column(5).setWidth(28);
            ws.column(8).setWidth(20);
            ws.column(9).setWidth(20);
            ws.column(10).setWidth(30);
            ws.column(11).setWidth(20);
            ws.column(12).setWidth(30);
            ws.column(13).setWidth(20);
            ws.column(14).setWidth(30);
            ws.column(15).setWidth(20);
            ws.column(16).setWidth(30);
            ws.column(17).setWidth(20);
            ws.column(18).setWidth(30);
            ws.column(19).setWidth(20);
            ws.column(20).setWidth(30);
            ws.column(21).setWidth(20);
            ws.column(22).setWidth(30);
            ws.column(23).setWidth(20);
            ws.column(24).setWidth(20);

            // Define headers
            ws.cell(1,1)
                .string('Drug Name')
                .style(style);
            ws.cell(1,2)
                .string('Drug Rank')
                .style(style);
            ws.cell(1,3)
                .string('NDC')
                .style(style);
            ws.cell(1,4)
                .string('GSN')
                .style(style);
            ws.cell(1,5)
                .string('Dosage Strength')
                .style(style);
            ws.cell(1,6)
                .string('Quantity')
                .style(style);
            ws.cell(1,7)
                .string('Zip Code')
                .style(style);
            ws.cell(1,8)
                .string('InsideRx Price')
                .style(style);
            ws.cell(1,9)
                .string('InsideRx UNC Price')
                .style(style);
            ws.cell(1,10)
                .string('InsideRx Pharmacy')
                .style(style);
            ws.cell(1,11)
                .string('GoodRx Price')
                .style(style);
            ws.cell(1,12)
                .string('GoodRx Pharmacy')
                .style(style);
            ws.cell(1,13)
                .string('US Pharmacy Card Price')
                .style(style);
            ws.cell(1,14)
                .string('US Pharmacy Card Pharmacy')
                .style(style);
            ws.cell(1,15)
                .string('WellRx Price')
                .style(style);
            ws.cell(1,16)
                .string('WellRx Pharmacy')
                .style(style);
            ws.cell(1,17)
                .string('MedImpact Price')
                .style(style);
            ws.cell(1,18)
                .string('MedImpact Pharmacy')
                .style(style);
            ws.cell(1,19)
                .string('SingleCare Price')
                .style(style);
            ws.cell(1,20)
                .string('SingleCare Pharmacy')
                .style(style);
            ws.cell(1,21)
                .string('Blink Price')
                .style(style);
            ws.cell(1,22)
                .string('Blink Pharmacy')
                .style(style);
            ws.cell(1,23)
                .string('Recommended Price')
                .style(style);
            ws.cell(1,24)
                .string('Difference')
                .style(style);

            console.log(`Writing prices for ${zip}...`);
            for (let i = 0; i < data.rows.length; i++) {
                // Writes price properties to each row
                ws.cell(i + 2, 1)
                    .string(data.rows[i]["name"]);
                ws.cell(i + 2, 2)
                    .number(data.rows[i]["rank"]);
                ws.cell(i + 2, 3)
                    .string(data.rows[i]["ndc"]);
                ws.cell(i + 2, 4)
                    .string((data.rows[i]["gsn"] || "N/A") + "");
                ws.cell(i + 2, 5)
                    .string(data.rows[i]["dosage_strength"]);
                ws.cell(i + 2, 6)
                    .string(data.rows[i]["quantity"] + "");
                ws.cell(i + 2, 7)
                    .string(zip);
                ws.cell(i + 2, 8)
                    .string((round(data.rows[i]["insiderx_price"]) || "N/A") + "");
                ws.cell(i + 2, 9)
                    .string((round(data.rows[i]["unc_price"]) || "N/A") + "");
                ws.cell(i + 2, 10)
                    .string(data.rows[i]["insiderx_pharmacy"] || pharmacies[data.rows[i]["rank"]]);
                ws.cell(i + 2, 11)
                    .string((round(data.rows[i]["goodrx_price"]) || "N/A") + "");
                ws.cell(i + 2, 12)
                    .string(data.rows[i]["goodrx_pharmacy"] || pharmacies[data.rows[i]["rank"]]);
                ws.cell(i + 2, 13)
                    .string((round(data.rows[i]["pharm_price"]) || "N/A") + "");
                ws.cell(i + 2, 14)
                    .string(data.rows[i]["pharm_pharmacy"] || pharmacies[data.rows[i]["rank"]]);
                ws.cell(i + 2, 15)
                    .string((round(data.rows[i]["wellrx_price"]) || "N/A") + "");
                ws.cell(i + 2, 16)
                    .string(data.rows[i]["wellrx_pharmacy"] || pharmacies[data.rows[i]["rank"]]);
                ws.cell(i + 2, 17)
                    .string((round(data.rows[i]["medimpact_price"]) || "N/A") + "");
                ws.cell(i + 2, 18)
                    .string(data.rows[i]["medimpact_pharmacy"] || pharmacies[data.rows[i]["rank"]]);
                ws.cell(i + 2, 19)
                    .string((round(data.rows[i]["blink_price"]) || "N/A") + "");
                ws.cell(i + 2, 20)
                    .string(data.rows[i]["blink_pharmacy"] || pharmacies[data.rows[i]["rank"]]);
                ws.cell(i + 2, 21)
                    .string((round(data.rows[i]["singlecare_price"]) || "N/A") + "");
                ws.cell(i + 2, 22)
                    .string(data.rows[i]["singlecare_pharmacy"] || pharmacies[data.rows[i]["rank"]]);
                ws.cell(i + 2, 23)
                    .string((round(data.rows[i]["recommended_price"]) || "N/A") + "");
                ws.cell(i + 2, 24)
                    .string((round(data.rows[i]["recommended_price"] - data.rows[i]["insiderx_price"]) || "N/A") + "");
            }
        } catch (err) {
            console.log(err);
        }
    }


    // Create file name (node Date gives month from 0-11, hence + 1)
    let date = new Date();
    let filename = `report-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

    wb.write(filename, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("wrote excel file");
        }
    });

    await fs.readFile(filename, (err, data) => {
        if (err) {
            throw err;
        } else {
            upload(data, filename);
            process.exit();
        }
    });

}

const report_query = "select g.* from (select distinct on (f.drug_id, f.rank) f.* from (select p1.id, p1.name, p1.drug_id, p1.rank, p1.dosage_strength, p1.quantity, p1.ndc, p1.gsn, p1.recommended_price, p1.zip_code,\n" +
    "\tcoalesce(p1.unc_price, p2.unc_price) as unc_price, \n" +
    "\tcoalesce(p1.insiderx_price, p2.insiderx_price) as insiderx_price,\n" +
    "\tcoalesce(p1.insiderx_pharmacy, p2.insiderx_pharmacy) as insiderx_pharmacy,\n" +
    "\tcoalesce(p1.pharm_price, p2.pharm_price) as pharm_price,\n" +
    "\tcoalesce(p1.pharm_pharmacy, p2.pharm_pharmacy) as pharm_pharmacy,\n" +
    "\tcoalesce(p1.wellrx_price, p2.wellrx_price) as wellrx_price,\n" +
    "\tcoalesce(p1.wellrx_pharmacy, p2.wellrx_pharmacy) as wellrx_pharmacy,\n" +
    "\tcoalesce(p1.medimpact_price, p2.medimpact_price) as medimpact_price,\n" +
    "\tcoalesce(p1.medimpact_pharmacy, p2.medimpact_pharmacy) as medimpact_pharmacy,\n" +
    "\tcoalesce(p1.singlecare_price, p2.singlecare_price) as singlecare_price,\n" +
    "\tcoalesce(p1.singlecare_pharmacy, p2.singlecare_pharmacy) as singlecare_pharmacy,\n" +
    "\tcoalesce(p1.singlecare_price, p2.singlecare_price) as singlecare_price,\n" +
    "\tcoalesce(p1.singlecare_pharmacy, p2.singlecare_pharmacy) as singlecare_pharmacy,\n" +
    "\tcoalesce(p1.goodrx_price, p2.goodrx_price) as goodrx_price,\n" +
    "\tcoalesce(p1.goodrx_pharmacy, p2.goodrx_pharmacy) as goodrx_pharmacy,\n" +
    "\tcoalesce(p1.blink_price, p2.blink_price) as blink_price,\n" +
    "\tcoalesce(p1.blink_pharmacy, p2.blink_pharmacy) as blink_pharmacy\n" +
    "from (\n" +
    "Select ROW_NUMBER() OVER (ORDER BY s.name) AS id , *\n" +
    "from (           (\n" +
    "    SELECT\n" +
    "      t.name, t.rank, t.drug_id, t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM \n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 0 \n" +
    "      order by name) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.rank,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price,t.unc_price, t.zip_code\n" +
    "    ORDER BY t.name, t.dosage_strength\n" +
    "    )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 1\n" +
    "      order by drug_id) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 2) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 3) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.rank, price.unc_price\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 4) t\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )) s\n" +
    " ORDER BY name ,dosage_strength, rank  \n" +
    ") p1 full outer join (\n" +
    "Select ROW_NUMBER() OVER (ORDER BY s.name) AS id , *\n" +
    "from (           (\n" +
    "    SELECT\n" +
    "      t.name, t.rank, t.drug_id, t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM \n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 0 \n" +
    "      order by name) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.rank,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price,t.unc_price, t.zip_code\n" +
    "    ORDER BY t.name, t.dosage_strength\n" +
    "    )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 1\n" +
    "      order by drug_id) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 2) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.unc_price, price.rank\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 3) t\n" +
    "\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )\n" +
    "  union all\n" +
    "    (SELECT\n" +
    "      t.name, t.rank, t.drug_id,\n" +
    "      t.dosage_strength, t.quantity, t.ndc, t.gsn, t.recommended_price, t.zip_code, t.unc_price,\n" +
    "      max(case when t.program_id = 0  then t.price end) AS insiderx_price,\n" +
    "      max(case when t.program_id = 0  then t.pharmacy end) AS insiderx_pharmacy,\n" +
    "      max(case when t.program_id = 1  then t.price end) AS pharm_price,\n" +
    "      max(case when t.program_id = 1  then t.pharmacy end) AS pharm_pharmacy,\n" +
    "      max(case when t.program_id = 2  then t.price end) AS wellrx_price,\n" +
    "      max(case when t.program_id = 2  then t.pharmacy end) AS wellrx_pharmacy,\n" +
    "      max(case when t.program_id = 3  then t.price end) AS medimpact_price,\n" +
    "      max(case when t.program_id = 3  then t.pharmacy end) AS medimpact_pharmacy,\n" +
    "      max(case when t.program_id = 4  then t.price end) AS singlecare_price,\n" +
    "      max(case when t.program_id = 4  then t.pharmacy end) AS singlecare_pharmacy,\n" +
    "      max(case when t.program_id = 6  then t.price end) AS goodrx_price,\n" +
    "      max(case when t.program_id = 6  then t.pharmacy end) AS goodrx_pharmacy,\n" +
    "      max(case when t.program_id = 5  then t.price end) AS blink_price ,\n" +
    "      max(case when t.program_id = 5  then t.pharmacy end) AS blink_pharmacy\n" +
    "    FROM\n" +
    "      ( SELECT drug_master.name, drug_master.id as drug_id, drug_master.ndc, drug_master.gsn, drug_master.zip_code, price.price, price.program_id,\n" +
    "        drug_master.quantity, drug_master.dosage_strength, price.recommended_price , price.pharmacy , price.rank, price.unc_price\n" +
    "      from report_drugs full outer join price on  price.id = report_drugs.price_id\n" +
    "        full outer join drug_master on price.drug_details_id = drug_master.id\n" +
    "      where report_drugs.report_id = $1 and drug_master.zip_code = $2 and price.rank = 4) t\n" +
    "    GROUP BY t.name , t.dosage_strength,t.drug_id, t.quantity, t.ndc, t.gsn, t.recommended_price, t.unc_price, t.zip_code,t.rank\n" +
    "    ORDER BY t.name, t.dosage_strength )) s\n" +
    "where s.unc_price is not null ORDER BY name ,dosage_strength, rank  \n" +
    ") p2 on p1.rank = p2.rank and p1.drug_id = p2.drug_id ) f ) g order by g.name, g.ndc, g.rank\n";

// Lambda handler
exports.myhandler = handler;
// Node.js handler
module.exports = handler;