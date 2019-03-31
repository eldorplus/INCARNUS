import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { FormGroup,  FormBuilder,  Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


export interface Doctorinformation {
  value: string;
  speciality: string;
}

export interface Doctorlocation {
  value: string;
  name: string;
}

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.scss']
})
export class DoctorsComponent implements OnInit {
  doctorForm: FormGroup;

 public underlinbg = 'download.png';
 public  doctorinfo_banner = ' doctorinfo.jpg';
 public  pro = 'profile1.jpg';


  public doctors = [];
  doctorprofiehidden: any;
  public data: any;
  public res: any;
  doctorpro: any ;
  doctorname: string;
  selectedDevice: any;
  prourl: any ;
  constructor(private _doctorService: DoctorService,
    private router: Router,
    private http: HttpClient,
    private formBuilder: FormBuilder
    ) { }

  ngOnInit() {
    this.doctorsearchlist();

//  this._doctorService.getDoctor();

    this.doctorprofiehidden = 0;
      this.doctorpro = true;
    this._doctorService.getDoctor()
    .pipe(first())
    .subscribe(data => {
            this.data = data;
            console.log(this.data );
            this.doctorsearchlist();

        },
        error => {
            console.log(error);
        });
  }
  private doctorsearchlist() {


    this.doctorForm = this.formBuilder.group({
        speciality: ['', Validators.required],
        // name: [this.data.name, Validators.required]
    });
}

    selectedValue : string ;

    doctorinformation : Doctorinformation [] = [
      {value: 'Fertility', speciality: 'Fertility'},
      {value: 'Childcare', speciality: 'Childcare'},
      {value: 'WomenHealth', speciality: 'Women Health'},
    ];

    doctorlocation : Doctorlocation [] = [
      { value : 'ChildCare', name: 'Chennai'},
      { value : 'WomenHealth', name : 'Coimbatore'},
      { value : 'FertilityCare', name: 'Salem'},
    ];

    selectedloaction:string;

    searchclick() {
      console.log(this.doctorForm.value.speciality);
      if (this.doctorForm.value.speciality == 'Fertility') {
        this.doctorpro = false;
        console.log(this.http.get('http://420e147b.ngrok.io/search?speciality=Fertility'));
      }
      if (this.doctorForm.value.speciality == 'Childcare') {
        this.doctorpro = false;
      //  return this.http.get('http://420e147b.ngrok.io/search?speciality=Childcare');
      console.log(this.http.get('http://420e147b.ngrok.io/search?speciality=Childcare'));
      }
      if (this.doctorForm.value.speciality == 'Women Health') {
        this.doctorpro = false;
      }
      // this._doctorService.update_doctor(this.doctorForm.value.speciality)

      //     .pipe(first())
      //     .subscribe(
      //         (res: Response) => {
      //         console.log(res);
      //           this.res = res ;
      //         },
      //         error => {
      //             alert(error);
      //         });

  }

  doctordetails() {
      this.router.navigateByUrl('/doctorsdetais');
  }
  doctorprofile() {
    this.router.navigateByUrl('/doctorsprofile');
}
}
