// import the necessary modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create an export function to encapsulate the model creation
module.exports = exports = function auditinfo(schema, options) {
    // define schema

    schema.add({
        createdby: { type: String, required: true },
        createdat: { type: Date, required: true },
        modifiedby: { type: String, required: true },
        modifiedat: { type: Date, required: true , index : true},
        statusflag: { type: String, required: true, index: true },
        orguid: { type: Schema.ObjectId, ref: 'Organisation', required: true, index: true },
        /** externaluid {String} - any external table unique uid */
        externaluid: String
    });

};