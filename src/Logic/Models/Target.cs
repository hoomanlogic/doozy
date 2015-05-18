using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class TargetModel
    {
        public Guid Id { get; set; }
        public string TagName { get; set; }
        public string Kind { get; set; }
        public short Goal { get; set; }
        public string Timeline { get; set; }
        public DateTime? Enlist { get; set; }
        public DateTime? Retire { get; set; }
    }
}