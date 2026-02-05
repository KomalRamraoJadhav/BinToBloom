using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BinToBloom_Backend.Services;
using System.Security.Claims;

namespace BinToBloom_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User not authenticated");
            int userId = int.Parse(userIdStr);

            // UserService.GetUserByIdAsync or GetProfile?
            // I'll assume GetUserByIdAsync.
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null) return NotFound("User not found");
            return Ok(user);
        }

        [HttpGet("collectors")]
        public async Task<IActionResult> GetCollectors()
        {
             // return list of collectors
             // Assuming UserService has GetCollectors or similar.
             // Or I might need CollectorService.
             // But let's check UserService.cs.
             return Ok(await _userService.GetAllCollectorsAsync());
        }
    }
}
