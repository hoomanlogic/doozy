using HoomanLogic.Models;
using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    public class LogEntriesController : ApiController
    {
        public ActionModel Post([FromBody] LogEntryModel model)
        {
            ActionsRepository.AddLogEntry(model);

            // return latest for this action
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Get(userId, model.ActionId);
        }

        public ActionModel Put([FromBody] LogEntryModel model)
        {
            ActionsRepository.UpdateLogEntry(model);

            // return latest for this action
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Get(userId, model.ActionId);
        }

        public ActionModel Delete(Guid id)
        {
            Guid actionId = ActionsRepository.DeleteLogEntry(id);

            // return latest for this action
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Get(userId, actionId);
        }
    }
}
