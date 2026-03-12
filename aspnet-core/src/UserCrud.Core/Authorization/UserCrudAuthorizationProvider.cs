using Abp.Authorization;
using Abp.Localization;
using Abp.MultiTenancy;

namespace UserCrud.Authorization
{
    public class UserCrudAuthorizationProvider : AuthorizationProvider
    {
        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            var pages = context.CreatePermission("Pages", L("Pages"));
            pages.CreateChildPermission(PermissionNames.Pages_Users, L("Users"));
            pages.CreateChildPermission(PermissionNames.Pages_Users_Activation, L("UsersActivation"));
            pages.CreateChildPermission(PermissionNames.Pages_Roles, L("Roles"));
            pages.CreateChildPermission(PermissionNames.Pages_Tenants, L("Tenants"), multiTenancySides: MultiTenancySides.Host);


            // ---------------- DOCTOR ----------------
            var doctor = pages.CreateChildPermission("Pages.Doctor", L("Doctor"));
            doctor.CreateChildPermission("Pages.Doctor.Create", L("CreateDoctor"));
            doctor.CreateChildPermission("Pages.Doctor.Edit", L("EditDoctor"));
            doctor.CreateChildPermission("Pages.Doctor.Delete", L("DeleteDoctor"));
            doctor.CreateChildPermission("Pages.Doctor.View", L("ViewDoctor"));

            // ---------------- PATIENT ----------------
            var patient = pages.CreateChildPermission("Pages.Patient", L("Patient"));
            patient.CreateChildPermission("Pages.Patient.Create", L("CreatePatient"));
            patient.CreateChildPermission("Pages.Patient.Edit", L("EditPatient"));
            patient.CreateChildPermission("Pages.Patient.Delete", L("DeletePatient"));
            patient.CreateChildPermission("Pages.Patient.View", L("ViewPatient"));

            // ---------------- PATIENT ADMISSION ----------------
            var admission = pages.CreateChildPermission("Pages.PatientAdmission", L("PatientAdmission"));
            admission.CreateChildPermission("Pages.PatientAdmission.Create", L("CreatePatientAdmission"));
            admission.CreateChildPermission("Pages.PatientAdmission.Edit", L("EditPatientAdmission"));
            admission.CreateChildPermission("Pages.PatientAdmission.Delete", L("DeletePatientAdmission"));
            admission.CreateChildPermission("Pages.PatientAdmission.View", L("ViewPatientAdmission"));

            // ---------------- ROOM ----------------
            var room = pages.CreateChildPermission("Pages.Room", L("Room"));
            room.CreateChildPermission("Pages.Room.Create", L("CreateRoom"));
            room.CreateChildPermission("Pages.Room.Edit", L("EditRoom"));
            room.CreateChildPermission("Pages.Room.Delete", L("DeleteRoom"));
            room.CreateChildPermission("Pages.Room.View", L("ViewRoom"));

            // ---------------- BED ----------------
            var bed = pages.CreateChildPermission("Pages.Bed", L("Bed"));
            bed.CreateChildPermission("Pages.Bed.Create", L("CreateBed"));
            bed.CreateChildPermission("Pages.Bed.Edit", L("EditBed"));
            bed.CreateChildPermission("Pages.Bed.Delete", L("DeleteBed"));
            bed.CreateChildPermission("Pages.Bed.View", L("ViewBed"));

        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, UserCrudConsts.LocalizationSourceName);
        }
    }
}