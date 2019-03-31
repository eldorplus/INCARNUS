// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;
// create an export function to encapsulate the model creation

// define schema
var PatientReportSchema = new Schema({
    /** patientuid {ObjectId} - reference to the Patient Schema */
    patientvisituid: { type: Schema.ObjectId, ref: 'patientvisit', required: true, index: true },
    /** documenttypeuid {ObjectId} - reference domain - PRDOCTY -- NEW */
    documenttypeuid: { type: String },
    /** documentname {string}  */
    documentname: { type: String, required: true, index: true  },
    /** reportdocument {Buffer} - binary data upto 4 MB maximum size -- Prescription, Lab report, Radiology report, bills, receipts */
    reportdocument: { type: Buffer },
    /** comments {string}  */
    comments: String,
    /** filetype {string}  */
    filetype: String
});

PatientReportSchema.plugin(resuable);

module.exports = mongoose.model('PatientReport', PatientReportSchema,'patientreport');