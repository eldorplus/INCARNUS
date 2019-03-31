var AppointmentSchedule = require('../models/appointmentschedule'); // refre the Model Exported Object schema
var AppointmentSession = require('../models/appointmentsessions');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var resuable = require('../models/framework/reusableobjects');
var SequenceNumber = require('../models/framework/sequencenumber.js');
//var winston = require('winston');
var moment = require('moment');
//var util = require('util');
//var async = require('async');

//  To get Appointment Sessions
exports.searchAppointmentSessions = function (req, res) {

    var query = AppointmentSession.find({
        statusflag: 'A',
        orguid: req.session.orguid,
        careprovideruid: req.body.careprovideruid 
    }, 'code name description activefrom activeto allownewregistration careprovideruid slotdetails')

    query.populate('careprovideruid', 'name titleuid lastname');
    query.populate({ path: 'careprovideruid.titleuid', model: 'ReferenceValue' });
    query.exec(function (err, docs) {
        if (!err) {
            res.status(200).json({ appointmentsessions: docs });
        } else {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        }
    });
}

//  To get appointment session slot details
exports.getappointmentsessionslotdetails = function (req, res) {
    if (req.body.slotdetailsuid && req.body.sessionuid) {
        var query = AppointmentSession.aggregate([{
            $match: {
                "_id": new mongoose.Types.ObjectId(req.body.sessionuid),
                "slotdetails._id": new mongoose.Types.ObjectId(req.body.slotdetailsuid)
            }
        },
        { $unwind: "$slotdetails" },
        {
            $match: {
                "slotdetails._id": new mongoose.Types.ObjectId(req.body.slotdetailsuid)
            }
        }
        ]);

        query.exec(function (err, docs) {
            if (!err) {
                if (docs && docs[0] && docs[0].slotdetails && docs[0].slotdetails._id) {
                    docs[0].slotdetails.allownewregistration = docs[0].allownewregistration;
                    res.status(200).json({ slotdetails: docs[0].slotdetails });
                } else {
                    //winston.error('Record not found', { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
                }
            } else {
                //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
                res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
            }
        });
    } else {
        //winston.error('slotdetailsuid missing', { timestamp: Date.now(), pid: process.pid, url: req.url });
        res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
    }
}


//  To get future appointment details for the patient
exports.getfutureappointmentforpatient = function(req, res) {

    if (req.body != null && req.body.patientuid != null) {
        var startdate = moment.utc().startOf('day').toDate();

        if (req.body.fromdate != null && req.body.fromdate.length > 0) {
            startdate = new Date(req.body.fromdate);
        }

        var mainCondition = {
            "orguid": new mongoose.Types.ObjectId(req.session.orguid),
            "statusflag": "A",
            "iscancelled": false,
            "slots.patientuid": new mongoose.Types.ObjectId(req.body.patientuid),
            "slots.isactive": true,
            "slots.start": { $gte: startdate }
        };

        if (req.body.statusuid != null)
            mainCondition["slots.statusuid"] = new mongoose.Types.ObjectId(req.body.statusuid);

        getSlotDetails(req, res, mainCondition);

    } else {
        //winston.error('No patientuid found', { timestamp: Date.now(), pid: process.pid, url: req.url });
        res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
    }
}

//  To get appointment details based on various criterias
exports.appointmentsearch = function(req, res) {
    var mainCondition = {
        "orguid": new mongoose.Types.ObjectId(req.session.orguid),
        "statusflag": "A"
    };

    if (req.body._id)
        mainCondition._id = new mongoose.Types.ObjectId(req.body._id);
    if (req.body.iscancelled != null)
        mainCondition.iscancelled = req.body.iscancelled;
    if (req.body.department)
        mainCondition.department = req.body.department;
    if (req.body.location)
        mainCondition.clinic = req.body.location;
    if (req.body.appointmentsessionuid)
        mainCondition.appointmentsessionuid = new mongoose.Types.ObjectId(req.body.appointmentsessionuid);
    if (req.body.careprovideruid)
        mainCondition.careprovideruid = new mongoose.Types.ObjectId(req.body.careprovideruid);

    if (req.body.isactive != null)
        mainCondition['slots.isactive'] = req.body.isactive;
    if (req.body.appointmentnumber)
        mainCondition['slots.appointmentnumber'] = req.body.appointmentnumber;
    if (req.body.patientuid)
        mainCondition['slots.patientuid'] = new mongoose.Types.ObjectId(req.body.patientuid);
    if (req.body.isHavingValidPatient)
        mainCondition['slots.patientuid'] = { '$ne': null };

    if (req.body.conflictCheck && req.body.fromdate && req.body.todate) {
        mainCondition['$or'] = [{
            "$and": [
                { 'slots.start': { $gte: new Date(req.body.fromdate) } },
                { 'slots.start': { $lt: new Date(req.body.todate) } }
            ]
        }, {
            "$and": [
                { 'slots.end': { $gt: new Date(req.body.fromdate) } },
                { 'slots.end': { $lte: new Date(req.body.todate) } }
            ]
        }, {
            "$and": [
                { 'slots.start': { $lt: new Date(req.body.fromdate) } },
                { 'slots.end': { $gte: new Date(req.body.todate) } }
            ]
        }];
    } else {
        if (req.body.fromdate) {
            mainCondition['slots.start'] = { $gte: new Date(req.body.fromdate) };
        }

        if (req.body.todate) {
            mainCondition['slots.end'] = { $lte: new Date(req.body.todate) };
        }
    }

    if (req.body.statusuids && req.body.statusuids.length) {
        var statusuids = [];
        for (var i in req.body.statusuids)
            statusuids.push(new mongoose.Types.ObjectId(req.body.statusuids[i]));
        mainCondition['slots.statusuid'] = { $in: statusuids };
    }
    getSlotDetails(req, res, mainCondition);
}


//  To get slot details
function getSlotDetails(req, res, mainCondition) {

    var noOfItem = req.body.limit || 0;
    var pageNumber = req.body.page || 0;

    var aggQuery = [];
    aggQuery.push({ $match: mainCondition }, { $unwind: "$slots" }, { $match: mainCondition }, { "$sort": { "slots.start": 1 } });

    if (noOfItem > 0 && !!pageNumber > 0) {
        aggQuery.push({
            $skip: (noOfItem * (pageNumber - 1))
        });
        aggQuery.push({
            $limit: noOfItem
        });
    }

    var query = AppointmentSchedule.aggregate(aggQuery);

    query.exec(function(err, docs) {
        if (err) {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            return res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        }

        if (!docs || !docs.length)
            return res.status(200).json({ appointments: [] });

        AppointmentSchedule.populate(docs, [
            { path: 'slots.patientuid', select: 'mrn titleuid firstname middlename lastname genderuid dateofbirth contact patientimageuid isanonymous' },
            { path: 'slots.statusuid', select: 'valuedescription' },
            { path: 'careprovideruid', select: 'name lastname' }
        ], function(err3, docs3) {
            if (err3) {
                //winston.error(err3, { timestamp: Date.now(), pid: process.pid, url: req.url });
                return res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
            }

            if (!docs3 || !docs3.length)
                return res.status(200).json({ appointments: [] });

            AppointmentSchedule.populate(docs3, [
                { path: 'slots.patientuid.genderuid', select: 'valuedescription', model: 'ReferenceValue' },
                { path: 'slots.patientuid.titleuid', select: 'valuedescription', model: 'ReferenceValue' }
            ], function(err2, docs2) {
                if (err2) {
                    //winston.error(err2, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    return res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
                }

                res.status(200).json({ appointments: formOutContent(docs2) });
            });
        });
    });

    function formOutContent(docs2) {
        var outputdocs = [];
        if (docs2 != null && docs2.length > 0) {
            for (var k = 0; k < docs2.length; k++) {
                docs2[k].slots.department = docs2[k].department;
                docs2[k].slots.careprovideruid = docs2[k].careprovideruid;
                docs2[k].slots.appointmentdate = docs2[k].appointmentdate;
                docs2[k].slots.appointmentdate = docs2[k].appointmentdate;
                docs2[k].slots.scheduleuid = docs2[k]._id;

                var patient = docs2[k].slots.patientuid;
                outputdocs.push(docs2[k].slots);
            }
        }
        return outputdocs;
    }
}


//  To cancel appointment slot 
exports.cancelappointment = function(req, res) {
    if (req.body != null && req.body.selectedscheduleuids != null) {
        var query = AppointmentSchedule.update({ _id: { $in: req.body.selectedscheduleuids } }, {
            $set: {
                iscancelled: true,
                cancelleddate: Date.now(),
                cancelreasonuid: req.body.cancelreasonuid,
                cancelcomments: req.body.cancelcomments,
                cancelledby: req.session.useruid
            }
        }, { multi: true });

        query.exec(function(err, docs) {
            if (!err) {
                res.status(200).json({});
            } else {
                //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
                res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
            }
        });
    } else {
        //winston.error('selectedscheduleuids not found', { timestamp: Date.now(), pid: process.pid, url: req.url });
        res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
    }
}

//  To generate next sequence number 
function getNextSequence(orguid, callback) {
    SequenceNumber.getNextSequence({
        code: 'APPOINTMENT',
        entypeuid: null,
        orguid: orguid
    }, function(seqErr, seqDocs) {
        if (!!seqErr) {
            callback(seqErr, null);
            return;
        } else {
            callback(null, seqDocs);
            return;
        }
    });
}


//  To add booking 
exports.addbooking = function(req, res) {
    addbooking(req, res);
}

exports.addbookingcallback = function(req, res, callback, filter) {
    if (!!filter) req.body = filter;
    addbooking(req, res, function(err, appt) {
        if (!!err) {
            callback(err, null);
        } else {
            callback(null, appt);
        }
    });
}

function addbooking(req, res, callback) {
    if (!req.body || !req.body.scheduleuid) {
        //winston.error('No scheduleuid found', { timestamp: Date.now(), pid: process.pid, url: req.url });
        if (!!callback) {
            setTimeout(function() { callback('ERRORS.RECORDNOTFOUND'); });
            return;
        } else {
            res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
            return;
        }
    }

    var templog = [{
        useruid: req.session.useruid,
        statusuid: req.body.statusuid,
        modifiedat: Date.now(),
        reasonuid: null,
        comments: req.body.comments
    }];

    getNextSequence(req.session.orguid, function(dsErr, appintNo) {
        if (!!dsErr) {
            //winston.error(dsErr, { timestamp: Date.now(), pid: process.pid, url: req.url });
            if (!!callback) {
                setTimeout(function() { callback('ERRORS.SEQNUM'); });
                return;
            } else {
                res.status(500).json({ error: 'ERRORS.SEQNUM' });
                return;
            }
        }

        AppointmentSchedule.findByIdAndUpdate(req.body.scheduleuid, {
                $push: {
                    "slots": {
                        start: req.body.start,
                        end: req.body.end,
                        expirydate: req.body.expirydate || null,
                        allDay: req.body.allDay,
                        title: req.body.title,
                        description: req.body.description,
                        backgroundcolor: req.body.backgroundcolor,
                        patientuid: req.body.patientuid,
                        priorityuid: req.body.priorityuid,
                        needstransport: req.body.needstransport,
                        modeuid: req.body.modeuid,
                        smstextuid: req.body.smstextuid,
                        isactive: req.body.isactive,
                        comments: req.body.comments,
                        statusuid: req.body.statusuid,
                        statusreason: req.body.statusreason,
                        isoverbooking: req.body.isoverbooking,
                        appointmentnumber: appintNo,
                        bookedbyuseruid: req.session.useruid
                    }
                }
            }, {
                safe: true,
                upsert: true
            }, function(err, model) {
                if (!err) {
                    //(req,patientuid,dataset,datasetuid,preaudit,postaudit)
                    //auditlog.logaudit(req, req.body.patientuid, 'AppointmentSchedule', req.body.scheduleuid, null, req.body.patientuid);
                    if (!!callback) {
                        setTimeout(function() { callback(null, model); });
                        return;
                    } else {
                        res.status(200).json({});
                    }
                } else {
                    //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    if (!!callback) {
                        setTimeout(function() { callback('ERRORS.CREATEERROR'); });
                        return;
                    } else {
                        res.status(500).json({ error: 'ERRORS.CREATEERROR' });
                    }
                }
            });
        });
    
}

//  To modify booking 
exports.modifybooking = function(req, res) {
    if (!req.body || !req.body.scheduleuid) {
        //winston.error('No scheduleuid found', { timestamp: Date.now(), pid: process.pid, url: req.url });
        res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        return;
    }

    if (req.body.orgscheduleuid == null || req.body.scheduleuid == req.body.orgscheduleuid) {
        var templog = {
            useruid: req.session.useruid,
            statusuid: req.body.statusuid,
            modifiedat: Date.now(),
            reasonuid: req.body.reasonuid,
            comments: req.body.statusreason
        };
        AppointmentSchedule.findOneAndUpdate({ _id: req.body.scheduleuid, "slots._id": req.body._id }, {
            '$set': {
                'slots.$.start': req.body.start,
                'slots.$.end': req.body.end,
                'slots.$.allDay': req.body.allDay,
                'slots.$.title': req.body.title,
                'slots.$.description': req.body.description,
                'slots.$.backgroundcolor': req.body.backgroundcolor,
                'slots.$.patientuid': req.body.patientuid,
                'slots.$.priorityuid': req.body.priorityuid,
                'slots.$.needstransport': req.body.needstransport,
                'slots.$.smstextuid': req.body.smstextuid,
                'slots.$.isactive': req.body.isactive,
                'slots.$.comments': req.body.comments,
                'slots.$.statusuid': req.body.statusuid,
                'slots.$.reasonuid': req.body.reasonuid,
                'slots.$.modeuid': req.body.modeuid,
                'slots.$.statusreason': req.body.statusreason,
            },
            '$push': { "slots.$.auditlog": templog }
        }, function(err, model) {
            if (!err) {
                //auditlog.logaudit(req, req.body.patientuid, 'AppointmentSchedule', req.body.scheduleuid, null, req.body._id);
                res.status(200).json({});
            } else {
                //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
                res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
            }
        });
    } else if (req.body.scheduleuid != req.body.orgscheduleuid) {
        // appointment is reschedule.
        var templog = {
            useruid: req.session.useruid,
            statusuid: req.body.reschedulestsvalue,
            modifiedat: Date.now(),
            reasonuid: req.body.reasonuid,
            comments: req.body.statusreason
        };

        AppointmentSchedule.findOneAndUpdate({
            _id: req.body.orgscheduleuid,
            "slots._id": req.body._id
        }, {
            '$set': {
                'slots.$.statusuid': req.body.reschedulestsvalue,
                'slots.$.isactive': false,
                'slots.$.backgroundcolor': 'orange',
                'slots.$.reasonuid': req.body.reasonuid,
                'slots.$.statusreason': req.body.statusreason
            },
            '$push': { "slots.$.auditlog": templog }
        }, {
            new: true
        }, function(err, doc) {
            if (err || !doc) {
                //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
                res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
                return;
            }

            var oldSlot = doc.slots.filter(function(item) {
                return item._id == req.body._id;
            })[0];

            if (!oldSlot || !oldSlot._id) {
                /*winston.error('Cant find old slot while reschedule', {
                    timestamp: Date.now(),
                    pid: process.pid,
                    url: req.url
                });*/
                res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
                return;
            }

            AppointmentSchedule.findByIdAndUpdate(req.body.scheduleuid, {
                $push: {
                    "slots": {
                        start: req.body.start,
                        end: req.body.end,
                        allDay: req.body.allDay,
                        title: req.body.title,
                        description: req.body.description,
                        backgroundcolor: req.body.backgroundcolor,
                        patientuid: req.body.patientuid,
                        priorityuid: req.body.priorityuid,
                        needstransport: req.body.needstransport,
                        smstextuid: req.body.smstextuid,
                        isactive: req.body.isactive,
                        comments: req.body.comments,
                        statusuid: req.body.statusuid,
                        reasonuid: req.body.reasonuid,
                        modeuid: req.body.modeuid,
                        statusreason: req.body.statusreason,
                        appointmentnumber: oldSlot.appointmentnumber,
                        bookedbyuseruid: req.session.useruid
                    }
                }
            }, {
                safe: true,
                upsert: true
            }, function(innererr, model) {
                if (!innererr) {
                    //auditlog.logaudit(req, req.body.patientuid, 'AppointmentSchedule', req.body.scheduleuid, null, req.body._id);
                    //updateFutureOrder(req, res);
                    res.status(200).json({});
                } else {
                    //winston.error(innererr, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
                }
            });
        });
    }
}

//  To check max appointments
exports.checkmaxappointments = function(req, res) {
    if (!req.body._id || !req.body.timinguid || !req.body.starttime || !req.body.endtime)
        return res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });

    var query = AppointmentSchedule.findById(req.body._id);
    query.lean().exec(function(err, doc) {
        if (err) {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            return res.status(500).json({ error: 'ERRORS.NOSCHEDULE' });
        }

        if (!doc || !doc._id || !doc.timings || !doc.timings.length)
            return res.status(500).json({ error: 'ERRORS.NOSCHEDULE' });

        var matchedTimings = doc.timings.filter(function(item) {
            return item._id == req.body.timinguid;
        })[0];

        if (!matchedTimings)
            return res.status(500).json({ error: 'ERRORS.NOSCHEDULE' });

        if (!matchedTimings.maxappointments || !doc.slots || !doc.slots.length)
            return res.status(200).json({ allowappoinment: true });

        var activeSlots = doc.slots.filter(function(item) {
            return item.isactive && item.rendering != 'background' && moment.utc(item.start) >= moment.utc(req.body.starttime) && moment.utc(item.end) < moment.utc(req.body.endtime);
        });

        if (activeSlots && activeSlots.length >= matchedTimings.maxappointments) {
            res.status(200).json({
                allowappoinment: false,
                maxappointments: matchedTimings.maxappointments
            });
        } else {
            res.status(200).json({ allowappoinment: true });
        }
    });
}
