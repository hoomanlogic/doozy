using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class ProjectModel
    {
        public Guid Id { get; set; }
        public Guid FocusId { get; set; }
        public string Kind { get; set; }
        public string Name { get; set; }
        public DateTime? Enlist { get; set; }
        public DateTime? Retire { get; set; }
        public string IconUri { get; set; }
        public string Content { get; set; }
        public string TagName { get; set; }
        public LogEntryModel LatestEntry { get; set; }
    }
}