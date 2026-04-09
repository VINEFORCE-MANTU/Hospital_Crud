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
  styleUrls: ['./doctor-profile.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DoctorProfileComponent extends AppComponentBase implements OnInit {

  doctor?: DocterDto;
  patients: PatientAdmissionDto[] = [];
  loading = false;

  // ✅ LOCAL CACHE
  private isLoaded = false;

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

    // ✅ IMPORTANT: prevent reload
    if (this.isLoaded) return;

    this.getDoctorProfile();
    this.getMyPatients();

    this.isLoaded = true;   // ✅ mark loaded
  }

  getDoctorProfile(): void {

    // ✅ instant if already loaded
    if (this.doctor) return;

    this.loading = true;

    this.doctorService
      .getMyDoctorProfile()
      .pipe(finalize(() => this.loading = false))
      .subscribe(result => {
        this.doctor = result;
      });
  }

  getMyPatients(): void {

    // ✅ instant if already loaded
    if (this.patients.length > 0) return;

    this.patientAdmissionService.getMyPatients().subscribe(result => {
      this.patients = result || [];
    });
  }

  approveAdmission(id: number): void {
    this.patientAdmissionService.approveAdmission(id).subscribe(() => {
      this.notify.success('Admission Approved');

      // ✅ refresh patients only
      this.patients = [];
      this.getMyPatients();
    });
  }

  rejectAdmission(id: number): void {

    const reason = prompt('Enter rejection reason');
    if (!reason) return;

    this.patientAdmissionService.rejectAdmission(id, reason).subscribe(() => {
      this.notify.success('Admission Rejected');

      // ✅ refresh patients only
      this.patients = [];
      this.getMyPatients();
    });
  }
}