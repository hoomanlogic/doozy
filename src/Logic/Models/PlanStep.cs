using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class PlanStepModel
    {
        public Guid Id { get; set; }
        public Guid PlanId { get; set; }
        public Guid? ParentId { get; set; }
        public string Kind { get; set; }
        public string Name { get; set; }
        public string Content { get; set; }
        public short? Duration { get; set; }
        public string TagName { get; set; }
        public string Status { get; set; }
        public DateTime? Created { get; set; }
        public short? Ordinal { get; set; }
    }
}