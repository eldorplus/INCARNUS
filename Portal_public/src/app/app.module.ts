import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { FooterComponent } from './footer/footer.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DoctorsComponent } from './doctors/doctors.component';
import { DoctorService } from '../services/doctor.service';
import { HttpClientModule } from '@angular/common/http';
import { DoctordetailsComponent } from './doctordetails/doctordetails.component';
import { DoctorappoimentComponent } from './doctorappoiment/doctorappoiment.component';
import { DoctorprofileComponent } from './doctorprofile/doctorprofile.component';
import { AvailabletimeComponent } from './availabletime/availabletime.component';
import { NewpatientComponent } from './newpatient/newpatient.component';
import { HomeComponent, SigninDialog, SignupDialog, DialogOverviewExampleDialog} from './home/home.component';
import { InnerLayoutComponent } from './inner-layout/inner-layout.component';
import { CancelAppoinmentDialog } from './inner-layout/cancel-appointment-popup';
import { PatientDetailsComponent } from './inner-layout/patient-details.component';
import { DoctorDetailsComponent } from './inner-layout/doctor-details.component';
import { AppTranslationModule } from './app.translation.module';
import { DoctorAppointmentComponent } from './home/doctor-appointment.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    ToolbarComponent,
    FooterComponent,
    DoctorsComponent,
    DoctordetailsComponent,
    DoctorappoimentComponent,
    DoctorprofileComponent,
    AvailabletimeComponent,
    NewpatientComponent, HomeComponent, SigninDialog,CancelAppoinmentDialog,
    SignupDialog,
    InnerLayoutComponent,
    PatientDetailsComponent,DialogOverviewExampleDialog,DoctorDetailsComponent,
    DoctorAppointmentComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    BrowserAnimationsModule,
    AppTranslationModule
  ],
  entryComponents: [
    SigninDialog, SignupDialog,CancelAppoinmentDialog,DialogOverviewExampleDialog
  ],
  providers: [DoctorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
