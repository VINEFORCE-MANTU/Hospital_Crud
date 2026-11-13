import { Component, OnInit, Injector, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import {
  DocterDto,
  DoctorCrudServiceServiceProxy,
  PatientAdmissionDto,
  PatientAdmissionCrudServiceServiceProxy,
  UserServiceProxy,
  UserDto,
  PatientCrudServiceServiceProxy,
  PatientDto
} from '@shared/service-proxies/service-proxies';

import { AppComponentBase } from '@shared/app-component-base';

export type UserRoleType = 'Admin' | 'Doctor' | 'Patient' | 'Receptionist' | 'User';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DoctorProfileComponent extends AppComponentBase implements OnInit {

  // Current Role & User
  userRoleType: UserRoleType = 'User';
  currentUser: any = null;

  // Role-specific data
  doctor?: DocterDto;
  patients: PatientAdmissionDto[] = [];
  patientProfile?: PatientDto;

  loading = true;

  constructor(
    injector: Injector,
    private doctorService: DoctorCrudServiceServiceProxy,
    private patientAdmissionService: PatientAdmissionCrudServiceServiceProxy,
    private userService: UserServiceProxy,
    private patientService: PatientCrudServiceServiceProxy,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    // 1. Instant fallback from current session
    if (this.appSession.user) {
      this.currentUser = {
        name: this.appSession.user.name,
        surname: this.appSession.user.surname,
        fullName: (this.appSession.user.name + ' ' + (this.appSession.user.surname || '')).trim(),
        userName: this.appSession.user.userName,
        emailAddress: this.appSession.user.emailAddress,
        roleNames: []
      };
    }

    const currentUserId = this.appSession.userId;
    if (!currentUserId) {
      this.determineRoleFromPermissions();
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    // 2. Query user details
    this.userService.get(currentUserId).subscribe({
      next: (user: UserDto) => {
        this.currentUser = user;
        this.determineRoleAndLoadData(user);
      },
      error: () => {
        // Fallback: determine role from permissions and doctor profile check
        this.determineRoleFromPermissions();
      }
    });
  }

  private determineRoleAndLoadData(user: UserDto): void {
    const roles = (user.roleNames || []).map(r => r.toUpperCase());

    if (roles.includes('ADMIN') || this.isGranted('Pages.Users')) {
      this.userRoleType = 'Admin';
      this.loading = false;
      this.cdr.detectChanges();
    } else if (roles.includes('DOCTOR') || this.isGranted('Pages.Doctor.Profile')) {
      this.userRoleType = 'Doctor';
      this.loadDoctorData();
    } else if (roles.includes('PATIENT')) {
      this.userRoleType = 'Patient';
      this.loadPatientData();
    } else if (roles.includes('RECEPTIONIST') || roles.includes('RECEPTION')) {
      this.userRoleType = 'Receptionist';
      this.loading = false;
      this.cdr.detectChanges();
    } else {
      this.determineRoleFromPermissions();
    }
  }

  private determineRoleFromPermissions(): void {
    if (this.isGranted('Pages.Users') && this.isGranted('Pages.Roles')) {
      this.userRoleType = 'Admin';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    // Check if user has doctor profile
    this.doctorService.getMyDoctorProfile().subscribe({
      next: (doc) => {
        if (doc && doc.id) {
          this.userRoleType = 'Doctor';
          this.doctor = doc;
          this.loading = false;
          this.cdr.detectChanges();
          this.getMyPatients();
        } else {
          this.userRoleType = 'User';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.userRoleType = 'User';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- Doctor Role Functions ---
  loadDoctorData(): void {
    this.doctorService
      .getMyDoctorProfile()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (result) => {
          this.doctor = result;
          this.loading = false;
          this.cdr.detectChanges();
          if (result && result.id) {
            this.getMyPatients();
          }
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getMyPatients(): void {
    this.patientAdmissionService.getMyPatients().subscribe({
      next: (result) => {
        this.patients = result || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.patients = [];
        this.cdr.detectChanges();
      }
    });
  }

  approveAdmission(id: number): void {
    this.patientAdmissionService.approveAdmission(id).subscribe(() => {
      this.notify.success('Admission Approved');
      this.patients = [];
      this.getMyPatients();
    });
  }

  rejectAdmission(id: number): void {
    const reason = prompt('Enter rejection reason');
    if (!reason) return;

    this.patientAdmissionService.rejectAdmission(id, reason).subscribe(() => {
      this.notify.success('Admission Rejected');
      this.patients = [];
      this.getMyPatients();
    });
  }

  // --- Patient Role Functions ---
  loadPatientData(): void {
    this.patientService.getAllPatients().pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (allPatients) => {
        if (this.currentUser && allPatients) {
          this.patientProfile = allPatients.find(
            p => (p.email && p.email.toLowerCase() === this.currentUser.emailAddress.toLowerCase()) ||
                 (p.firstName && this.currentUser.name && p.firstName.toLowerCase() === this.currentUser.name.toLowerCase())
          );
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
