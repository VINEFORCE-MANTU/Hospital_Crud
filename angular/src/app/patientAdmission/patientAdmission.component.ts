import { Component, Injector, ChangeDetectorRef, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';

import { appModuleAnimation } from '../../shared/animations/routerTransition';
import { PagedListingComponentBase } from '../../shared/paged-listing-component-base';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';

import {
  PatientAdmissionDto,
  PatientAdmissionCrudServiceServiceProxy
} from '../../shared/service-proxies/service-proxies';

import { CreatePatientAdmissionDialogComponent } from './create/create.component';
import { EditPatientAdmissionDialogComponent } from './edit/edit.component';

@Component({
  standalone: true,
  templateUrl: './patientAdmission.component.html',
  animations: [appModuleAnimation()],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    LocalizePipe
  ]
})
export class PatientAdmissionComponent
  extends PagedListingComponentBase<PatientAdmissionDto> {

  @ViewChild('dataTable', { static: true }) dataTable!: Table;
  @ViewChild('paginator', { static: true }) paginator!: Paginator;

  patientAdmissions: PatientAdmissionDto[] = [];
  keyword = '';
  primengTableHelper: any;

  constructor(
    injector: Injector,
    private _admissionService: PatientAdmissionCrudServiceServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

 list(event?: any): void {

  this.primengTableHelper.showLoadingIndicator();

  this._admissionService
    .getAllPatientAdmissions()
    .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
    .subscribe(result => {

      this.patientAdmissions = result;
      this.filterAdmissions();   // apply filter

      this.cd.detectChanges();
    });
}

filterAdmissions(): void {

  if (!this.keyword) {
    this.primengTableHelper.records = this.patientAdmissions;
    return;
  }

  const search = this.keyword.toLowerCase();

  this.primengTableHelper.records = this.patientAdmissions.filter(admission =>
      admission.patient?.firstName?.toLowerCase().includes(search) ||
      admission.patient?.lastName?.toLowerCase().includes(search) 

  );
}

  createPatientAdmission(): void {
    const modalRef = this._modalService.show(
      CreatePatientAdmissionDialogComponent,
      { class: 'modal-lg' }
    );

    modalRef.content.onSave.subscribe(() => this.refresh());
  }

  editPatientAdmission(admission: PatientAdmissionDto): void {
    const modalRef = this._modalService.show(
      EditPatientAdmissionDialogComponent,
      {
        class: 'modal-lg',
        initialState: { admission: admission  }
      }
    );

    modalRef.content.onSave.subscribe(() => this.refresh());
  }

  delete(entity: PatientAdmissionDto): void {
    abp.message.confirm(
      'Are you sure you want to delete this admission?',
      undefined,
      (result: boolean) => {
        if (result) {
          this._admissionService
            .deletePatientAdmission(entity.id)
            .subscribe(() => {
              abp.notify.success('Admission successfully deleted');
              this.refresh();
            });
        }
      }
    );
  }
  
}
