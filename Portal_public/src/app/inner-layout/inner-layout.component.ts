import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { SignupDialog, SigninDialog } from '../home/home.component';
import { CancelAppoinmentDialog } from './cancel-appointment-popup';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
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
    private _doctorService: DoctorService, public dialog: MatDialog, private translate: TranslateService, private router: Router
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit() {
    this.signin();
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
              this.patientdetail(result.loginid, '', localStorage.getItem("extid"));

            console.log(this.data);
          },
            error => {
              console.log(error);
            });
        }
      });
    }
    else {

      this._doctorService.getpatientsbylogin(userid).subscribe(data => {

        this.detail = data.patient;
        this.patientdetail(localStorage.getItem("loginId"), '', localStorage.getItem("extid"));
        console.log(data.patient);
      },
        error => {
          console.log(error);
        });
    }
  }
  patientPhoto: string = "";
  patientdetail(id: any, name: string, extid: any) {

    this.selectedPatientId = id;
    // To get patient card details   
    this._doctorService.getpatientcarddetail(id).subscribe(
      s => {

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
    this._doctorService.getfutureappointmentsforpatient((extid ? extid : id)).subscribe(s => {
      if (s)
        this.patientUpcommingAppoinments = s.appointments;
      console.log(s);
    });


    //  To get patient visit details 
    this._doctorService.getPatientVisits(id).subscribe(s => {
      this.patientvisits = s.patientvisits;
      this.patientvisits.forEach(element => {
        element["open"] = false;
        element["patientreports"] = [];
        this._doctorService.getpatientreports(element._id).subscribe(s => {
          s.patientreports.forEach(r => {
            element["patientreports"].push(r);
          });
        });

        console.log(this.patientvisits);
      });
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
    });
  }

  signout() {
    localStorage.removeItem("extid");
    localStorage.removeItem("loginId");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    this.router.navigate(['/', 'home']);
  }

  openReport(obj: any) {
    obj.open = false;
  }
  closeReport(obj: any) {
    obj.open = true;
  }

  getAge(date: any) {
    return this._doctorService.getAge(date);
  }
}
