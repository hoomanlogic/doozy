using HoomanLogic.Models;
using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System.Collections.Generic;
using System.Web.Http;

namespace HoomanLogic.Server.Controllers
{
    public class MessagesController : ApiController
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

        /// <summary>
        /// This API method is superceded by the ChatHub. Keeping for now in case ChatHub fails. See example js usage below:
        /// $.ajax({
        ///     context: this,
        ///     url: hl.hub.HOST_NAME + '/api/sendmessage',
        ///     dataType: 'json',
        ///     headers: {
        ///         'Authorization': 'Bearer ' + app.dataModel.getAccessToken()
        ///     },
        ///     type: 'POST',
        ///     contentType: 'application/json',
        ///     data: JSON.stringify({ userName: this.props.settings.userName, message: $('#uxMessage').val(), file: null }),
        ///     success: function() {
        ///         toastr.success('Message sent!');
        ///     },
        ///     error: function(xhr, status, err) {
        ///         toastr.error('Oh no! There was a problem sending this message' + status + err);
        ///     }
        /// });
        /// </summary>
        /// <param name="messageBody"></param>
        [HttpPost]
        [Route("api/sendmessage")]
        public void SendMessage([FromBody]MessageBody messageBody)
        {
            string userId = User.Identity.GetUserId();
            MessagesRepository.Add(userId, messageBody.UserName, messageBody.Text, null, false);
        }

        [HttpPost]
        [Route("api/messages")]
        public List<MessageModel> GetMessages([FromBody]UserBody userBody)
        {
            string userId = User.Identity.GetUserId();
            return MessagesRepository.GetConversationHistory(userId, userBody.UserName);
        }
    }
}
