using System.ComponentModel.DataAnnotations;

namespace CRUD_Ops.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; } 
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNo { get; set; } = string.Empty;
        public string Adress { get; set; } = string.Empty;
    }
}
