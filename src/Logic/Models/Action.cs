﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class ActionModel
    {
        public ActionModel()
        {
            LatestEntry = new LogEntryModel();
            Items = new List<ActionModel>();
            RecurrenceRules = new List<String>();
        }
        public Guid Id { get; set; }
        public string Ref { get; set; }
        public string Kind { get; set; }
        public string Name { get; set; }
        public bool IsSomeday { get; set; }
        public string Content { get; set; }
        public DateTime? Enlist { get; set; }
        public DateTime? Retire { get; set; }
        public short? StartAt { get; set; }
        public short? Duration { get; set; }
        public List<string> Tags { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? LastPerformed { get; set; }
        public DateTime? NextDate { get; set; }
        public LogEntryModel LatestEntry { get; set; }
        public List<LogEntryModel> LogEntries  { get; set; }
        public List<ActionModel> Items { get; set; }
        public List<String> RecurrenceRules { get; set; }
    }
}