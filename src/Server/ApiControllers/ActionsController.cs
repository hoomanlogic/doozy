using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class ActionsController : ApiController
    {
        public List<Models.ActionModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Get(userId);
        }

        public Models.ActionModel Get(Guid id)
        {
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Get(userId, id);
        }

        public dynamic Post([FromBody] Models.ActionModel model)
        {
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Add(userId, model);
        }

        public dynamic Put([FromBody] Models.ActionModel model)
        {
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Update(userId, model);
        }

        public void Delete(Guid id)
        {
            ActionsRepository.Delete(id);
        }
    }
}
