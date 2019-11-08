const handler = require('./uspharmacy');
const promise = handler().then(() => {
    console.log("Done");
}).catch((error) => console.log(error));