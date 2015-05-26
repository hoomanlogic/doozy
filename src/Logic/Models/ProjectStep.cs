using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class ProjectStepModel
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string Kind { get; set; }
        public string Name { get; set; }
        public string Content { get; set; }
        public short? Duration { get; set; }
        public string TagName { get; set; }
        public DateTime? Created { get; set; }
        public short? Level { get; set; }
        public short? Parent { get; set; }
        public short? Ordinal { get; set; }
    }
}