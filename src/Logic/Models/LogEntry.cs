using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class LogEntryModel
    {
        public LogEntryModel()
        {
            Upvotes = new List<LogEntryPeanut>();
            Comments = new List<LogEntryPeanut>();
            Attachments = new List<LogEntryPeanut>();
        }

        public Guid Id { get; set; }
        public string Ref { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string KnownAs { get; set; }
        public string ProfileUri { get; set; }
        public DateTime Date { get; set; }
        public Guid ActionId { get; set; }
        public string ActionName { get; set; }
        public string Entry { get; set; }
        public short? Duration { get; set; }
        public string Details { get; set; }
        public List<LogEntryPeanut> Upvotes { get; set; }
        public List<LogEntryPeanut> Comments { get; set; }
        public List<LogEntryPeanut> Attachments { get; set; }
    }

    public class LogEntryPeanut
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string KnownAs { get; set; }
        public string ProfileUri { get; set; }
        public DateTime Date { get; set; }
        public string Comment { get; set; }
        public string AttachmentUri { get; set; }
        

    }
}