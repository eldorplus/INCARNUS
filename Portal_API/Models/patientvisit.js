/**
 * Schema representing Patient Visit.
 * The PatientVisit schema stores the all the detail such as department, doctor, payor etc of each OPD or IP visit of the patient.
 *
 * @module PatientVisit
 */
// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;

// create an export function to encapsulate the model creation
var PatientVisitCareprovider = new Schema({
    department: { type: String },
    //visittypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    careprovideruid: { type: Schema.ObjectId, ref: 'Doctor' },
    startdate: { type: Date , index: true },
    clinic: { type: String },
    comments: { type: String },
    //statusuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    //outcomeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** entypeuid {ObjectId} - type of the encounter - referencedomain code : ENTYPE  */
    //entypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    isprimarycareprovider: Boolean,
    queuenumber: { type: String },
    enddate: { type: Date , index: true  }
});

var PatientVisitSchema = new Schema({
    /** patientuid {ObjectId} - reference to the Patient Schema */
    patientuid: { type: Schema.ObjectId, ref: 'Patient', required: true, index: true },
    /** entypeuid {ObjectId} - type of the encounter - referencedomain code : ENTYPE  */
    //entypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** visitid {String} - unique sequence number generated for this visit */
    visitid: { type: String, required: true, index: true  },
    /** visitstatusuid {ObjectId} - status of the visit - referencedomain code : VSTSTS */
    //visitstatusuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** startdate {Date} - date time stamp made when the patient visit is created (registration / admission) */
    startdate: { type: Date, required: true, index: true },
    /** enddate {Date} - date time stamp when the patient is discharged */
    enddate: { type: Date },
    
    /** visitcareproviders {PatientVisitCareprovider}  - contains the associated department, doctor details  for this patient visit */
    visitcareproviders: [PatientVisitCareprovider]

});


PatientVisitSchema.plugin(resuable);
module.exports = mongoose.model('PatientVisit', PatientVisitSchema, "patientvisit");