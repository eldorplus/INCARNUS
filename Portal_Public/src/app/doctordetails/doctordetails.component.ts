import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { Router } from '@angular/router';

export interface Doctorinformation {
  value: string;
  viewValue: string;
}

export interface Doctorlocation {
  value: string;
  viewValue: string;
}
export interface PeriodicElement {
  date: string;
  position: number;
  morningtime: string;
  eveningtime: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, date: 'SUN, 20 JAN 2019', morningtime: " 09:00-12:00 " , eveningtime: '13:30-18:00'},
  {position: 2, date: 'MON, 21 JAN 2019', morningtime: " 09:00-12:00 " , eveningtime: '13:30-18:00'},
  {position: 3, date: 'SUN, 20 JAN 2019', morningtime: " 09:00-12:00 " , eveningtime: '13:30-18:00'},
  {position: 4, date: 'MON, 21 JAN 2019', morningtime: " 09:00-12:00 " , eveningtime: '13:30-18:00'},
  {position: 5, date: 'SUN, 20 JAN 2019', morningtime: " 09:00-12:00 " , eveningtime: '13:30-18:00'},
  {position: 6, date: 'SUN, 20 JAN 2019', morningtime: " 09:00-12:00 " , eveningtime: '13:30-18:00'},
];
@Component({
  selector: 'app-doctordetails',
  templateUrl: './doctordetails.component.html',
  styleUrls: ['./doctordetails.component.scss']
})
export class DoctordetailsComponent implements OnInit {
  displayedColumns: string[] = ['position', 'date', 'morningtime', 'eveningtime'];
  dataSource = ELEMENT_DATA;

  doctorprofiehidden: any;
  constructor(
    private _doctorService: DoctorService,
    private router: Router
  ) { }

  ngOnInit() {
    // this.doctors = this._doctorService.getDoctor();

    this.doctorprofiehidden = 0;
  }

  doctortimetable(val) {
    console.log(val);
      if ( val == 'ChildCare') {
          this.doctorprofiehidden = 1;
      }
      if ( val == 'WomenHealth') {
        this.doctorprofiehidden = 1;
    }
    if ( val == 'FertilityCare') {
      this.doctorprofiehidden = 1;
  }
    }

    selectedValue : string ;
    doctorinformation : Doctorinformation [] = [
      {value: 'ChildCare', viewValue: 'Child Care'},
      {value: 'WomenHealth', viewValue: 'Women Health'},
      {value: 'FertilityCare', viewValue: 'Fertility Care'},
    ];

    doctorlocation : Doctorlocation [] = [
      {value: 'ChildCare', viewValue: 'Chennai'},
      {value: 'WomenHealth', viewValue: 'Coimbatore'},
      {value: 'FertilityCare', viewValue: 'Salem'},
    ];
    selectedloaction:string

    availabletime() {
      this.router.navigateByUrl('/availabletime');
    }


}
