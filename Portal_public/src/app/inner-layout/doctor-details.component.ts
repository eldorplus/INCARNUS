import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { first } from 'rxjs/operators';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SignupDialog, SigninDialog } from '../home/home.component';
import { CancelAppoinmentDialog } from './cancel-appointment-popup';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { debug } from 'util';
@Component({
    selector: 'app-doctor-detail',
    templateUrl: './doctor-details.component.html',
    styleUrls: ['./patient-details.component.scss']
})
export class DoctorDetailsComponent implements OnInit {
    doctorId: string = '';
    doctorImage: string = '';
    doctorData: any = null;
    genderList: any[] = [];
    doctorGender: string = "";
    frmDoctorInfo: FormGroup;
    constructor(
        private _doctorService: DoctorService, public dialog: MatDialog, private route: ActivatedRoute, private _fb: FormBuilder,
        private snackBar: MatSnackBar
    ) {

    }
    ngOnInit(): void {
        this.route.paramMap.subscribe(params => { this.doctorId = params.get("id"); this.detDoctorData(this.doctorId); });
    }

    formInialize(Data: any) {
        this.frmDoctorInfo = this._fb.group({
            ID: [Data.doctor._id],
            Description: [Data.doctor.description, Validators.required],
            Urls: [Data.doctor.contact.weburl, Validators.required]
        });
    }

    Save() {
        let obj = this.doctorData;
        obj.doctor.description = this.frmDoctorInfo.value.Description;
        obj.doctor.contact.weburl = this.frmDoctorInfo.value.Urls;
        debugger;
        this._doctorService.savedoctorinformation(obj.doctor).subscribe(
            s => { 
                this.snackBar.open("Doctor Information Updated Successfully.", "", {
                    duration: 2000,
                  });
            },
            e => { }
        );
    }
    getGenderList() {
        this._doctorService.getGenderList().subscribe(
            s => {

                this.genderList = s.dropdownlist;
                if (this.doctorData) {
                    let doctorGend = this.genderList.filter(f => f._id == this.doctorData.doctor.genderuid);
                    this.doctorGender = doctorGend.length > 0 ? doctorGend[0].valuedescription : "";
                }

            }
        );
    }
    detDoctorData(doctorId: string) {
        this._doctorService.getdoctorphoto(doctorId).subscribe(s => {
            this.doctorImage = '';
            if (s.doctorimage && s.doctorimage.length > 0)
                this.doctorImage = s.doctorimage[0].doctorphoto;
        });
        this._doctorService.getdoctorprofile(doctorId).subscribe(
            s => {
                this.doctorData = s;
                this.formInialize(s);
                this.getGenderList();
                console.log("Doctor Details");
                console.log(s);
            }, e => {

            }
        );
    }
}