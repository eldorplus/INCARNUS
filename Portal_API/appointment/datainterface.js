var Organisation = require('../models/organisation'); // refre the Model Exported Object schema


var Doctor = require('../models/Doctor'); // refre the Model Exported Object schema
var DoctorImage = require('../models/Doctorimage'); // refre the Model Exported Object schema
var ReferenceValue = require('../models/framework/ReferenceValue'); // refre the Model Exported Object schema

var Patient = require('../models/patient'); // refre the Model Exported Object schema
var PatientImage = require('../models/patientimage'); // refre the Model Exported Object schema

var mongoose = require('mongoose');
//var winston = require('winston');
var fs = require('fs');

var escapeReg = exports.escapeReg = function(str) {
    return String(str).replace(/[-[\]{}()*+?,\\/^$|#\s]/g, "\\$&");
};

var getBetweenRegx = exports.getBetweenRegx = function(str) {
    return new RegExp(escapeReg(str).toLowerCase(), 'i');
};


//  Organization

function populateOrganisationDataFromRequest(req, newOrganisation) {
    if (req.body.keepsameid == 1) {
        newOrganisation._id = req.body.externalid;
    }
    newOrganisation.code = req.body.code.toUpperCase() ;
    newOrganisation.externalid = req.body.externalid;
    newOrganisation.name = req.body.name;
    newOrganisation.description = req.body.description;
    newOrganisation.activefrom = req.body.activefrom;
    newOrganisation.activeto = req.body.activeto;
    newOrganisation.levelcode = req.body.levelcode;
    //newOrganisation.parentorguid = req.body.parentorguid;
    //newOrganisation.preflanguid = req.body.preflanguid;
    //newOrganisation.orgtypeuid = req.body.orgtypeuid;
    newOrganisation.organisationcode = req.body.organisationcode;
    newOrganisation.holidays = req.body.holidays;

    newOrganisation.isgstregistered = req.body.isgstregistered;
    newOrganisation.gstregno = req.body.gstregno;
    newOrganisation.businessregno = req.body.businessregno;
    newOrganisation.companyname = req.body.companyname;

    if (req.body.address != null) {
        newOrganisation.address = {};
        newOrganisation.address.address = req.body.address;
        newOrganisation.address.area = req.body.area;
        newOrganisation.address.city = req.body.city;
        newOrganisation.address.state = req.body.state;
        newOrganisation.address.country = req.body.country;
        newOrganisation.address.zipcode = req.body.zipcode;
    }

    if (req.body.mobilephone != null) {
        newOrganisation.contact = {};
        newOrganisation.contact.workphone = req.body.workphone;
        newOrganisation.contact.mobilephone = req.body.mobilephone;
        newOrganisation.contact.emailid = req.body.emailid;
        newOrganisation.contact.weburl = req.body.weburl;
    }

    newOrganisation.modifiedby = req.session.useruid;
    newOrganisation.modifiedat = Date.now();
}

exports.saveorganisation = function(req, res) {

    var query = Organisation.find({
        externalid: req.body.externalid
    });

    query.exec(function(err, docs) {
        if (!err && (!docs || !docs.length )) {
            var newOrganisation = new Organisation()
            newOrganisation.uid = req.body.uid;
            populateOrganisationDataFromRequest(req, newOrganisation);
        
            newOrganisation.createdby = req.session.useruid;
            newOrganisation.createdat = Date.now();
            newOrganisation.statusflag = "A";
            newOrganisation.orguid = req.session.orguid;
        
            newOrganisation.save(function(Innererr) {
                if (!Innererr) {
                    res.status(200).json({ uid: newOrganisation._id});
                } else {
                    //winston.error(Innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.CREATEERROR' });
                }
            });
        }
        else {
            console.log(docs);
            var newOrganisation = new Organisation();
            newOrganisation = docs[0];
            newOrganisation.uid = req.body.uid;
            populateOrganisationDataFromRequest(req, newOrganisation);

            if (!newOrganisation.createdby)
                newOrganisation.createdby = req.session.useruid;
            if (!newOrganisation.orguid)
                newOrganisation.orguid = req.session.orguid;

            newOrganisation.save(function(Innererr) {
                if (!Innererr) {
                    res.status(200).json({ uid: newOrganisation._id });
                } else {
                    //winston.error(Innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
                }
            });

            
        }

});
}

//  Reference Value

function populateReferenceValueFromRequest(req, newRefVal) {
    if (req.body.keepsameid == 1) {
        newRefVal._id = req.body.externalid;
    }
    newRefVal.valuecode = req.body.valuecode ;
    newRefVal.externalid = req.body.externalid;
    newRefVal.valuedescription = req.body.valuedescription;
    newRefVal.locallanguagedesc = req.body.locallanguagedesc;
    newRefVal.aliasname = req.body.aliasname;
    newRefVal.isdefault = req.body.isdefault;
    newRefVal.activefrom = req.body.activefrom;
    newRefVal.activeto = req.body.activeto;
    newRefVal.domaincode = req.body.domaincode;
    newRefVal.relatedvalue = req.body.relatedvalue;
    newRefVal.displayorder = req.body.displayorder;

    newRefVal.modifiedby = req.session.useruid;
    newRefVal.modifiedat = Date.now();
}

exports.saveReferenceValue = function(req, res) {

    var query = ReferenceValue.find({
        externalid: req.body.externalid
    });
    console.log(req.body.externalid);

    query.exec(function(err, docs) {
        if (!err && (!docs || !docs.length )) {
            var newRefVal = new ReferenceValue();
            //newRefVal.uid = req.body.uid;
            populateReferenceValueFromRequest(req, newRefVal);
        
            newRefVal.createdby = req.session.useruid;
            newRefVal.createdat = Date.now();
            newRefVal.statusflag = "A";
            newRefVal.orguid = req.session.orguid;
        
            newRefVal.save(function(Innererr) {
                if (!Innererr) {
                    res.status(200).json({ uid: newRefVal._id});
                } else {
                    //winston.error(Innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.CREATEERROR' });
                }
            });
        }
        else {
            console.log(docs[0]);
            var newRefVal = new ReferenceValue();
            newRefVal = docs[0];
            //newRefVal.uid = req.body.uid;
            populateReferenceValueFromRequest(req, newRefVal);

            if (!newRefVal.createdby)
                newRefVal.createdby = req.session.useruid;
            if (!newRefVal.orguid)
                newRefVal.orguid = req.session.orguid;

                newRefVal.save(function(Innererr) {
                if (!Innererr) {
                    res.status(200).json({ uid: newRefVal._id });
                } else {
                    //winston.error(Innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
                }
            });

            
        }

});
}


//  Doctor

function populateDoctorDataFromRequest(req, newDoctor) {
    if (req.body.keepsameid == 1) {
        newDoctor._id = req.body.externalid;
    }
    newDoctor.externalid = req.body.externalid;
    newDoctor.code = req.body.code;
    newDoctor.name = req.body.name;
    newDoctor.lastname = req.body.lastname;
    newDoctor.dateofbirth = req.body.dateofbirth;
    newDoctor.printname = req.body.printname;
    newDoctor.specialtyuid = req.body.specialtyuid;
    newDoctor.location = req.body.location;
    newDoctor.worktype = req.body.worktype;
    newDoctor.nationality = req.body.nationality;
    newDoctor.description = req.body.description;

    newDoctor.titleuid = req.body.titleuid;
    newDoctor.genderuid = req.body.genderuid;
    newDoctor.qualification = req.body.qualification;
    newDoctor.primarydept = req.body.primarydept;
    newDoctor.licensenumber = req.body.licensenumber;
    newDoctor.licenseissuedate = req.body.licenseissuedate;
    newDoctor.licenseexpirtydate = req.body.licenseexpirtydate;

    newDoctor.activefrom = req.body.activefrom;
    newDoctor.activeto = req.body.activeto;

    newDoctor.iscareprovider = req.body.iscareprovider;
    newDoctor.isopconsultant = req.body.isopconsultant;
    newDoctor.isadmitconsultant = req.body.isadmitconsultant;
    newDoctor.issurgeon = req.body.issurgeon;
    newDoctor.isanaesthetist = req.body.isanaesthetist;
    newDoctor.isradiologist = req.body.isradiologist;
    newDoctor.islaboratorist = req.body.islaboratorist;
    newDoctor.isgstregistered = req.body.isgstregistered;
    newDoctor.gstregno = req.body.gstregno;
    newDoctor.businessregno = req.body.businessregno;
    newDoctor.companyname = req.body.companyname;
    newDoctor.companyaddress = req.body.companyaddress;

    newDoctor.doctorurls = req.body.doctorurls;
    newDoctor.EducationLinks = req.body.EducationLinks;

    newDoctor.address = {};
    newDoctor.address.address = req.body.address;
    newDoctor.address.area = req.body.area;
    newDoctor.address.city = req.body.city;
    newDoctor.address.state = req.body.state;
    newDoctor.address.country = req.body.country;
    newDoctor.address.zipcode = req.body.zipcode;

    newDoctor.contact = {};
    newDoctor.contact.workphone = req.body.workphone;
    newDoctor.contact.homephone = req.body.homephone;
    newDoctor.contact.mobilephone = req.body.mobilephone;
    newDoctor.contact.alternatephone = req.body.alternatephone;
    newDoctor.contact.emailid = req.body.emailid;
    newDoctor.contact.weburl = req.body.weburl;

    newDoctor.createdby = req.session.useruid;
    newDoctor.createdat = Date.now();
    newDoctor.modifiedby = req.session.useruid;
    newDoctor.modifiedat = Date.now();
    newDoctor.statusflag = "A";
    newDoctor.orguid = req.session.orguid;
}

exports.saveDoctor = function(req, res) {

    var query = Doctor.find({
        externalid: req.body.externalid
    });

    query.exec(function(err, docs) {
        if (!err && (!docs || !docs.length )) {
            var newDoctor = new Doctor()
            populateDoctorDataFromRequest(req, newDoctor);
        
            newDoctor.createdby = req.session.useruid;
            newDoctor.createdat = Date.now();
            newDoctor.statusflag = "A";
            newDoctor.orguid = req.session.orguid;
        
            newDoctor.save(function(Innererr) {
                if (!Innererr) {
                    res.status(200).json({ uid: newDoctor._id});
                } else {
                    //winston.error(Innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.CREATEERROR' });
                }
            });
        }
        else {
            console.log(docs);
            var newDoctor = new Doctor();
            newDoctor = docs[0];
            populateDoctorDataFromRequest(req, newDoctor);

            if (!newDoctor.createdby)
                newDoctor.createdby = req.session.useruid;
            if (!newDoctor.orguid)
                newDoctor.orguid = req.session.orguid;

            newDoctor.save(function(Innererr) {
                if (!Innererr) {
                    res.status(200).json({ uid: newDoctor._id });
                } else {
                    //winston.error(Innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
                }
            });

            
        }

});
}


// To save Doctor photo 
exports.savedoctorphoto = function(req, res) {
    var newDoctorphoto = new DoctorImage();
    newDoctorphoto.doctorid = req.body.doctorid;
    newDoctorphoto.comments = req.body.comments;
    newDoctorphoto.doctorphoto = fs.readFileSync(req.body.filepath);
    newDoctorphoto.createdby = req.session.useruid;
    newDoctorphoto.createdat = Date.now();
    newDoctorphoto.modifiedby = req.session.useruid;
    newDoctorphoto.modifiedat = Date.now();
    newDoctorphoto.statusflag = "A";
    newDoctorphoto.orguid = req.session.orguid;

    newDoctorphoto.save(function(Innererr) {
        if (!Innererr) {
            res.status(200).json({
                doctorphoto: newDoctorphoto
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


//  Patient

function populatePatientDataFromRequest(req, newPatient) {
    if (req.body.keepsameid == 1) {
        newPatient._id = req.body.externalid;
    }

    newPatient.externalid = req.body.externalid;
    newPatient.mrn = req.body.mrn;
    newPatient.internalmrn = req.body.internalmrn;
    newPatient.firstname = req.body.firstname;
    newPatient.lastname = req.body.lastname;

    newPatient.localfirstname = req.body.localfirstname;
    newPatient.locallastname = req.body.locallastname;

    newPatient.titleuid = req.body.titleuid;
    newPatient.localnametitleuid = req.body.localnametitleuid;
    newPatient.genderuid = req.body.genderuid;

    newPatient.isvip = req.body.isvip;
    newPatient.isanonymous = req.body.isanonymous;
    newPatient.dateofbirth = req.body.dateofbirth;
    newPatient.registereddate = req.body.registereddate;
    newPatient.isinterpreterreqd = req.body.isinterpreterreqd;
    newPatient.notes = req.body.notes;
    newPatient.tempmrnid = req.body.tempmrnid;

    newPatient.nationalid = req.body.nationalid;
    newPatient.natidexpirtydate = req.body.natidexpirtydate;
    newPatient.isemployee = req.body.isemployee;

    newPatient.address = {};
    newPatient.address.address = req.body.address;
    newPatient.address.area = req.body.area;
    newPatient.address.city = req.body.city;
    newPatient.address.state = req.body.state;
    newPatient.address.country = req.body.country;
    newPatient.address.zipcode = req.body.zipcode;

    newPatient.contact = {};
    newPatient.contact.workphone = req.body.workphone;
    newPatient.contact.homephone = req.body.homephone;
    newPatient.contact.mobilephone = req.body.mobilephone;
    newPatient.contact.alternatephone = req.body.alternatephone;
    newPatient.contact.emailid = req.body.emailid;
    newPatient.contact.weburl = req.body.weburl;

    newPatient.createdby = req.session.useruid;
    newPatient.createdat = Date.now();
    newPatient.modifiedby = req.session.useruid;
    newPatient.modifiedat = Date.now();
    newPatient.statusflag = "A";
    newPatient.orguid = req.session.orguid;
}

exports.savePatient = function(req, res) {

    var query = Patient.find({
        externalid: req.body.externalid
    });

    query.exec(function(err, docs) {
        if (!err && (!docs || !docs.length )) {
            var newPatient = new Patient()
            populatePatientDataFromRequest(req, newPatient);
        
            newPatient.createdby = req.session.useruid;
            newPatient.createdat = Date.now();
            newPatient.statusflag = "A";
            newPatient.orguid = req.session.orguid;
        
            newPatient.save(function(Innererr) {
                if (!Innererr) {
                    res.status(200).json({ uid: newPatient._id});
                } else {
                    //winston.error(Innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.CREATEERROR' });
                }
            });
        }
        else {
            console.log(docs);
            var newPatient = new Patient();
            newPatient = docs[0];
            populatePatientDataFromRequest(req, newPatient);

            if (!newPatient.createdby)
                newPatient.createdby = req.session.useruid;
            if (!newPatient.orguid)
                newPatient.orguid = req.session.orguid;

            newPatient.save(function(Innererr) {
                if (!Innererr) {
                    res.status(200).json({ uid: newPatient._id });
                } else {
                    //winston.error(Innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
                }
            });

            
        }

});
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


