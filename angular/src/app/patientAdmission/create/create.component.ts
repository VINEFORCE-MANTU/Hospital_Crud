import { Component, Injector, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { AppComponentBase } from '../../../shared/app-component-base';
import {
  CreatePatientAdmissionDto,
  PatientAdmissionDto,
  PatientCrudServiceServiceProxy,
  DoctorCrudServiceServiceProxy,
  BedCrudServiceServiceProxy,
  PatientAdmissionCrudServiceServiceProxy,
  RoomDtoServiceServiceProxy,
} from '../../../shared/service-proxies/service-proxies';


import { AbpModalHeaderComponent } from '../../../shared/components/modal/abp-modal-header.component';
import { AbpModalFooterComponent } from '../../../shared/components/modal/abp-modal-footer.component';
import { AbpValidationSummaryComponent } from '../../../shared/components/validation/abp-validation.summary.component';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { finalize } from 'rxjs/operators';
import moment from 'moment';

@Component({
  templateUrl: './create.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AbpModalHeaderComponent,
    AbpModalFooterComponent,
    AbpValidationSummaryComponent,
    LocalizePipe,
  ],
})
export class CreatePatientAdmissionDialogComponent extends AppComponentBase implements OnInit {
  saving = false;
  admission: PatientAdmissionDto = new PatientAdmissionDto();
  statusOptions: string[] = ['Admitted', 'Discharged', 'UnderObservation'];
  patients: any[] = [];
  doctors: any[] = [];
  beds: any[] = [];
  rooms: any[] = [];
  selectedRoomId: number | null = null;

  @Output() onSave = new EventEmitter<any>();

  constructor(
    injector: Injector,
    private _admissionService: PatientAdmissionCrudServiceServiceProxy,
    private _patientService: PatientCrudServiceServiceProxy,
    private _doctorService: DoctorCrudServiceServiceProxy,
    private _bedService: BedCrudServiceServiceProxy,
    private _roomService: RoomDtoServiceServiceProxy,
    public bsModalRef: BsModalRef,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadDropdowns();
  }




loadDropdowns(): void {
  forkJoin({
    patients: this._patientService.getAllPatients(),
    doctors: this._doctorService.getAllDoctors(),
    beds: this._bedService.getAllBeds(),
    rooms: this._roomService.getAllRooms()
  }).subscribe({
    next: ({ patients, doctors, beds, rooms }) => {

      this.patients = patients;
      this.doctors = doctors;
      this.rooms = rooms;

      // initially empty beds
      this.beds = [];

      this.cd.detectChanges();
    },
    error: (err) => {
      console.error('Failed to load dropdown data', err);
    }
  });
}

onRoomChange(roomId: number): void {

  this.selectedRoomId = roomId;

  if (!roomId) {
    this.beds = [];
    return;
  }

  this._bedService.getBedsByRoomId(roomId).subscribe({
    next: (result) => {

      // backend already returns only available beds
      this.beds = result;

      this.cd.detectChanges();
    },
    error: (err) => {
      console.error('Error loading beds', err);
    }
  });

}


save(): void {
  const dto = new CreatePatientAdmissionDto();

  dto.admissionDate = this.admission.admissionDate
    ? moment(this.admission.admissionDate, 'YYYY-MM-DD')
    : null;

  dto.dischargeDate = this.admission.dischargeDate
    ? moment(this.admission.dischargeDate, 'YYYY-MM-DD')
    : null;

  dto.diagnosis = this.admission.diagnosis;
  dto.status = this.admission.status;
  dto.patientId = this.admission.patientId;
  dto.doctorId = this.admission.doctorId;
  dto.bedId = this.admission.bedId;

  this._admissionService.createPatientAdmission(dto).subscribe({
    next: () => {
      this.notify.success('Patient admission saved successfully.');
      this.bsModalRef.hide();
      this.onSave.emit();
    },
    error: (err) => {
      console.error(err);
      this.notify.error('Error saving patient admission.');
    }
  });
}




}
