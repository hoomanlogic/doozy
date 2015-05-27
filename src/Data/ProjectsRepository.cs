using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class ProjectsRepository
    {
        #region Public API
        public static List<ProjectModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                List<ProjectModel> models = db.Projects.Where(c => c.UserId == userId).Select(row => new Models.ProjectModel()
                {
                    Id = row.Id,
                    FocusId = row.FocusId,
                    Kind = row.Kind,
                    Name = row.Name,
                    TagName = row.TagName,
                    Created = row.Enlist,
                    Retire = row.Retire,
                    Content = row.Content,
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

        public static ProjectModel Get(string userId, Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ProjectModel model = db.Projects.Where(c => c.Id == id).Select(row => new Models.ProjectModel()
                {
                    Id = row.Id,
                    FocusId = row.FocusId,
                    Kind = row.Kind,
                    Name = row.Name,
                    TagName = row.TagName,
                    Created = row.Enlist,
                    Retire = row.Retire,
                    Content = row.Content,
                    IconUri = row.IconUri
                }).FirstOrDefault();

                return model;
            }
        }

        public static dynamic Add(string userId, ProjectModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                ef.Project row = new ef.Project();
                row.Id = Guid.NewGuid();
                row.FocusId = model.FocusId;
                row.UserId = userId;
                row.Kind = model.Kind;
                row.Name = model.Name;
                row.TagName = model.TagName;
                row.Enlist = model.Created;
                row.Retire = model.Retire;
                row.Content = model.Content;
                row.IconUri = model.IconUri;
                db.Projects.Add(row);
                db.SaveChanges();
                model.Id = row.Id;

                // add the tag
                TagModel projectTag = new TagModel();
                projectTag.Id = Guid.NewGuid();
                projectTag.Kind = "Goal";
                projectTag.Name = model.TagName;
                projectTag.Parent = null;
                projectTag.Path = "/" + model.TagName + "/";

                TagsRepository.Add(userId, projectTag);

                return new { Id = row.Id, Name = row.Name };
            }
        }

        public static dynamic Update(string userId, ProjectModel model)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                ef.Project row = db.Projects.Where(a =>
                        a.Id == model.Id
                    ).First();

                // update the tag
                if (row.TagName != model.TagName) {
                    ef.Tag projectTag = db.Tags.Where(a => a.UserId == userId && a.Name == row.TagName).FirstOrDefault();
                    if (projectTag != null)
                    {
                        projectTag.Name = model.TagName;
                    }
                }

                row.FocusId = model.FocusId;
                row.Kind = model.Kind;
                row.Name = model.Name;
                row.TagName = model.TagName;
                row.Enlist = model.Created;
                row.Retire = model.Retire;
                row.Content = model.Content;
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
                var row = db.Projects.Where(a =>
                        a.Id == id
                    ).First();

                db.Projects.Remove(
                    row
                );

                db.SaveChanges();
            }
        }

        public static void UpdateProjectUri(string userId, string projectId, string uri)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                Guid projectGuid = Guid.Parse(projectId);
                // sync this model along with all children and related 
                ef.Project row = db.Projects.Where(r => r.UserId == userId && r.Id == projectGuid).First();

                row.IconUri = uri;

                // persist changes
                db.SaveChanges();
            }
        }
        #endregion
    }
}