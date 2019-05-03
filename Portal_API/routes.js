module.exports = function(app) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    // frontend routes =========================================================

    //Security
    var security = require('./common/security');
    //  Authenticate 
    app.post('/common/security/authenticate', security.checkloginpassword);
    //  Change password 
    app.post('/common/security/changepassword', security.changepassword);
    //  Change password 
    app.post('/common/security/resetpassword', security.resetpassword);
    //  Test sms *
    app.post('/common/security/testsms', security.Testsms);
    //  get verification code
    app.post('/common/security/getverificationcode', security.getverificationcode);
    //  Verify sms *
    app.post('/common/security/verifysms', security.Verifysms);
    

    //Doctors
    var doctor = require('./appointment/doctor');
    app.get('/appointment/doctor/test', doctor.test);
    //  drop down list
    app.post('/getorganisationlist', doctor.getorganisationlist);

    //  drop down list
    app.post('/getdropdownlist', doctor.getdropdownlist);
    //  Doctor search
    app.post('/appointment/doctor/search', doctor.search);
    //  Get doctor photo
    app.post('/appointment/doctor/getimagedetail/:id', doctor.getimagedetail);
    //  Get doctor profile - for doctor id 
    app.post('/appointment/doctor/getdoctordetail', doctor.getdoctordetail);
    //  save doctor photo 
    app.post('/appointment/doctor/savedoctorphoto', doctor.savedoctorphoto);

    //Book Appointment
    var appointment = require('./appointment/bookappointment');
    //  To get upcoming appointments for the given patient
    app.post('/appointment/bookappointment/futureappointments', appointment.getfutureappointmentforpatient);
    //  To get appointment session for the doctor / location 
    app.post('/appointment/bookappointment/getappointmentsessions', appointment.searchAppointmentSessions);
    //  To get slot details for the appointment session
    //app.post('/appointment/bookappointment/getappointmentsessionslotdetails', appointment.getappointmentsessionslotdetails);
    //  To get appointment schedule
    app.post('/appointment/bookappointment/searchappointment', appointment.appointmentsearch);
    //  To get appointment schedule id
    app.post('/appointment/bookappointment/getAppointmentSchedule', appointment.getAppointmentSchedule);

    //  To Create appointment schedule
    app.post('/appointment/bookappointment/createschedule', appointment.create);
    //  To cancel appointment schedule
    app.post('/appointment/bookappointment/cancelschedule', appointment.cancelappointment);
    
    //  To book new appointment booking 
    app.post('/appointment/bookappointment/addbooking', appointment.addbooking);
    //  To modify appointment booking 
    app.post('/appointment/bookappointment/modifybooking', appointment.modifybooking);
    //  To cancel appointment booking 
    app.post('/appointment/bookappointment/cancelbooking', appointment.cancelbooking);

    //  To Book an appointment -- including patient creation 
    app.post('/appointment/bookappointment/bookappointment', appointment.bookappointment);

    //  To check max appointments
    app.get('/appointment/bookappointment/checkmaxappointments', appointment.checkmaxappointments);
    
    
    //Patient
    var patient = require('./appointment/patient');
    //  To get basic details of the patient for patient card display - id 
    app.post('/appointment/patient/getbasicdetail', patient.getbasicdetail);
    //  To get all details / documents of the patient - id 
    app.post('/appointment/patient/getfulldetail', patient.getdetail);
    //  To creaate patient with basic details
    app.post('/appointment/patient/create', patient.create);
    //  To duplicate check of the patient basic details
    app.post('/appointment/patient/checkpatientbybasicdetail', patient.checkpatientbybasicdetail);
    //  To get patient id by mrn
    app.post('/appointment/patient/getpatientbymrn', patient.getpatientuidbymrn);
    //  To save patient photo
    app.post('/appointment/patient/savepatientphoto', patient.savepatientphoto);
    app.post('/appointment/patient/getpatientphoto', patient.getimagedetail);


    //Patient Reports
    var report = require('./report/patientvisit');
    //  Get list of Patients for the logged-in user (based on mobile number)
    app.post('/report/patientvisit/getpatientuidbyloginid', report.getpatientuidbyloginid);
    //  To get patient visits for the given patient - id 
    app.post('/report/patientvisit/getvisitsforpatient', report.getvisitsforpatient);
    //  To get repots/documents list for the given patient visit - id 
    app.post('/report/patientvisit/getreportsforpatientvisit', report.getreportsforpatientvisit);
    //  To get document details for the given report - id
    app.post('/report/patientvisit/getreportdetail', report.getreportdetail);
    //  To save document details 
    app.post('/report/patientvisit/savereportdetail', report.savereportdetail);

    //Interface
    //  save doctor information
    app.post('/interface/savedoctorinformation', doctor.savedoctorinformation);
    //  save doctor photo 
    app.post('/interface/savedoctorphoto', doctor.savedoctorphoto);

    //  save patient information
    app.post('/interface/receivepatientinformation', patient.create);
    //  save patient photo 
    app.post('/interface/savepatientphoto', patient.savepatientphoto);
    //  generate password for patients
    app.post('/interface/createpassword', security.changepassword);
    //  To get all details of the patient 
    app.post('/interface/getpatientdetail', patient.getdetail);
    //  To get all details of the patient based on date
    app.post('/interface/getpatientdetails', patient.getpatientdetails);

    //  save patient visits
    app.post('/interface/savepatientvisits', report.savepatientvisitinformation);
    //  save patient reports
    app.post('/interface/savepatientreports', report.savereportdetail);

    //  To get appointment schedule information for the appointment session 
    app.post('/interface/getAppointmentSchedulesforSession', appointment.getAppointmentSchedule);
    //  To get appointment schedule information based on the date 
    app.post('/interface/getappointmentscheduledetails', appointment.getappointmentscheduledetails);


/*
    //The thirdparty routes must always be at last.
    //If any new routes file are required , please add above this.
    require('./thirdparty/thirdparty_routes.js')(app);
*/
    // route to handle all angular requests
    app.get('*', function(req, res) {
        //res.sendfile('../public/index.html');
        var path = require('path');
        res.sendFile(path.resolve('public/index.html'));
    });

};