using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserCrud.Docters.Enums;

namespace UserCrud.Docters.Dto
{
    public class DocterDto: FullAuditedEntity<long>
    {
        public string DocterCode { get; set; }

        public string FullName { get; set; }
        public DoctorSpecializationEnum Specialization { get; set; }
        public string SpecializationName => Specialization.ToString();
        public string Qualification { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public long UserId { get; set; }
        public bool IsAvailble { get; set; }

    }

}

