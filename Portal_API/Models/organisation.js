/**
 * Schema representing master data for defining a Organisation (ex: Hospital, Primary, etc) 
 * The organisation can be defined within the hospital group
 *
 * @module Organisation
 */

// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;

var EnterpriseAddressSchema = new Schema({
    address: String,
    area: String,
    city: String,
    state: String,
    country: String,
    zipcode: String
});

var EnterpriseContactSchema = new Schema({
    workphone: String,
    homephone: String,
    mobilephone: String,
    alternatephone: String,
    emailid: String,
    weburl: String

});

var OrganisationSchema = new Schema({
    /** uid {Number} has to be unique for an organisation */
    uid: { type: Number },
    /** Code {string} has to be unique */
    code: { type: String, required: true, index: true },
    /** Name {string} defines the  name given to the organisation*/
    name: { type: String, required: true, index: true },
    /** description {string} - comments or text with additional details */
    description: String,
    /** activefrom {Date} - start date for the organisation */
    activefrom: Date,
    /** activeto {Date} - end date or expiry date for the organisation . Can be null for active organisations. */
    activeto: Date,
    levelcode: String,
    /** parentorguid {ObjectId} - parent of this organisation in a hospital group*/
    parentorguid: { type: Schema.ObjectId, ref: 'Organisation' },
    /** orgtypeuid {ObjectId} - type of the organisation such as primary care, acute care, etc*/
    orgtypeuid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** isgstregistered {Boolean} - whether the hospital is tax registered */
    isgstregistered: Boolean,
    /** gstregno {String} - tax registration number */
    gstregno: String,
    /** businessregno {String} - business registration number */
    businessregno: String,
    /** companyname {String} - company name used for tax registration purposes */
    companyname: String,
    /** address {EnterpriseAddressSchema} - address of the hospital */
    address: EnterpriseAddressSchema,
    /** contact {EnterpriseContactSchema} - contact details of the hospital such as phone, weburl, etc */
    contact: EnterpriseContactSchema,
    /** Organisation Code {string} link to interface government*/
    organisationcode: String,
    /** preflanguid {ObjectId} - preferred language of the hospital - reference domain code : PRFLAN */
    preflanguid: { type: Schema.ObjectId, ref: 'ReferenceValue' },
    /** holidays {Date} - holidays of the organisation */
    holidays: [Date],
    /** emailid {string} Email id of the organisation */
    emailid : {type : String, index: true},
});

OrganisationSchema.plugin(resuable);
module.exports = mongoose.model('Organisation', OrganisationSchema,'organisation');