using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class ProjectStepsRepository
    {
        #region Public API
        public static List<ProjectStepModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                List<ProjectStepModel> models = db.ProjectSteps.Where(c => c.UserId == userId).Select(row => new Models.ProjectStepModel()
                {
                    Id = row.Id,
                    ProjectId = row.ProjectId,
                    Kind = row.Kind,
                    Name = row.Name,
                    Duration = row.Duration,
                    TagName = row.TagName,
                    Level = row.Level,
                    Parent = row.Parent,
                    Ordinal = row.Ordinal
                }).ToList();

                return models;
            }
        }

        public static ProjectStepModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ProjectStepModel model = db.ProjectSteps.Where(c => c.Id == id).Select(row => new Models.ProjectStepModel()
                {
                    Id = row.Id,
                    ProjectId = row.ProjectId,
                    Kind = row.Kind,
                    Name = row.Name,
                    Duration = row.Duration,
                    TagName = row.TagName,
                    Level = row.Level,
                    Parent = row.Parent,
                    Ordinal = row.Ordinal
                }).FirstOrDefault();

                return model;
            }
        }

        public static dynamic Add(string userId, ProjectStepModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.ProjectStep row = new ef.ProjectStep();
                row.Id = Guid.NewGuid();
                row.ProjectId = model.ProjectId;
                row.UserId = userId;
                row.Kind = model.Kind;
                row.Name = model.Name;
                row.TagName = model.TagName;
                row.Duration = model.Duration;
                row.Level = model.Level;
                row.Parent = model.Parent;
                row.Ordinal = model.Ordinal;
                db.ProjectSteps.Add(row);
                db.SaveChanges();
                model.Id = row.Id;

                return new { Id = row.Id, Name = row.Name };
            }
        }

        public static dynamic Update(string userId, ProjectStepModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                ef.ProjectStep row = db.ProjectSteps.Where(a =>
                        a.Id == model.Id
                    ).First();

                row.ProjectId = model.ProjectId;
                row.Kind = model.Kind;
                row.Name = model.Name;
                row.TagName = model.TagName;
                row.Duration = model.Duration;
                row.Level = model.Level;
                row.Parent = model.Parent;
                row.Ordinal = model.Ordinal;

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
                var row = db.ProjectSteps.Where(a =>
                        a.Id == id
                    ).First();

                db.ProjectSteps.Remove(
                    row
                );

                db.SaveChanges();
            }
        }
        #endregion
    }
}