// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;
// create an export function to encapsulate the model creation

// define schema
var PatientDocumentSchema = new Schema({
    /** documenttypeuid {ObjectId} - reference domain - PDOCTY */
    documenttypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** scanneddocument {Buffer} - binary data upto 4 MB maximum size */
    scanneddocument: { type: Buffer },
    /** documentname {string}  */
    documentname: String,
    /** comments {string}  */
    comments: String,
    /** filetype {string}  */
    filetype: String
});

PatientDocumentSchema.plugin(resuable);

module.exports = mongoose.model('PatientDocument', PatientDocumentSchema,'patientdocument');