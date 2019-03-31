
// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');


var Schema = mongoose.Schema;

// create an export function to encapsulate the model creation

  // define schema



  var ReferenceDomainSchema = new Schema({
    code : {type : String, required:true, index: true},
    name : {type : String, required:true, index: true},
    description : String,
    activefrom : {type : Date,index: true},
    activeto : Date,
    sortbydescription : Boolean,
    systemdefinedcodes : Boolean,
    values : [{type: Schema.ObjectId, ref: 'ReferenceValue' }]
  });  

ReferenceDomainSchema.plugin(resuable);
module.exports = mongoose.model('ReferenceDomain', ReferenceDomainSchema, 'referencedomain');

