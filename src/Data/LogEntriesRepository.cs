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