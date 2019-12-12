// RxWave Test functions

// MASTER LAMBDA
const handler = require('./masterLambda');
const promise = handler(null, null, function() {
    console.log("Done");
    process.exit(0);
});

//// INSIDE RX
// const handler = require('./insiderx');
// const promise = handler().then(() => {
//     console.log("Done");
// }).catch((error) => console.log(error));

// // GOODRX
// const handler = require('./goodrx');
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));

// // WELLRX
// const handler = require('./wellrx');
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));

// // US PHARMACY CARD
// const handler = require('./uspharmacy');
//
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));

// // MEDIMPACT
// const handler = require('./medimpact');
//
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));

// // SINGLECARE
// const handler = require('./singlecare');
//
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));

//// BLINK HEALTH
// const handler = require('./blink');
//
// let promise = handler().then(() => {
//     console.log("Promise resolved");
// }).catch((error) => console.log(error));