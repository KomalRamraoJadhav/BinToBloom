using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BinToBloom_Backend.Models.DTOs;
using BinToBloom_Backend.Services;

namespace BinToBloom_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "NGO")]
    public class NGOController : ControllerBase
    {
        private readonly INGOService _ngoService;

        public NGOController(INGOService ngoService)
        {
            _ngoService = ngoService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var dashboard = await _ngoService.GetNGODashboardAsync(userId);
            
            if (dashboard == null)
                return NotFound(new { message = "Dashboard not found." });

            return Ok(dashboard);
        }

        [HttpGet("city-waste-data")]
        public async Task<IActionResult> GetCityWasteData()
        {
            var data = await _ngoService.GetCityWasteDataAsync();
            return Ok(data);
        }

        [HttpGet("download-report")]
        public async Task<IActionResult> DownloadReport()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var dashboard = await _ngoService.GetNGODashboardAsync(userId);
            var cityData = await _ngoService.GetCityWasteDataAsync();
            
            if (dashboard == null)
                return NotFound(new { message = "Dashboard not found." });

            // Generate report data
            var reportData = new
            {
                ngoName = dashboard.Name,
                city = dashboard.City,
                generatedOn = DateTime.Now,
                totalWasteCollected = dashboard.TotalWasteCollected,
                totalCarbonSaved = dashboard.TotalCarbonSaved,
                cityWiseData = cityData
            };

            return Ok(reportData);
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var reports = await _ngoService.GetNGOReportsAsync(userId);
            return Ok(reports);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateNGOProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _ngoService.UpdateNGOProfileAsync(userId, dto);
            
            if (!result)
                return BadRequest(new { message = "Failed to update profile." });

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var analytics = await _ngoService.GetGlobalAnalyticsAsync();
            return Ok(analytics);
        }

        [HttpGet("analytics/city/{city}")]
        public async Task<IActionResult> GetCityAnalytics(string city)
        {
            var analytics = await _ngoService.GetCitySpecificAnalyticsAsync(city);
            return Ok(analytics);
        }
    }
}
