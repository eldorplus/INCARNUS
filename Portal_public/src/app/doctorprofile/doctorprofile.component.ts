import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-doctorprofile',
  templateUrl: './doctorprofile.component.html',
  styleUrls: ['./doctorprofile.component.scss']
})

export class DoctorprofileComponent implements OnInit {
  public location_img = "g3.jpg";
  public logo = 'logo.png';
  constructor() { }

  ngOnInit() {
  }

}




