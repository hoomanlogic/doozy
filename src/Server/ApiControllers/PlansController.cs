using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class PlansController : ApiController
    {
        public List<Models.PlanModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return PlansRepository.Get(userId);
        }

        public Models.PlanModel Get(Guid id)
        {
            string userId = User.Identity.GetUserId();
            return PlansRepository.Get(userId, id);
        }

        public dynamic Post([FromBody] Models.PlanModel model)
        {
            string userId = User.Identity.GetUserId();
            return PlansRepository.Add(userId, model);
        }

        public dynamic Put([FromBody] Models.PlanModel model)
        {
            string userId = User.Identity.GetUserId();
            return PlansRepository.Update(userId, model);
        }

        public void Delete(Guid id)
        {
            PlansRepository.Delete(id);
        }
    }
}