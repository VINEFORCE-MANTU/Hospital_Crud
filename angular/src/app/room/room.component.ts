import { Component, Injector, ChangeDetectorRef, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { EditRoomDialogComponent } from './edit/edit.component';
import { Table, TableModule } from 'primeng/table';
import { LazyLoadEvent, PrimeTemplate } from 'primeng/api';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { appModuleAnimation } from '../../shared/animations/routerTransition';
import { PagedListingComponentBase } from '../../shared/paged-listing-component-base';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import {RoomDto, RoomDtoServiceServiceProxy} from '../../shared/service-proxies/service-proxies';
import { CreateRoomDialogComponent } from './create/create.component';


@Component({
  templateUrl: './room.component.html',
   styleUrl: './room.component.css',
  animations: [appModuleAnimation()],
  // standalone: true,
 imports: [FormsModule, TableModule, PrimeTemplate, PaginatorModule, LocalizePipe,CommonModule]
})
export class RoomComponent extends PagedListingComponentBase<RoomDto> {
getStudents() {
throw new Error('Method not implemented.');
}

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  Rooms: RoomDto[] = [];
  keyword = '';
    primengTableHelper: any;

  constructor(
    injector: Injector,
    private _roomService: RoomDtoServiceServiceProxy,
    private _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }
list(event?: LazyLoadEvent): void {

  this.primengTableHelper.showLoadingIndicator();

  this._roomService
    .getAllRooms()
    .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
    .subscribe((result) => {

      this.Rooms = result;
      this.filterRooms(); // apply filter

      this.cd.detectChanges();
    });
}

filterRooms() {

  if (!this.keyword) {
    this.primengTableHelper.records = this.Rooms;
    return;
  }

  const search = this.keyword.toLowerCase();

  this.primengTableHelper.records = this.Rooms.filter(room =>
      room.roomNumber?.toLowerCase().includes(search) ||
      room.roomTypeName?.toLowerCase().includes(search) ||
      room.totalBeds?.toString().includes(search)
  );
}

 createRoom(): void {
    const modalRef = this._modalService.show(CreateRoomDialogComponent, {
      class: 'modal-lg',
    });

    modalRef.content.onSave.subscribe(() => this.refresh());
  }

 editRoom(room: RoomDto): void {
  const modalRef = this._modalService.show(EditRoomDialogComponent, {
    class: 'modal-lg',
    initialState: {
      room: room // ✅ use parameter
    }
  });

  modalRef.content.onSave.subscribe(() => {
    this.refresh();
  });
}

  delete(room: RoomDto): void {
  abp.message.confirm(
    'RoomsDeleteWarningMessage',
    undefined,
    (result: boolean) => {
      if (result) {
        this._roomService.deleteRoom(room.id).subscribe(() => {
          abp.notify.success('SuccessfullyDeleted');
          this.refresh();
        });
      }
    }
  );
}

}
