import { Component, Injector, ChangeDetectorRef, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EditDoctorDialogComponent } from './edit/edit.component';
import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { appModuleAnimation } from '../../shared/animations/routerTransition';
import { PagedListingComponentBase } from '../../shared/paged-listing-component-base';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { DoctorCrudServiceServiceProxy, DocterDto } from '../../shared/service-proxies/service-proxies';
import { CreateDoctorDialogComponent } from './create/create.component';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { EventEmitter } from 'stream';


@Component({
  standalone: true, // ✅ Make it standalone
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css'], // fixed typo
  animations: [appModuleAnimation()],
  imports: [
    FormsModule,
    CommonModule,
     TableModule,
    Paginator,
    LocalizePipe
  ]
})
export class DoctorComponent extends PagedListingComponentBase<DocterDto> {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  Doctors: DocterDto[] = [];
  keyword = '';
  primengTableHelper: any;

  constructor(
    injector: Injector,
    private _doctorService: DoctorCrudServiceServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

 list(event?: LazyLoadEvent): void {

  this.primengTableHelper.showLoadingIndicator();

  this._doctorService
    .getAllDoctors()
    .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
    .subscribe((result) => {

      this.Doctors = result;
      this.filterDoctors(); // apply filter

      this.cd.detectChanges();
    });
}

filterDoctors() {

  if (!this.keyword) {
    this.primengTableHelper.records = this.Doctors;
    return;
  }

  const search = this.keyword.toLowerCase();

  this.primengTableHelper.records = this.Doctors.filter(doctor =>
      doctor.fullName?.toLowerCase().includes(search) ||
      doctor.docterCode?.toLowerCase().includes(search)
  );
}

  createDoctor(): void {
    const modalRef = this._modalService.show(CreateDoctorDialogComponent, {
      class: 'modal-lg',
    });

    modalRef.content.onSave.subscribe(() => this.refresh());
  }

  editDoctor(doctor: DocterDto): void {
    const modalRef = this._modalService.show(EditDoctorDialogComponent, {
      class: 'modal-lg',
      initialState: {
        doctor: doctor // ✅ use parameter
      }
    });
  
    modalRef.content.onSave.subscribe(() => {
      this.refresh();
    });
  }

  delete(doctor: DocterDto): void {
    abp.message.confirm(
      ('DoctorDeleteWarningMessage'),
      undefined,
      (result: boolean) => {
        if (result) {
          this._doctorService.deleteDoctor(doctor.id).subscribe(() => {
            abp.notify.success(('SuccessfullyDeleted'));
            this.refresh();
          });
        }
      }
    );
  }
}
