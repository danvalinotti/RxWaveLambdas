// const handler = require('./insiderx');
// const promise = handler().then(() => {
//     console.log("Done");
// }).catch((error) => console.log(error));

const handler = require('./goodrx');

let promise = handler().then(() => {
    console.log("Promise resolved");
}).catch((error) => console.log(error));

// const handler = require('./wellrx');
//
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));

// const handler = require('./uspharmacy');
//
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));