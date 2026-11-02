import { Component, Injector, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbpSessionService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/app-component-base';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { FormsModule } from '@angular/forms';
import { AbpValidationSummaryComponent } from '../../shared/components/validation/abp-validation.summary.component';
import { RouterLink, Router } from '@angular/router';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TenantChangeDialogComponent } from '../tenant/tenant-change-dialog.component';
import { AccountLanguagesComponent } from '../layout/account-languages.component';

@Component({
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    animations: [accountModuleAnimation()],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        AbpValidationSummaryComponent,
        RouterLink,
        LocalizePipe,
        AccountLanguagesComponent,
    ],
})
export class LoginComponent extends AppComponentBase implements OnInit {
    submitting = false;
    showPassword = false;
    selectedRole: 'doctor' | 'patient' | 'admin' = 'doctor';

    availableLanguages: abp.localization.ILanguageInfo[] = [];
    currentLanguageName = '';
    isLanguageDropdownOpen = false;

    get currentLanguage(): abp.localization.ILanguageInfo | undefined {
        return this.localization?.currentLanguage;
    }

    get currentLanguageDisplayName(): string {
        return this.currentLanguage?.displayName || 'English';
    }

    get currentLanguageIcon(): string {
        return this.currentLanguage?.icon || 'famfamfam-flags us';
    }

    @HostListener('document:click')
    closeDropdowns(): void {
        this.isLanguageDropdownOpen = false;
    }

    toggleLanguageDropdown(event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    }

    constructor(
        injector: Injector,
        public authService: AppAuthService,
        private _sessionService: AbpSessionService,
        private router: Router,
        private _modalService: BsModalService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        if (this.localization && this.localization.languages) {
            this.availableLanguages = this.localization.languages.filter(
                (l) => !l.isDisabled
            );
            if (this.localization.currentLanguage) {
                this.currentLanguageName = this.localization.currentLanguage.name;
            }
        }
    }

    get multiTenancySideIsTeanant(): boolean {
        return this._sessionService.tenantId > 0;
    }

    get isSelfRegistrationAllowed(): boolean {
        if (!this._sessionService.tenantId) {
            return false;
        }
        return true;
    }

    get isMultiTenancyEnabled(): boolean {
        return abp.multiTenancy.isEnabled;
    }

    get currentTenancyName(): string {
        return this.appSession?.tenant?.tenancyName || '';
    }

    openTenantModal(): void {
        const modal = this._modalService.show(TenantChangeDialogComponent);
        if (this.appSession.tenant) {
            modal.content.tenancyName = this.appSession.tenant.tenancyName;
        }
    }

    selectRole(role: 'doctor' | 'patient' | 'admin'): void {
        this.selectedRole = role;
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    changeLanguage(languageName: string): void {
        abp.utils.setCookieValue(
            'Abp.Localization.CultureName',
            languageName,
            new Date(new Date().getTime() + 5 * 365 * 86400000),
            abp.appPath
        );
        location.reload();
    }

    forgotPassword(): void {
        abp.message.info(
            'Please contact your hospital clinical administrator or IT support at support@meditrack.health to reset your credentials.',
            'Reset Password'
        );
    }

    login(): void {
        this.submitting = true;

        this.authService.authenticate(() => {
            this.submitting = false;

            // Doctor
            if (this.permission.isGranted('Pages.Doctor')) {
                this.router.navigate(['/app/docter']);
            }
            // Patient
            else if (this.permission.isGranted('Pages.Patient')) {
                this.router.navigate(['/app/patient/profile']);
            }
            // Admin
            else if (this.permission.isGranted('Pages.Roles')) {
                this.router.navigate(['/app/about']);
            }
            // Default
            else {
                this.router.navigate(['/app/about']);
            }
        });
    }
}