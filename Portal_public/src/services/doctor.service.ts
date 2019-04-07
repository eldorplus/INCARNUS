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
  constructor(private http: HttpClient) { }
  _doctorurl = 'http://localhost:8080/appointment/doctor/search';


  _patient = 'assets/data/Patient.json';
  _patientvisit = 'assets/data/PatientVisit.json';

  getDoctor() {
    return this.http.get(this._doctorurl);
  }

  update_doctor(location) {
    // var doc = JSON.parse(a);
    return this.http.get(`${environment.apiUrl}/appointment/doctor/search?location=` + location);
  }

  authenticate(mobileno: string, password: string) {
    return this.http.post<any>('http://localhost:8080/common/security/authenticate', { 'loginid': mobileno, 'password': password });
  }

  ChangePassword(useruid: string, password: string) {
    return this.http.post<any>('http://localhost:8080/common/security/changepassword', { 'useruid': useruid, 'password': password });
  }

  getverificationcode() {
    return this.http.post<any>('http://localhost:8080/common/security/getverificationcode', {});
  }

  verifysms(mobilephone: any, verificationcode: any, username: any) {
    return this.http.post<any>('http://localhost:8080/common/security/verifysms', {
      mobilephone: mobilephone,
      verificationcode: verificationcode,
      username: username
    });
  }


  //  Book Appointment functionality
  //  ******************************

  // To get specialty list 


  getspecialtylist() {
    return this.http.post<any>('http://localhost:8080/getdropdownlist', { 'domaincode': 'SPECIALTY' });
  }

  getLocationList() {
    return this.http.post<any>('http://localhost:8080/getdropdownlist', { 'domaincode': 'LOCATION' });
  }

  getTitleList() {
    return this.http.post<any>('http://localhost:8080/getdropdownlist', { 'domaincode': 'TITLE' });
  }

  getGenderList() {
    return this.http.post<any>('http://localhost:8080/getdropdownlist', { 'domaincode': 'GENDER' });
  }


  // To search doctors based on location, doctor name & specialty 
  doctorsearch(name: any, location: any, specialtyid: any) {
    return this.http.post<any>('http://localhost:8080/appointment/doctor/search', { 'name': name, 'location': location, 'specialtyuid': specialtyid });
  }

  // To get doctor photo for the doctor id 
  getdoctorphoto(doctorid: any) {
    return this.http.post<any>('http://localhost:8080/appointment/doctor/getimagedetail/'+doctorid, { 'id': doctorid });
  }

  // To get doctor profile information for the doctor id 
  getdoctorprofile(doctorid: any) {
    return this.http.post<any>('http://localhost:8080/appointment/doctor/getdoctordetail', { 'id': doctorid });
  }

  // To get appointment session information for the doctor id 
  getappointmentschedule(sessionid: any, AppointmentDate: string) {
    //return this.http.post<any>('http://localhost:8080/appointment/bookappointment/searchappointment', { 'appointmentsessionuid': sessionid, 'fromdate': AppointmentDate, 'todate': AppointmentDate });
    return this.http.post<any>('http://localhost:8080/appointment/bookappointment/getAppointmentSchedule', { 'appointmentsessionuid': sessionid, 'fromdate': AppointmentDate, 'todate': AppointmentDate });
  }

  // To get appointment schedule information for the session
  getappointmentsession(doctorid: any) {
    return this.http.post<any>('http://localhost:8080/appointment/bookappointment/getappointmentsessions', { 'careprovideruid': doctorid });
  }

  savephoto(data: any) {
    return this.http.post<any>('http://localhost:8080/appointment/doctor/savedoctorphoto', { 'filepath': data });
  }

  savedoctorinformation(data: any) {
    return this.http.post<any>('http://localhost:8080/interface/savedoctorinformation', data);
  }



 

  // To create schedule 
  createSchedule(sessionid: any, AppointmentDate: Date, slotuids: any[]) {
    return this.http.post<any>('http://localhost:8080/appointment/bookappointment/createschedule', { 'sessionuid': sessionid, 'fromdate': AppointmentDate, 'todate': AppointmentDate, 'slotuids': slotuids });
  }

  //  To add booking 
  createPatient(fname: any, lname: any, mname: any, gender: any, title: any, dob: any, phone: any, email: any) {
    return this.http.post<any>('http://localhost:8080/appointment/patient/create', {
      'firstname': fname, 'lastname': lname, 'middlename': mname,
      'genderuid': gender, 'titleuid': title, 'dateofbirth': dob, 'mobilephone': phone, 'emailid': email
    });
  }

  //  To add booking 
  addbooking(scheduleuid: any, start: any, end: any, patientuid: any, slotno: number) {
    return this.http.post<any>('http://localhost:8080/appointment/bookappointment/addbooking', { 'scheduleuid': scheduleuid, 'start': start, 'end': end, 'description': '', 'patientuid': patientuid, 'isactive': true, 'slotno': slotno });
  }


  getCancelReasonList() {
    return this.http.post<any>('http://localhost:8080/getdropdownlist', { 'domaincode': 'TEST1' });
  }

  cancelAppointment(scheduleid: any, reasonid: string, comment: string) {
    return this.http.post<any>('http://localhost:8080/appointment/bookappointment/cancelbooking', { 'selectedscheduleuids': scheduleid, 'cancelreasonuid': reasonid, 'cancelcomments': comment });
  }

  //  Patient Visit & Reports functionality
  //  *************************************
  // To get patient details for the login id 
  getpatientsbylogin(useruid) {
    // let myheader = new Headers({ 'content-type': 'application/json' });
    // let option = new RequestOptions({ headers: myheader });
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'my-auth-token',
        responseType:'arraybuffer'
      })
    };
    let user = { 'useruid': useruid };
    return this.http.post<any>('http://localhost:8080/report/patientvisit/getpatientuidbyloginid', user);
  }

  // To get patient card detail for the patient id 
  getpatientcarddetail(patientid: any) {
    return this.http.post<any>('http://localhost:8080/appointment/patient/getbasicdetail', { 'id': patientid });
  }

  

  getpatientphoto(patientid: any) {
    return this.http.post<any>('http://localhost:8080/appointment/patient/getpatientphoto', { 'id': patientid });
  }

  // To get Visit information for the selected patient id 
  getPatientVisits(patientid: any) {
    return this.http.post<any>('http://localhost:8080/report/patientvisit/getvisitsforpatient', { 'id': patientid });
  }

  // To get future appointment information for the selected patient id & status 
  getfutureappointmentsforpatient(patientid: any) {
    return this.http.post<any>(`${environment.apiUrl}/appointment/bookappointment/futureappointments`, { 'patientuid': patientid });
  }

  //  To get report information for the selected patient visit id 
  getpatientreports(visitid: any) {
    return this.http.post<any>('http://localhost:8080/report/patientvisit/getreportsforpatientvisit', { 'id': visitid });
  }

  // To get Report details for the report id 
  getreportdetail(reportid: any) {
    return this.http.post<any>('http://localhost:8080/report/patientvisit/getreportdetail', { 'id': reportid });
  }








  // Dummy Data In Json File


  // getvisitPatient(): Observable<IPatient[]> {
  //   return this.http.get<IPatient[]>(this._patient);
  // }
  // getvisit(): Observable<IPatientVisit[]> {
  //   console.log(this._patientvisit);
  //   return this.http.get<IPatientVisit[]>(this._patientvisit);
  // }





}
