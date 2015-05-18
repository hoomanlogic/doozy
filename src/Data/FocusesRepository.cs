using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class FocusesRepository
    {
        #region Public API
        public static List<FocusModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                List<FocusModel> models = db.Focuses.Where(c => c.UserId == userId).Select(row => new Models.FocusModel()
                {
                    Id = row.Id,
                    Kind = row.Kind,
                    Name = row.Name,
                    TagName = row.TagName,
                    Enlist = row.Enlist,
                    Retire = row.Retire,
                    IconUri = row.IconUri
                }).ToList();

                foreach (var model in models)
                {
                    var tag = db.Tags.Where(a => a.UserId == userId && a.Name == model.TagName).FirstOrDefault();
                    if (tag != null && tag.Actions.Count() > 0)
                    {
                        var actionIds = tag.Actions.Select(a => a.Id).ToList();
                        model.LatestEntry = db.LogEntries.Where(a => a.Entry == "performed" && actionIds.Contains(a.ActionId)).OrderByDescending(b => b.Date).Select(c => new Models.LogEntryModel() { Id = c.Id, ActionId = c.ActionId, Date = c.Date, Entry = c.Entry, Duration = c.Duration }).FirstOrDefault();
                    }
                }

                return models;
            }
        }

        public static FocusModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                FocusModel model = db.Focuses.Where(c => c.Id == id).Select(row => new Models.FocusModel()
                {
                    Id = row.Id,
                    Kind = row.Kind,
                    Name = row.Name,
                    TagName = row.TagName,
                    Enlist = row.Enlist,
                    Retire = row.Retire,
                    IconUri = row.IconUri
                }).FirstOrDefault();

                return model;
            }
        }

        public static dynamic Add(string userId, FocusModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.Focus row = new ef.Focus();
                row.Id = Guid.NewGuid();
                row.UserId = userId;
                row.Kind = model.Kind;
                row.Name = model.Name;
                row.TagName = model.TagName;
                row.Enlist = model.Enlist;
                row.Retire = model.Retire;
                row.IconUri = model.IconUri;
                db.Focuses.Add(row);
                db.SaveChanges();
                model.Id = row.Id;

                // add the tag
                TagModel focusTag = new TagModel();
                focusTag.Id = Guid.NewGuid();
                focusTag.IsFocus = true;
                focusTag.Kind = "Focus";
                focusTag.Name = model.TagName;
                focusTag.Parent = null;
                focusTag.Path = "/" + model.TagName + "/";

                TagsRepository.Add(userId, focusTag);

                return new { Id = row.Id, Name = row.Name };
            }
        }

        public static dynamic Update(string userId, FocusModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                ef.Focus row = db.Focuses.Where(a =>
                        a.Id == model.Id
                    ).First();

                // update the tag
                if (row.TagName != model.TagName) {
                    ef.Tag focusTag = db.Tags.Where(a => a.UserId == userId && a.Name == row.TagName).FirstOrDefault();
                    if (focusTag != null)
                    {
                        focusTag.Name = model.TagName;
                    }
                }

                row.Kind = model.Kind;
                row.Name = model.Name;
                row.TagName = model.TagName;
                row.Enlist = model.Enlist;
                row.Retire = model.Retire;
                row.IconUri = model.IconUri;

                // persist changes
                db.SaveChanges();

                // return a fresh model since some children may have a new id
                return Get(userId, model.Id);
            }
        }

        public static void Delete(Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var row = db.Focuses.Where(a =>
                        a.Id == id
                    ).First();

                db.Focuses.Remove(
                    row
                );

                db.SaveChanges();
            }
        }

        public static void UpdateFocusUri(string userId, string focusId, string uri)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                Guid focusGuid = Guid.Parse(focusId);
                // sync this model along with all children and related 
                ef.Focus row = db.Focuses.Where(r => r.UserId == userId && r.Id == focusGuid).First();

                row.IconUri = uri;

                // persist changes
                db.SaveChanges();
            }
        }
        #endregion
    }
}