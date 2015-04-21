using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class ObjectiveModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public DateTime? Enlist { get; set; }
        public DateTime? Retire { get; set; }
        public List<string> Targets { get; set; }
        public List<string> Tags { get; set; }
        public string Content { get; set; }
        public LogEntryModel LatestEntry { get; set; }
        public List<ObjectiveModel> Children { get; set; }
    }
}