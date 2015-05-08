using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class ActionsRepository
    {
        #region Public API

        public static List<ActionModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var rootModels = GetActionsByParent(db, userId, null);

                return rootModels;
            }
        }

        public static ActionModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ActionModel action = db.Actions.Where(c => c.Id == id).Select(row => new Models.ActionModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    Kind = row.Kind,
                    Name = row.Name,
                    Created = row.Created,
                    Duration = row.Duration,
                    NextDate = row.NextDate,
                    IsPublic = row.IsPublic,
                    Content = row.Content,
                    RecurrenceRules = row.RecurrenceRules.Select(a => a.Rule).ToList(),
                    Tags = row.Tags.Select(tag => (tag.Kind == "Focus" ? "!" : (tag.Kind == "Place" ? "@" : (tag.Kind == "Need" ? "$" : (tag.Kind == "Goal" ? ">" : (tag.Kind == "Box" ? "#" : ""))))) + tag.Name).ToList(),
                    LastPerformed = db.LogEntries.Where(a => a.ActionId == row.Id && a.Entry == "performed").OrderByDescending(b => b.Date).Select(c => c.Date).FirstOrDefault(),
                    LatestEntry = db.LogEntries.Where(a => a.ActionId == row.Id).OrderByDescending(b => b.Date).Select(c => new Models.LogEntryModel() { Id = c.Id, ActionId = c.ActionId, Date = c.Date, Entry = c.Entry, Duration = c.Duration, Details = c.Details }).FirstOrDefault()
                }).FirstOrDefault();

                /**
                 * Linq FirstOrDefault returns DateTime.MinValue 
                 * instead of Null so we force it to null here
                 */
                if (action.LastPerformed == DateTime.MinValue)
                {
                    action.LastPerformed = null;
                }

                action.Items = GetActionsByParent(db, userId, action.Id);

                return action;
            }
        }

        private static List<ActionModel> GetActionsByParent(ef.hoomanlogicEntities db, string userId, Guid? parentId)
        {
            List<ActionModel> actions = null;

            if (parentId != null)
            {
                //actions = (from row in db.Actions
                //           join pw in db.ActionPathways on row.Id equals pw.ChildId
                //           where pw.ParentId == parentId
                //           orderby pw.Order
                //           select new Models.ActionModel()
                //           {
                //               Id = row.Id,
                //               Ref = row.Id.ToString(),
                //               Kind = row.Kind,
                //               Name = row.Name,
                //               Created = row.Created,
                //               Duration = row.Duration,
                //               NextDate = row.NextDate,
                //               IsPublic = row.IsPublic,
                //               Content = row.Content,
                //               RecurrenceRules = row.RecurrenceRules.Select(a => a.Rule).ToList(),
                //               Tags = row.Tags.Select(tag => (tag.Kind == "Focus" ? "!" : (tag.Kind == "Place" ? "@" : (tag.Kind == "Need" ? "$" : (tag.Kind == "Goal" ? ">" : (tag.Kind == "Box" ? "#" : ""))))) + tag.Name).ToList(),
                //               LastPerformed = db.LogEntries.Where(a => a.ActionId == row.Id && a.Entry == "performed").OrderByDescending(b => b.Date).Select(c => c.Date).FirstOrDefault(),
                //               LatestEntry = db.LogEntries.Where(a => a.ActionId == row.Id).OrderByDescending(b => b.Date).Select(c => new Models.LogEntryModel() { Id = c.Id, ActionId = c.ActionId, Date = c.Date, Entry = c.Entry, Duration = c.Duration, Details = c.Details }).FirstOrDefault()
                //           }).ToList();

                //foreach (var action in actions)
                //{
                //    /**
                //     * Linq FirstOrDefault returns DateTime.MinValue 
                //     * instead of Null so we force it to null here
                //     */
                //    if (action.LastPerformed == DateTime.MinValue)
                //    {
                //        action.LastPerformed = null;
                //    }

                //    action.Items = GetActionsByParent(db, userId, action.Id);
                //}
            }
            else
            {
                //join o in db.ActionPathways
                //on row.Id equals o.ChildId into sr
                //from x in sr.DefaultIfEmpty()

                actions = (from row in db.Actions
                           where row.UserId == userId
                           select new Models.ActionModel()
                           {
                               Id = row.Id,
                               Ref = row.Id.ToString(),
                               Kind = row.Kind,
                               Name = row.Name,
                               Created = row.Created,
                               Duration = row.Duration,
                               NextDate = row.NextDate,
                               IsPublic = row.IsPublic,
                               Content = row.Content,
                               RecurrenceRules = row.RecurrenceRules.Select(a => a.Rule).ToList(),
                               Tags = row.Tags.Select(tag => (tag.Kind == "Focus" ? "!" : (tag.Kind == "Place" ? "@" : (tag.Kind == "Need" ? "$" : (tag.Kind == "Goal" ? ">" : (tag.Kind == "Box" ? "#" : ""))))) + tag.Name).ToList(),
                               LastPerformed = db.LogEntries.Where(a => a.ActionId == row.Id && a.Entry == "performed").OrderByDescending(b => b.Date).Select(c => c.Date).FirstOrDefault(),
                               LatestEntry = db.LogEntries.Where(a => a.ActionId == row.Id).OrderByDescending(b => b.Date).Select(c => new Models.LogEntryModel() { Id = c.Id, ActionId = c.ActionId, Date = c.Date, Entry = c.Entry, Duration = c.Duration, Details = c.Details }).FirstOrDefault()
                           }).ToList();

                /**
                 * Linq FirstOrDefault returns DateTime.MinValue 
                 * instead of Null so we force it to null here
                 */
                actions.ForEach(a =>
                {
                    if (a.LastPerformed == DateTime.MinValue)
                    {
                        a.LastPerformed = null;
                    }
                });
            }
       
            return actions;
        }

        public static dynamic Add(string userId, ActionModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.Action row = RecursiveAdd(db, null, userId, model);
                db.Actions.Add(row);

                // persist changes
                db.SaveChanges();
                model.Id = row.Id;

                // return a fresh model
                return Get(userId, model.Id);
            }
        }

        public static dynamic Update(string userId, ActionModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                RecursiveUpdate(db, userId, model);

                // persist changes
                db.SaveChanges();

                // return a fresh model
                return Get(userId, model.Id);
            }
        }

        public static void Delete(Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                db.Database.ExecuteSqlCommand("exec dbo.archiveAction @ActionId", id);
            }
        }

        public static void AddLogEntry(LogEntryModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // create log entry row
                ef.LogEntry row = new ef.LogEntry();
                row.Id = Guid.NewGuid();
                row.ActionId = model.ActionId;
                row.Date = model.Date;
                row.Entry = model.Entry;
                row.Duration = model.Duration;
                row.Details = model.Details;

                // add row to db table
                db.LogEntries.Add(row);
                db.SaveChanges();

                if (model.Entry == "performed")
                {
                    // set next date action should be performed
                    var action = db.Actions.Where(a => a.Id == model.ActionId).FirstOrDefault();
                    var latestPerformance = db.LogEntries.Where(a => a.Entry == "performed").OrderByDescending(a => a.Date).Select(a => a.Date).FirstOrDefault();
                    if (latestPerformance == null || latestPerformance == DateTime.MinValue || latestPerformance <= model.Date)
                    {
                        List<RecurrenceModel> recurrenceRules = new List<RecurrenceModel>();
                        foreach (var rule in action.RecurrenceRules)
                        {
                            recurrenceRules.Add(RecurrenceModel.GetRecurrence(rule.Rule));
                        }

                        action.NextDate = GetNextOccurrence(recurrenceRules, action.Created.Value, model.Date);
                        // persist changes
                        db.SaveChanges();
                    }
                }
            }
        }

        public static void UpdateLogEntry(LogEntryModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // create log entry row
                ef.LogEntry row = db.LogEntries.Where(a => a.Id == model.Id).First();
                bool dateChanged = false;
                if (row.Date != model.Date)
                {
                    row.Date = model.Date;
                    dateChanged = true;
                }
                row.Duration = model.Duration;
                row.Details = model.Details;

                // add row to db table
                db.SaveChanges();

                if (model.Entry == "performed" && dateChanged)
                {
                    // set next date action should be performed
                    var action = db.Actions.Where(a => a.Id == model.ActionId).FirstOrDefault();
                    var latestPerformance = db.LogEntries.Where(a => a.Entry == "performed").OrderByDescending(a => a.Date).Select(a => a.Date).FirstOrDefault();
                    if (latestPerformance == null || latestPerformance == DateTime.MinValue || latestPerformance <= model.Date)
                    {
                        List<RecurrenceModel> recurrenceRules = new List<RecurrenceModel>();
                        foreach (var rule in action.RecurrenceRules)
                        {
                            recurrenceRules.Add(RecurrenceModel.GetRecurrence(rule.Rule));
                        }

                        action.NextDate = GetNextOccurrence(recurrenceRules, action.Created.Value, model.Date);

                        // persist changes
                        db.SaveChanges();
                    }

                }
            }
        }

        public static Guid DeleteLogEntry(Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                Guid actionId = Guid.Empty;

                // find log entry row in db table
                var row = db.LogEntries.Where(a =>
                        a.Id == id
                    ).First();

                // find action assigned to log entry then
                // save reference to the action id then
                // remove the retire date if unlogged action is a simple todo
                var action = db.Actions.Where(a => a.Id == row.ActionId).First();
                actionId = action.Id;

                // remove the log entry row from db table
                db.LogEntries.Remove(row);

                // persist changes
                db.SaveChanges();

                // re-calculate the next date
                if (row.Entry == "performed")
                {
                    // set next date action should be performed
                    List<RecurrenceModel> recurrenceRules = new List<RecurrenceModel>();
                    foreach (var rule in action.RecurrenceRules)
                    {
                        recurrenceRules.Add(RecurrenceModel.GetRecurrence(rule.Rule));
                    }

                    var latestOccurrenceMinDefault = db.LogEntries.Where(a => a.ActionId == actionId && a.Entry == "performed").OrderByDescending(a => a.Date).Select(a => a.Date).FirstOrDefault();
                    DateTime? latestOccurrence = null;
                    if (latestOccurrenceMinDefault != DateTime.MinValue) {
                        latestOccurrence = latestOccurrenceMinDefault;
                    }
                    action.NextDate = GetNextOccurrence(recurrenceRules, action.Created.Value, latestOccurrence);
                    db.SaveChanges();
                }

                // TODO: UGLY DESIGN: return the action id so we can get new
                return actionId;
            }
        }

        #endregion

        #region Private API
        private static DateTime? GetNextOccurrence(List<RecurrenceModel> recurrenceRules, DateTime firstOccurrence, DateTime? latestOccurrence)
        {
            DateTime? nextDate = null;

            if (recurrenceRules.Count > 0)
            {
                DateTime date = latestOccurrence.HasValue ? latestOccurrence.Value.AddDays(1) : firstOccurrence;
                while (nextDate == null)
                {
                    bool occursToday = false;
                    // figure out the next date this action should be performed
                    foreach (var recur in recurrenceRules)
                    {
                        // process rule
                        bool match = RecurrenceModel.ProcessRecurrence(date, firstOccurrence, recur);
                        if (match == true && (recur.Kind == "RRULE" || recur.Kind == "RDATE"))
                        {
                            // might occur unless an exception overrides it
                            occursToday = true;
                        }
                        else if (match == true && (recur.Kind == "EXRULE" || recur.Kind == "EXDATE"))
                        {
                            // only takes one exception match to rule it out
                            occursToday = false;
                            break;
                        }
                    }

                    if (occursToday)
                    {
                        nextDate = date;
                    }

                    // iterate another day
                    date = date.AddDays(1);
                }
            }

            return nextDate;
        }

        private static ef.Tag GetTag(ef.hoomanlogicEntities db, string userId, string tag)
        {
            string kind = "Tag";
            if (tag.StartsWith("!"))
            {
                kind = "Focus";
                tag = tag.Substring(1);
            }
            else if (tag.StartsWith("@"))
            {
                kind = "Place";
                tag = tag.Substring(1);
            }
            else if (tag.StartsWith(">"))
            {
                kind = "Goal";
                tag = tag.Substring(1);
            }
            else if (tag.StartsWith("$"))
            {
                kind = "Need";
                tag = tag.Substring(1);
            }
            else if (tag.StartsWith("#"))
            {
                kind = "Box";
                tag = tag.Substring(1);
            }
            var tagRow = db.Tags.Where(t => t.UserId == userId && t.Name == tag).FirstOrDefault();
            if (tagRow == null)
            {
                tagRow = new ef.Tag()
                {
                    Id = Guid.NewGuid(),
                    Name = tag,
                    UserId = userId,
                    Path = "/" + tag + "/",
                    Kind = kind,
                    IsFocus = kind == "Focus"
                };
                db.Tags.Add(tagRow);
            }
            return tagRow;
        }

        private static bool IsTagFocus(ef.hoomanlogicEntities db, string userId, string tag)
        {
            if (tag.StartsWith("!")) {
                return true;
            } else if (new string[] { "@", "#", "$", ">" }.Contains(tag[0].ToString()))
            {
                return false;
            }

            var tagRow = db.Tags.Where(t => t.UserId == userId && t.Name == tag).FirstOrDefault();
            if (tagRow == null)
            {
                return false;
            } 
            else {
                return tagRow.Kind == "Focus";
            }
        }

        private static ef.Action RecursiveAdd(ef.hoomanlogicEntities db, Guid? parentId, string userId, Models.ActionModel model)
        {
            DateTime thisMoment = DateTime.UtcNow;

            ef.Action row = new ef.Action();
            row.Id = Guid.NewGuid();
            row.UserId = userId;
            row.Kind = model.Kind;
            row.Name = model.Name;
            row.Duration = model.Duration;
            row.IsPublic = model.IsPublic;
            row.Content = model.Content;
            row.NextDate = model.NextDate;
            row.Created = thisMoment;
            //row.ParentId = parentId;

            // add tags
            bool hasFocus = false;
            if (model.Tags != null)
            {
                foreach (var tag in model.Tags)
                {
                    row.Tags.Add(GetTag(db, userId, tag));
                    if (IsTagFocus(db, userId, tag))
                    {
                        hasFocus = true;
                    }
                }
            }

            // must have at least one focus tag
            if (!hasFocus)
            {
                row.Tags.Add(GetTag(db, userId, "hooman"));
            }

            // add recurrence rules
            if (model.RecurrenceRules != null)
            {
                foreach (var rule in model.RecurrenceRules)
                {
                    row.RecurrenceRules.Add(new ef.RecurrenceRule() { ActionId = row.Id, Rule = rule });
                }
            }

            // add children
            foreach (var child in model.Items)
            {
                //row.Children.Add(RecursiveAdd(db, row.Id, userId, child));
            }

            // add created log entry
            ef.LogEntry rowCreatedLog = new ef.LogEntry();
            rowCreatedLog.Id = Guid.NewGuid();
            rowCreatedLog.ActionId = row.Id;
            rowCreatedLog.Date = thisMoment;
            rowCreatedLog.Entry = "created";
            rowCreatedLog.Duration = null;
            db.LogEntries.Add(rowCreatedLog);

            return row;
        }

        private static void RecursiveUpdate(ef.hoomanlogicEntities db, string userId, Models.ActionModel model)
        {

            ef.Action row = db.Actions.Where(c => c.Id == model.Id).First();
            row.Kind = model.Kind;
            row.Name = model.Name;
            row.Duration = model.Duration;
            row.IsPublic = model.IsPublic;
            row.Content = model.Content;
            row.NextDate = model.NextDate;

            SyncTags(db, userId, model, row);

            SyncRecurrenceRules(db, model, row);

            // sync children
            foreach (var child in model.Items)
            {
                if (child.Id == null)
                {
                    //row.Children.Add(RecursiveAdd(db, row.Id, userId, child));
                }
                else
                {
                    RecursiveUpdate(db, userId, child);
                }
            }
        }

        private static void SyncTags(ef.hoomanlogicEntities db, string userId, ActionModel model, ef.Action row)
        {
            // model string list of tags
            if (model.Tags == null)
            {
                model.Tags = new List<String>();
            }

            // row string list of tags
            List<String> persistedTags = row.Tags.Select(tag => (tag.Kind == "Focus" ? "!" : (tag.Kind == "Place" ? "@" : (tag.Kind == "Need" ? "$" : (tag.Kind == "Goal" ? ">" : (tag.Kind == "Box" ? "#" : ""))))) + tag.Name).ToList();

            // add tags that are in model and are not persisted
            model.Tags.Where(tag => !persistedTags.Contains(tag)).ToList().ForEach(tag =>
               row.Tags.Add(GetTag(db, userId, tag))
            );

            // remove tags that are not in model and are persisted'
            var removeTags = row.Tags.Where(tag => !model.Tags.Contains((tag.Kind == "Focus" ? "!" : (tag.Kind == "Place" ? "@" : (tag.Kind == "Need" ? "$" : (tag.Kind == "Goal" ? ">" : (tag.Kind == "Box" ? "#" : ""))))) + tag.Name)).ToList();
            foreach (var tag in removeTags) {
                row.Tags.Remove(tag);
            }

            // must have at least one focus tag
            bool hasFocus = false;
            foreach (string tag in model.Tags)
            {
                if (IsTagFocus(db, userId, tag))
                {
                    hasFocus = true;
                }
            }
            if (!hasFocus)
            {
                row.Tags.Add(GetTag(db, userId, "hooman"));
            }
            
        }

        private static void SyncRecurrenceRules(ef.hoomanlogicEntities db, ActionModel model, ef.Action row)
        {
            // model string list of tags
            if (model.RecurrenceRules == null)
            {
                model.RecurrenceRules = new List<String>();
            }

            // row string list of tags
            List<String> persistedRules = row.RecurrenceRules.Select(rule => rule.Rule).ToList();

            // add tags that are in model and are not persisted
            model.RecurrenceRules.Where(rule => !persistedRules.Contains(rule)).ToList().ForEach(rule =>
                row.RecurrenceRules.Add(new ef.RecurrenceRule()
                {
                    ActionId = row.Id,
                    Rule = rule
                })
            );

            // remove tags that are not in model and are persisted
            db.RecurrenceRules.RemoveRange(
                row.RecurrenceRules.Where(rule =>
                    !model.RecurrenceRules.Contains(rule.Rule)
                )
            );
        }

        #endregion
    }
}