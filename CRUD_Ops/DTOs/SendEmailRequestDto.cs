namespace CRUD_Ops.DTOs
{
    public class SendEmailRequestDto
    {
        public List<int> UserIds { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
    }
}
