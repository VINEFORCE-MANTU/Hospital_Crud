using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserCrud.Beds;
using UserCrud.Docters;
using UserCrud.PatientAdmission.Enums;
using UserCrud.Patients;

namespace UserCrud.PatientAdmission
{
    public class patientAdmission :FullAuditedEntity<long>
    {
        public DateTime AdmissionDate { get; set; }
        public DateTime? DischargeDate { get; set; }

        public string Diagnosis { get; set; }

        public string Status { get; set; }
        public AdmissionApprovalStatus ApprovalStatus { get; set; }   // Pending / Approved / Rejected
        public string RejectionReason { get; set; }

        public long PatientId { get; set; }
        public long DoctorId { get; set; }
        public long BedId { get; set; }

        [ForeignKey("PatientId")]
        public patient Patient { get; set; }

        [ForeignKey("DoctorId")]
        public doctor Doctor { get; set; }
        [ForeignKey("BedId")]
        public bed Bed { get; set; }
    }
}
