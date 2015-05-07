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

        public static List<LogEntryModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var models = db.LogEntries.Where(c => c.Action.UserId == userId && c.Action.IsPublic).Select(row => new LogEntryModel()
                {
                    Id = row.Id,
                    Date = row.Date,
                    ActionId = row.ActionId,
                    ActionName = row.Action.Name,
                    Details = row.Details,
                    Duration = row.Duration,
                    Entry = row.Entry,
                    Upvotes = row.LogEntryPeanuts.Where(a => a.Kind == "Upvote").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, UserName = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Comments = row.LogEntryPeanuts.Where(a => a.Kind == "Comment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, UserName = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList(),
                    Attachments = row.LogEntryPeanuts.Where(a => a.Kind == "Attachment").Select(a => new LogEntryPeanut() { Id = a.Id, UserId = a.UserId, Date = a.Date, Comment = a.Comment, AttachmentUri = a.AttachmentUri, ProfileUri = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().ProfileUri, UserName = a.AspNetUser.Personas.Where(b => b.Kind == "Public").FirstOrDefault().KnownAs }).ToList()
                }).ToList();

                return models;
            }
        }

        public static LogEntryModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var model = db.LogEntries.Where(c => c.Id == id).Select(row => new LogEntryModel()
                {
                    Id = row.Id,
                    Date = row.Date,
                    ActionId = row.ActionId,
                    ActionName = row.Action.Name,
                    Details = row.Details,
                    Duration = row.Duration,
                    Entry = row.Entry

                }).FirstOrDefault();

                return model;
            }
        }

        public static bool ToggleUpvote(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                bool added = false;
                var row = db.LogEntryPeanuts.Where(c => c.LogEntryId == id && c.UserId == userId && c.Kind == "Upvote").FirstOrDefault();
                if (row == null)
                {
                    db.LogEntryPeanuts.Add(new ef.LogEntryPeanut()
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        LogEntryId = id,
                        Kind = "Upvote",
                        Date = DateTime.UtcNow
                    });
                    added = true;
                } else {
                    db.LogEntryPeanuts.Remove(row);
                }
                db.SaveChanges();
                return added;
           }
        }

        public static void AddComment(string userId, Guid id, string comment)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                db.LogEntryPeanuts.Add(new ef.LogEntryPeanut()
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    LogEntryId = id,
                    Kind = "Comment",
                    Date = DateTime.UtcNow,
                    Comment = comment
                });
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