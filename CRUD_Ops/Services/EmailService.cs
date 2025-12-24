using MimeKit;
using MailKit.Net.Smtp;

namespace CRUD_Ops.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string message);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;


        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress(
                _configuration["Smtp:FromName"],
                _configuration["Smtp:FromEmail"]
            ));

            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new TextPart("plain")
            {
                Text = message
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                _configuration["Smtp:Host"],
                int.Parse(_configuration["Smtp:Port"]),
                MailKit.Security.SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                _configuration["Smtp:Username"],
                _configuration["Smtp:Password"]
            );

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}
