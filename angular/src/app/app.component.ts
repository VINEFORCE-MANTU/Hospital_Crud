import { Component, Injector, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppComponentBase } from '@shared/app-component-base';
import { SignalRAspNetCoreHelper } from '@shared/helpers/SignalRAspNetCoreHelper';
import { LayoutStoreService } from '@shared/layout/layout-store.service';

import { HeaderComponent } from './layout/header.component';
import { SidebarComponent } from './layout/sidebar.component';
import { FooterComponent } from './layout/footer.component';

import { DoctorAiComponent } from './docter/doctor-ai/doctor-ai.component';
import { CommonModule } from '@angular/common';
@Component({
    templateUrl: './app.component.html',
    standalone: true,
    imports: [
        HeaderComponent,
        SidebarComponent,
        RouterOutlet,
        FooterComponent,
        DoctorAiComponent,
        CommonModule
    ],
})
export class AppComponent extends AppComponentBase implements OnInit {

    sidebarExpanded: boolean;
    isDoctor = false;

    constructor(
        injector: Injector,
        private renderer: Renderer2,
        private _layoutStore: LayoutStoreService
    ) {
        super(injector);
    }

    ngOnInit(): void {

        this.renderer.addClass(document.body, 'sidebar-mini');

        SignalRAspNetCoreHelper.initSignalR();

        // Check Doctor Permission
        this.isDoctor = abp.auth.isGranted('Pages.Doctor');

        abp.event.on('abp.notifications.received', (userNotification) => {

            abp.notifications.showUiNotifyForUserNotification(
                userNotification
            );

            Push.create('AbpZeroTemplate', {
                body: userNotification.notification.data.message,
                icon: abp.appPath + 'assets/app-logo-small.png',
                timeout: 6000,
                onClick: function () {
                    window.focus();
                    this.close();
                },
            });
        });

        this._layoutStore.sidebarExpanded.subscribe((value) => {
            this.sidebarExpanded = value;
        });
    }

    toggleSidebar(): void {
        this._layoutStore.setSidebarExpanded(
            !this.sidebarExpanded
        );
    }
}