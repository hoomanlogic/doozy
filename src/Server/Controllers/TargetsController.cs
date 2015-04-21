using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class TargetsController : ApiController
    {
        public List<Models.TargetModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return TargetsRepository.Get(userId);
        }

        public Models.TargetModel Get(Guid id)
        {
            string userId = User.Identity.GetUserId();
            return TargetsRepository.Get(userId, id);
        }

        public dynamic Post([FromBody] Models.TargetModel model)
        {
            string userId = User.Identity.GetUserId();
            return TargetsRepository.Add(userId, model);
        }

        public dynamic Put([FromBody] Models.TargetModel model)
        {
            string userId = User.Identity.GetUserId();
            return TargetsRepository.Update(userId, model);
        }

        public void Delete(Guid id)
        {
            TargetsRepository.Delete(id);
        }
    }
}
