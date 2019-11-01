"use strict";
exports.__esModule = true;
var DrugArrayModel = /** @class */ (function () {
    function DrugArrayModel() {
    }
    return DrugArrayModel;
}());
exports.DrugArrayModel = DrugArrayModel;
var Drug = /** @class */ (function () {
    function Drug(name, type, dosage, qty, grxId) {
        this.name = name;
        this.type = type;
        this.dosage = dosage;
        this.qty = qty;
        this.grxId = grxId;
        this.drugName = name;
        this.drugForm = type;
        this.dosageStrength = dosage;
        this.quantity = qty;
        this.id = grxId;
    }
    return Drug;
}());
exports.Drug = Drug;
