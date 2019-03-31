var Patient = require('../models/patient'); // refre the Model Exported Object schema
var PatientImage = require('../models/patientimage'); // refre the Model Exported Object schema

var mongoose = require('mongoose');
//var winston = require('winston');
//var async = require('async');
var moment = require('moment');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var fs = require('fs');

var PatientVisit = require('../models/patientvisit'); // refre the Model Exported Object schema
//var ReferenceDomain = require('../models/framework/referencedomain'); // refre the Model Exported Object schema
//var ReferenceValue = require('../models/framework/referencevalue');
var resuable = require('../models/reusableobjects');

//var sequencenumber = require('../models/framework/sequencenumber.js');
//var ReferenceDomainMaster = require('../framework/referencedomain.js');

//  To get basic details of the patient - id
exports.getbasicdetail = function(req, res) {
    var query = Patient.findById(req.body.id);
    query.select('titleuid firstname middlename lastname genderuid dateofbirth contact address ');
    query.populate('titleuid', 'valuecode valuedescription');
    query.populate('genderuid', 'valuecode valuedescription');

    query.lean().exec(function(err, doc) {
        if (!err) {
            res.status(200).json({ patient: doc });
        } else {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        }
    });
}

// To get Patient details & documents - id 
exports.getdetail = function(req, res) {
    var query = Patient.findById(req.body.id);
    query.populate('genderuid', 'valuecode valuedescription relatedvalue');
    query.populate('titleuid', 'valuecode valuedescription');
    query.populate('localnametitleuid', 'valuedescription');
    query.populate('viptypeuid', 'valuedescription');
    query.populate('nationalityuid', 'valuedescription');
    query.populate('occupationuid', 'valuedescription');
    query.populate('rhfactoruid', 'valuedescription');
    query.populate('bloodgroupuid', 'valuedescription');
    query.populate('preflanguid', 'valuedescription relatedvalue');
    /*query.populate({
        path: 'patientdocuments.documentuid',
        select: 'documentname filetype documenttypeuid createdby createdat comments',
        populate: [{ path: 'documenttypeuid', model: 'ReferenceValue', select: 'valuedescription' }
        ]
    });*/

    query.lean().exec(function(err, docs) {
        if (!err) {
            //var patient = docs;
            res.status(200).json({
                patient: docs
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

//create method. First check for exist and then create if not exists.
var create = function(req, res, callback) {
    var errors = [];

    console.log(req.body);
    //check for duplicate patient - whether to continue or not.

    var query = Patient.find({
        orguid: req.session.orguid,
        statusflag: 'A'
    });
    if (req.body.firstname != null && req.body.firstname.length > 0) {
        query.where('firstname').equals(req.body.firstname.toUpperCase());
        if (req.body.middlename && req.body.middlename.length > 0) {
            query.where('middlename').equals(req.body.middlename.toUpperCase());
        }
        if (req.body.lastname && req.body.lastname.length > 0) {
            query.where('lastname').equals(req.body.lastname.toUpperCase());
        }
    }
    if (req.body.mobilephone != null && req.body.mobilephone.length > 0) {
        query.where('contact.mobilephone').equals(req.body.mobilephone.toUpperCase());
    }

    query.exec(function(err, docs) {
        if (!err && (!docs || !docs.length )) {

            var newPatient = new Patient();
            //  Temporary MRN number 
            //sequence = req.body.mobilephone.toUpperCase() + '-' + req.body.dateofbirth ;

                //newPatient.mrn = sequence;
                //newPatient.internalmrn = newPatient.mrn.replace(/-/g, '');
                //newPatient.tempmrnid = newPatient.mrn;
                newPatient.loginid = req.body.mobilephone.toUpperCase();
                //newPatient.password =  req.body.mobilephone.toUpperCase();
                /*var password =  (req.body.firstname.toUpperCase() + req.body.lastname.toUpperCase()).substring(0,4) + req.body.dateofbirth.substring(0,4);
                
                bcrypt.hash(password, 10, function(err, hash) {

                    if (!err && hash != null) {
                        var md5password = crypto.createHash('md5').update(password).digest("base64");
                        console.log("password - " + hash);
                        console.log("ext password - " + md5password);
                        newPatient.password = hash;
                        newPatient.externalpassword = md5password;
                    }
                    // Store hash in your password DB.
                });*/
            

                if (req.body.firstname != null)
                    newPatient.firstname = req.body.firstname.toUpperCase();
                if (req.body.middlename != null)
                    newPatient.middlename = req.body.middlename.toUpperCase();
                if (req.body.lastname != null)
                    newPatient.lastname = req.body.lastname.toUpperCase();

                //Local Name
                if (req.body.localfirstname != null)
                    newPatient.localfirstname = req.body.localfirstname.toUpperCase();
                if (req.body.localmiddlename != null)
                    newPatient.localmiddlename = req.body.localmiddlename.toUpperCase();
                if (req.body.locallastname != null)
                    newPatient.locallastname = req.body.locallastname.toUpperCase();

                newPatient.titleuid = req.body.titleuid;
                newPatient.localnametitleuid = req.body.localnametitleuid;
                newPatient.genderuid = req.body.genderuid;
                newPatient.dateofbirth = req.body.dateofbirth;
                newPatient.registereddate = Date.now();
                newPatient.contact = {};
                newPatient.contact.workphone = req.body.mobilephone;
                newPatient.contact.mobilephone = req.body.mobilephone;
                newPatient.contact.emailid = req.body.emailid;
                newPatient.contact.homephone = req.body.mobilephone;
                newPatient.contact.alternatephone = req.body.mobilephone;


                //patient audit log schema.
/*                     newPatient.patientdemochanges = [];
                var demochange = {};
                demochange.modifiedat = new Date();
                demochange.modifiedby = req.session.useruid;
                demochange.organisationuid = req.session.orguid;
                demochange.postaudit = JSON.stringify(req.body);
                newPatient.patientdemochanges.push(demochange);
*/              //newPatient.patientimageuid = req.body.patientimageuid;
                //newPatient.patientdocuments = req.body.patientdocuments;
                newPatient.createdby = req.session.useruid;
                newPatient.createdat = Date.now();
                newPatient.modifiedby = req.session.useruid;
                newPatient.modifiedat = Date.now();
                newPatient.statusflag = "A";
                newPatient.orguid = req.session.orguid;
                console.log(newPatient);
                newPatient.save(function(Innererr) {
                    if (!Innererr) {
                        //var postaudit = newPatient.toJSON();

                        //auditlog.logaudit(req, newPatient._id, 'Patient', newPatient._id, null, postaudit);
                        var pat = {};
                        pat.uid = newPatient._id;
                        //pat.mrn = newPatient.mrn;
                        pat.firstname = newPatient.firstname;
                        pat.middlename = newPatient.middlename;
                        pat.lastname = newPatient.lastname;
                        pat.localfirstname = newPatient.localfirstname;
                        pat.localmiddlename = newPatient.localmiddlename;
                        pat.locallastname = newPatient.locallastname;
                        
                        if (!!callback) {
                            setTimeout(function() { callback(null, pat); });
                            return;
                        } else {
                            res.status(200).json({
                                patient: pat
                            });
                        }
                    } else {
                        /*winston.error(Innererr, {
                            timestamp: Date.now(),
                            pid: process.pid,
                            url: req.url
                        }); */
                        console.log(Innererr);
                        if (!!callback) {
                            setTimeout(function() { callback('ERRORS.CREATEERROR'); });
                            return;
                        } else {
                            res.status(500).json({
                                error: 'ERRORS.CREATEERROR'
                            });
                        }
                    }
                });

        } else {
            /* winston.error(err, {
                timestamp: Date.now(),
                pid: process.pid,
                url: req.url
            }); */
            if (!err && (docs != null && docs.length > 0)) {
                var duplicateIDs = "";
                for (var i = 0; i < docs.length; i++) {
                    duplicateIDs += docs[i]._id;
                    duplicateIDs += ',';
                }
                if (!!callback) {
                    setTimeout(function() { callback('ERRORS.DUPLICATEPATIENT'); });
                    return;
                } else {
                    res.status(500).json({
                        error: 'ERRORS.DUPLICATEPATIENT',
                        duplicateIDs: duplicateIDs
                    });
                }
            } else {
                if (!!callback) {
                    setTimeout(function() { callback('ERRORS.CREATEERROR'); });
                    return;
                } else {
                    res.status(500).json({ error: 'ERRORS.CREATEERROR' });
                }
            }
        }
    });
}

exports.create = function(req, res) {
    create(req, res);
};


var checkpatientbybasicdetail = function(req, res, callback) {
    var query = Patient.find({
        orguid: req.session.orguid,
        statusflag: 'A'
    });
    if (req.body.firstname != null && req.body.firstname.length > 0) {
        query.where('firstname').equals(req.body.firstname.toUpperCase());
    }
    if (req.body.lastname && req.body.lastname.length > 0) {
        query.where('lastname').equals(req.body.lastname.toUpperCase());
    }
    if (!!req.body.genderuid) {
        query.where('genderuid').equals(req.body.genderuid);
    }
    /*if (!!req.body.dobfrom) {
        query.where('dateofbirth').gte(req.body.dobfrom);
    }
    if (!!req.body.dobto) {
        query.where('dateofbirth').lte(req.body.dobto);
    }*/
    query.lean().exec(function(err, docs) {
        if (!!err) {
            if (!!callback) {
                setTimeout(function() { callback(err); });
                return;
            } else {
                //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
                res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
            }
        }

        if (docs != null && docs.length > 0) {
            var duplicateIDs = "";
            for (var i = 0; i < docs.length; i++) {
                duplicateIDs += docs[i]._id;
                if ((docs.length - 1) != i) {
                    duplicateIDs += ', ';
                }
            }

            if (!!callback) {
                setTimeout(function() { callback(null, duplicateIDs); });
                return;
            } else {
                res.status(200).json({
                    duplicateIDs: duplicateIDs
                });
            }
        } else {
            if (!!callback) {
                setTimeout(function() { callback(); });
                return;
            } else {
                res.status(200).json({});
            }
        }
    });
}

//  To check the duplicate patient 
exports.checkpatientbybasicdetail = function(req, res) {
    checkpatientbybasicdetail(req, res);
}


var getpatientuidbymrn = function(req, res, callback) {
    var field = '_id firstname middlename lastname dateofbirth genderuid';

    var query = Patient.findOne({ mrn: req.body.mrn }, field);
    query.populate('genderuid', 'valuedescription valuecode');
    query.lean().exec(function(err, docs) {
        if (!err) {
            if (!!callback) {
                setTimeout(function() { callback(null, docs); });
                return;
            } else {
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

//  To get patient detail by MRN number
exports.getpatientuidbymrn = function(req, res) {
    getpatientuidbymrn(req, res);
}


// To save patient photo 
exports.savepatientphoto = function(req, res) {
    var newPatientphoto = new PatientImage();
    newPatientphoto.patientuid = req.body.patientuid;
    newPatientphoto.comments = req.body.comments;
    newPatientphoto.patientphoto = fs.readFileSync(req.body.filepath);
    newPatientphoto.createdby = req.session.useruid;
    newPatientphoto.createdat = Date.now();
    newPatientphoto.modifiedby = req.session.useruid;
    newPatientphoto.modifiedat = Date.now();
    newPatientphoto.statusflag = "A";
    newPatientphoto.orguid = req.session.orguid;

    newPatientphoto.save(function(Innererr) {
        if (!Innererr) {
            res.status(200).json({
                patientphoto: newPatientphoto
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

// To get Patient photo
exports.getimagedetail = function(req, res) {
    if (!req.body.id) {
        return res.status(500).json({
            error: 'ERRORS.RECORDNOTFOUND'
        });
    }
    var query = PatientImage.find({
      
    })
  
    query.where('patientuid').equals(req.body.id);

    query.lean().exec(function(err, docs) {
        if (!err) {
            res.status(200).json({
                patientimage: docs
            });
        } else {
          
            res.status(500).json({
                error: 'ERRORS.RECORDNOTFOUND'
            });
        }
    });
};

//  To get patient details based on the modified date 
exports.getpatientdetails = function (req, res) {

    var query = Patient.find({
        statusflag: 'A',
        orguid: req.session.orguid, 
        modifiedat: {
            $gte: req.body.fromdate
        }
     });
    query.select('firstname middlename lastname titleuid genderuid dateofbirth modifiedby modifiedat contact address');
    query.lean().exec(function (err, docs) {
        if (!err) {
            res.status(200).json({ patients: docs });
        } else {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        }
    });
};
