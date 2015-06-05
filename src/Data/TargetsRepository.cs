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
                    Name = row.Name,
                    EntityType = row.EntityType,
                    EntityId = row.EntityId.Value,
                    Measure = row.Measure,
                    Number = row.Number,
                    Created = row.Created,
                    Retire = row.Retire,
                    Starts = row.Starts,
                    Period = row.Period,
                    Multiplier = row.Multiplier,
                    RetireWhenMet = row.RetireWhenMet
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
                    Name = row.Name,
                    EntityType = row.EntityType,
                    EntityId = row.EntityId.Value,
                    Measure = row.Measure,
                    Number = row.Number,
                    Created = row.Created,
                    Retire = row.Retire,
                    Starts = row.Starts,
                    Period = row.Period,
                    Multiplier = row.Multiplier,
                    RetireWhenMet = row.RetireWhenMet
                }).FirstOrDefault();

                return model;
            }
        }

        public static dynamic Add(string userId, Models.TargetModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.Target row = new ef.Target()
                {
                    UserId = userId,
                    Id = Guid.NewGuid(),
                    Name = model.Name,
                    EntityType = model.EntityType,
                    EntityId = model.EntityId,
                    Measure = model.Measure,
                    Number = model.Number,
                    Created = model.Created,
                    Retire = model.Retire,
                    Starts = model.Starts,
                    Period = model.Period,
                    Multiplier = model.Multiplier,
                    RetireWhenMet = model.RetireWhenMet
                };

                db.Targets.Add(row);
                db.SaveChanges();

                model.Id = row.Id;

                return new { Id = row.Id};
            }
        }

        public static TargetModel Update(string userId, TargetModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                ef.Target row = db.Targets.Where(r => r.Id == model.Id).First();
                row.Name = model.Name;
                row.EntityType = model.EntityType;
                row.EntityId = model.EntityId;
                row.Measure = model.Measure;
                row.Number = model.Number;
                row.Created = model.Created;
                row.Retire = model.Retire;
                row.Starts = model.Starts;
                row.Period = model.Period;
                row.Multiplier = model.Multiplier;
                row.RetireWhenMet = model.RetireWhenMet;

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