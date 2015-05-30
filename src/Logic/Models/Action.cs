using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class ActionModel
    {
        public ActionModel()
        {
            Items = new List<ActionModel>();
            RecurrenceRules = new List<String>();
        }
        public Guid Id { get; set; }
        public Guid? PlanStepId { get; set; }
        public short? Ordinal { get; set; }
        public string Kind { get; set; }
        public string Name { get; set; }
        public bool IsPublic { get; set; }
        public string Content { get; set; }
        public short? Duration { get; set; }
        public List<string> Tags { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? LastPerformed { get; set; }
        public DateTime? NextDate { get; set; }
        public List<ActionModel> Items { get; set; }
        public List<String> RecurrenceRules { get; set; }
    }
}