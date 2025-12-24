using CRUD_Ops.Data;
using CRUD_Ops.DTOs;
using CRUD_Ops.Services;
using CRUD_Ops.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace CRUD_Ops.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        // ✅ Constructor with BOTH dependencies injected
        public UsersController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // 🟢 GET: api/users
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        // 🟢 GET: api/users/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // 🟢 POST: api/users
        [HttpPost]
        public async Task<IActionResult> CreateUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }

        // 🟢 PUT: api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User updatedUser)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            user.Name = updatedUser.Name;
            user.Email = updatedUser.Email;
            user.PhoneNo = updatedUser.PhoneNo;
            user.Adress = updatedUser.Adress;

            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // 🟢 DELETE: api/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 🟢 UPLOAD USERS FROM EXCEL
        [HttpPost("upload-excel")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var users = new List<User>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    int rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        var user = new User
                        {
                            Name = worksheet.Cells[row, 1].Text,
                            Email = worksheet.Cells[row, 2].Text,
                            PhoneNo = worksheet.Cells[row, 3].Text,
                            Adress = worksheet.Cells[row, 4].Text
                        };

                        users.Add(user);
                    }
                }
            }

            _context.Users.AddRange(users);
            await _context.SaveChangesAsync();

            return Ok($"{users.Count} users uploaded successfully");
        }

        // 🟢 SEND EMAIL TO SELECTED USERS
        [HttpPost("send-email")]
        public async Task<IActionResult> SendEmailToSelectedUsers(
            SendEmailRequestDto request)
        {
            // Validation
            if (request.UserIds == null || !request.UserIds.Any())
                return BadRequest("No users selected.");

            if (string.IsNullOrWhiteSpace(request.Subject) ||
                string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Subject and message are required.");

            // Fetch selected users
            var users = await _context.Users
                .Where(u => request.UserIds.Contains(u.Id))
                .ToListAsync();

            foreach (var user in users)
            {
                if (!string.IsNullOrWhiteSpace(user.Email))
                {
                    await _emailService.SendEmailAsync(
                        user.Email,
                        request.Subject,
                        request.Message
                    );
                }
            }

            return Ok("Email sent successfully to selected users.");
        }
    }
}
