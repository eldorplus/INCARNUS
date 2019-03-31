import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { SignupDialog, SigninDialog } from '../home/home.component';
import { CancelAppoinmentDialog } from './cancel-appointment-popup';
@Component({
  selector: 'app-inner-layout',
  templateUrl: './inner-layout.component.html',
  styleUrls: ['./inner-layout.component.scss']
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
    private _doctorService: DoctorService, public dialog: MatDialog
  ) { }

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
          localStorage.setItem("userId",result.userid);
          this._doctorService.getpatientsbylogin(this.useruid).subscribe(data => {

            this.detail = data.patient;
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
        console.log(this.data);
      },
        error => {
          console.log(error);
        });
    }
  }
  patientPhoto: string = "";
  patientdetail(id, name) {
    this.selectedPatientId = id;
    // To get patient card details
    this.selectedPatient = name;
    this._doctorService.getpatientcarddetail(id).subscribe(
      s => {
        this.patientCard = s.patient;
        this._doctorService.getpatientphoto(id).subscribe(
          s => {
            this.patientPhoto = '';
            if (s.patientimage && s.patientimage.length > 0) {
              this.patientPhoto = s.patientimage[0].patientphoto;
            }
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


}
