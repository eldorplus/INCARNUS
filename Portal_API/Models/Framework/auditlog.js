// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');
var Schema = mongoose.Schema;

//Departments defined the speciality

// create an export function to encapsulate the model creation

// define schema


var AuditLogSchema = new Schema({
    useruid: { type: String, index: true },
    username: String,
    url: String,
    patientuid: { type: Schema.ObjectId, ref: 'Patient', index: true },
    patientvisituid: { type: Schema.ObjectId, ref: 'PatientVisit', index: true },
    patientname: String,
    dataset: { type: String, index: true },
    datasetuid: { type: Schema.ObjectId, index: true },
    datasetcode: String,
    auditdate: { type: Date, index: true },
    preaudit: String,
    postaudit: String,
    ipaddress: String

});
//need to add dept to service depts based on order categories.

AuditLogSchema.plugin(resuable);
module.exports = mongoose.model('AuditLog', AuditLogSchema);