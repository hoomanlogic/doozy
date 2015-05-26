using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class ProjectStepsController : ApiController
    {
        public List<Models.ProjectStepModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return ProjectStepsRepository.Get(userId);
        }

        public Models.ProjectStepModel Get(Guid id)
        {
            string userId = User.Identity.GetUserId();
            return ProjectStepsRepository.Get(userId, id);
        }

        public dynamic Post([FromBody] Models.ProjectStepModel model)
        {
            string userId = User.Identity.GetUserId();
            return ProjectStepsRepository.Add(userId, model);
        }

        public dynamic Put([FromBody] Models.ProjectStepModel model)
        {
            string userId = User.Identity.GetUserId();
            return ProjectStepsRepository.Update(userId, model);
        }

        public void Delete(Guid id)
        {
            ProjectStepsRepository.Delete(id);
        }
    }
}
