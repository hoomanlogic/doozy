using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class LogEntryModel
    {
        public Guid Id { get; set; }
        public DateTime Date { get; set; }
        public Guid ActionId { get; set; }
        public string Entry { get; set; }
        public short? Duration { get; set; }
        public string Details { get; set; }
    }
}