process.env.DB_HOST = "postgresql://postgres:galaxy123456@database-2.ch91gk9zmx2h.us-east-1.rds.amazonaws.com/postgres";
process.env.REGION = "ohio";
const insideRxHandler = require('./insiderx').myhandler;

async function runSuite() {
    await insideRxHandler().then(() => {
        console.log("Done");
    })
    // setTimeout(() => {
    //     console.log("Ended process");
    //     process.exit();
    // }, 300000)
}

runSuite().then(() => {
    process.exit();
});
