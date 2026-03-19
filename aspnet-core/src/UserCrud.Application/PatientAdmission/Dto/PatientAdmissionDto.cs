using Abp.Application.Services.Dto;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserCrud.Beds;
using UserCrud.Beds.Dto;
using UserCrud.Docters;
using UserCrud.Docters.Dto;
using UserCrud.Patients;
using UserCrud.Patients.Dto;

namespace UserCrud.PatientAdmission.Dto
{
    public class PatientAdmissionDto :FullAuditedEntityDto<long>
    {
        public DateTime AdmissionDate { get; set; }
        public DateTime? DischargeDate { get; set; }

        public string Diagnosis { get; set; }

        public string Status { get; set; }
        public string ApprovalStatus { get; set; }

        // Reason if doctor rejects
        public string RejectionReason { get; set; }

        public long PatientId { get; set; }
        public long DoctorId { get; set; }
        public long BedId { get; set; }

         
        public PatientDto Patient { get; set; }

     
        public DocterDto Doctor { get; set; }
     
        public BedDto Bed { get; set; }

    }
}
