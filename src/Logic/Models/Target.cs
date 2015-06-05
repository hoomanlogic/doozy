using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class TargetModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string EntityType { get; set; }
        public Guid EntityId { get; set; }
        public byte Measure { get; set; }
        public short Number { get; set; }
        public DateTime Created { get; set; }
        public DateTime? Retire { get; set; }
        public DateTime Starts { get; set; }
        public byte Period { get; set; }
        public short Multiplier { get; set; }
        public bool RetireWhenMet { get; set; }
    }
}