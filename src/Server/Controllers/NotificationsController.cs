using HoomanLogic.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity;

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

        #region Response Objects
        public class NotificationResponse
        {
            public string Title { get; set; }
            public string Message { get; set; }
            public string Icon { get; set; }
            public string Tag { get; set; }

        }
        #endregion

        [HttpPost]
        [Route("api/acknowledgenotification/{id}")]
        public dynamic AcknowledgeNotification(Guid id, [FromBody]UserBody userBody)
        {
            return NotificationsRepository.AcknowledgeNotification(id);
        }

        [AllowAnonymous]
        [Route("api/notification")]
        public dynamic GetNotification()
        {
            //string userId = User.Identity.GetUserId();
            var notification = NotificationsRepository.GetLatestNotification("");
            return new { Error = "", Notification = new NotificationResponse() { Title = notification.Kind, Message = notification.Subject, Icon = "/android-icon-192x192.png", Tag = "simple-push-demo-notification-tag" } };
        }
    }
}
