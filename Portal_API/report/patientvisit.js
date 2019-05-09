var mongoose = require('mongoose');
var Patient = require('../models/patient'); // refre the Model Exported Object schema
var PatientVisit = require('../models/patientvisit'); // refre the Model Exported Object schema -- PatientVisit
var PatientReport = require('../models/patientreport'); // refre the Model Exported Object schema

var moment = require('moment');
var fs = require('fs');

var resuable = require('../models/framework/reusableobjects');
//var winston = require('winston');

//  To get patient by Login ID - mobile number
var getpatientuidbyloginid = function(req, res, callback) {
    //console.log(req.body.useruid);
    var field = '_id firstname middlename lastname dateofbirth genderuid externalid';
    var query = Patient.find({ loginid: req.body.useruid }, field);
    console.log("useruid -----------", req.body)
    query.populate('genderuid', 'valuedescription valuecode');
    query.lean().exec(function(err, docs) {
        if (!err) {
            if (!!callback) {
                setTimeout(function() { callback(null, docs); });
                return;
            } else {
                console.log(docs);
                res.status(200).json({
                    patient: docs
                });
            }
        } else {
            /* winston.error(err, {
                timestamp: Date.now(),
                pid: process.pid,
                url: req.url
            }); */

            if (!!callback) {
                setTimeout(function() { callback(); });
                return;
            } else {
                res.status(500).json({
                    error: 'ERRORS.RECORDNOTFOUND'
                });
            }
        }
    });
}

exports.getpatientuidbyloginid = function(req, res) {
    getpatientuidbyloginid(req, res);
}

// To get patient visit information for the patient
exports.getvisitsforpatient = function(req, res) {
    if (!req.body.id) {
        return res.status(500).json({
            error: 'ERRORS.RECORDNOTFOUND'
        });
    }
    
    var query = PatientVisit.find({
        statusflag: 'A',
        orguid: req.session.orguid
    });
    query.where('patientuid').equals(req.body.id);
    query.select('patientuid visitid startdate visitcareproviders ');
    query.populate('visitcareproviders.department', 'name');
    query.populate('visitcareproviders.careprovideruid', 'printname userimageuid');
    //query.populate('visitcareproviders.visittypeuid', 'valuedescription');
    //query.populate('visitcareproviders.statusuid', 'valuedescription');
    //query.populate('entypeuid', 'valuecode valuedescription relatedvalue');
    query.sort({ startdate: 'desc' });

    query.lean().exec(function(err, docs) {
        console.log("docs", docs)
        if (!err) {
            res.status(200).json({
                patientvisits: docs
            });
        } else {
            /*winston.error(err, {
                timestamp: Date.now(),
                pid: process.pid,
                url: req.url
            });*/
            res.status(500).json({
                error: 'ERRORS.RECORDNOTFOUND'
            });
        }
    });
}


// To get list of report documents for the patient visit 
exports.getreportsforpatientvisit = function(req, res) {
    if (!req.body.id) {
        return res.status(500).json({
            error: 'ERRORS.RECORDNOTFOUND'
        });
    }

    var query = PatientReport.find({
        statusflag: 'A',
        orguid: req.session.orguid
    });
    query.where('patientvisituid').equals(req.body.id);
    //query.where('visitid').equals(req.params.visitid);
    query.select('patientvisituid documenttypeuid documentname comments filetype ');
    query.populate('documenttypeuid', 'valuedescription');
    query.sort({ documenttypeuid: 'asc' });

    query.lean().exec(function(err, docs) {
        if (!err) {
            res.status(200).json({
                patientreports: docs
            });
        } else {
            /*winston.error(err, {
                timestamp: Date.now(),
                pid: process.pid,
                url: req.url
            }); */
            res.status(500).json({
                error: 'ERRORS.RECORDNOTFOUND'
            });
        }
    });
}

// To get patient report by passing report document id
exports.getreportdetail = function(req, res) {
    PatientReport.findById(req.body.id, function(err, docs) {
        if (!err) {
            res.status(200).json({
                PatientReport: docs
            });
        } else {
           /* winston.error(err, {
                timestamp: Date.now(),
                pid: process.pid,
                url: req.url
            }); */
            res.status(500).json({
                error: 'ERRORS.RECORDNOTFOUND'
            });
        }
    });
};

// To save patient report 
exports.savereportdetail = function(req, res) {
    var newPatientReport = new PatientReport();
    newPatientReport.patientvisituid = req.body.patientvisituid;
    newPatientReport.documenttype = req.body.documenttype;
    newPatientReport.documentname = req.body.documentname;
    newPatientReport.comments = req.body.comments;
    newPatientReport.filetype = req.body.filetype;
    newPatientReport.reportdocument = fs.readFileSync(req.body.filepath);
    newPatientReport.createdby = req.session.useruid;
    newPatientReport.createdat = Date.now();
    newPatientReport.modifiedby = req.session.useruid;
    newPatientReport.modifiedat = Date.now();
    newPatientReport.statusflag = "A";
    newPatientReport.orguid = req.session.orguid;

    newPatientReport.save(function(Innererr) {
        if (!Innererr) {
            res.status(200).json({
                patientreport: newPatientReport
            });
        }
        else
        {
            res.status(500).json({
                error: 'ERRORS.CREATEERROR' + Innererr
            });
        }
    });
};


//  Interface with other system 
// To receive patient visit information  
exports.savepatientvisitinformation = function(req, res) {
    var newVisit = new PatientVisit();
    newVisit._id = req.body._id;
    newVisit.patientuid = req.body.patientuid;
    //newVisit.entypeuid = req.body.entypeuid;
    newVisit.visitid = req.body.visitid;
    //newVisit.visitstatusuid = req.body.visitstatusuid;
    newVisit.startdate = req.body.startdate;
    newVisit.enddate = req.body.enddate;

    newVisit.visitcareproviders = {};
    newVisit.visitcareproviders.department = req.body.department;
    newVisit.visitcareproviders.careprovideruid = req.body.careprovideruid;
    newVisit.visitcareproviders.startdate = req.body.startdate;
    newVisit.visitcareproviders.clinic = req.body.clinic;
    newVisit.visitcareproviders.enddate = req.body.enddate;
    //newVisit.visitcareproviders.outcomeuid = req.body.outcomeuid;
    //newVisit.visitcareproviders.statusuid = req.body.statusuid;
    //newVisit.visitcareproviders.outcomeuid = req.body.outcomeuid;
    //newVisit.visitcareproviders.entypeuid = req.body.entypeuid;
    newVisit.visitcareproviders.comments = req.body.comments;

    newVisit.createdby = req.session.useruid;
    newVisit.createdat = Date.now();
    newVisit.modifiedby = req.session.useruid;
    newVisit.modifiedat = Date.now();
    newVisit.statusflag = "A";
    newVisit.orguid = req.session.orguid;

    newVisit.save(function(Innererr) {
        if (!Innererr) {
            res.status(200).json({
                visit: newVisit
            });
        }
        else
        {
            res.status(500).json({
                error: 'ERRORS.CREATEERROR' + Innererr
            });
        }
    });
};