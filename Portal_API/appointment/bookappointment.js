var AppointmentSchedule = require('../models/appointmentschedule'); // refre the Model Exported Object schema
var AppointmentSession = require('../models/appointmentsession');
var Patient = require('../models/patient'); // refre the Model Exported Object schema
var bcrypt = require('bcryptjs');
var crypto = require('crypto');

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
        orguid: req.session.orguid
    });
    query.where('careprovideruid').equals(req.body.careprovideruid);
    console.log(req.body);
    query.select('code name description activefrom activeto allownewregistration careprovideruid slotdetails');
    query.populate('careprovideruid', 'name titleuid lastname');
    //query.populate({ path: 'careprovideruid.titleuid', model: 'ReferenceValue' });
    query.lean().exec(function (err, docs) {
        if (!err) {
            res.status(200).json({ appointmentsessions: docs });
        } else {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        }
    });
}

//  To get Appointment schedule
exports.getAppointmentSchedule = function (req, res) {

    var query = AppointmentSchedule.find({
        statusflag: 'A',
        orguid: req.session.orguid
    });
    query.where('appointmentsessionuid').equals(req.body.appointmentsessionuid);
    
    console.log(req.body);
    query.select('_id appointmentdate careprovideruid slots');
    query.lean().exec(function (err, docs) {
        if (!err) {
            res.status(200).json({ appointments: docs });
        } else {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        }
    });
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

    if ( req.body.fromdate && req.body.todate) { // req.body.conflictCheck &&
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

    console.log(mainCondition);

    var aggQuery = [];
    aggQuery.push({ $match: mainCondition }, { $unwind: "$slots" }, { $match: mainCondition }, { "$sort": { "slots.start": 1 } });
    //aggQuery.push({ $match: mainCondition });

    /*
    if (noOfItem > 0 && !!pageNumber > 0) {
        aggQuery.push({
            $skip: (noOfItem * (pageNumber - 1))
        });
        aggQuery.push({
            $limit: noOfItem
        });
    }
    */

    var query = AppointmentSchedule.aggregate(aggQuery);

    query.exec(function(err, docs) {
        if (err) {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            return res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        }
        console.log(docs);

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


//  To cancel appointment schedule 
exports.cancelappointment = function(req, res) {
    if (req.body != null && req.body.selectedscheduleuids != null) {
        var query = AppointmentSchedule.update({ "slots._id": { $in: req.body.selectedscheduleuids } }, {
            $set: {
                'slots.$.isactive': false,
                'slots.$.cancelleddate': Date.now(),
                'slots.$.cancelreasonuid': req.body.cancelreasonuid,
                'slots.$.cancelcomments': req.body.cancelcomments,
                'slots.$.cancelledby': req.session.useruid
            }
        }, { multi: true });

        query.exec(function(err, docs) {
            if (!err) {
                res.status(200).json({});
            } else {
                console.log(err);
                //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
                res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
            }
        });
    } else {
        //winston.error('selectedscheduleuids not found', { timestamp: Date.now(), pid: process.pid, url: req.url });
        res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
    }
}

/*//  To generate next sequence number 
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
*/

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
    console.log(req.body);

    var templog = [{
        useruid: req.session.useruid,
        statusuid: req.body.statusuid,
        modifiedat: Date.now(),
        reasonuid: null,
        comments: req.body.comments
    }];

    //  Slot No will be passed from UI  
    appintNo = "APP0" + req.body.slotno;

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
        //});
    
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

//  Create Schedule for the appointment session id 
exports.create = function(req, res) {
    console.log(req.body);
    createSchedule(req, req.body, function(err, uid) {
        if (!err) {
            res.status(200).json({ uid: uid });
        } else {
            res.status(500).json({ error: err });
        }
    });
}


//create method. First check for exist and then create if not exists.
//temp.fromdate , temp.todate, temp.sessionuid, temp.slotuids = [];
var createSchedule = exports.createSchedule = function(req, filter, callback) {
    console.log(filter.sessionuid);
    AppointmentSchedule.find({
        appointmentsessionuid: filter.sessionuid,
        appointmentdate: {
            $gte: filter.fromdate,
            $lte: filter.todate
        },
        iscancelled: false,
        orguid: req.session.orguid
    }).lean().exec(function(err, appschedules) {
        if (err) {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            //console.log(err);
            return callback('ERRORS.RECORDNOTFOUND');
        }

        if (!appschedules) { appschedules = []; }
        //console.log(filter.sessionuid);
        AppointmentSession.findById(filter.sessionuid, function(error, sessdocs) {
            if (error) {
                //winston.error(error, { timestamp: Date.now(), pid: process.pid, url: req.url });
                //console.log("session not found - " + error);
                return callback('ERRORS.RECORDNOTFOUND');
            }
            console.log(sessdocs);
            if (!sessdocs || !sessdocs.slotdetails || !sessdocs.slotdetails.length) {
                //winston.error('slotdetails not found - id=' + filter.sessionuid, { timestamp: Date.now(), pid: process.pid, url: req.url });
                //console.log("slots not found ");
                return callback('ERRORS.RECORDNOTFOUND');
            }

            //now create the schedule for each day.
            var appointmentsession = sessdocs;
            var scheduleArray = [];
            var start = moment.utc(filter.fromdate);
            var end = moment.utc(filter.todate);
            var noofdays = end.diff(start, 'days') + 1;
            console.log("slot length - " + filter.slotuids.length);
            //console.log("slot id - " + filter.slotuids[0]);

            for (var j = 0; j < filter.slotuids.length; j++) {
                /*var slot = appointmentsession.slotdetails.filter(function(item) {
                    return item._id && filter.slotuids[j]._id && item._id.toString() == filter.slotuids[j]._id.toString();
                })[0]; */
                var slot = appointmentsession.slotdetails[0];
                console.log(slot);
                if (!slot) continue;

                for (var i = 0; i < noofdays; i++) {
                    /**   {Number} daysofweek - Sun - 0, Mon - 1, Tue - 2, etc denoting the days in which the slots is recurring*/
                    //daysofweek : [Number],
                    //still need to incorporate the logic for every 2 weeks, 3 weeks, etc.
                    var apptdate = moment.utc(filter.fromdate);
                    if (i > 0)
                        apptdate.add(i, 'days');

                    var dow = moment.utc(filter.fromdate).add(req.session.utcoffset, 'm').add(i, 'days').day();
                    console.log("dow - " + dow);
                    var isallowed = slot.daysofweek.filter(function(item) { return (item == dow) });
                    if (!isallowed || !isallowed.length) { continue; }
                    var appointmentdate = apptdate.add(req.session.utcoffset, 'm').toDate();

                    for (var k = 0; k < appschedules.length; k++) {
                        if (appschedules[k].departmentuid && slot.departmentuid && appschedules[k].departmentuid.toString() == slot.departmentuid.toString() && appschedules[k].appointmentdate.toISOString() == appointmentdate.toISOString()) {
                            return callback('ERRORS.APPOINTMENTSCHEDULEEXISTS');
                        }
                    }

                    var newschedule = new AppointmentSchedule();
                    newschedule.appointmentsessionuid = appointmentsession._id;
                    newschedule.appointmentslotdetailsuid = slot._id;
                    newschedule.appointmentdate = appointmentdate;
                    newschedule.generatedby = req.session.useruid;
                    //newschedule.generatecomments = filter.gencomments;
                    newschedule.careprovideruid = appointmentsession.careprovideruid;
                    //newschedule.departmentuid = slot.departmentuid;
                    //newschedule.clinicuid = slot.clinicuid;
                    newschedule.department = slot.department;
                    newschedule.location = slot.location;
                    newschedule.timings = [];

                    if (slot.timings != null && slot.timings.length > 0) {
                        for (var k = 0; k < slot.timings.length; k++) {
                            var temp = {};
                            temp.starttime = slot.timings[k].starttime;
                            temp.endtime = slot.timings[k].endtime;
                            temp.isslotbased = slot.timings[k].isslotbased;
                            temp.duration = slot.timings[k].duration;
                            temp.noofslots = slot.timings[k].noofslots;
                            temp.maxappointments = slot.timings[k].maxappointments;
                            newschedule.timings.push(temp);
                        }
                    }

                    newschedule.iscancelled = false;
                    newschedule.createdby = req.session.useruid;
                    newschedule.createdat = Date.now();
                    newschedule.modifiedby = req.session.useruid;
                    newschedule.modifiedat = Date.now();
                    newschedule.statusflag = "A";
                    newschedule.orguid = req.session.orguid;
                    scheduleArray.push(newschedule);
                }
            }

            if (!scheduleArray || !scheduleArray.length) {
                return callback('ERRORS.DOWNOTFOUND');
            }

            AppointmentSchedule.insertMany(scheduleArray, function(referror, refdocs) {
                if (!referror) {
                    //auditlog.logaudit(req, null, 'AppointmentSchedule', appointmentsession._id, null, scheduleArray);
                    callback(null, appointmentsession._id);                   
                } else {
                    //winston.error(referror, { timestamp: Date.now(), pid: process.pid, url: req.url });
                    callback('ERRORS.CREATEERROR');
                }
            });
        });
    });
}

//  To cancel appointment booking 
exports.cancelbooking = function(req, res) {
    if (req.body != null && req.body.selectedscheduleuids != null) {
        var query = AppointmentSchedule.update({ _id: { $in: req.body.selectedscheduleuids }, "slots.patientuid": req.body.patientuid }, {
            $set: {
                isactive: false,
                reasonuid: req.body.cancelreasonuid,
                statusreason: req.body.cancelcomments,
                bookedbyuser: req.session.username
            }
        }, { multi: true });

        query.exec(function(err, docs) {
            if (!err) {
                res.status(200).json({});
            } else {
                console.log(err);
                //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
                res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
            }
        });
    } else {
        //winston.error('selectedscheduleuids not found', { timestamp: Date.now(), pid: process.pid, url: req.url });
        res.status(500).json({ error: 'ERRORS.UPDATEERROR' });
    }
}


//  Book appointment for the patient  
exports.bookappointment = function(req, res) {
    console.log(req.body);
    if (!req.body.patientuid) {
        //  Create Patient 
        createpatient(req, res, function(err, uid) {
            if (!err) {
                console.log(uid);
                //  Create Booking 
                addbooking(uid, req, res);

                res.status(200).json({ uid: uid });
            } else {
                res.status(500).json({ error: err });
            }
        });
    }
    else{
        if (!req.body.scheduleuid) {
            //  Create Schedule 

            //  Create Booking 

        }
        else
        {
            //  Create Booking 
            addbooking(req, res);
        }
    }
}


//create method. First check for exist and then create if not exists.
var createpatient = function(req, res, callback) {
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
            sequence = req.body.mobilephone.toUpperCase() + '-' + req.body.dateofbirth ;

                newPatient.mrn = sequence;
                newPatient.internalmrn = newPatient.mrn.replace(/-/g, '');
                newPatient.tempmrnid = newPatient.mrn;
                newPatient.loginid = req.body.mobilephone.toUpperCase();
                //newPatient.password =  req.body.mobilephone.toUpperCase();
                var password =  (req.body.firstname.toUpperCase() + req.body.lastname.toUpperCase()).substring(0,4) + req.body.dateofbirth.substring(0,4);
                console.log(password);
                bcrypt.hash(password, 10, function(err, hash) {

                    if (!err && hash != null) {
                        var md5password = crypto.createHash('md5').update(password).digest("base64");
                        newPatient.password = hash;
                        newPatient.externalpassword = md5password;
                        console.log(md5password);
                    }
                    // Store hash in your password DB.
                });
            

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
                //console.log(newPatient);
                newPatient.save(function(Innererr) {
                    if (!Innererr) {
                        //var postaudit = newPatient.toJSON();

                        //auditlog.logaudit(req, newPatient._id, 'Patient', newPatient._id, null, postaudit);
                        var pat = {};
                        pat.uid = newPatient._id;
                        pat.mrn = newPatient.mrn;
                        pat.firstname = newPatient.firstname;
                        pat.middlename = newPatient.middlename;
                        pat.lastname = newPatient.lastname;
                        pat.localfirstname = newPatient.localfirstname;
                        pat.localmiddlename = newPatient.localmiddlename;
                        pat.locallastname = newPatient.locallastname;
                        
                        if (!!callback) {
                            //setTimeout(function() { callback(null, pat); });
                            return pat.uid;
                        } else {
                            /*res.status(200).json({
                                patient: pat.uid
                            });*/
                            return pat.uid;
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
                var patid = "";
                for (var i = 0; i < docs.length; i++) {
                    duplicateIDs += docs[i].mrn;
                    duplicateIDs += ',';
                    patid = docs[i]._id;
                }
                if (!!callback) {
                    //setTimeout(function() { callback('ERRORS.DUPLICATEPATIENT'); });
                    return patid;
                } else {
                    /*res.status(200).json({
                        patient: patid
                    });*/
                    return patid;

                    /*res.status(500).json({
                        error: 'ERRORS.DUPLICATEPATIENT',
                        duplicateIDs: duplicateIDs
                    });*/
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

//  Interface
//  To get appointment schedule details based on the modified date 
exports.getappointmentscheduledetails = function (req, res) {

    var query = AppointmentSchedule.find({
        statusflag: 'A',
        orguid: req.session.orguid, 
        modifiedat: {
            $gte: req.body.fromdate 
        }
     });
    query.select('appointmentsessionuid appointmentslotdetailsuid appointmentdate comments  department location careprovideruid modifiedby modifiedat slots timings');
    query.lean().exec(function (err, docs) {
        if (!err) {
            res.status(200).json({ schedules: docs });
        } else {
            //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
            res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
        }
    });
};
