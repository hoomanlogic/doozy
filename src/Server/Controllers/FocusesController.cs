using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class FocusesController : ApiController
    {
        public List<Models.FocusModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return FocusesRepository.Get(userId);
        }

        public Models.FocusModel Get(Guid id)
        {
            string userId = User.Identity.GetUserId();
            return FocusesRepository.Get(userId, id);
        }

        public dynamic Post([FromBody] Models.FocusModel model)
        {
            string userId = User.Identity.GetUserId();
            return FocusesRepository.Add(userId, model);
        }

        public dynamic Put([FromBody] Models.FocusModel model)
        {
            string userId = User.Identity.GetUserId();
            return FocusesRepository.Update(userId, model);
        }

        public void Delete(Guid id)
        {
            FocusesRepository.Delete(id);
        }
    }
}