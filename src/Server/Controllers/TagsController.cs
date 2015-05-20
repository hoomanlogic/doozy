using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class TagsController : ApiController
    {
        public List<Models.TagModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return TagsRepository.Get(userId);
        }

        public Models.TagModel Get(Guid id)
        {
            string userId = User.Identity.GetUserId();
            return TagsRepository.Get(userId, id);
        }

        public dynamic Post([FromBody] Models.TagModel model)
        {
            string userId = User.Identity.GetUserId();
            return TagsRepository.Add(userId, model);
        }

        public dynamic Put([FromBody] Models.TagModel model)
        {
            string userId = User.Identity.GetUserId();
            return TagsRepository.Update(userId, model);
        }

        public void Delete(Guid id)
        {
            TagsRepository.Delete(id);
        }
    }
}