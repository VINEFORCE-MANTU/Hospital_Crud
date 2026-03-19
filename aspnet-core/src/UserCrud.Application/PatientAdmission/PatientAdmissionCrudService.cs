using Abp.Application.Services;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UserCrud.Beds;
using UserCrud.Beds.Dto;
using UserCrud.Docters;
using UserCrud.Docters.Dto;
using UserCrud.PatientAdmission.Dto;
using UserCrud.PatientAdmission.Enums;
using UserCrud.Patients;
using UserCrud.Patients.Dto;

namespace UserCrud.PatientAdmission
{
    public class PatientAdmissionCrudService : ApplicationService, IPatientAdmissionDtoApplicationModule
    {
        private readonly IRepository<patientAdmission, long> _patientAdmissionRepository;
        private readonly IRepository<patient, long> _patientRepository;
        private readonly IRepository<doctor, long> _doctorRepository;
        private readonly IRepository<bed, long> _bedRepository;

        public PatientAdmissionCrudService(
            IRepository<patientAdmission, long> patientAdmissionRepository,
            IRepository<patient, long> patientRepository,
            IRepository<doctor, long> doctorRepository,
            IRepository<bed, long> bedRepository)
        {
            _patientAdmissionRepository = patientAdmissionRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _bedRepository = bedRepository;
        }

        // Get all admissions
        public async Task<List<PatientAdmissionDto>> GetAllPatientAdmissionsAsync()
        {
            var admissions = await _patientAdmissionRepository
                .GetAllIncluding(a => a.Patient, a => a.Doctor, a => a.Bed)
                .ToListAsync();

            return admissions.Select(MapToDto).ToList();
        }

        // Get by Id
        public async Task<PatientAdmissionDto> GetPatientAdmissionByIdAsync(long id)
        {
            var admission = await _patientAdmissionRepository
                .GetAllIncluding(a => a.Patient, a => a.Doctor, a => a.Bed)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (admission == null)
                throw new EntityNotFoundException(typeof(patientAdmission), id);

            return MapToDto(admission);
        }

        // Create admission
        public async Task<PatientAdmissionDto> CreatePatientAdmissionAsync(CreatePatientAdmissionDto input)
        {
            var patient = await _patientRepository.FirstOrDefaultAsync(p => p.Id == input.PatientId)
                ?? throw new UserFriendlyException($"Patient with id {input.PatientId} not found.");

            var doctor = await _doctorRepository.FirstOrDefaultAsync(d => d.Id == input.DoctorId)
                ?? throw new UserFriendlyException($"Doctor with id {input.DoctorId} not found.");

            var bed = await _bedRepository.FirstOrDefaultAsync(b => b.Id == input.BedId)
                ?? throw new UserFriendlyException($"Bed with id {input.BedId} not found.");

            var admission = new patientAdmission
            {
                AdmissionDate = input.AdmissionDate,
                DischargeDate = input.DischargeDate,
                Diagnosis = input.Diagnosis,
                Status = input.Status,
                PatientId = input.PatientId,
                DoctorId = input.DoctorId,
                BedId = input.BedId,
                Patient = patient,
                Doctor = doctor,
                Bed = bed
            };

            await _patientAdmissionRepository.InsertAsync(admission);

            return MapToDto(admission);
        }

        public async Task<List<PatientAdmissionDto>> GetMyPatients()
        {
            var userId = AbpSession.UserId.Value;

            var doctor = await _doctorRepository
                .FirstOrDefaultAsync(x => x.UserId == userId);

            var admissions = await _patientAdmissionRepository
                .GetAllIncluding(
                    x => x.Patient,
                    x => x.Doctor,
                    x => x.Bed,
                    x => x.Bed.Room
                )
                .Where(x => x.DoctorId == doctor.Id)
                .ToListAsync();

            return ObjectMapper.Map<List<PatientAdmissionDto>>(admissions);
        }

        // Update admission
        public async Task<PatientAdmissionDto> UpdatePatientAdmissionAsync(UpdatePatientAdmissionDto input)
        {
            var admission = await _patientAdmissionRepository.FirstOrDefaultAsync(a => a.Id == input.Id)
                ?? throw new EntityNotFoundException(typeof(patientAdmission), input.Id);

            var patient = await _patientRepository.FirstOrDefaultAsync(p => p.Id == input.PatientId)
                ?? throw new UserFriendlyException($"Patient with id {input.PatientId} not found.");

            var doctor = await _doctorRepository.FirstOrDefaultAsync(d => d.Id == input.DoctorId)
                ?? throw new UserFriendlyException($"Doctor with id {input.DoctorId} not found.");

            var bed = await _bedRepository.FirstOrDefaultAsync(b => b.Id == input.BedId)
                ?? throw new UserFriendlyException($"Bed with id {input.BedId} not found.");

            admission.AdmissionDate = input.AdmissionDate;
            admission.DischargeDate = input.DischargeDate;
            admission.Diagnosis = input.Diagnosis;
            admission.Status = input.Status;
            admission.PatientId = input.PatientId;
            admission.DoctorId = input.DoctorId;
            admission.BedId = input.BedId;

            // Assign navigation properties for mapping
            admission.Patient = patient;
            admission.Doctor = doctor;
            admission.Bed = bed;

            await _patientAdmissionRepository.UpdateAsync(admission);

            return MapToDto(admission);
        }

        public async Task ApproveAdmission(long id)
        {
            var admission = await _patientAdmissionRepository.FirstOrDefaultAsync(id)
                ?? throw new EntityNotFoundException(typeof(patientAdmission), id);

            admission.ApprovalStatus = AdmissionApprovalStatus.Approved;

            await _patientAdmissionRepository.UpdateAsync(admission);
        }

        public async Task RejectAdmission(long id, string reason)
        {
            var admission = await _patientAdmissionRepository.FirstOrDefaultAsync(id)
                ?? throw new EntityNotFoundException(typeof(patientAdmission), id);

            admission.ApprovalStatus = AdmissionApprovalStatus.Rejected;
            admission.RejectionReason = reason;

            await _patientAdmissionRepository.UpdateAsync(admission);
        }

        // Delete admission
        public async Task DeletePatientAdmissionAsync(long id)
        {
            var admission = await _patientAdmissionRepository.FirstOrDefaultAsync(a => a.Id == id)
                ?? throw new EntityNotFoundException(typeof(patientAdmission), id);

            await _patientAdmissionRepository.DeleteAsync(admission);
        }

        // Map entity to DTO
        private PatientAdmissionDto MapToDto(patientAdmission a)
        {
            return new PatientAdmissionDto
            {
                Id = a.Id,
                AdmissionDate = a.AdmissionDate,
                DischargeDate = a.DischargeDate,
                Diagnosis = a.Diagnosis,
                Status = a.Status,
                PatientId = a.PatientId,
                DoctorId = a.DoctorId,
                BedId = a.BedId,
                Patient = a.Patient == null ? null : new PatientDto
                {
                    Id = a.Patient.Id,
                    FirstName = a.Patient.FirstName,
                    LastName = a.Patient.LastName,
                    PatientCode = a.Patient.PatientCode
                },
                Doctor = a.Doctor == null ? null : new DocterDto
                {
                    Id = a.Doctor.Id,
                    FullName = a.Doctor.FullName,
                    Specialization = a.Doctor.Specialization
                },
                Bed = a.Bed == null ? null : new BedDto
                {
                    Id = a.Bed.Id,
                    BedNumber = a.Bed.BedNumber
                }
            };
        }
    }
}