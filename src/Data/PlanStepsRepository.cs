using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class PlanStepsRepository
    {
        #region Public API
        public static List<PlanStepModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                List<PlanStepModel> models = db.PlanSteps.Where(c => c.UserId == userId).Select(row => new Models.PlanStepModel()
                {
                    Id = row.Id,
                    PlanId = row.ProjectId,
                    ParentId = row.ParentId,
                    Kind = row.Kind,
                    Name = row.Name,
                    Created = row.Created,
                    Duration = row.Duration,
                    TagName = row.TagName,
                    Ordinal = row.Ordinal,
                    Content = row.Content,
                    Status = row.Status
                }).ToList();

                return models;
            }
        }

        public static PlanStepModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                PlanStepModel model = db.PlanSteps.Where(c => c.Id == id).Select(row => new Models.PlanStepModel()
                {
                    Id = row.Id,
                    PlanId = row.ProjectId,
                    ParentId = row.ParentId,
                    Kind = row.Kind,
                    Name = row.Name,
                    Created = row.Created,
                    Duration = row.Duration,
                    TagName = row.TagName,
                    Ordinal = row.Ordinal,
                    Content = row.Content,
                    Status = row.Status
                }).FirstOrDefault();

                return model;
            }
        }

        public static dynamic Add(string userId, PlanStepModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.PlanStep row = new ef.PlanStep();
                row.Id = Guid.NewGuid();
                row.ProjectId = model.PlanId;
                row.ParentId = model.ParentId;
                row.UserId = userId;

                row.Kind = model.Kind;
                row.Name = model.Name;
                row.Created = model.Created;
                row.Status = model.Status;
                row.TagName = model.TagName;
                row.Duration = model.Duration;
                row.Ordinal = model.Ordinal;
                row.Content = model.Content;
                db.PlanSteps.Add(row);
                db.SaveChanges();
                model.Id = row.Id;

                //if (model.Kind == "Action")
                //{
                //    ef.Action actionRow = new ef.Action();
                //    actionRow.Id = row.Id;
                //    actionRow.ProjectStepId = row.Id;
                //    actionRow.UserId = userId;
                //    actionRow.Kind = "Action";
                //    actionRow.Name = model.Name;
                //    actionRow.Ordinal = model.Ordinal;
                //    actionRow.Duration = model.Duration;
                //    actionRow.Content = model.Content;
                //    actionRow.Created = model.Created;
                //    db.Actions.Add(actionRow);
                //    db.SaveChanges();
                //}

                return new { Id = row.Id, Name = row.Name };
            }
        }

        public static dynamic Update(string userId, PlanStepModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                ef.PlanStep row = (from a in db.PlanSteps
                                     where a.Id == model.Id
                                     select a).First();

                if (row != null)
                {
                    //row.ProjectId = model.ProjectId;
                    //row.ParentId = model.ParentId;
                    row.Kind = model.Kind;
                    row.Name = model.Name;
                    row.Created = model.Created;
                    row.Status = model.Status;
                    row.TagName = model.TagName;
                    row.Duration = model.Duration;
                    row.Ordinal = model.Ordinal;
                    row.Content = model.Content;

                    // persist changes
                    db.SaveChanges();
                }
                
            }

            // return a fresh model since some children may have a new id
            return Get(userId, model.Id);
        }

        public static void Delete(Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var row = db.PlanSteps.Where(a =>
                        a.Id == id
                    ).First();

                db.PlanSteps.Remove(
                    row
                );

                db.SaveChanges();
            }
        }
        #endregion
    }
}