// import the necessary modules
var mongoose = require('mongoose');
var resuable = require('./reusableobjects');
//var frameworkEnum = require('./frameworkenum');


var Schema = mongoose.Schema;
// create an export function to encapsulate the model creation
// define schema
var SequenceNumberSchema = new Schema({
    code: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        index: true
    },
    entypeuid: {
        type: Schema.ObjectId,
        ref: 'ReferenceValue',
        index: true
    },
    initvalue: Number,
    runningvalue: Number,
    formatlength: Number,
    reseedperiod: String,
    activefrom: Date,
    activeto: Date,
    displayformat: String,
    paramtype: {
        type: String,
        /* enum: [
            null,
            frameworkEnum.sequenceNumberParamTypes.visitType,
            frameworkEnum.sequenceNumberParamTypes.orderCategoryType,
            frameworkEnum.sequenceNumberParamTypes.careProvider,
            frameworkEnum.sequenceNumberParamTypes.department,
            frameworkEnum.sequenceNumberParamTypes.store
        ], */
        index: true
    },
    paramvalue: {
        type: String,
        index: true
    },
    reseeddate: Date
});

SequenceNumberSchema.plugin(resuable);
module.exports = mongoose.model('SequenceNumber', SequenceNumberSchema,'sequencenumber');