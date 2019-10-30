export interface DrugModel {
    drugName: string;
    drugForm: string;
    dosageStrength: string;
    quantity: number;
}

export class DrugArrayModel {
    drugs: DrugModel[]
}

export class Drug {
    drugName: string;
    drugForm: string;
    dosageStrength: string;
    quantity: number;
    id: string;

    constructor(
        public name: string,
        public type: string,
        public dosage: string,
        public qty: number,
        public grxId: string) {
            this.drugName = name;
            this.drugForm = type;
            this.dosageStrength = dosage;
            this.quantity = qty;
            this.id = grxId;
    }
}