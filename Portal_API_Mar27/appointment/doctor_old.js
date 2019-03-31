var User = require('../models/Doctor'); // refre the Model Exported Object schema
var UserImage = require('../models/Doctorimage'); // refre the Model Exported Object schema
var Organisation = require('../models/organisation');
var ReferenceValue = require('../models/framework/referencevalue');

var mongoose = require('mongoose');
//var winston = require('winston');

//var apputils = require('../apputil'); // Refer the Utilitis method to handle error or as common
var auditlog = require('../models/framework/auditlog.js');
var resuable = require('../models/framework/reusableobjects');

var SequenceNumber = require('../models/framework/sequencenumber');

var getBetweenRegx = exports.getBetweenRegx = function(str) {
    return new RegExp(escapeReg(str).toLowerCase(), 'i');
};


exports.list = function(req, res) {};

function search(req, res, callback) {
    var NUMBER_OF_ITEMS = req.body.limit || 0;
    var PAGE_NUMBER = req.body.page || 0;

    var query = null;

    if (req.body.acrossorganisations == true) {
        query = doctor.find({
                statusflag: 'A'
            })
            .skip(NUMBER_OF_ITEMS * (PAGE_NUMBER - 1))
            .limit(NUMBER_OF_ITEMS);
    } else {
        query = doctor.find({
                statusflag: 'A',
                $or: [{ orguid: req.session.orguid }, { orguid: req.session.parentorguid }]
            })
            .skip(NUMBER_OF_ITEMS * (PAGE_NUMBER - 1))
            .limit(NUMBER_OF_ITEMS);
    }

    if (req.body.code != null && req.body.code.length > 0)
        query.where('code').equals(!!req.body.isstrictcode ? req.body.code : { '$regex': apputils.getBetweenRegx(req.body.code) });

    if (req.body.name != null && req.body.name.length > 0) {
        query.and({
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

    if (req.body.location != null && req.body.location.length > 0) {
        query.and({
            name: {
                '$regex': getBetweenRegx(req.body.location)
                }
        });
    }

    if (req.body.includeall != null && req.body.includeall == true) {
        //no need to check activeto field
    } else if (req.body.isNewRegister != true) {
        query.and({
            activefrom: {
                $lte: new Date(moment().endOf('day').toISOString())
            }
        });
        query.and({
            $or: [{
                activeto: {
                    $gte: new Date(moment().startOf('day').toISOString())
                }
            }, {
                activeto: null
            }]
        });
    }
    if (req.body.notinuserid) {
        query.where('_id').ne(req.body.notinuserid);
    }

    if (req.body.isradiologist != null && req.body.isradiologist == true) {
        query.where('isradiologist').equals(req.body.isradiologist);
    }
    if (req.body.islaboratorist != null && req.body.islaboratorist == true) {
        query.where('islaboratorist').equals(req.body.islaboratorist);
    }
    if (req.body.iscareprovider != null) {
        query.where('iscareprovider').equals(req.body.iscareprovider);
    }
    if (req.body.isopconsultant != null && req.body.isopconsultant == true) {
        query.where('isopconsultant').equals(req.body.isopconsultant);
    }
    if (req.body.isadmitconsultant != null && req.body.isadmitconsultant == true) {
        query.where('isadmitconsultant').equals(req.body.isadmitconsultant);
    }
    /*
    if (req.body.departmentuids && req.body.departmentuids.length > 0) {
        query.and({
            $or: [{
                    'userdepartments.uid': {
                        $in: req.body.departmentuids
                    }
                },
                {
                    alldepartments: true
                }
            ]
        });
    } else if (req.body.departmentuid != null && req.body.departmentuid.length > 0) {
        query.and({
            $or: [{
                    'userdepartments.uid': req.body.departmentuid
                },
                {
                    alldepartments: true
                }
            ]
        });
    }
    */
   
    if (req.body.issurgeon != null && req.body.issurgeon == true) {
        query.where('issurgeon').equals(req.body.issurgeon);
    }
    if (req.body.isanaesthetist != null) {
        query.where('isanaesthetist').equals(req.body.isanaesthetist);
    }
    if (!!req.body.notin && req.body.notin instanceof Array && req.body.notin.length) {
        query.where('_id').nin(req.body.notin);
    }

    if (req.body.selectField)
        query.select(req.body.selectField);

    query.select('code name description titleuid activefrom activeto _id orguid lastname');
    //query.populate('titleuid', 'valuedescription');


    query.exec(function(err, docs) {
        if (!err) {
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

exports.getimagedetail = function(req, res) {
    DoctorImage.findById(req.params.id, function(err, docs) {
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

exports.test = function(req, res) {
    res.status(200).json({
        name: "Success"
    });
}