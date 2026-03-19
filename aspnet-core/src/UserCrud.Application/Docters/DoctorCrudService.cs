using Abp.Application.Services;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Abp.UI;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using UserCrud.Docters.Dto;

namespace UserCrud.Docters
{
    public class DoctorCrudService : ApplicationService , IDoctorCrudApplicationModule
    {
        private readonly IRepository<doctor, long> _doctorRepository;

        public DoctorCrudService(IRepository<doctor, long> doctorRepository)
        {
            _doctorRepository = doctorRepository;
        }

        // Get all doctors
        public async Task<List<DocterDto>> GetAllDoctorsAsync()
        {
            var doctors = await _doctorRepository.GetAllListAsync();
            return doctors.Select(d => new DocterDto
            {
                Id = d.Id,
                DocterCode = d.DocterCode,
                FullName = d.FullName,
                Specialization = d.Specialization,
                Qualification = d.Qualification,
                PhoneNumber = d.PhoneNumber,
                Email = d.Email,
                IsAvailble = d.IsAvailble
            }).ToList();
        }

        // Get doctor by ID
        public async Task<DocterDto> GetDoctorByIdAsync(long id)
        {
            var doctor = await _doctorRepository.FirstOrDefaultAsync(d => d.Id == id);
            if (doctor == null)
            {
                throw new Exception($"Doctor with id {id} not found.");
            }

            return new DocterDto
            {
                Id = doctor.Id,
                DocterCode = doctor.DocterCode,
                FullName = doctor.FullName,
                Specialization = doctor.Specialization,
                Qualification = doctor.Qualification,
                PhoneNumber = doctor.PhoneNumber,
                Email = doctor.Email,
                IsAvailble = doctor.IsAvailble
            };
        }

        // Create a new doctor
        public async Task<DocterDto> CreateDoctorAsync(CreateDocterDto input)
        {
            try
            {
                var validationErrors = new List<ValidationResult>();

                // Check DoctorCode duplicate
                if (await _doctorRepository.FirstOrDefaultAsync(d => d.DocterCode == input.DocterCode) != null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"DoctorCode '{input.DocterCode}' is already in use.",
                        new[] { "DoctorCode" }));
                }

                // Check Email duplicate
                if (await _doctorRepository.FirstOrDefaultAsync(d => d.Email == input.Email) != null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"Email '{input.Email}' is already in use.",
                        new[] { "Email" }));
                }

                // Check PhoneNumber duplicate
                if (await _doctorRepository.FirstOrDefaultAsync(d => d.PhoneNumber == input.PhoneNumber) != null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"Phone number '{input.PhoneNumber}' is already in use.",
                        new[] { "PhoneNumber" }));
                }

                // If any validation errors exist, throw
                if (validationErrors.Any())
                {
                    throw new AbpValidationException("Validation failed", validationErrors);
                }

                // Create new doctor entity
                var doctor = new doctor
                {
                    DocterCode = input.DocterCode,
                    FullName = input.FullName,
                    Specialization = input.Specialization,
                    Qualification = input.Qualification,
                    PhoneNumber = input.PhoneNumber,
                    Email = input.Email,
                    IsAvailble = input.IsAvailble,
                    UserId = AbpSession.UserId.Value
                };

                // Insert into repository
                var createdDoctor = await _doctorRepository.InsertAsync(doctor);

                // Return DTO
                return new DocterDto
                {
                    Id = createdDoctor.Id,
                    DocterCode = createdDoctor.DocterCode,
                    FullName = createdDoctor.FullName,
                    Specialization = createdDoctor.Specialization,
                    Qualification = createdDoctor.Qualification,
                    PhoneNumber = createdDoctor.PhoneNumber,
                    Email = createdDoctor.Email,
                    IsAvailble = createdDoctor.IsAvailble,
                    
                    UserId = createdDoctor.UserId
                };
            }
            catch (AbpValidationException vex)
            {
                // Re-throw validation exceptions as they are expected
                throw;
            }
            catch (Exception ex)
            {
                // Catch unexpected exceptions and wrap if needed
                throw new UserFriendlyException("An unexpected error occurred while creating the doctor.", ex);
            }
        }
        public async Task<DocterDto> UpdateDoctorAsync(UpdateDocterDto input)
        {
            try
            {
                var doctor = await _doctorRepository.FirstOrDefaultAsync(d => d.Id == input.Id);
                if (doctor == null)
                {
                    throw new UserFriendlyException($"Doctor with Id '{input.Id}' not found.");
                }

                var validationErrors = new List<ValidationResult>();

                // Check DoctorCode duplicate (excluding current doctor)
                if (await _doctorRepository.FirstOrDefaultAsync(d => d.DocterCode == input.DocterCode && d.Id != input.Id) != null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"DoctorCode '{input.DocterCode}' is already in use.",
                        new[] { "DoctorCode" }));
                }

                // Check Email duplicate (excluding current doctor)
                if (await _doctorRepository.FirstOrDefaultAsync(d => d.Email == input.Email && d.Id != input.Id) != null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"Email '{input.Email}' is already in use.",
                        new[] { "Email" }));
                }

                // Check PhoneNumber duplicate (excluding current doctor)
                if (await _doctorRepository.FirstOrDefaultAsync(d => d.PhoneNumber == input.PhoneNumber && d.Id != input.Id) != null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"Phone number '{input.PhoneNumber}' is already in use.",
                        new[] { "PhoneNumber" }));
                }

                // If any validation errors exist, throw
                if (validationErrors.Any())
                {
                    throw new AbpValidationException("Validation failed", validationErrors);
                }

                // Update doctor entity
                doctor.DocterCode = input.DocterCode;
                doctor.FullName = input.FullName;
                doctor.Specialization = input.Specialization;
                doctor.Qualification = input.Qualification;
                doctor.PhoneNumber = input.PhoneNumber;
                doctor.Email = input.Email;
                doctor.IsAvailble = input.IsAvailble;

                await _doctorRepository.UpdateAsync(doctor);

                // Return updated DTO
                return new DocterDto
                {
                    Id = doctor.Id,
                    DocterCode = doctor.DocterCode,
                    FullName = doctor.FullName,
                    Specialization = doctor.Specialization,
                    Qualification = doctor.Qualification,
                    PhoneNumber = doctor.PhoneNumber,
                    Email = doctor.Email,
                    IsAvailble = doctor.IsAvailble
                };
            }
            catch (AbpValidationException)
            {
                // Re-throw known validation exceptions
                throw;
            }
            catch (Exception ex)
            {
                // Wrap unexpected exceptions
                throw new UserFriendlyException("An unexpected error occurred while updating the doctor.", ex);
            }
        }
        public async Task<DocterDto> GetMyDoctorProfile()
        {
            var userId = AbpSession.UserId;

            var doctor = await _doctorRepository
                .FirstOrDefaultAsync(x => x.UserId == userId);

            return ObjectMapper.Map<DocterDto>(doctor);
        }

        // Delete a doctor
        public async Task DeleteDoctorAsync(long id)
        {
            var doctor = await _doctorRepository.FirstOrDefaultAsync(d => d.Id == id);
            if (doctor == null)
            {
                throw new Exception($"Doctor with id {id} not found.");
            }

            await _doctorRepository.DeleteAsync(doctor);
        }
    }
}
