
// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');

var Schema = mongoose.Schema;

// create an export function to encapsulate the model creation

  // define schema



  var ReferenceValueSchema = new Schema({
   
        valuecode : {type : String, required:true, index: true},
        valuedescription : {type :String, index: true, index: true},
        locallanguagedesc : String,
        aliasname : String,
        isdefault : Boolean,
        activefrom : {type : Date, index: true},
        activeto : {type :Date , index:true},
        domaincode : {type : String, required:true, index:true},
        relatedvalue : String,
        displayorder : Number
     			
  });  

ReferenceValueSchema.plugin(resuable);
module.exports = mongoose.model('ReferenceValue', ReferenceValueSchema,'referencevalue');

