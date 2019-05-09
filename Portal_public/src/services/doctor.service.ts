import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { environment } from '../environments/environment';


import { Observable } from 'rxjs';
import { IPatientVisit } from '../app/PatientVisit';
import { IPatient } from '../app/Patient';
@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  token: any;
  status: any;
  spec: any;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  };
  constructor(private http: HttpClient) { }
  _doctorurl = 'http://localhost:8080/appointment/doctor/search';


  _patient = 'assets/data/Patient.json';
  _patientvisit = 'assets/data/PatientVisit.json';

  _localAPIURL = 'http://localhost:8080/';
  _ExternalAPIURL = 'http://52.220.168.61:8090/';

  getDoctor() {
    return this.http.get(this._doctorurl);
  }

  update_doctor(location) {
    // var doc = JSON.parse(a);
    return this.http.get(`${environment.apiUrl}/appointment/doctor/search?location=` + location);
  }

  authenticate(mobileno: string, password: string) {
    return this.http.post<any>(this._localAPIURL + 'common/security/authenticate', { 'loginid': mobileno, 'password': password });
  }

  ChangePassword(useruid: string, password: string) {
    return this.http.post<any>(this._localAPIURL + 'common/security/changepassword', { 'useruid': useruid, 'password': password });
  }

  getverificationcode() {
    return this.http.post<any>(this._localAPIURL + 'common/security/getverificationcode', {});
  }

  verifysms(mobilephone: any, verificationcode: any, username: any) {
    return this.http.post<any>(this._localAPIURL + 'common/security/verifysms', {
      mobilephone: mobilephone,
      verificationcode: verificationcode,
      username: username
    });
  }


  //  Book Appointment functionality
  //  ******************************

  // To get specialty list 


  getspecialtylist() {
    return this.http.post<any>(this._localAPIURL + 'getdropdownlist', { 'domaincode': 'SPECIALTY' });
  }

  getLocationList() {
    //return this.http.post<any>('http://localhost:8080/getdropdownlist', { 'domaincode': 'LOCATION' });
    return this.http.post<any>(this._localAPIURL + 'getorganisationlist', { });
  }

  getTitleList() {
    return this.http.post<any>(this._localAPIURL + 'getdropdownlist', { 'domaincode': 'TITLE' });
  }

  getGenderList() {
    return this.http.post<any>(this._localAPIURL + 'getdropdownlist', { 'domaincode': 'GENDER' });
  }


  // To search doctors based on location, doctor name & specialty 
  doctorsearch(name: any, location: any, specialtyid: any) {
    return this.http.post<any>(this._localAPIURL + 'appointment/doctor/search', { 'name': name, 'location': location, 'specialtyuid': specialtyid });
  }

  // To get doctor photo for the doctor id 
  getdoctorphoto(doctorid: any) {
    return this.http.post<any>(this._localAPIURL + 'appointment/doctor/getimagedetail/' + doctorid, { 'id': doctorid });
  }

  // To get doctor profile information for the doctor id 
  getdoctorprofile(doctorid: any) {
    return this.http.post<any>(this._localAPIURL + 'appointment/doctor/getdoctordetail', { 'id': doctorid });
  }

  // To get appointment session information for the doctor id 
  getappointmentschedule(sessionid: any, AppointmentDate: string) {
    //return this.http.post<any>('http://localhost:8080/appointment/bookappointment/searchappointment', { 'appointmentsessionuid': sessionid, 'fromdate': AppointmentDate, 'todate': AppointmentDate });
    return this.http.post<any>(this._localAPIURL + 'appointment/bookappointment/getAppointmentSchedule', { 'appointmentsessionuid': sessionid, 'fromdate': AppointmentDate, 'todate': AppointmentDate });
  }

  // To get appointment schedule information for the session
  getappointmentsession(doctorid: any) {
    return this.http.post<any>(this._localAPIURL + 'appointment/bookappointment/getappointmentsessions', { 'careprovideruid': doctorid });
  }

  savephoto(data: any) {
    return this.http.post<any>(this._localAPIURL + 'appointment/doctor/savedoctorphoto', { 'filepath': data });
  }

  savedoctorinformation(data: any) {
    return this.http.post<any>(this._localAPIURL + 'interface/savedoctorinformation', data);
  }





  // To create schedule 
  createSchedule(sessionid: any, AppointmentDate: Date, slotuids: any[]) {
    return this.http.post<any>(this._localAPIURL + 'appointment/bookappointment/createschedule', { 'sessionuid': sessionid, 'fromdate': AppointmentDate, 'todate': AppointmentDate, 'slotuids': slotuids });
  }

  //  To create patient 
  createPatient(param: any, orguid: any, useruid: any ) {
    return this.http.post<any>(this._localAPIURL + 'http://52.220.168.61:8090/patientportal/patient/create', param, { headers : {'orguid' : orguid , 'useruid' : useruid }});
  }

  //  To add booking 
  addbooking(param: any, head: any) {
    return this.http.post<any>(this._ExternalAPIURL + 'patientportal/appointmentschedule/addbooking', param, head);
  }


  getCancelReasonList() {
    return this.http.post<any>(this._localAPIURL + 'getdropdownlist', { 'domaincode': 'CANCELREASON' });
  }

  cancelAppointment(scheduleid: any, slotid: any, reasonid: string, comment: string, orguid: any, useruid: any) {
    return this.http.post<any>(this._ExternalAPIURL + 'patientportal/appointmentschedule/cancelbooking', { 'scheduleuid': scheduleid, '_id' : slotid, 'cancelreasonuid': reasonid, 'cancelcomments': comment } , { headers : {'orguid' : orguid , 'useruid' : useruid }});
  }

  //  Patient Visit & Reports functionality
  //  *************************************
  // To get patient details for the login id 
  getpatientsbylogin(useruid) {
    // let myheader = new Headers({ 'content-type': 'application/json' });
    // let option = new RequestOptions({ headers: myheader });

    let user = { 'useruid': useruid };
    return this.http.post<any>(this._localAPIURL + 'report/patientvisit/getpatientuidbyloginid', user);
  }

  // To get patient card detail for the patient id 
  getpatientcarddetail(patientid: any) {
    return this.http.post<any>(this._localAPIURL + 'appointment/patient/getbasicdetail', { 'id': patientid });
  }



  getpatientphoto(patientid: any) {
    return this.http.post<any>(this._localAPIURL + 'appointment/patient/getpatientphoto', { 'id': patientid });
  }

  // To get Visit information for the selected patient id 
  getPatientVisits(patientid: any) {
    return this.http.post<any>(this._localAPIURL + 'report/patientvisit/getvisitsforpatient', { 'id': patientid });
  }

  // To get future appointment information for the selected patient id & status 
  getfutureappointmentsforpatient(patientid: any) {
    return this.http.post<any>(this._ExternalAPIURL + 'patientportal/appointmentschedule/getfutureappointmentforpatient', { 'patientuid': patientid, 'curdate': new Date() });
  }

  //  To get report information for the selected patient visit id 
  getpatientreports(visitid: any) {
    return this.http.post<any>(this._localAPIURL + 'report/patientvisit/getreportsforpatientvisit', { 'id': visitid });
  }

  // To get Report details for the report id 
  getreportdetail(reportid: any) {
    return this.http.post<any>(this._localAPIURL + 'report/patientvisit/getreportdetail', { 'id': reportid });
  }



  // To get available slots for the doctor 
  getavailableslots(orguid: any, careprovideruid: any, fromdate: any, todate: any, departmentuid: any) {
    return this.http.post<any>(this._ExternalAPIURL + 'patientportal/appointmentschedule/getavaliableslots', { 'careprovideruid': careprovideruid, 'fromdate': fromdate, 'todate': todate, 'departmentuid': departmentuid } ,  { headers : {'orguid' : orguid , 'useruid' : careprovideruid }} );
  }

  getAge(dateString) {
    if (dateString && new Date(dateString)) {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var yearNow = now.getFullYear();
      var monthNow = now.getMonth();
      var dateNow = now.getDate();
      var dob = new Date(dateString);
      var yearDob = dob.getFullYear();
      var monthDob = dob.getMonth();
      var dateDob = dob.getDate();
      let age: any = {};
      var ageString = "";
      var yearString = "";
      var monthString = "";
      var dayString = "";
      let yearAge = 0;

      yearAge = yearNow - yearDob;

      if (monthNow >= monthDob)
        var monthAge = monthNow - monthDob;
      else {
        yearAge--;
        var monthAge = 12 + monthNow - monthDob;
      }

      if (dateNow >= dateDob)
        var dateAge = dateNow - dateDob;
      else {
        monthAge--;
        var dateAge = 31 + dateNow - dateDob;

        if (monthAge < 0) {
          monthAge = 11;
          yearAge--;
        }
      }

      age = {
        years: yearAge,
        months: monthAge,
        days: dateAge
      };

      if (age.years > 1) yearString = " Y";
      else yearString = " Y";
      if (age.months > 1) monthString = " M";
      else monthString = " M";
      if (age.days > 1) dayString = " D";
      else dayString = " D";


      if ((age.years > 0) && (age.months > 0) && (age.days > 0))
        ageString = age.years + yearString + ", " + age.months + monthString + ", " + age.days + dayString + "";
      else if ((age.years == 0) && (age.months == 0) && (age.days > 0))
        ageString = "" + age.days + dayString + "";
      else if ((age.years > 0) && (age.months == 0) && (age.days == 0))
        ageString = age.years + yearString + " Happy Birthday!!";
      else if ((age.years > 0) && (age.months > 0) && (age.days == 0))
        ageString = age.years + yearString + " " + age.months + monthString + " ";
      else if ((age.years == 0) && (age.months > 0) && (age.days > 0))
        ageString = age.months + monthString + " " + age.days + dayString + "";
      else if ((age.years > 0) && (age.months == 0) && (age.days > 0))
        ageString = age.years + yearString + " " + age.days + dayString + " ";
      else if ((age.years == 0) && (age.months > 0) && (age.days == 0))
        ageString = age.months + monthString + "";
      else ageString = "";

      return ageString;
    }
    else
      return "";
  }

}
