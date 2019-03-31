/**
 * Schema representing Patient Image.
 * The PatientImage schema stores photograph of the patient.
 *
 * @module PatientImage
 */
// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;
// create an export function to encapsulate the model creation

  // define schema
  var PatientImageSchema = new Schema({
    /** patientuid {ObjectId} - reference to the Patient Schema */
    patientuid: { type: Schema.ObjectId, ref: 'Patient', required: true, index: true },    
    comments : String,
    patientphoto: {data: Buffer, contentType: String},
    
  });
  
 PatientImageSchema.plugin(resuable);
 
 module.exports = mongoose.model('PatientImage', PatientImageSchema,'patientimage');
