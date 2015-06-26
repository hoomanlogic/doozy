using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class TagsRepository
    {
        #region Public API

        public static List<TagModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var models = db.Tags.Where(c => c.UserId == userId).Select(row => new TagModel()
                {
                    Id = row.Id,
                    Name = row.Name,
                    Kind = row.Kind,
                    Path = row.Path,
                    Content = row.Content
                }).ToList();

                return models;
            }
        }

        public static TagModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var model = db.Tags.Where(c => c.Id == id).Select(row => new TagModel()
                {
                    Id = row.Id,
                    Name = row.Name,
                    Kind = row.Kind,
                    Path = row.Path,
                    Content = row.Content

                }).FirstOrDefault();

                return model;
            }
        }

        public static TagModel Get(string userId, string name)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var model = db.Tags.Where(c => c.UserId == userId && c.Name == name).Select(row => new TagModel()
                {
                    Id = row.Id,
                    Name = row.Name,
                    Kind = row.Kind,
                    Path = row.Path,
                    Content = row.Content
                }).FirstOrDefault();

                return model;
            }
        }

        public static Guid Add(string userId, Models.TagModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.Tag row = new ef.Tag()
                {
                    UserId = userId,
                    Id = Guid.NewGuid(),
                    Name = model.Name,
                    Kind = model.Kind,
                    Path = model.Path,
                    Content = model.Content
                };
                db.Tags.Add(row);
                db.SaveChanges();
                return row.Id;
            }
        }

        public static TagModel Update(string userId, TagModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                ef.Tag row = db.Tags.Where(r => r.Id == model.Id).First();

                row.Name = model.Name;
                row.Kind = model.Kind;
                row.Path = model.Path;
                row.Content = model.Content;

                // persist changes
                db.SaveChanges();

                // return a fresh model (might change this to void since server doesn't modify data in any way)
                return Get(userId, model.Id);
            }
        }

        public static void Delete(Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                db.Tags.Remove(
                    db.Tags.Where(a =>a.Id == id).First()
                );

                db.SaveChanges();
            }
        }

        public static ef.Tag GetTag(ef.hoomanlogicEntities db, string userId, string tag)
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

        public static bool IsTagFocus(ef.hoomanlogicEntities db, string userId, string tag)
        {
            if (tag.StartsWith("!"))
            {
                return true;
            }
            else if (new string[] { "@", "#", "$", ">" }.Contains(tag[0].ToString()))
            {
                return false;
            }

            var tagRow = db.Tags.Where(t => t.UserId == userId && t.Name == tag).FirstOrDefault();
            if (tagRow == null)
            {
                return false;
            }
            else
            {
                return tagRow.Kind == "Focus";
            }
        }

        #endregion
    }
}