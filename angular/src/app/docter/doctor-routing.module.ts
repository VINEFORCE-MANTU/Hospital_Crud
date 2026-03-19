import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import{DoctorComponent} from  './doctor.component';
import { CreateDoctorDialogComponent } from "./create/create.component";
import { EditDoctorDialogComponent } from "./edit/edit.component";
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
const routes: Routes = [
  {
    path: '',
    component: DoctorComponent,
    pathMatch: 'full',
  },
  {
    path: 'create',
    component: CreateDoctorDialogComponent,
    pathMatch: 'full',
  },
  {
    path: 'edit/:id',
    component: EditDoctorDialogComponent,
    pathMatch: 'full',
  },
   {
    path: 'profile',
    component: DoctorProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorRoutingModule {}
