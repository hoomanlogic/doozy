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
                    PlanStepId = row.ProjectStepId,
                    Ordinal = row.Ordinal,
                    Kind = row.Kind,
                    Name = row.Name,
                    Created = row.Created,
                    Duration = row.Duration,
                    NextDate = row.NextDate,
                    IsPublic = row.IsPublic,
                    Content = row.Content,
                    RecurrenceRules = row.RecurrenceRules.Select(a => a.Rule).ToList(),
                    Tags = row.Tags.Select(tag => tag.TagKind.Symbol + tag.Name).ToList(),
                    LastPerformed = db.LogEntries.Where(a => a.ActionId == row.Id && a.Entry == "performed").OrderByDescending(b => b.Date).Select(c => c.Date).FirstOrDefault()
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
                //               Tags = row.Tags.Select(tag => tag.TagKind.Symbol + tag.Name).ToList(),
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
                               PlanStepId = row.ProjectStepId,
                               Ordinal = row.Ordinal,
                               Kind = row.Kind,
                               Name = row.Name,
                               Created = row.Created,
                               Duration = row.Duration,
                               NextDate = row.NextDate,
                               IsPublic = row.IsPublic,
                               Content = row.Content,
                               RecurrenceRules = row.RecurrenceRules.Select(a => a.Rule).ToList(),
                               Tags = row.Tags.Select(tag => tag.TagKind.Symbol + tag.Name).ToList(),
                               LastPerformed = db.LogEntries.Where(a => a.ActionId == row.Id && a.Entry == "performed").OrderByDescending(b => b.Date).Select(c => c.Date).FirstOrDefault()
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

                // return a fresh model
                return Get(userId, row.Id);
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
                db.Database.ExecuteSqlCommand("exec dbo.archiveAction @p0", id);
            }
        }
        #endregion

        #region Private API
        private static ef.Action RecursiveAdd(ef.hoomanlogicEntities db, Guid? parentId, string userId, Models.ActionModel model)
        {
            DateTime thisMoment = DateTime.UtcNow;

            ef.Action row = new ef.Action();
            row.Id = Guid.NewGuid();
            row.ProjectStepId = model.PlanStepId;
            row.Ordinal = model.Ordinal;
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
                    row.Tags.Add(TagsRepository.GetTag(db, userId, tag));
                    if (TagsRepository.IsTagFocus(db, userId, tag))
                    {
                        hasFocus = true;
                    }
                }
            }

            // must have at least one focus tag
            if (!hasFocus)
            {
                row.Tags.Add(TagsRepository.GetTag(db, userId, "hooman"));
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
            //foreach (var child in model.Items)
            //{
            //    row.Children.Add(RecursiveAdd(db, row.Id, userId, child));
            //}

            // add created log entry
            //ef.LogEntry rowCreatedLog = new ef.LogEntry();
            //rowCreatedLog.Id = Guid.NewGuid();
            //rowCreatedLog.UserId = userId;
            //rowCreatedLog.ActionId = row.Id;
            //rowCreatedLog.Date = thisMoment;
            //rowCreatedLog.Entry = "created";
            //rowCreatedLog.Duration = null;
            //db.LogEntries.Add(rowCreatedLog);

            return row;
        }

        private static void RecursiveUpdate(ef.hoomanlogicEntities db, string userId, Models.ActionModel model)
        {

            ef.Action row = db.Actions.Where(c => c.Id == model.Id).First();
            row.ProjectStepId = model.PlanStepId;
            row.Ordinal = model.Ordinal;
            row.Kind = model.Kind;
            row.Name = model.Name;
            row.Duration = model.Duration;
            row.IsPublic = model.IsPublic;
            row.Content = model.Content;
            row.NextDate = model.NextDate;

            SyncTags(db, userId, model, row);

            SyncRecurrenceRules(db, model, row);

            // sync children
            if (model.Items != null) { 
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
        }

        private static void SyncTags(ef.hoomanlogicEntities db, string userId, ActionModel model, ef.Action row)
        {
            // model string list of tags
            if (model.Tags == null)
            {
                model.Tags = new List<String>();
            }

            // row string list of tags
            List<String> persistedTags = row.Tags.Select(tag => tag.TagKind.Symbol + tag.Name).ToList();

            // add tags that are in model and are not persisted
            model.Tags.Where(tag => !persistedTags.Contains(tag)).ToList().ForEach(tag =>
               row.Tags.Add(TagsRepository.GetTag(db, userId, tag))
            );

            // remove tags that are not in model and are persisted'
            var removeTags = row.Tags.Where(tag => !model.Tags.Contains(tag.TagKind.Symbol + tag.Name)).ToList();
            foreach (var tag in removeTags) {
                row.Tags.Remove(tag);
            }

            // must have at least one focus tag
            bool hasFocus = false;
            foreach (string tag in model.Tags)
            {
                if (TagsRepository.IsTagFocus(db, userId, tag))
                {
                    hasFocus = true;
                }
            }
            if (!hasFocus)
            {
                row.Tags.Add(TagsRepository.GetTag(db, userId, "hooman"));
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