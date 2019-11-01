import { Drug, DrugModel, DrugArrayModel } from './drugs';
import * as fs from 'fs';
import * as fetch from 'node-fetch';
import * as new_drugs from '../new_drugs.json';

function timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateUrl(drug: DrugModel): string {
    const base = "https://www.goodrx.com/";
    let url = base + drug.drugName.toLowerCase().replace(/\ +/g, "-");
    // let label_override = "?label_override=" + drug.drugName.toLowerCase().split(" ")[0];
    let form: string;
    if (drug.drugForm !== "") {
        form = "?form=" + drug.drugForm.toLowerCase().replace(/\ +/g, "-") + "&";
    } else {
        form = "?";
    }
    let dosage = "dosage=" + drug.dosageStrength.toLowerCase().replace(/\ +/g, "-");
    let quantity = "&quantity=" + drug.quantity;

    return url + form + dosage + quantity;
}

export function extractId(text: string): string {
    const start_index = text.indexOf("drug_id=") + 8;
    const end_index = start_index + text.substring(start_index).indexOf("&");

    if (end_index - start_index < 15) {
        let id = text.substring(start_index, end_index);
        console.log(id);
        return id;
    } else {
        console.log('error')
        return null;
    }
}

export function getDrugId(drug: DrugModel): Promise<Response> {
    const url = generateUrl(drug);

    return new Promise<Response>(resolve => {
        fetch(url, {
            method: 'get',
            headers: {
                "Connection": "keep-alive",
                "host": "www.goodrx.com",
                "Referer": "https://www.goodrx.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"
            }
        }).then((response: Response) => {
            resolve(response)
        })
    });
}

async function asyncForEach(array: any[], callback: Function) {
    for (let index = 0; index < array.length; index++ ) {
        await callback(array[index], index, array);
    }
}

export async function runTest(): Promise<void> {
    console.log("Running test...");

    const ids = [];
    const drugsArray: DrugArrayModel = new DrugArrayModel();
    drugsArray.drugs = JSON.parse(JSON.stringify(new_drugs));
    fs.truncateSync('../grx_ids.json');
    console.log("Cleared json output file");

    await asyncForEach(drugsArray.drugs, async (drug: DrugModel) => {
        const url = generateUrl(drug);
        const id = await getDrugId(drug)
            .then((response) => response.text())
            .then((text) => extractId(text))
            .catch((error) => { console.log(error) })
        console.log(id);
        ids.push(id);
        await timeout(7500);
    });

    console.log("NUM IDS: " + ids.length);
}