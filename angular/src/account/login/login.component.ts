import { Component, Injector } from '@angular/core';
import { AbpSessionService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/app-component-base';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { FormsModule } from '@angular/forms';
import { AbpValidationSummaryComponent } from '../../shared/components/validation/abp-validation.summary.component';
import { RouterLink, Router } from '@angular/router';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AppSessionService } from '@shared/session/app-session.service';

@Component({
    templateUrl: './login.component.html',
    animations: [accountModuleAnimation()],
    standalone: true,
    imports: [FormsModule, AbpValidationSummaryComponent, RouterLink, LocalizePipe],
})
export class LoginComponent extends AppComponentBase {
    submitting = false;

    constructor(
        injector: Injector,
        public authService: AppAuthService,
        private _sessionService: AbpSessionService,
        private router: Router
    ) {
        super(injector);
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