using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class LogEntriesRepository
    {
        #region Public API

        public static LogEntryModel Get(string userId, Guid logEntryId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var model = db.LogEntries.Where(c => c.UserId == userId && c.Id == logEntryId).Select(row => new LogEntryModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    UserId = row.UserId,
                    UserName = row.AspNetUser.UserName,
                    KnownAs = row.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs,
                    ProfileUri = row.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri,
                    Date = row.Date,
                    ActionId = row.ActionId,
                    ActionName = row.Action == null ? "" : row.Action.Name,
                    Details = row.Details,
                    Duration = row.Duration,
                    Entry = row.Entry,
                    Tags = row.Tags.Select(tag => tag.TagKind.Symbol + tag.Name).ToList(),
                    Upvotes = row.LogEntryPeanuts.Where(a => a.Kind == "Upvote").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Comments = row.LogEntryPeanuts.Where(a => a.Kind == "Comment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Attachments = row.LogEntryPeanuts.Where(a => a.Kind == "Attachment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList()
                }).FirstOrDefault();

                return model;
            }
        }

        public static List<LogEntryModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var models = db.LogEntries.Where(c => c.UserId == userId && c.Action.IsPublic).Select(row => new LogEntryModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    UserId = row.UserId,
                    UserName = row.AspNetUser.UserName,
                    KnownAs = row.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs,
                    ProfileUri = row.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, 
                    Date = row.Date,
                    ActionId = row.ActionId,
                    ActionName = row.Action == null ? "" : row.Action.Name,
                    Details = row.Details,
                    Duration = row.Duration,
                    Entry = row.Entry,
                    Tags = row.Tags.Select(tag => tag.TagKind.Symbol + tag.Name).ToList(),
                    Upvotes = row.LogEntryPeanuts.Where(a => a.Kind == "Upvote").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Comments = row.LogEntryPeanuts.Where(a => a.Kind == "Comment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Attachments = row.LogEntryPeanuts.Where(a => a.Kind == "Attachment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList()
                }).ToList();

                return models;
            }
        }

        public static List<LogEntryModel> Get(string userId, bool isMine)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var models = db.LogEntries.Where(c => c.UserId == userId && ((c.Action != null && c.Action.IsPublic) || isMine)).Select(row => new LogEntryModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    UserId = row.UserId,
                    UserName = row.AspNetUser.UserName,
                    KnownAs = row.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs,
                    ProfileUri = row.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri,
                    Date = row.Date,
                    ActionId = row.ActionId,
                    ActionName = row.Action == null ? "" : row.Action.Name,
                    Details = row.Details,
                    Duration = row.Duration,
                    Entry = row.Entry,
                    Tags = row.Tags.Select(tag => tag.TagKind.Symbol + tag.Name).ToList(),
                    Upvotes = row.LogEntryPeanuts.Where(a => a.Kind == "Upvote").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Comments = row.LogEntryPeanuts.Where(a => a.Kind == "Comment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Attachments = row.LogEntryPeanuts.Where(a => a.Kind == "Attachment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList()
                }).ToList();

                return models;
            }
        }
        public class LogEntryChanges
        {
            public Guid Id { get; set; }
            public DateTime? NextDate { get; set; }
        }

        public static LogEntryChanges Add(string userId, LogEntryModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // create log entry row
                ef.LogEntry row = new ef.LogEntry();
                row.Id = Guid.NewGuid();
                row.UserId = userId;
                row.ActionId = model.ActionId;
                row.Date = model.Date;
                row.Entry = model.Entry;
                row.Duration = model.Duration;
                row.Details = model.Details;

                // add row to db table
                db.LogEntries.Add(row);
                db.SaveChanges();

                // add tags
                if (model.Tags != null)
                {
                    foreach (var tag in model.Tags)
                    {
                        row.Tags.Add(TagsRepository.GetTag(db, userId, tag));
                    }
                }
                db.SaveChanges();

                if (model.ActionId.HasValue && new string[] { "performed", "skipped" }.Contains(model.Entry))
                {

                    var action = db.Actions.Where(a => a.Id == model.ActionId).FirstOrDefault();

                    // Box > Queue: process queue item and decrement next items in the queue
                    var boxTags = action.Tags.Where(a => a.Kind == "Box").Select(a => a.Name).ToList();
                    if (model.Entry == "performed" && boxTags.Count > 0 && action.Ordinal != null)
                    {
                        // subtract 1 from the ordinal for any 
                        var actions = db.Actions.Where(a => a.Tags.Select(c => c.Name).Intersect(boxTags).Count() > 0 && a.Ordinal != null && a.Ordinal > action.Ordinal.Value);
                        foreach (var a in actions)
                        {
                            a.Ordinal -= 1;
                        }
                        action.Ordinal = null;
                    }

                    // set next date action should be performed
                    var latestPerformance = db.LogEntries.Where(a => a.Entry == "performed" || a.Entry == "skipped").OrderByDescending(a => a.Date).Select(a => a.Date).FirstOrDefault();
                    if (latestPerformance == null || latestPerformance == DateTime.MinValue || latestPerformance <= model.Date)
                    {
                        List<RecurrenceModel> recurrenceRules = new List<RecurrenceModel>();
                        foreach (var rule in action.RecurrenceRules)
                        {
                            recurrenceRules.Add(RecurrenceModel.GetRecurrence(rule.Rule));
                        }

                        action.NextDate = Utility.GetNextOccurrence(recurrenceRules, action.Created.Value, model.Date);
                        
                        // persist changes
                        db.SaveChanges();

                        return new LogEntryChanges() { Id = row.Id, NextDate = action.NextDate.HasValue ? action.NextDate : DateTime.MinValue };
                    }
                }

                return new LogEntryChanges() { Id = row.Id, NextDate = null };
            }
        }

        public static LogEntryChanges Update(string userId, LogEntryModel model)
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

                if (model.ActionId.HasValue && model.ActionId.Value != Guid.Empty)
                {
                    var action = db.Actions.Where(a => a.Id == model.ActionId).FirstOrDefault();
                    if (action != null)
                    {
                        var tags = action.Tags.Select(tag => tag.TagKind.Symbol + tag.Name).ToList();
                        if (model.Tags == null)
                        {
                            model.Tags = tags;
                        }
                        else
                        {
                            model.Tags = model.Tags.Concat(tags).Distinct().ToList();
                        }
                    }
                }

                SyncTags(db, userId, model, row);
                db.SaveChanges();

                if (model.ActionId.HasValue && model.ActionId.Value != Guid.Empty && new string[] { "performed", "skipped" }.Contains(model.Entry) && dateChanged)
                {
                    // set next date action should be performed
                    var action = db.Actions.Where(a => a.Id == model.ActionId).FirstOrDefault();
                    var latestPerformance = db.LogEntries.Where(a => a.Entry == "performed" || a.Entry == "skipped").OrderByDescending(a => a.Date).Select(a => a.Date).FirstOrDefault();
                    if (latestPerformance == null || latestPerformance == DateTime.MinValue || latestPerformance <= model.Date)
                    {
                        List<RecurrenceModel> recurrenceRules = new List<RecurrenceModel>();
                        foreach (var rule in action.RecurrenceRules)
                        {
                            recurrenceRules.Add(RecurrenceModel.GetRecurrence(rule.Rule));
                        }

                        action.NextDate = Utility.GetNextOccurrence(recurrenceRules, action.Created.Value, model.Date);

                        // persist changes
                        db.SaveChanges();

                        return new LogEntryChanges() { Id = model.Id, NextDate = action.NextDate };
                    }

                }

                return new LogEntryChanges() { Id = model.Id, NextDate = null };
            }
        }

        private static void SyncTags(ef.hoomanlogicEntities db, string userId, LogEntryModel model, ef.LogEntry row)
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
            foreach (var tag in removeTags)
            {
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

        public static LogEntryChanges Delete(Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                

                // find log entry row in db table
                var row = db.LogEntries.Where(a =>
                        a.Id == id
                    ).First();


                // find action assigned to log entry then
                // save reference to the action id then
                // remove the retire date if unlogged action is a simple todo
                var action = db.Actions.Where(a => a.Id == row.ActionId).FirstOrDefault();

                //DELETE FROM [dbo].[LogEntries] WHERE Id = @p0;

                db.Database.ExecuteSqlCommand("DELETE FROM [dbo].[LogEntriesTags] WHERE LogEntryId = @p0;", new object[] { id });

                // remove the log entry row from db table
                db.LogEntries.Remove(row);

                // persist changes
                db.SaveChanges();

                // re-calculate the next date for action
                if (action != null && new string[] { "performed", "skipped" }.Contains(row.Entry))
                {

                    Guid actionId = Guid.Empty;
                    actionId = action.Id;

                    // set next date action should be performed
                    List<RecurrenceModel> recurrenceRules = new List<RecurrenceModel>();
                    foreach (var rule in action.RecurrenceRules)
                    {
                        recurrenceRules.Add(RecurrenceModel.GetRecurrence(rule.Rule));
                    }

                    var latestOccurrenceMinDefault = db.LogEntries.Where(a => a.ActionId == actionId && (a.Entry == "performed" || a.Entry == "skipped")).OrderByDescending(a => a.Date).Select(a => a.Date).FirstOrDefault();
                    DateTime? latestOccurrence = null;
                    if (latestOccurrenceMinDefault != DateTime.MinValue)
                    {
                        latestOccurrence = latestOccurrenceMinDefault;
                    }
                    action.NextDate = Utility.GetNextOccurrence(recurrenceRules, action.Created.Value, latestOccurrence);
                    db.SaveChanges();

                    return new LogEntryChanges() { Id = id, NextDate = action.NextDate };
                }

                return new LogEntryChanges() { Id = id, NextDate = null };
            }
        }

        public static LogEntryPeanut ToggleUpvote(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                LogEntryPeanut peanut = null;
                var row = db.LogEntryPeanuts.Where(c => c.LogEntryId == id && c.UserId == userId && c.Kind == "Upvote").FirstOrDefault();
                if (row == null)
                {
                    peanut = new LogEntryPeanut()
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Date = DateTime.UtcNow
                    };

                    db.LogEntryPeanuts.Add(new ef.LogEntryPeanut()
                    {
                        Id = peanut.Id,
                        UserId = peanut.UserId,
                        LogEntryId = id,
                        Kind = "Upvote",
                        Date = peanut.Date
                    });
                } else {
                    db.LogEntryPeanuts.Remove(row);
                }
                db.SaveChanges();
                return peanut;
           }
        }

        public static LogEntryPeanut AddComment(string userId, Guid id, string comment)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {

                LogEntryPeanut peanut = new LogEntryPeanut()
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Date = DateTime.UtcNow,
                    Comment = comment
                };

                db.LogEntryPeanuts.Add(new ef.LogEntryPeanut()
                {
                    LogEntryId = id,
                    Id = peanut.Id,
                    UserId = peanut.UserId,
                    Kind = "Comment",
                    Date = peanut.Date,
                    Comment = peanut.Comment
                });
                db.SaveChanges();

                var persona = db.Personas.Where(a => a.UserId == userId && a.Kind == "Public").First();
                peanut.KnownAs = persona.KnownAs;
                peanut.ProfileUri = persona.ProfileUri;

                return peanut;
            }
        }

        public static void UpdateComment(string userId, Guid id, string comment)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {

                var row = db.LogEntryPeanuts.Where(a => a.Id == id).First();
                row.Comment = comment;

                db.SaveChanges();
            }
        }

        public static void DeleteComment(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var row = db.LogEntryPeanuts.Where(c => c.Id == id && c.UserId == userId).FirstOrDefault();
                if (row != null)
                {
                    db.LogEntryPeanuts.Remove(row);
                }
                db.SaveChanges();
            }
        }
        #endregion
    }
}