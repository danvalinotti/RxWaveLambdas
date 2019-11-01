function generateUrl(drug) {
  const base = "https://www.goodrx.com/";
  let packageDesc = drug.PACKAGE_DSC;
  let quantity = ''
  let form = ''
  let dosage = ''
  let name = '';
  // console.log(packageDesc)
  
  switch (packageDesc) {
    case "AER BR.ACT":
      name = drug.BrandName.split(" ")[0].toLowerCase();
      form = "redihaler";
      dosage = "10.6g-of-" + drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
      quantity = 1;
      break;
    case "AER W/ADAP":
      switch (drug.BrandName) {
        case "AIRDUO RESPICLICK":
          name = drug.BrandName.split(" ")[0].toLowerCase();
          form = drug.BrandName.split(" ")[1].toLowerCase();
          dosage = "0.45g-of-" + 
                drug.Strength.split("-")[0] + "mcg-" +
                drug.Strength.split("-")[1].toLowerCase().replace(" ", "-");
          quantity = 1;
          break;
        case "COMBIVENT RESPIMAT":
          name = drug.BrandName.split(" ")[0].toLowerCase();
          form = drug.BrandName.split(" ")[1].toLowerCase().replace(" ", "") + "-inhaler";
          dosage = "120-doses-of-" +
                drug.Strength.split("-")[0].toLowerCase() + "mcg-" +
                drug.Strength.split("-")[1].toLowerCase().replace(" ", "");
          quantity = 1;
          break;
        case "FLOVENT HFA":
          name = drug.BrandName.split(" ")[0].toLowerCase();
          form = drug.BrandName.split(" ")[0].toLowerCase().replace(" ", "") + "-inhaler";
          dosage = drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
          quantity = 1;
          break;
        case "PROAIR RESPICLICK":
          name = drug.BrandName.split(" ")[0].toLowerCase();
          form = drug.BrandName.split(" ")[1].toLowerCase().replace(" ", "") + "-inhaler";
          dosage = "8.5g-of-" + drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
          quantity = 1;
          break;
        case "QVAR":
          name = "qvar";
          form = "redihaler";
          dosage = "10.6g-of-" + drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
          quantity = 1;
          break;
        case "SPIRIVA RESPIMAT":
          name = drug.BrandName.split(" ")[0].toLowerCase();
          form = drug.BrandName.split(" ")[1].toLowerCase().replace(" ", "") + "-inhaler";
          dosage = "60-doses-of-" + drug.STRENGTH_MSR + + drug.STRENGTH_UNIT_TXT.toLowerCase() + "-per-actuation"
          quantity = 1;
          break;
        case "STIOLTO RESPIMAT":
          name = drug.BrandName.split(" ")[0].toLowerCase();
          form = drug.BrandName.split(" ")[1].toLowerCase().replace(" ", "") + "-inhaler";
          dosage = "60-inhalations-of-" + drug.Strength.split("-")[1].toLowerCase();
          quantity = 1;
          break;
        case "STRIVERDI RESPIMAT":
          name = drug.BrandName.split(" ")[0].toLowerCase();
          form = drug.BrandName.split(" ")[1].toLowerCase().replace(" ", "") + "-inhaler";
          dosage = "60-doses-of-" + drug.STRENGTH_MSR + + drug.STRENGTH_UNIT_TXT.toLowerCase() + "-actuation";
          quantity = 1;
          break;
        case "SYMBICORT":
          name = drug.BrandName.toLowerCase();
          form = "inhaler";
          dosage = "120-doses-of-" + drug.Strength.split("-")[0] + "mcg-" + drug.Strength.split("-")[1].toLowerCase();
          quantity = 1;
          break;
        case "XHANCE":
          name = drug.BrandName.toLowerCase();
          form = "nasal-spray";
          dosage = "16ml-of-" + drug.Strength.replace(" ", "").toLowerCase();
          quantity = 1;
          break;
      } break;
    case "BLIST PACK":
      name = drug.BrandName.replace(" ", "-").toLowerCase();
      quantity = 1;
      const subform = drug.DrugName.split(" ")[drug.DrugName.split(" ").length - 1];
      // if (drug.BrandName === "GRASTEK") {
      //   console.log(subform);
      // }
      if (subform === "CAPSULE") {
        form = "capsule";
        dosage = drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
      } else if (subform === "INH") {
        form = "inhaler";
        dosage = drug.PACKAGE_SIZE_QTY + `-blisters-of-${
          (drug.Strength.includes("-")) 
            ? drug.Strength.split("-")[0] + "mcg-" + drug.Strength.split("-")[1].toLowerCase()
            : drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase()
          }`;
      } else if (subform === "TABLET" ) {
        form = "package";
        name = drug.BrandName.replace(" ", "-").toLowerCase();
        if (drug.Strength.includes("(")) {
          dosage = drug.PACKAGE_SIZE_QTY + "-tablets";
          quantity = 1;
        } else if (drug.Strength.includes("-") && !drug.Strength.includes("(")) {
          dosage = drug.Strength.toLowerCase();
          quantity = drug.PACKAGE_SIZE_QTY;
        } else {
          dosage = drug.PACKAGE_SIZE_QTY + "-sublingual-tablets-of-" + drug.Strength.toLowerCase().replace(" ", "-");
          quantity = 1;
        }
      } else if (end === "INFATAB") {
        form = "chewable-tablet";
        dosage = drug.Strength.replace(" ", "").toLowerCase();
      } else if (subform === "PACK") {
        let dArr = drug.Strength.split("-");
        form = "kit";
        dosage = "30-day-of-" + dArr[0] + "mg-" + dArr[1] + "mg-" + dArr[2] + "mg";
        quantity = 1;
      } else if (subform === "TAB") {
        form = "dose-pack";
        dosage = "30-sublingual-tablets-of-" + drug.Strength.replace(" ", "-").toLowerCase();
        quantity = 1;
      } else if (subform ==="DOSE)") {
        form = "dose-pack";
        dosage = "2-tablets-of-" + drug.Strength.replace(" ", "").toLowerCase();
        quantity = 1;
      } else if (subform === "SOLUTION") {
        form = "box";
        dosage = drug.PACKAGE_SIZE_QTY + "-vials-of-" + drug.Strength.replace("%", "%25");
        quantity = 1;
      } else if (subform === "DISKUS") {
        form = subform.toLowerCase() + "-inhaler";
        dosage = drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
        quantity = 1;
      } break;
    case "BOTTLE":
      name = drug.BrandName.replace(" ", "-").toLowerCase();
      quantity = 1;
      let end = drug.DrugName.split(" ")[drug.DrugName.split(" ").length - 1];
      // console.log(end);
      
      if (end === "LOTION" || end === "SHAMPOO") {
        form = "bottle-of-" + end.toLowerCase();
        dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.Strength.replace("%", "%25")
      } else if (end.includes("CAP")) {
        form = "capsule";
        if (drug.Strength.includes("-")) {
          let dArr = drug.Strength.split("-");
          dosage = dArr[0] + "mg-" + dArr[1] + "mg-" + dArr[2] + "mg";
        } else {
          dosage = drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
        }
      } else if (end === "TABLET") {
        form = "tablet";
        if (drug.Strength.includes("-")) {
          dosage = drug.Strength.replace("-", "mg-").toLowerCase() + "mg"; 
        } else {
          dosage = drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
        }
      } else if (end === "PUMP") {
        form = "gel-pump";
        let dArr = drug.Strength.replace(" ", "").split("-");
        if (drug.Strength.includes("-")) {
          dosage = drug.PACKAGE_SIZE_QTY + "-of-" + dArr[0].replace("%", "%25") + "-" + dArr[1].replace("%", "%25");
        } else {
          dosage =  drug.PACKAGE_SIZE_QTY + "-of-" + dArr[0].replace("%", "%25");
        }
      } else if (end === "SPRAY") {
        form = "bottle-of-spray";
        let dArr = drug.Strength.replace(" ", "").split("-");
        dosage =  drug.PACKAGE_SIZE_QTY + "ml-of-" + dArr[0].replace("%", "%25");
      } else if (end === "INFATAB") {
        form = "chewable-tablet";
        dosage = drug.Strength.replace(" ", "").toLowerCase();
      } else if (end === "SUSP" || end === "SUSPENSION") {
        if (name.includes('dyanavel')) {
          form = "oral-suspension"
        } else {
          form = "bottle-of-oral-suspension"
        }
        dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.STRENGTH_MSR + "mg-" + drug.VOLUME_MSR + "ml";
      } else if(end === "CONC") {
        form = "bottle-of-oral-solution";
        dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.Strength.toLowerCase().replace("/", "-");
      } else if (end === "GEL") {
        let percent = drug.DrugName.split(" ")[drug.DrugName.split(" ").length - 2];
        form = "gel-pump";
        dosage = drug.PACKAGE_SIZE_QTY + "g-of-" + percent.replace("%", "%25");
      } else if (end === "MG" || end === "TB") {
        form = "tablet";
        dosage = drug.Strength.toLowerCase();
        quantity = drug.PACKAGE_SIZE_QTY;
      } else if (end === "0.75%") {
        form = "bottle-of-lotion";
        dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.Strength + "25";
      } break;
    case "BOX":
      let nameSplit = drug.BrandName.split(" ");
      name = nameSplit[0].replace(" ", "-").toLowerCase();
      quantity = 1;

      if (nameSplit.length > 1) {
        if (nameSplit[1] === "FASTCLIX") {
          form = "lancing-device";
          dosage = "fastclix";
        } else if (nameSplit[1] === "GUIDE") {
          form = "test-strip";
          dosage = "guide";
          quantity = drug.PACKAGE_SIZE_QTY;
        } else if (nameSplit[1] === "ULTRA") {
          form = "test-strip";
          dosage = "ultra-blue";
          quantity = drug.PACKAGE_SIZE_QTY;
        } else {
          form = "kit";
          dosage = drug.PACKAGE_SIZE_QTY + "-units";
        }
      } else {
        name = drug.BrandName.replace(" ", "-").toLowerCase();
        if (drug.Strength.includes("%")) {
          form = "patch";
          dosage = drug.Strength.replace("0", "") + "25";
          quantity = drug.PACKAGE_SIZE_QTY;
        } else {
          form = "carton";
          dosage = drug.PACKAGE_SIZE_QTY + "-once-weekly-patches-of-" + drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.replace("/24h", "-day").toLowerCase();
        }
      } break;
    case "CANISTER":
      let nameSplit1 = drug.BrandName.split(" ");
      name = nameSplit1[0].toLowerCase();
      quantity = 1;

      if (nameSplit1.length > 1) {
        form = nameSplit1[1].toLowerCase();
        if (form === "children") {
          form = "inhaler";
        } else if (form === "hfa") {
          form = "hfa-inhaler";
        }
        if (drug.Strength.includes("-")) {
          let dArr = drug.Strength.split("-");
          form = "diskus-inhaler"
          dosage = dArr[0] + "mcg-" + dArr[1].toLowerCase();
        } else {
          if (nameSplit1[1] === "FLEXHALER") {
            form = "flexhaler";
            dosage = drug.Strength.toLowerCase().replace(" ", "-");
          } else {
            dosage = drug.PACKAGE_SIZE_QTY + "g-of-" + drug.Strength.replace(" ", "").toLowerCase();
          }
        }
      } else {
        form = "inhaler";
        dosage = drug.PACKAGE_SIZE_QTY + "g-of-" + drug.Strength.replace(" ", "").toLowerCase();
      } break;
    case "CARTRIDGE":
      name = drug.BrandName.toLowerCase();
      let psq = drug.PACKAGE_SIZE_QTY;
      quantity = 1;

      if (psq === 1) {
        if (drug.Strength.includes("/")) {
          dosage = drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
          form = "cartridge";
        } else {
          dosage = "1-cartridge-of-" + drug.Strength.toLowerCase().replace(" ", "");
          form = "kit";
        }
      } else {
        dosage = psq + "-miniquick-devices-of-" + drug.STRENGTH_MSR + drug.STRENGTH_UNIT_TXT.toLowerCase();
        form = "package";
      } break;
    case "DROP BTL":
      name = drug.BrandName.toLowerCase();
      quantity = 1;
      form = "eye-dropper";
      dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.Strength + "25";
      break;
    case "JAR":
      name = drug.BrandName.toLowerCase();
      form = "jar-of-gel";
      dosage = drug.PACKAGE_SIZE_QTY + "g-of-" + drug.Strength.replace(/[1-5]%/, "%25");
      quantity = 1;
      break;
    case "KIT":
      let drugSplit = drug.DrugName.split(" ");
      name = drug.BrandName.replace("-");
      form = "kit";
      quantity = 1;
      dosage = "50g-of-" + drug.Strength.split("-")[0] + `25-${drugSplit[2].toLowerCase}`;
      break;
    case "PF APPLI":
      let nameArr = drug.BrandName.toLowerCase().split(" ");
      name = nameArr[0];
      form = nameArr[2];
      dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.STRENGTH_MSR + "-units-ml";
      quantity = 1;
      break;
    case "PACKET":
      name = drug.BrandName.toLowerCase().replace(" ", "-").replace("#", "-");
      quantity = drug.PACKAGE_SIZE_QTY;
      form = "carton";
      dosage = drug.PACKAGE_SIZE_QTY + "-packets-of-" + drug.STRENGTH_MSR + `-${drug.STRENGTH_UNIT_TXT.toLowerCase().replace(" ", "-")}`;
      break;
    case "SYRINGE":
      name = drug.BrandName.toLowerCase().replace(" ", "-");
      let nameArr3 = drug.BrandName.toLowerCase().split(" ");
      let formIndex = nameArr3.indexOf("kwikpen");
      dosage = `${drug.PACKAGE_SIZE_QTY}ml-of-${drug.STRENGTH_MSR}-${drug.STRENGTH_UNIT_TXT === "UNIT" ? 'units' : drug.STRENGTH_UNIT_TXT.toLowerCase()}-${drug.VOLUME_UNIT_TXT}`

      if (formIndex !== -1) {
        form = nameArr3[formIndex];
        quantity = 5;
      } else if (nameArr3.length > 1) {
        if (nameArr3[0] === "bydureon") {
          name = nameArr3[0];  
          quantity = 1;
          if (nameArr3[1] === "bcise") {
            form = "carton";
            dosage = `4-pens-of-${drug.Strength.toLowerCase().replace("/", "-")}`
          } else {
            form = "kit";
            dosage = `4-pens-of-${drug.STRENGTH_MSR}${drug.STRENGTH_UNIT_TXT.toLowerCase()}-pen`;
          }
        } else if (nameArr3[0] === 'emgality') {
          form = nameArr3[1];
          dosage = drug.Strength.replace(" ", "-").replace("/", "-").toLowerCase();
          quantity = 1;
        } else if (nameArr3[0] === 'humulin') {
          name = `humulin-${nameArr3[1].replace("/", "-").toLowerCase()}`;
          form = nameArr3[2];
          quantity = 5;
          dosage = `${drug.PACKAGE_SIZE_QTY}ml-of-${drug.STRENGTH_MSR}-units-${drug.VOLUME_UNIT_TXT.toLowerCase()}`
        } else if (nameArr3[1] === "solostar") {
          quantity = 1;
          if (nameArr3[0] === "toujeo") {
            form = "carton";
            dosage = "3-prefilled-" +  drug.PACKAGE_SIZE_QTY + "-pens-of-" + drug.STRENGTH_MSR + "-units/ml";
          } else {
            form = "solostar-pen";
            dosage = drug.PACKAGE_SIZE_QTY + drug.VOLUME_UNIT_TXT.toLowerCase() + "-of-" + drug.STRENGTH_MSR + "-units/ml";
          } 
        }
      } else {
        if (name === 'symjepi') {
          quantity = 1;
          form = 'package';
          dosage = `${drug.PACKAGE_SIZE_QTY}-pre-filled-syringes-of-${drug.STRENGTH_MSR}${drug.STRENGTH_UNIT_TXT.toLowerCase()}`
        } else {
          quantity = drug.PACKAGE_SIZE_QTY;
          form = 'carton';
          dosage = `4-pens-of-${drug.Strength.replace("/", "-").toLowerCase()}ml`
        }
      }
      break;
    case "TUBE":
      name = drug.BrandName.toLowerCase().replace(" ", "-");
      let dArr = drug.DrugName.split(" ");
      
      if (dArr[dArr.length - 1] !== "KIT") {
        // form = "";
        form = `tube-of-${dArr[dArr.length - 1]}`;
        dosage = `${drug.PACKAGE_SIZE_QTY}g-of-${drug.Strength}`; 
        quantity = 1;
      } else {
        form = 'kit';
        dosage = 'two-3-ounce-tubes-of-' + drug.Strength + '25';
        quantity = 1;
      }
      break;
    case "TUBE/KIT":
      name = drug.BrandName.toLowerCase();
      form = "tube-of-cream";
      quantity = 1;
      dosage = drug.PACKAGE_SIZE_QTY + "g-of-" + drug.Strength.toLowerCase().replace(" ", "").replace("/", "-");
      break;
    case "VIAL":
      let nameArr2 = drug.BrandName.toLowerCase().split(" ");
      form = "vial";
      quantity = 1;

      if (nameArr2.length === 1) {
        name = nameArr2[0];
        if (drug.STRENGTH_UNIT_TXT === "UNIT") {
          dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.STRENGTH_MSR + "-units-ml";
        } else {
          form = "kit";
          dosage = drug.PACKAGE_SIZE_QTY + `-${name === "humatrope" ? 'cartridge' : 'pens'}-of-` + drug.Strength.toLowerCase().replace(" ", "-") + `${name === "humatrope" ? "" : "-pen"}`
        }
      } else if (nameArr2.length > 2) {
        name = nameArr2[0] + "-" + nameArr2[2];
        dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.STRENGTH_MSR + "-units-ml";
      } else {
        name = nameArr2[0] + "-" + nameArr2[1];
        dosage = drug.PACKAGE_SIZE_QTY + "ml-of-" + drug.STRENGTH_MSR + "-units-ml";
      }
      break;
    default:
      break;
  }
  
  let label_override;
  if (drug.BrandName.includes("/")) {
    label_override = capitalize(drug.BrandName.replace("/", "%2F").replace(" ", "-"));
  } else {
    label_override = capitalize(name);
  }
  
  let url = base + name + "?label_override=" + label_override;
  let formParam = "&form=" + form;
  let dosageParam = "&dosage=" + dosage;
  let quantityParam = "&quantity=" + quantity;
  
  let response = url + formParam + dosageParam + quantityParam;
  const model = {
    drugName: capitalize(name),
    drugForm: form,
    dosageStrength: deserialize(dosage),
    dosageStrengthNum: drug.STRENGTH_MSR,
    dosageStrengthUnit: drug.STRENGTH_UNIT_TXT,
    volumeNum: drug.VOLUME_MSR,
    volumeUnit: drug.VOLUME_UNIT_TXT,
    quantity: quantity,
    gsn: '' + drug.GSN,
    ndc: '' + drug.NDC11,
    goodRxId: '',
    url: response
  };
  if (name === "" || form === "" || dosage === "" || quantity === "") {
    console.log("ERROR: undefined value");
    console.log({name: name, form: form, dosage: dosage, quantity: quantity});
    return {
      url: response,
      model: {name: name, form: form, dosage: dosage, quantity: quantity},
      error: "ERROR: undefined value"
    }
  } else {
    return {
      url: response,
      model: model
    }
  }
}

function deserialize(name) {
  return name.replace("%25", "%").replace(/-/, " ");
}

function capitalize(name) {
  let n = '' + name;
  return n.charAt(0).toUpperCase() + n.slice(1);
}

module.exports = generateUrl;