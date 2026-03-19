import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import {
DocterDto,
DoctorCrudServiceServiceProxy,
PatientAdmissionDto,
PatientAdmissionCrudServiceServiceProxy
} from '@shared/service-proxies/service-proxies';

import { AppComponentBase } from '@shared/app-component-base';

@Component({
selector: 'app-doctor-profile',
templateUrl: './doctor-profile.component.html',
standalone: true,
imports: [CommonModule]
})
export class DoctorProfileComponent extends AppComponentBase implements OnInit {

doctor?: DocterDto;
patients: PatientAdmissionDto[] = [];
loading = false;

constructor(
injector: Injector,
private doctorService: DoctorCrudServiceServiceProxy,
private patientAdmissionService: PatientAdmissionCrudServiceServiceProxy
) {
super(injector);
}

ngOnInit(): void {
this.loadData();
}

loadData(): void {
this.getDoctorProfile();
this.getMyPatients();
}

getDoctorProfile(): void {
this.loading = true;


this.doctorService
  .getMyDoctorProfile()
  .pipe(finalize(() => this.loading = false))
  .subscribe(result => {
    this.doctor = result;
  });


}

getMyPatients(): void {
this.patientAdmissionService.getMyPatients().subscribe(result => {
this.patients = result || [];
});
}

approveAdmission(id: number): void {
this.patientAdmissionService.approveAdmission(id).subscribe(() => {
this.notify.success('Admission Approved');
this.getMyPatients();
});
}

rejectAdmission(id: number): void {


const reason = prompt('Enter rejection reason');

if (!reason) return;

this.patientAdmissionService.rejectAdmission(id, reason).subscribe(() => {
  this.notify.success('Admission Rejected');
  this.getMyPatients();
});


}

}
