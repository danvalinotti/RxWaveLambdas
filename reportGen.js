const xl = require('excel4node');
const report_query = require('./report_query');
const {
    Client
} = require('pg');
let db_host = process.env.DB_HOST || "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
const client = new Client({
    connectionString: db_host
});
client.connect();

function round(num) {
    return Math.round(num * 100) / 100;
}

async function handler() {
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
    let latest = await client.query("select id from report_table order by timestamp desc limit 1;\n");
    let reportId = latest.rows[0]["id"];
    console.log(`Latest report: ${reportId}`);

    for (let zip of zips) {
        console.log(`Getting prices for zip code ${zip}...`);

        try {
            let data = await client.query(report_query, [reportId, zip]);
            let ws = wb.addWorksheet(zip, {});
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

            console.log(`Finished sheet ${zip}.`);
        } catch (err) {
            console.log(err);
        }
    }

    wb.write("testReport.xlsx", function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
            console.log("done.");
            process.exit();
        }
    })
}

exports.myhandler = handler;
module.exports = handler;
