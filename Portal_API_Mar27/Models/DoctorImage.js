/**
 * Schema representing Doctor photo details.
 *
 * @module Doctor
 */
// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./Framework/reusableobjects');

var Schema = mongoose.Schema;

var DoctorImageSchema = new Schema({
    doctorid: { type: Schema.ObjectId, ref: 'doctor', required: true, index: true },
    /** userphoto {string} - photograph in a base64 format */  
    doctorphoto: String,
    comments : String
    
  });

  DoctorImageSchema.plugin(resuable);

module.exports = mongoose.model('DoctorImage', DoctorImageSchema,'doctorimage');