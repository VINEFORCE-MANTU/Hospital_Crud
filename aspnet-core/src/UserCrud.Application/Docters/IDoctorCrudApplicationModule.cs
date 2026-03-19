using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserCrud.Docters.Dto;

namespace UserCrud.Docters
{
    public interface IDoctorCrudApplicationModule
    {
        Task<List<DocterDto>> GetAllDoctorsAsync();
        Task<DocterDto> GetDoctorByIdAsync(long id);
        Task<DocterDto> CreateDoctorAsync(CreateDocterDto input);
        Task<DocterDto> UpdateDoctorAsync(UpdateDocterDto input);
        Task<DocterDto> GetMyDoctorProfile();
        Task DeleteDoctorAsync(long id);

    }
}
