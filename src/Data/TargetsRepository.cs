using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class TargetsRepository
    {
        #region Public API

        public static List<TargetModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var models = db.Targets.Where(c => c.UserId == userId).Select(row => new TargetModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    TagName = row.Tag.Name,
                    Kind = row.Kind,
                    Goal = row.Goal,
                    Timeline = row.Timeline,
                    Enlist = row.Enlist,
                    Retire = row.Retire
                }).ToList();

                return models;
            }
        }

        public static TargetModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var model = db.Targets.Where(c => c.Id == id).Select(row => new TargetModel()
                {
                    Id = row.Id,
                    Ref = row.Id.ToString(),
                    TagName = row.Tag.Name,
                    Kind = row.Kind,
                    Goal = row.Goal,
                    Timeline = row.Timeline,
                    Enlist = row.Enlist,
                    Retire = row.Retire
                }).FirstOrDefault();

                return model;
            }
        }

        public static dynamic Add(string userId, Models.TargetModel model)
        {
            Guid tagId = TagsRepository.Get(userId, model.TagName).Id;

            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.Target row = new ef.Target()
                {
                    UserId = userId,
                    Id = Guid.NewGuid(),
                    TagId = tagId,
                    Kind = model.Kind,
                    Goal = model.Goal,
                    Timeline = model.Timeline,
                    Enlist = model.Enlist,
                    Retire = model.Retire
                };

                db.Targets.Add(row);
                db.SaveChanges();

                model.Id = row.Id;

                return new { Ref = model.Ref, Id = row.Id};
            }
        }

        public static TargetModel Update(string userId, TargetModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                ef.Target row = db.Targets.Where(r => r.Id == model.Id).First();

                row.TagId = db.Tags.Where(r => r.UserId == userId && r.Name == model.TagName).First().Id;
                row.Kind = model.Kind;
                row.Goal = model.Goal;
                row.Timeline = model.Timeline;
                row.Enlist = model.Enlist;
                row.Retire = model.Retire;

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
                db.Targets.Remove(
                    db.Targets.Where(a =>a.Id == id).First()
                );

                db.SaveChanges();
            }
        }

        #endregion
    }
}