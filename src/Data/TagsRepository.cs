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
                    IsFocus = row.IsFocus || row.Kind == "Focus"
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
                    IsFocus = row.IsFocus || row.Kind == "Focus"

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
                    IsFocus = row.IsFocus || row.Kind == "Focus"
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
                    IsFocus = model.IsFocus || model.Kind == "Focus"
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
                row.IsFocus = model.IsFocus || model.Kind == "Focus";

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

        #endregion
    }
}