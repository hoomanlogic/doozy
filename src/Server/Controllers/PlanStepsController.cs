using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class PlanStepsController : ApiController
    {
        public List<Models.PlanStepModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return PlanStepsRepository.Get(userId);
        }

        public Models.PlanStepModel Get(Guid id)
        {
            string userId = User.Identity.GetUserId();
            return PlanStepsRepository.Get(userId, id);
        }

        public dynamic Post([FromBody] Models.PlanStepModel model)
        {
            string userId = User.Identity.GetUserId();
            return PlanStepsRepository.Add(userId, model);
        }

        public dynamic Put([FromBody] Models.PlanStepModel model)
        {
            string userId = User.Identity.GetUserId();
            return PlanStepsRepository.Update(userId, model);
        }

        public void Delete(Guid id)
        {
            PlanStepsRepository.Delete(id);
        }
    }
}
