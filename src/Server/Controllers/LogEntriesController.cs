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

        public LogEntryModel Post([FromBody] LogEntryModel model)
        {
            string userId = User.Identity.GetUserId();

            HoomanLogic.Data.LogEntriesRepository.LogEntryChanges result = LogEntriesRepository.Add(userId, model);

            // return latest for this action
            LogEntryModel returnVal = LogEntriesRepository.Get(userId, result.Id);
            if (result.NextDate.HasValue)
            {
                returnVal.NextDate = result.NextDate.Value;
            }
            return returnVal;
        }

        public LogEntryModel Put([FromBody] LogEntryModel model)
        {
            string userId = User.Identity.GetUserId();

            HoomanLogic.Data.LogEntriesRepository.LogEntryChanges result = LogEntriesRepository.Update(userId, model);

            // return latest for this action
            LogEntryModel returnVal = LogEntriesRepository.Get(userId, model.Id);
            if (result.NextDate.HasValue)
            {
                returnVal.NextDate = result.NextDate.Value;
            }
            return returnVal;
        }

        public HoomanLogic.Data.LogEntriesRepository.LogEntryChanges Delete(Guid id)
        {
            HoomanLogic.Data.LogEntriesRepository.LogEntryChanges result = LogEntriesRepository.Delete(id);
            return result;
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

        [HttpPut]
        [Route("api/comment")]
        public void PutComment([FromBody] PutCommentRequest request)
        {
            string userId = User.Identity.GetUserId();
            LogEntriesRepository.UpdateComment(userId, request.Id, request.Comment);
        }

        public class PutCommentRequest
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
