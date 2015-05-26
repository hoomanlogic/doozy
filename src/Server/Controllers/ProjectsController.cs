using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class ProjectsController : ApiController
    {
        public List<Models.ProjectModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return ProjectsRepository.Get(userId);
        }

        public Models.ProjectModel Get(Guid id)
        {
            string userId = User.Identity.GetUserId();
            return ProjectsRepository.Get(userId, id);
        }

        public dynamic Post([FromBody] Models.ProjectModel model)
        {
            string userId = User.Identity.GetUserId();
            return ProjectsRepository.Add(userId, model);
        }

        public dynamic Put([FromBody] Models.ProjectModel model)
        {
            string userId = User.Identity.GetUserId();
            return ProjectsRepository.Update(userId, model);
        }

        public void Delete(Guid id)
        {
            ProjectsRepository.Delete(id);
        }
    }
}