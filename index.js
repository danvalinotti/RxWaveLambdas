// const handler = require('./masterLambda');
// const promise = handler();
const handler = require('./insiderx');
const promise = handler().then(() => {
    console.log("Done");
}).catch((error) => console.log(error));

// const handler = require('./reportGen');
//
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));

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