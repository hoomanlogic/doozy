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

        public static ProjectStepModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ProjectStepModel model = db.ProjectSteps.Where(c => c.Id == id).Select(row => new Models.ProjectStepModel()
                {
                    Id = row.Id,
                    ProjectId = row.ProjectId,
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

        public static dynamic Add(string userId, ProjectStepModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.ProjectStep row = new ef.ProjectStep();
                row.Id = Guid.NewGuid();
                row.ProjectId = model.ProjectId;
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
                ef.ProjectStep row = (from a in db.ProjectSteps
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