using Abp.Application.Services;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using UserCrud.Beds.Dto;
using UserCrud.Rooms;
using UserCrud.Rooms.Dto;

namespace UserCrud.Beds
{
    public class BedCrudService : ApplicationService
    {
        private readonly IRepository<bed, long> _bedRepository;
        private readonly IRepository<room, long> _roomRepository;

        public BedCrudService(IRepository<bed, long> bedRepository, IRepository<room, long> roomRepository)
        {
            _bedRepository = bedRepository;
            _roomRepository = roomRepository;
        }

        // ===================== MAPPER =====================
        private BedDto MapToBedDto(bed b)
        {
            return new BedDto
            {
                Id = b.Id,
                BedNumber = b.BedNumber,
                IsOccupied = b.IsOccupied,
                RoomId = b.RoomId,
                Room = b.Room == null ? null : new RoomDto
                {
                    Id = b.Room.Id,
                    RoomType = b.Room.RoomType,
                    RoomNumber = b.Room.RoomNumber,
                    TotalBeds = b.Room.TotalBeds,
                    IsActive = b.Room.IsActive
                }
            };
        }

        // ===================== GET ALL =====================
        public async Task<List<BedDto>> GetAllBedsAsync()
        {
            var beds = await _bedRepository
                .GetAllIncluding(b => b.Room)
                .ToListAsync();

            return beds.Select(MapToBedDto).ToList();
        }

        // ===================== GET BY ID =====================
        public async Task<BedDto> GetBedByIdAsync(long id)
        {
            var bed = await _bedRepository
                .GetAllIncluding(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (bed == null)
                throw new UserFriendlyException($"Bed with id {id} not found.");

            return MapToBedDto(bed);
        }

        // ===================== CREATE =====================
        public async Task<BedDto> CreateBedAsync(CreateBedDto input)
        {
            try
            {
                var validationErrors = new List<ValidationResult>();

                var room = await _roomRepository.FirstOrDefaultAsync(input.RoomId);
                if (room == null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"Room with id {input.RoomId} does not exist.",
                        new[] { "RoomId" }));
                }

                var duplicateBed = await _bedRepository.FirstOrDefaultAsync(
                    b => b.RoomId == input.RoomId && b.BedNumber == input.BedNumber);

                if (duplicateBed != null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"BedNumber '{input.BedNumber}' already exists in this room.",
                        new[] { "BedNumber" }));
                }

                if (validationErrors.Any())
                    throw new AbpValidationException("Validation failed", validationErrors);

                var bed = new bed
                {
                    BedNumber = input.BedNumber,
                    IsOccupied = input.IsOccupied,
                    RoomId = input.RoomId
                };

                await _bedRepository.InsertAsync(bed);

                bed.Room = room;

                return MapToBedDto(bed);
            }
            catch (AbpValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Error while creating the bed.", ex);
            }
        }

        // ===================== UPDATE =====================
        public async Task<BedDto> UpdateBedAsync(UpdateBedDto input)
        {
            try
            {
                var bed = await _bedRepository.FirstOrDefaultAsync(input.Id);
                if (bed == null)
                    throw new UserFriendlyException($"Bed with id {input.Id} not found.");

                var validationErrors = new List<ValidationResult>();

                var duplicate = await _bedRepository.FirstOrDefaultAsync(
                    b => b.RoomId == input.RoomId &&
                         b.BedNumber == input.BedNumber &&
                         b.Id != input.Id);

                if (duplicate != null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"BedNumber '{input.BedNumber}' already exists in this room.",
                        new[] { "BedNumber" }));
                }

                var room = await _roomRepository.FirstOrDefaultAsync(input.RoomId);
                if (room == null)
                {
                    validationErrors.Add(new ValidationResult(
                        $"Room with id {input.RoomId} does not exist.",
                        new[] { "RoomId" }));
                }

                if (validationErrors.Any())
                    throw new AbpValidationException("Validation failed", validationErrors);

                bed.BedNumber = input.BedNumber;
                bed.IsOccupied = input.IsOccupied;
                bed.RoomId = input.RoomId;

                await _bedRepository.UpdateAsync(bed);

                bed.Room = room;

                return MapToBedDto(bed);
            }
            catch (AbpValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Error while updating the bed.", ex);
            }
        }

        // ===================== DELETE =====================
        public async Task DeleteBedAsync(long id)
        {
            var bed = await _bedRepository.FirstOrDefaultAsync(id);

            if (bed == null)
                throw new UserFriendlyException($"Bed with id {id} not found.");

            await _bedRepository.DeleteAsync(bed);
        }

        // ===================== GET BEDS BY ROOM =====================
        public async Task<List<BedDto>> GetBedsByRoomIdAsync(long roomId)
        {
            try
            {
                var beds = await _bedRepository
                    .GetAllIncluding(b => b.Room)
                    .Where(b => b.RoomId == roomId && !b.IsOccupied)
                    .ToListAsync();

                return beds.Select(MapToBedDto).ToList();
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException("Error while fetching available beds.", ex);
            }
        }
    }
}