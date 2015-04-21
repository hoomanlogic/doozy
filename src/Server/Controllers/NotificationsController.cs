using HoomanLogic.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    public class NotificationsController : ApiController
    {
        #region Request Objects
        public class UserBody
        {
            public string UserName { get; set; }
        }
        #endregion

        [HttpPost]
        [Route("api/acknowledgenotification/{id}")]
        public dynamic AcknowledgeNotification(Guid id, [FromBody]UserBody userBody)
        {
            return NotificationsRepository.AcknowledgeNotification(id);
        }
    }
}
