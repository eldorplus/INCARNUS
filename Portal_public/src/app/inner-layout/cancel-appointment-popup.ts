import { FormControl, Validators } from '@angular/forms';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DialogData } from '../home/home.component';
import { DoctorService } from '../../services/doctor.service';

@Component({
    selector: 'app-cancelAppointment',
    templateUrl: 'cancel-appointment-popup.html',
})
export class CancelAppoinmentDialog {
    cancelReason = new FormControl('', [Validators.required]);
    cancelComment = new FormControl('');
    reasonList: any[] = [];
    getErrorMessage() {
        return this.cancelReason.hasError('required') ? 'You must select a Reason' : '';
    }
    constructor(
        public dialogRef: MatDialogRef<CancelAppoinmentDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any,  private _doctorService: DoctorService) {
        
        this.getReason();
    }

    getReason() {
        this._doctorService.getCancelReasonList().subscribe(
            s => { this.reasonList = s.dropdownlist; }
        );
    }
    cancelAppointment() {
        let id = this.data.scheduleuid; // schedule id
        let slot = this.data._id; // slot id
        if (this.cancelReason.valid)
            this._doctorService.cancelAppointment(id, slot, this.cancelReason.value, this.cancelComment.value).subscribe(s => {
                alert('Appointment Cancelled Successfully.');
                this.dialogRef.close();
            });
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
}