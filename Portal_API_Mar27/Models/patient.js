/**
 * Schema representing Patient Demographic details.
 * The Patient is registered in the OP, emergency or IP registration process.
  *
 * @module Patient
 */
// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;

var PatientAddressSchema = new Schema({
    address: String,
    area: String,
    city: String,
    state: String,
    country: String,
    zipcode: String
});

var PatientContactSchema = new Schema({
    workphone: String,
    homephone: String,
    mobilephone: { type: String, index: true },
    alternatephone: String,
    emailid: String,
    weburl: String
});


var PatientSchema = new Schema({
    /** mrn {String} - medical record number to be generated uniquely for the patient usine sequence number generation */
    mrn: { type: String},
    /** internalmrn {String} - same as mrn without - . Used for Searching purposes. */
    internalmrn: { type: String },
    /** firstname {String} - the first part of the name of the patient */
    firstname: { type: String, required: true, index: true },
    /** middlename {String} - the middle part of the name of the patient */
    middlename: { type: String, index: true },
    /** lastname {String} - the last part of the name of the patient */
    lastname: { type: String, index: true },
    
    /** login id {String} - mobile number of the patient */
    loginid: { type: String, required: true, index: true },

    /** password {String} - password of the user in bcrypt encrypted format */
    password: { type: String },
    /** externalpassword {String} - password of the user in md5 format for  */
    externalpassword: { type: String },
    /** isemailidverified {Boolean} - whether the user email id is verified*/
    isemailidverified: Boolean,
    /** ismobileverified {Boolean} - whether the user mobile number  is verified*/
    ismobileverified: Boolean,

    /** localfirstname {String} - the first part of local name of the patient */
    localfirstname: { type: String, index: true },
    /** localmiddlename {String} - the middle part of local name of the patient */
    localmiddlename: { type: String, index: true },
    /** locallastname {String} - the last part of local name of the patient */
    locallastname: { type: String, index: true },
    /** titleuid {ObjectId} - reference domain code : TITLE */
    titleuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** localnametitleuid {ObjectId} - reference domain code : TITLE */
    localnametitleuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** genderuid {ObjectId} - reference domain code : GENDER */
    genderuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** isvip {Boolean} - whether patient is a very important patient (VIP) - defaults to false */
    isvip: { type: Boolean },
    /** viptypeuid {ObjectId} - reference domain code : VIPTYP */
    viptypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** isanonymous {Boolean} - whether anonymity has to be maintained about this patient - default false */
    isanonymous: { type: Boolean },
    /** dateofbirth {Date} - the date of birth of the patient (original or guess) */
    dateofbirth: { type: Date },
    /** registereddate {Date} - the actual date of registration of the patient */
    registereddate: { type: Date, index: true },
    /** nationalityuid {ObjectId} - nationality of the patient reference domain code : NATNTY */
    nationalityuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** religionuid {ObjectId} - religion of the patient reference domain code : RELGON */
    religionuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** raceuid {ObjectId} - race of the patient reference domain code : RACE */
    raceuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** occupationuid {ObjectId} - occupation of the patient reference domain code : OCCUPN */
    occupationuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** patienttypeuid {ObjectId} - patient type - reference domain code : PATTYP */
    patienttypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** preflanguid {ObjectId} - preferred language of the patient - reference domain code : PRFLAN */
    preflanguid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** maritalstatusuid {ObjectId} - marital status of the patient - reference domain code : MARTST */
    maritalstatusuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** isinterpreterreqd {Boolean} - whether the patient requires interpreter - defaults to false */
    isinterpreterreqd: { type: Boolean },
    /** notes {String} - any comments, notes about the patient */
    notes: { type: String },
    /** tempmrnid {String} - Temporary MRN if used in case of temp registration */
    tempmrnid: { type: String, index: true },
    /** nationalid {String} - national universal identifier of the patient ususally issued by the government */
    nationalid: { type: String, index: true },
    /** natidexpirtydate {Date} - expiry date of the national id for the patient */
    natidexpirtydate: { type: Date },
    /** address {PatientAddressSchema} - full address of the patient including the city, state, country, zipcode  */
    address: PatientAddressSchema,
    /** contact {PatientContactSchema}  - phone, mobile and email id of the patient*/
    contact: PatientContactSchema,
    /** patientimageuid {Photo} - the photograph of the patient */
    patientimageuid: { type: Schema.ObjectId, ref: 'PatientImage' },

    /** bloodgroupuid {ObjectId} - reference domain BLDGRP*/
    bloodgroupuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** rhfactoruid {ObjectId} - reference domain RHFACT*/
    rhfactoruid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** hospitalnewstypeuids [] - Options to send hospital news to user - reference value code : NEWSTYP */
    hospitalnewstypeuids: [{
        type: Schema.ObjectId, ref: 'ReferenceValue'
    }],
    /** hospnewsexpirydate {Date} - end date or expiry date for hospital news */
    hospnewsexpirydate: Date,
    /** isemployee {Boolean} - whether the patient was hospital employee */
    isemployee: Boolean,
    patientdocuments: [{ documentuid: { type: Schema.ObjectId, ref: 'PatientDocument' } }]

});

PatientSchema.index({ internalmrn: 'text', firstname: 'text', lastname: 'text', 'contact.mobilephone': 'text', 'nationalid': 'text' });
PatientSchema.plugin(resuable);

module.exports = mongoose.model('Patient', PatientSchema, 'patient');