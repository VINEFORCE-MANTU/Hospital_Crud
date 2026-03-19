import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                children: [
                    
                    {
                        path: 'home',
                        loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'docter',
                        loadChildren: () => import('./docter/doctor.module').then((m) => m.DoctorModule),
                        canActivate: [AppRouteGuard],
                    },
                     {
                        path: 'patient',
                        loadChildren: () => import('./patient/patient.module').then((m) => m.PatientModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'room',
                        loadChildren: () => import('./room/room.module').then((m) => m.RoomModule),
                        canActivate: [AppRouteGuard],
                    },
                      {
                        path: 'bed',
                        loadChildren: () => import('./bed/bed.module').then((m) => m.BedModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'patientAdmission',
                        loadChildren: () => import('./patientAdmission/patientAdmission.module').then((m) => m.PatientAdmissionModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'about',
                        loadChildren: () => import('./about/about.module').then((m) => m.AboutModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'users',
                        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
                        data: { permission: 'Pages.Users' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'roles',
                        loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
                        data: { permission: 'Pages.Roles' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'tenants',
                        loadChildren: () => import('./tenants/tenants.module').then((m) => m.TenantsModule),
                        data: { permission: 'Pages.Tenants' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'update-password',
                        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
                        canActivate: [AppRouteGuard],
                    },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
