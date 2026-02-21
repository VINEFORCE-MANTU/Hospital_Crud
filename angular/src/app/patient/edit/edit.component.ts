import { Component, Injector, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { AppComponentBase } from '../../../shared/app-component-base';
import { PatientDto, PatientCrudServiceServiceProxy, UpdatePattientDto } from '../../../shared/service-proxies/service-proxies';

import { AbpModalHeaderComponent } from '../../../shared/components/modal/abp-modal-header.component';
import { AbpModalFooterComponent } from '../../../shared/components/modal/abp-modal-footer.component';
import { AbpValidationSummaryComponent } from '../../../shared/components/validation/abp-validation.summary.component';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';

@Component({
  templateUrl: './edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AbpModalHeaderComponent,
    AbpModalFooterComponent,
    LocalizePipe,
  ],
})
export class EditPatientDialogComponent extends AppComponentBase implements OnInit {

  saving = false;

  patient!: PatientDto;

  patientImages: { id: number, base64: string }[] = [];

  removedPhotoIds: number[] = [];

  @Output() onSave = new EventEmitter<any>();

  genderOptions: string[] = ['Male', 'Female', 'Other'];

  constructor(
    injector: Injector,
    private _patientService: PatientCrudServiceServiceProxy,
    public bsModalRef: BsModalRef,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    console.log("ImageIds from backend:", this.patient.imageIds);


    // this.genderOptions = Object.keys(this.l('PatientEnum'))
    //   .filter(k => isNaN(Number(k)));

    this.patientImages = [];
    this.removedPhotoIds = [];

    const photos = this.patient.photosBase64 ?? [];
    const ids = this.patient.imageIds ?? [];

    // Safe combine
    for (let i = 0; i < photos.length; i++) {
      this.patientImages.push({
        id: ids[i] ?? 0,
        base64: photos[i]
      });
    }
  }

  save(): void {

    this.saving = true;

    const input = new UpdatePattientDto();
    input.init(this.patient);

    // Send ONLY remaining images
    input.photosBase64 = this.patientImages.map(img => img.base64);

    // Send removed IDs
    input.removedPhotoIds = this.removedPhotoIds;

    this._patientService.updatePatient(input).subscribe(
      () => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.bsModalRef.hide();
        this.onSave.emit(null);
      },
      () => {
        this.saving = false;
        this.cd.detectChanges();
      }
    );
  }

  onFileSelected(event: any): void {

    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {

      const reader = new FileReader();

      reader.onload = (e: any) => {

        const base64String = e.target.result.split(',')[1];

        if (!this.patientImages.some(img => img.base64 === base64String)) {
          this.patientImages.push({
            id: 0,
            base64: base64String
          });
        }

        this.cd.detectChanges();
      };

      reader.readAsDataURL(files[i]);
    }
  }

removePhoto(index: number): void {

  const removed = this.patientImages[index];

  if (removed && removed.id > 0) {
    this.removedPhotoIds.push(removed.id);
  }

  this.patientImages.splice(index, 1);

  console.log('Removed IDs:', this.removedPhotoIds);
}


}
