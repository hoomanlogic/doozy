using HoomanLogic.Models;
using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class ConnectionsController : ApiController
    {
        #region Request Objects
        public class UserBody
        {
            public string UserName { get; set; }
        }

        public class MessageBody
        {
            public string UserName { get; set; }
            public string Text { get; set; }
            public string File { get; set; }
        }
        #endregion

        public List<ConnectionModel> Get()
        {
            string userId = User.Identity.GetUserId();
            return ConnectionsRepository.Get(userId);
        }

        [HttpPost]
        [Route("api/requestconnection")]
        public void RequestConnection([FromBody]UserBody userBody)
        {
            string userId = User.Identity.GetUserId();
            ConnectionsRepository.RequestConnection(userId, User.Identity.Name, userBody.UserName);
        }

        [HttpPost]
        [Route("api/acceptconnection")]
        public dynamic AcceptConnection([FromBody]UserBody userBody)
        {
            string userId = User.Identity.GetUserId();
            return ConnectionsRepository.AcceptConnection(userId, User.Identity.Name, userBody.UserName);
        }

        [HttpPost]
        [Route("api/rejectconnection")]
        public void RejectConnection([FromBody]UserBody userBody)
        {
            string userId = User.Identity.GetUserId();
            ConnectionsRepository.RejectConnection(userId, User.Identity.Name, userBody.UserName);
        }
    }
}
