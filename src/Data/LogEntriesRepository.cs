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
                var model = db.LogEntries.Where(c => c.Action.UserId == userId && c.Id == logEntryId).Select(row => new LogEntryModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    UserId = row.Action.UserId,
                    UserName = row.Action.AspNetUser.UserName,
                    KnownAs = row.Action.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs,
                    ProfileUri = row.Action.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri,
                    Date = row.Date,
                    ActionId = row.ActionId,
                    ActionName = row.Action.Name,
                    Details = row.Details,
                    Duration = row.Duration,
                    Entry = row.Entry,
                    Upvotes = row.LogEntryPeanuts.Where(a => a.Kind == "Upvote").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Comments = row.LogEntryPeanuts.Where(a => a.Kind == "Comment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Attachments = row.LogEntryPeanuts.Where(a => a.Kind == "Attachment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, KnownAs = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList()
                }).FirstOrDefault();

                return model;
            }
        }

        //public static LogEntryModel Get(string userId, Guid id)
        //{
        //    using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
        //    {
        //        var model = db.LogEntries.Where(c => c.Id == id).Select(row => new LogEntryModel()
        //        {
        //            Id = row.Id,
        //            Date = row.Date,
        //            ActionId = row.ActionId,
        //            ActionName = row.Action.Name,
        //            Details = row.Details,
        //            Duration = row.Duration,
        //            Entry = row.Entry

        //        }).FirstOrDefault();

        //        return model;
        //    }
        //}


        public static List<LogEntryModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var models = db.LogEntries.Where(c => c.Action.UserId == userId && c.Action.IsPublic).Select(row => new LogEntryModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    UserId = row.Action.UserId,
                    UserName = row.Action.AspNetUser.UserName,
                    KnownAs = row.Action.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs,
                    ProfileUri = row.Action.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, 
                    Date = row.Date,
                    ActionId = row.ActionId,
                    ActionName = row.Action.Name,
                    Details = row.Details,
                    Duration = row.Duration,
                    Entry = row.Entry,
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
                var models = db.LogEntries.Where(c => c.Action.UserId == userId && (c.Action.IsPublic || isMine)).Select(row => new LogEntryModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    UserId = row.Action.UserId,
                    UserName = row.Action.AspNetUser.UserName,
                    KnownAs = row.Action.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs,
                    ProfileUri = row.Action.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri,
                    Date = row.Date,
                    ActionId = row.ActionId,
                    ActionName = row.Action.Name,
                    Details = row.Details,
                    Duration = row.Duration,
                    Entry = row.Entry,
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

        public static LogEntryChanges Add(LogEntryModel model)
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

                        action.NextDate = Utility.GetNextOccurrence(recurrenceRules, action.Created.Value, model.Date);

                        // persist changes
                        db.SaveChanges();

                        return new LogEntryChanges() { Id = row.Id, NextDate = action.NextDate.HasValue ? action.NextDate : DateTime.MinValue };
                    }
                }

                return new LogEntryChanges() { Id = row.Id, NextDate = null };
            }
        }

        public static LogEntryChanges Update(LogEntryModel model)
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

                        action.NextDate = Utility.GetNextOccurrence(recurrenceRules, action.Created.Value, model.Date);

                        // persist changes
                        db.SaveChanges();

                        return new LogEntryChanges() { Id = model.Id, NextDate = action.NextDate };
                    }

                }

                return new LogEntryChanges() { Id = model.Id, NextDate = null };
            }
        }

        public static LogEntryChanges Delete(Guid id)
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