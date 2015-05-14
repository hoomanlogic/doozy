using HoomanLogic.Models;
using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System;
using System.Web.Http;
using System.Collections.Generic;

namespace HoomanLogic.Server.Controllers
{
    public class LogEntriesController : ApiController
    {
        public List<LogEntryModel> Get()
        {
            // return latest for this action
            string userId = User.Identity.GetUserId();
            return LogEntriesRepository.Get(userId, true);
        }

        public List<LogEntryModel> Get(string userName)
        {
            // return latest for this action
            string userId = UsersRepository.GetUserId(userName);
            return LogEntriesRepository.Get(userId);
        }

        public ActionModel Post([FromBody] LogEntryModel model)
        {
            ActionsRepository.AddLogEntry(model);

            // return latest for this action
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Get(userId, model.ActionId);
        }

        public LogEntryModel Put([FromBody] LogEntryModel model)
        {
            ActionsRepository.UpdateLogEntry(model);

            // return latest for this action
            string userId = User.Identity.GetUserId();
            return LogEntriesRepository.Get(userId, model.Id);
        }

        public ActionModel Delete(Guid id)
        {
            Guid actionId = ActionsRepository.DeleteLogEntry(id);

            // return latest for this action
            string userId = User.Identity.GetUserId();
            return ActionsRepository.Get(userId, actionId);
        }

        [HttpPost]
        [Route("api/toggleupvote")]
        public LogEntryPeanut ToggleUpvote([FromBody] ToggleUpvoteRequest request)
        {
            string userId = User.Identity.GetUserId();
            return LogEntriesRepository.ToggleUpvote(userId, request.Id);
        }

        public class ToggleUpvoteRequest
        {
            public Guid Id { get; set; }

        }

        [HttpPost]
        [Route("api/comment")]
        public LogEntryPeanut PostComment([FromBody] PostCommentRequest request)
        {
            string userId = User.Identity.GetUserId();
            return LogEntriesRepository.AddComment(userId, request.Id, request.Comment);
        }
        public class PostCommentRequest
        {
            public Guid Id { get; set; }
            public string Comment { get; set; }
        }

        [HttpDelete]
        [Route("api/comment")]
        public void DeleteComment([FromBody] DeleteCommentRequest request)
        {
            string userId = User.Identity.GetUserId();
            LogEntriesRepository.DeleteComment(userId, request.Id);
        }

        public class DeleteCommentRequest
        {
            public Guid Id { get; set; }
        }
    }
        
}
