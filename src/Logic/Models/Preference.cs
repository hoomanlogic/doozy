using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HoomanLogic.Models
{
    public class Preference
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string ProfileUri { get; set; }
        public byte WeekStarts { get; set; }
        public string Location { get; set; }
        public string Email { get; set; }
        public bool EmailNotifications { get; set; }
    }
}
