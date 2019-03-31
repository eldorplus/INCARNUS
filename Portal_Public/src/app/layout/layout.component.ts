import { Component, OnInit } from '@angular/core';
// import {ToolbarComponent} from '../toolbar/toolbar.component';
import {MatButtonModule} from '@angular/material/button';
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
public logo = 'logo.png';

   public patientslider1 = 'slide1.jpg';
   public patientslider2 = 'slide1.jpg';
   public patientslider3 = 'slide1.jpg';





  constructor() { }

  ngOnInit() {
  }

}
