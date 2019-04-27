/**
 * Schema representing Doctor Profile details.
 *
 * @module Doctor
 */
// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;

var DoctorAddressSchema = new Schema({
    address: String,
    area: String,
    city: String,
    state: String,
    country: String,
    zipcode: String
});

var DoctorContactSchema = new Schema({
    workphone: String,
    homephone: String,
    mobilephone: String,
    alternatephone: String,
    emailid: String,
    weburl: String
});

var DoctorSchema = new Schema({
    /** externalid {string} has to be unique */
    externalid: {type :String, index: true},       
    /** Code {string} has to be unique */
    code: { type: String, required: true, index: true },
    /** Name {string} Defines the Full Name Of user*/
    name: { type: String, required: true, index: true },
    /** lastname {string} defines the last name given to the user -- lname in PROVIDER file*/
    lastname: String,

    /** dateofbirth  {Date} - Date of birth -- birth in PROVIDER file*/
    dateofbirth: Date,
    /** providertypeuid {ObjectId} - referencedomain code : PROVIDERTYPE -- providertype in PROVIDER file*/
    //providertypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },

    /** Print Name {string} Defines the name to be printed in certificates report, etc*/
    printname: { type: String },
    /** specialtyuid {ObjectId} - reference value for the 'Doctor Specialty' - code SPECIALTY*/
    specialtyuid: { type: Schema.ObjectId, ref: 'ReferenceValue', index: true },

    /** location {String} - location of the doctor for appointment */
    location : String,
    
    /** worktype {String} - Interface - Work Type of the user or doctor */
    worktype : String,
    /** nationality {String} - Interface - nationality of the doctor */
    nationality : String ,
    /** status {String} - Interface - Employment status of the doctor */
    status : String,
    
    /** description {string} - comments or text with additional details */
    description: String,
    /** activefrom {Date} - start date for the user */
    activefrom: Date,
    /** activeto {Date} - end date or expiry date for the user. Can be null for active departments. */
    activeto: Date,
    /** titleuid {ObjectId} - reference value for the 'TITLE'*/
    titleuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** genderuid {ObjectId} - reference value for the 'GENDER'*/
    genderuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** qualification {String} - field for storing the qualification details. Can be printed in documents*/
    qualification: String,
    /** licensenumber {String} - the practising license number for the doctors*/
    licensenumber: String,
    /** licenseissuedate {Date} - the practising license issue date for the doctors*/
    licenseissuedate: Date,
    /** licenseexpirtydate {Date} - the practising license expiry date for the doctors*/
    licenseexpirtydate: Date,
    /** primarydeptuid {ObjectId} - Main department of the doctor*/
    primarydept: { type: String },
    /** doctorfeetypeuid {ObjectId} - reference value for the 'Doctor Fee type' - code DFFEET*/
    //doctorfeetypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** iscareprovider {Boolean} - whether the user is  a doctor */
    iscareprovider: Boolean,
    /** isopconsultant {Boolean} - whether the OPD patients can be registered for this doctor  */
    isopconsultant: Boolean,
    /** isadmitconsultant {Boolean} - whether the IPD patients can be admitted for this doctor  */
    isadmitconsultant: Boolean,
    /** issurgeon {Boolean} - whether the surgery booking / records can be made for this doctor  */
    issurgeon: Boolean,
    /** isanaesthetist {Boolean} - whether the doctor is an anaesthetist  */
    isanaesthetist: Boolean,
    /** isradiologist {Boolean} - whether the doctor is an radiologist  */
    isradiologist: Boolean,
    /** islaboratorist {Boolean} - whether is an islaboratorist  */
    islaboratorist: Boolean,
    /** address {DoctorAddressSchema} - address of the Doctor */
    address: DoctorAddressSchema,
    /** contact {DoctorContactSchema} - contact details of the user such as phone, weburl, etc */
    contact: DoctorContactSchema,
    /** isgstregistered {Boolean} - whether the doctor is tax registered */
    isgstregistered: Boolean,
    /** gstregno {String} - tax registration number */
    gstregno: String,
    /** businessregno {String} - business registration number */
    businessregno: String,
    /** companyname {String} - company name used for tax registration purposes */
    companyname: String,
    /** companyaddress {String} - address of the company */
    companyaddress: String,
    /** activefrom {Date} - start date for the gst */
    //gstactivefrom: Date,
    /** activeto {Date} - end date or expiry date for the gst. Can be null for active departments. */
    //gstactiveto: Date,
    /** doctorimageuid {ObjectId} - link to the photograph of the doctor*/
    doctorimageuid: { type: Schema.ObjectId, ref: 'DoctorImage' },
    /** URLS , Links  */
    doctorurls: String, 
    /** Education links */
    EducationLinks: String, 
    /** visitingorgs {[ObjectId]} - various organisations in this group in which the doctor consults*/
    visitingorgs: [{
        name: String,
        activefrom: Date,
        activeto: Date
    }],


    //titlelocaluid: { type: Schema.ObjectId, ref: 'ReferenceValue' },

    firstnamelocal : String,

    lastnamelocal : String,

    fullnamelocal : String,

    fullname : String,

    suffix : String,
});

DoctorSchema.plugin(resuable);

module.exports = mongoose.model('Doctor', DoctorSchema,'doctor');