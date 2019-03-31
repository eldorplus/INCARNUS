import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  public mainmenu = [
    {
     title: 'Home',
     url: 'home',
     icon: 'home'
    },
    {
      title: 'About Us',
      url: 'dashboard',
      icon: 'Dashboard'
     },
     {
       title: 'Services',
       url: 'dashboard',
       icon: 'Dashboard'
      },
      {
        title: 'Our Team',
        url: 'dashboard',
        icon: 'Dashboard'
       },
       {
         title: 'Gallery',
         url: 'dashboard',
         icon: 'Dashboard'
        }
        ,
       {
         title: 'Contact Us',
         url: 'dashboard',
         icon: 'Dashboard'
        }
  ];
  constructor() { }

  ngOnInit() {
  }

}
