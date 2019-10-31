const xl = require('excel4node');
const mongoose = require('mongoose');
mongoose.connect('mongodb://54.81.21.172:27017/rxwave_testing',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;
const GoodRxIdSchema = new Schema({
    id: ObjectId,
    drugName: String,
    drugForm: String,
    dosageStrength: String,
    dosageStrengthNum: {type: Number, default: 0},
    dosageStrengthUnit: {type: String, default: ''},
    volumeNum: {type: Number, default: 0},
    volumeUnit: {type: String, default: ''},
    quantity: Number,
    gsn: String,
    ndc: String,
    goodRxId: String,
    url: String
});
const GoodRxIdModel = mongoose.model('GoodRxId', GoodRxIdSchema);

function writeExcel() {
  GoodRxIdModel.aggregate(
    {},
    
  )
  
  GoodRxIdModel.find({}, function(err, data) {
    if (err) console.log(err);
    else {
      var wb = createDoc(data);
      wb.write('Test.xlsx');
      console.log("done.");
      process.exit();
    }
  });

  // console.log(data);

}

function createDoc(data) {
  var wb = new xl.Workbook();
  var ws = wb.addWorksheet('Sheet 1');
  var style = wb.createStyle({
    font: {
      color: "#FFFFFF"
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#5b9ad5',
      fgColor: '#5b9ad5'
    }
  })

  // headers
  ws.cell(1,1)
    .string('DrugName')
    .style(style);
  ws.cell(1,2)
    .string('GSN')
    .style(style);
  ws.cell(1,3)
    .string('NDC')
    .style(style);
  ws.cell(1,4)
    .string('GoodRxID')
    .style(style);
  ws.cell(1,5)
    .string('DosageStrength')
    .style(style);
  ws.cell(1,6)
    .string('DosageNum')
    .style(style);
  ws.cell(1,7)
    .string('DosageUnit')
    .style(style);
  ws.cell(1,8)
    .string('VolumeNum')
    .style(style);
  ws.cell(1,9)
    .string('VolumeUnit')
    .style(style);
  ws.cell(1,10)
    .string('Quantity')
    .style(style);
  ws.cell(1,11)
    .string('URL')
    .style(style);

  for (let i = 0; i < data.length; i++) {
    ws.cell(i+2, 1)
      .string(data[i].drugName);
    ws.cell(i+2, 2)
      .string(data[i].gsn);
    ws.cell(i+2, 3)
      .string(data[i].ndc);
    ws.cell(i+2, 4)
      .string(data[i].goodRxId + "");
    ws.cell(i+2, 5)
      .string(data[i].dosageStrength);
    ws.cell(i+2, 6)
      .string(data[i].dosageStrengthNum + "");
    ws.cell(i+2, 7)
      .string(data[i].dosageStrengthUnit);
    ws.cell(i+2, 8)
      .string(data[i].volumeNum + "");
    ws.cell(i+2, 9)
      .string(data[i].volumeUnit);
    ws.cell(i+2, 10)
      .string(data[i].quantity + "");
    ws.cell(i+2, 11)
      .string(data[i].url);
  }

  return wb;
}

writeExcel();