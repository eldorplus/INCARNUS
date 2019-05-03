var Doctor = require('../models/Doctor'); // refre the Model Exported Object schema
var DoctorImage = require('../models/Doctorimage'); // refre the Model Exported Object schema
var ReferenceValue = require('../models/framework/ReferenceValue'); // refre the Model Exported Object schema
var organization = require('../models/organisation'); // refre the Model Exported Object schema

var mongoose = require('mongoose');
//var winston = require('winston');
var fs = require('fs');

var escapeReg = exports.escapeReg = function(str) {
    return String(str).replace(/[-[\]{}()*+?,\\/^$|#\s]/g, "\\$&");
};

var getBetweenRegx = exports.getBetweenRegx = function(str) {
    return new RegExp(escapeReg(str).toLowerCase(), 'i');
};


exports.list = function(req, res) {};

// To get organization list 
exports.getorganisationlist = function(req, res) {
    var query = organization.find({
        statusflag: 'A'
    })
    query.select('uid externalid name _id ');
    query.lean().exec(function(err, docs) {
        if (!err) {
            res.status(200).json({
                dropdownlist: docs
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

// To get speciality list 
exports.getdropdownlist = function(req, res) {
    var query = ReferenceValue.find({
        statusflag: 'A', 
        orguid: req.session.orguid
    })
    query.where('domaincode').equals(req.body.domaincode);

    query.lean().exec(function(err, docs) {
        if (!err) {
            res.status(200).json({
                dropdownlist: docs
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


//  To search doctor by Name, Location & Specialty
function search(req, res, callback) {
    /*res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);*/

    var query = Doctor.find({
        statusflag: 'A' 
        //orguid: req.session.orguid
    })

    console.log('name : ' + req.body.name);
    console.log('location : ' + req.body.location);
    console.log('specialty : ' + req.body.specialtyuid);

    /*if (req.body.code != null && req.body.code.length > 0)
        query.where('code').equals(!!req.body.isstrictcode ? req.body.code : { '$regex': getBetweenRegx(req.body.code) });
    */
   if (req.body.location != null && req.body.location.length > 0) {
    query.where({
        orguid: {
            $in: req.body.location
            }
    });
    }

   if (req.body.specialtyuid != null && req.body.specialtyuid.length > 0) {
        query.where({
            specialtyuid: {
                $in: req.body.specialtyuid
                }
        });
    }
    
    if (req.body.name != null && req.body.name.length > 0) {
        query.where({
            $or: [{
                    name: {
                        '$regex': getBetweenRegx(req.body.name)
                    }
                }, {
                    lastname: {
                        '$regex': getBetweenRegx(req.body.name)
                    }
                },
                {
                    licensenumber: {
                        '$regex': getBetweenRegx(req.body.name)
                    }
                }
            ]
        });
    }

    /*if (req.body.location != null && req.body.location.length > 0) {
        query.where({
            location: {
                '$regex': getBetweenRegx(req.body.location)
                }
        });
    } */
   
 
    query.select('printname genderuid titleuid primarydept location qualification specialtyuid _id externalid orguid');
    query.populate('genderuid', 'valuedescription');
    query.populate('titleuid', 'valuedescription');
    query.populate('specialtyuid', 'valuedescription');

    query.exec(function(err, docs) { 
        if (!err) {
            console.log(docs);

            if (!!callback) {
                setTimeout(function() { callback(null, docs); });
                return;
            } else {
                res.status(200).json({
                    doctors: docs
                });
            }
        } else {
            //winston.error(err, {
            //    timestamp: Date.now(),
            //    pid: process.pid,
            //    url: req.url
            //});
            if (!!callback) {
                setTimeout(function() { callback('ERRORS.RECORDNOTFOUND'); });
                return;
            } else {
                res.status(500).json({
                    error: 'ERRORS.RECORDNOTFOUND'
                });
            }
        }
    });
};

//  To search doctor by Name, Location & Specialty
exports.search = function(req, res) {
    search(req, res);
}

exports.searchcallback = function(req, res, callback, filter) {
    if (!!filter) req.body = filter;
    search(req, res, function(err, users) {
        if (!!err) {
            callback(err, null);
        } else {
            callback(null, users);
        }
    });
}

// To get Doctor photo
exports.getimagedetail = function(req, res) {
    if (!req.body.id) {
        return res.status(500).json({
            error: 'ERRORS.RECORDNOTFOUND'
        });
    }

    var query = DoctorImage.find({
        statusflag: 'A', 
        orguid: req.session.orguid
    })
    query.where('doctorid').equals(req.body.id);

    query.lean().exec(function(err, docs) {
        if (!err) {
            res.status(200).json({
                doctorimage: docs
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

// To get Doctor detail for the complete profile
exports.getdoctordetail = function(req, res) {
    if (!req.body.id) {
        return res.status(500).json({
            error: 'ERRORS.RECORDNOTFOUND'
        });
    }
    console.log('id : ' + req.body.id);
    Doctor.findById(req.body.id, function(err, docs) {
        if (!err) {
            res.status(200).json({
                doctor: docs
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

exports.test = function(req, res) {
    res.status(200).json({
        name: "Success"
    });
}

// To save patient photo 
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

//  Interface with other system 
// To receive doctor information  
exports.savedoctorinformation = function(req, res) {
    var newDoctor = new Doctor();
    newDoctor._id = req.body._id;
    newDoctor.code = req.body.code;
    newDoctor.name = req.body.name;
    newDoctor.printname = req.body.printname;
    newDoctor.specialtyuid = req.body.specialtyuid;
    newDoctor.location = req.body.location;
    newDoctor.titleuid = req.body.titleuid;
    newDoctor.genderuid = req.body.genderuid;
    newDoctor.qualification = req.body.qualification;
    newDoctor.primarydept = req.body.primarydept;
    newDoctor.activefrom = req.body.activefrom;
    newDoctor.activeto = req.body.activeto;

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

    newDoctor.save(function(Innererr) {
        if (!Innererr) {
            res.status(200).json({
                doctor: newDoctor
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


exports.savedoctor = function(req, res) {
    if (req.body.externalid != null) {
        Doctor.findOneAndUpdate({
            externalid: req.body.externalid
        }, {
            $set: {
                name: req.body.name,
                titleuid: req.body.selectedtitleuid,
                genderuid: req.body.selectedgenderuid,
                qualification: req.body.qualification,
                userimageuid: req.body.userimageuid,
                licensenumber: req.body.licensenumber,
                modifiedat: new Date(),
                modifiedby: req.session.useruid
            }
        }, {
            safe: true,
            upsert: true
        }, function(err, docs) {
            if (!err) {
                res.status(200).json({});
            } else {
                //winston.error(err, {
                //    timestamp: Date.now(),
                //    pid: process.pid,
                //    url: req.url
                //});
                res.status(500).json({
                    error: 'ERRORS.UPDATEERROR'
                });
            }
        });
    } else {
        //winston.error(null, {
        //    timestamp: Date.now(),
        //    pid: process.pid,
        //    url: req.url
        //});
        res.status(500).json({
            error: 'ERRORS.RECORDNOTFOUND'
        });
    }
};
