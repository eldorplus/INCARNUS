import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { SignupDialog, SigninDialog } from '../home/home.component';
import { CancelAppoinmentDialog } from './cancel-appointment-popup';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-inner-layout',
  templateUrl: './inner-layout.component.html',
  styleUrls: ['./inner-layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InnerLayoutComponent implements OnInit {
  public pro = 'profile1.jpg';
  public logo = 'logo.png';
  public data: any;
  public detail: any[] = [];
  public selectedvisit: any;
  public reportid: any;
  public patientreport: any;
  public visitlist: any;

  public profile: any;

  public useruid: any;
  public visiterid: any;
  public patientvisitdetail: any;

  public patientvisitinfo = [];

  public patientCard: any = null;
  selectedPatient: string = '-- Select Patient --';
  selectedPatientId: string = '';
  patientvisits: any = [];
  patientUpcommingAppoinments: any = [];
  openPDF: string = '';
  patientReports: any[] = [];
  constructor(
    private _doctorService: DoctorService, public dialog: MatDialog, private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit() {


    this.signin();



    //  To get Patient information for the Login ID 
    //this.useruid = "111111111";
    // if (userid)
    //   this.useruid = userid;


  }
  signin(): void {
    let userid = localStorage.getItem("userId");
    if (!userid) {
      const dialogRef = this.dialog.open(SigninDialog, {
        width: '400px',
        panelClass: 'sign-dialog-container',
        data: {}
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // result.patientid
          this.useruid = result.userid;

          this._doctorService.getpatientsbylogin(this.useruid).subscribe(data => {

            this.detail = data.patient;
            if (data.patient)
              this.patientdetail(result.loginid, '');

            console.log(this.data);
          },
            error => {
              console.log(error);
            });
        }
      });
    }
    else {
      this.patientdetail(localStorage.getItem("loginId"), '');
      this._doctorService.getpatientsbylogin(userid).subscribe(data => {

        this.detail = data.patient;
        console.log(data.patient);
      },
        error => {
          console.log(error);
        });
    }
  }
  patientPhoto: string = "";
  patientdetail(id, name) {
    debugger;
    this.selectedPatientId = id;
    // To get patient card details   
    this._doctorService.getpatientcarddetail(id).subscribe(
      s => {
        debugger;
        this.patientCard = s.patient;
        if (s.patient)
          this.selectedPatient = (s.patient.firstname + ' ' + s.patient.lastname);
        this._doctorService.getpatientphoto(id).subscribe(
          s => {
            this.patientPhoto = '';
            if (s.patientimage && s.patientimage.length > 0) 
              this.patientPhoto = s.patientimage[0].patientphoto;            
          }
        );
      }
    );

    // To get Upcomming Appoinments
    this._doctorService.getfutureappointmentsforpatient(id).subscribe(s => {

      this.patientUpcommingAppoinments = s.appointments;
      console.log(s);
    });


    //  To get patient visit details 
    this._doctorService.getPatientVisits(id).subscribe(s => {
      this.patientvisits = s.patientvisits;
      console.log(s);
    });


  }

  getReports(id) {
    this.openPDF = id;
    this._doctorService.getpatientreports(id).subscribe(s => {
      this.patientReports = s.patientreports;
    });
  }

  downloadReport(id) {
    this._doctorService.getreportdetail(id).subscribe(s => {
      debugger;
      let result = s.PatientReport.reportdocument.data;


      var byteArray = new Uint8Array(result);
      var blob = new Blob([byteArray], { type: 'application/pdf' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob);
      } else {
        var objectUrl = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = objectUrl;
        link.download = s.PatientReport.documentname + '.' + s.PatientReport.filetype;
        link.click();
        //window.open(objectUrl);
      }
    });
  }

  cancelAppointmentPopup(id): void {
    const dialogRef = this.dialog.open(CancelAppoinmentDialog, {
      width: '400px',
      panelClass: 'sign-dialog-container',
      data: { 'id': id }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      debugger;
      // this.animal = result;
    });
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
      else yearString = " year";
      if (age.months > 1) monthString = " M";
      else monthString = " month";
      if (age.days > 1) dayString = " D";
      else dayString = " day";


      if ((age.years > 0) && (age.months > 0) && (age.days > 0))
        ageString = age.years + yearString + ", " + age.months + monthString + ", and " + age.days + dayString + "";
      else if ((age.years == 0) && (age.months == 0) && (age.days > 0))
        ageString = "" + age.days + dayString + "";
      else if ((age.years > 0) && (age.months == 0) && (age.days == 0))
        ageString = age.years + yearString + " Happy Birthday!!";
      else if ((age.years > 0) && (age.months > 0) && (age.days == 0))
        ageString = age.years + yearString + " and " + age.months + monthString + " ";
      else if ((age.years == 0) && (age.months > 0) && (age.days > 0))
        ageString = age.months + monthString + " and " + age.days + dayString + "";
      else if ((age.years > 0) && (age.months == 0) && (age.days > 0))
        ageString = age.years + yearString + " and " + age.days + dayString + " ";
      else if ((age.years == 0) && (age.months > 0) && (age.days == 0))
        ageString = age.months + monthString + "";
      else ageString = "";

      return ageString;
    }
    else
      return "";
  }







}
