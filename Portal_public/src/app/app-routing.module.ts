import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoctorsComponent } from './doctors/doctors.component';
import { LayoutComponent } from './layout/layout.component';
import { DoctordetailsComponent } from './doctordetails/doctordetails.component';
import { DoctorprofileComponent } from './doctorprofile/doctorprofile.component';
import { AvailabletimeComponent } from './availabletime/availabletime.component';
import { HomeComponent } from './home/home.component';
import { InnerLayoutComponent } from './inner-layout/inner-layout.component';
import { PatientDetailsComponent } from './inner-layout/patient-details.component';
import { DoctorDetailsComponent } from './inner-layout/doctor-details.component';

const routes: Routes = [
  { path: 'doctors', component: DoctorsComponent },
  // { path: '**', component: LayoutComponent },
  { path: '', component: HomeComponent/*  */ },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'doctorsdetais', component: DoctordetailsComponent },
  { path: 'doctorsprofile', component: DoctorprofileComponent },
  { path: 'availabletime', component: AvailabletimeComponent },
  { path: 'innerlayout', component: InnerLayoutComponent },
  { path: 'home', component: HomeComponent },
  { path: 'patient/:id', component: PatientDetailsComponent },
  { path: 'doctor/:id', component: DoctorDetailsComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
