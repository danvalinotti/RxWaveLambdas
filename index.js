const handler = require('./insiderx');
const promise = handler().then(() => {
    console.log("Done");
}).catch((error) => console.log(error));