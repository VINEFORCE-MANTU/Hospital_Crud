import { Component, Injector, ChangeDetectorRef, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { EditBedDialogComponent } from './edit/edit.component';
import { Table, TableModule } from 'primeng/table';
import { LazyLoadEvent, PrimeTemplate } from 'primeng/api';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { appModuleAnimation } from '../../shared/animations/routerTransition';
import { PagedListingComponentBase } from '../../shared/paged-listing-component-base';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import {BedDto, BedCrudServiceServiceProxy} from '../../shared/service-proxies/service-proxies';
import { CreateBedDialogComponent } from './create/create.component';


@Component({
  templateUrl: './bed.component.html',
   styleUrl: './bed.component.css',
  animations: [appModuleAnimation()],
  // standalone: true,
 imports: [FormsModule, TableModule, PrimeTemplate, PaginatorModule, LocalizePipe,CommonModule]
})
export class BedComponent extends PagedListingComponentBase<BedDto> {
getStudents() {
throw new Error('Method not implemented.');
}

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  Beds: BedDto[] = [];
  keyword = '';
    primengTableHelper: any;

  constructor(
    injector: Injector,
    private _bedService: BedCrudServiceServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

list(event?: LazyLoadEvent): void {

  this.primengTableHelper.showLoadingIndicator();

  this._bedService
    .getAllBeds()
    .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
    .subscribe((result) => {

      this.Beds = result;
      this.filterBeds(); // apply filter

      this.cd.detectChanges();
    });
}


filterBeds() {

  if (!this.keyword) {
    this.primengTableHelper.records = this.Beds;
    return;
  }

  const search = this.keyword.toLowerCase();

  this.primengTableHelper.records = this.Beds.filter(bed =>
    bed.bedNumber?.toString().toLowerCase().includes(search) 

  );
}
 createBed(): void {
    const modalRef = this._modalService.show(CreateBedDialogComponent, {
      class: 'modal-lg',
    });

    modalRef.content.onSave.subscribe(() => this.refresh());
  }

 editBed(bed: BedDto): void {
  const modalRef = this._modalService.show(EditBedDialogComponent, {
    class: 'modal-lg',
    initialState: {
      bed: bed // ✅ use parameter
    }
  });

  modalRef.content.onSave.subscribe(() => {
    this.refresh();
  });
}

  delete(bed: BedDto): void {
  abp.message.confirm(
    'RoomsDeleteWarningMessage',
    undefined,
    (result: boolean) => {
      if (result) {
        this._bedService.deleteBed(bed.id).subscribe(() => {
          abp.notify.success('SuccessfullyDeleted');
          this.refresh();
        });
      }
    }
  );
}

}
