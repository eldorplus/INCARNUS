import { Component, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { first } from 'rxjs/operators';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { debug } from 'util';
import { appointmentsessions, DialogOverviewExampleDialog } from './home.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorAppointmentComponent implements OnInit, OnChanges {

  @Input() doctorId: string;
  displayedColumns: string[] = ['position', 'date', 'morningtime'];

  docimg: string = "";
  Department = new FormControl();
  appointmentSessionList: appointmentsessions[] = [];
  doctordepartments: any[] = [];
  selecteddoctor: any = {};
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      debugger;
      let id = params.get("id");
      if (id)
        this.detDoctorData(id)
    })
  }

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    let id = this.doctorId;
    if (id)
    {
      this.appointmentSessionList = [];
      this.Department.setValue('');
      this.detDoctorData(id);
    }
  }

  constructor(
    private _doctorService: DoctorService, public dialog: MatDialog, private route: ActivatedRoute, private _fb: FormBuilder,
    private snackBar: MatSnackBar, protected translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  getavaillots() {
    let dept = this.Department.value;
    this.appointmentSessionList = [];
    if (dept) {
      let data = this.availableFreelots.filter(f => f.department._id == dept);

      let obj: any[] = [];
      let appointmentsessions: appointmentsessions[] = [];
      for (let index = 0; index < 8; index++) {
        let currentDate = new Date();
        let date = new Date(currentDate.setDate(new Date().getDate() + index))
        let slots = data.filter(f => new Date(f.starttime).toDateString() == date.toDateString());
        if (slots.length > 0) {
          let o: appointmentsessions = {
            date: date,
            position: (index + 1),
            morningtime: slots
          }
          appointmentsessions.push(o);
        }
      }

      this.appointmentSessionList = appointmentsessions;

    }
  }

  availableFreelots: any[] = [];

  detDoctorData(doctorId: string) {
    this._doctorService.getdoctorphoto(doctorId).subscribe(s => {
      this.docimg = '';
      if (s.doctorimage && s.doctorimage.length > 0)
        this.docimg = s.doctorimage[0].doctorphoto;
    });
    this.availableFreelots = [];
    this._doctorService.getdoctorprofile(doctorId).subscribe(
      s => {
        let date = new Date();
        this.selecteddoctor = s.doctor;
        let orguid: any = s.doctor.orguid, // '569794170946a3d0d588efe6',
          careprovideruid: any = s.doctor.externalid, // '5876feb1ef258a3b428f9202',
          fromdate: any = new Date(),
          todate: any = new Date(date.setDate(date.getDate() + 7)),
          departmentuid: any = ''; //'569cb69f2d10b2d7eaf6fa5f';

        // SERVICE ONCE WORKS REMOVE BELOW CODE START HERE
        //let da = this.sampleData().freeSlots;
        //this.availableFreelots = da;
        //var dept = da.map(m => m.department);
        //this.doctordepartments = [];
        //dept.forEach(element => {
          //if (this.doctordepartments.filter(f => f._id == element._id).length == 0)
         //   this.doctordepartments.push(element);
        //});
        // SERVICE ONCE WORKS REMOVE CODE END HERE

        this._doctorService.getavailableslots(orguid, careprovideruid, fromdate, todate, departmentuid).subscribe(s => {
          console.log(s);
          debug;
          // SERVICE ONCE WORKS REMOVE BELOW CODE START HERE
          let da = s.freeSlots;
          this.availableFreelots = da;
          var dept = da.map(m => m.department);
          this.doctordepartments = [];
          dept.forEach(element => {
            if (this.doctordepartments.filter(f => f._id == element._id).length == 0)
              this.doctordepartments.push(element);
          });
          // SERVICE ONCE WORKS REMOVE CODE END HERE

        }, e => {
          console.log(e);
        });



      }, e => {

      }
    );
  }


  sampleData() {
    let data: any = `{ "freeSlots": [
          {
            "appointmentscheduleuid": "5c23262e9f7ed577bf7c87fd",
            "starttime": "2019-05-04T02:30:00.000Z",
            "endtime": "2019-05-04T02:40:00.000Z",
            "department": {
              "_id": "569cb69f2d10b2d7eaf6fa5f",
              "name": "General Medicine"
            }
          },
          {
            "appointmentscheduleuid": "5c23262e9f7ed577bf7c87fd",
            "starttime": "2019-05-04T02:40:00.000Z",
            "endtime": "2019-05-04T02:50:00.000Z",
            "department": {
              "_id": "569cb69f2d10b2d7eaf6fa5f",
              "name": "General Medicine"
            }
          },
          {
            "appointmentscheduleuid": "5c23262e9f7ed577bf7c87fd",
            "starttime": "2019-05-05T02:50:00.000Z",
            "endtime": "2019-05-05T03:00:00.000Z",
            "department": {
              "_id": "569cb69f2d10b2d7eaf6fa5f",
              "name": "General Medicine"
            }
          },
          {
            "appointmentscheduleuid": "5c23262e9f7ed577bf7c87fd",
            "starttime": "2019-05-05T02:50:00.000Z",
            "endtime": "2019-05-05T03:00:00.000Z",
            "department": {
              "_id": "569cb69f2d10b2d7eaf6fa5f",
              "name": "General Medicine"
            }
          },
          {
            "appointmentscheduleuid": "5c23262e9f7ed577bf7c87fd",
            "starttime": "2019-05-06T02:30:00.000Z",
            "endtime": "2019-05-06T02:40:00.000Z",
            "department": {
              "_id": "569cb69f2d10b2d7eaf6fa5f",
              "name": "General Medicine"
            }
          },
          {
            "appointmentscheduleuid": "5c23262e9f7ed577bf7c87fd",
            "starttime": "2019-05-06T02:40:00.000Z",
            "endtime": "2019-05-06T02:50:00.000Z",
            "department": {
              "_id": "569cb69f2d10b2d7eaf6fa5f",
              "name": "General Medicine"
            }
          }
         
        ]}`


    return JSON.parse(data);
  }

  openDialog(obj): void {

    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '500px',
      data: { selectedSlotInfo: obj }
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }


}