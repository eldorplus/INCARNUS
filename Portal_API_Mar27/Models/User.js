/**
 * Schema representing master data for creating a user (ex: registration staff, pharmacist, nurses, doctors, etc) 
 * The user can be a careprovider (doctor) or a clinical staff or an administrative staff
 *
 * @module User 
 */


// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;

var UserSchema = new Schema({

    /** Code {string} has to be unique */
    code: { type: String, required: true, index: true },

    /** loginid {String} - loginid of the user */
    loginid: { type: String },

    /** mobilephone {String} - mobile number of the user */
    mobilephone: {type : String, index: true},

    /** emailid {String} - Email id of the user */
    emailid: {type : String, index: true},

    /** password {String} - password of the user in bcrypt encrypted format */
    password: String,
    /** externalpassword {String} - password of the user in md5 format for  */
    externalpassword: String,
    /** changepasswordcode {String} - Change password code */
    changepasswordcode: String,
    /** changepasswordvalidto {Date} - validity for change password request */
    changepasswordvalidto: Date,
    /** verificationcode {String} - generated as a random 6 digit number */
    verificationcode : String,
    /** verificationenccode {String} - Encrypted verification code to send in link */
    verificationenccode: String,
    /** isloginverified {Boolean} - whether the user login email or mobile is verified*/
    isloginverified: Boolean,
    /** isemailidverified {Boolean} - whether the user email id is verified*/
    isemailidverified: Boolean,
    /** ismobileverified {Boolean} - whether the user mobile number  is verified*/
    ismobileverified: Boolean,
    /** islocked {Boolean} - whether the user is automatically locked due to too many invalid login attempts */
    islocked: Boolean,
    /** noofinvalidlogins {Number} - record of number of invalid login attempts */
    noofinvalidlogins: Number,
    /** lastlogindate {Date} - last successful login date */
    lastlogindate: Date,
    /** changepasswordatnextlogin {Boolean} - whether to force the user to change password on next login */
    changepasswordatnextlogin: Boolean

});

/** plugin the framework attributes like createdat, createdby, etc. */
UserSchema.plugin(resuable);

module.exports = mongoose.model('User', UserSchema,'user');