using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using HoomanLogic.Data;
using Microsoft.AspNet.Identity;
using System.Text.RegularExpressions;
using System.IO;
using System.Drawing;

namespace HoomanLogic.Server
{
    /// <summary>
    /// SignalR Hub
    /// </summary>
    public class ChatHub : Hub
    {
        #region Private Members
        private static List<string> _Users = new List<string>();
        #endregion

        #region Public API

        public void Send(string userName, string message, bool relay, string data, string originalFileName)
        {
            try
            {
                // save image to uploads dir and return a file path
                var id = Context.User.Identity.GetUserId();
                string filePath = SaveFile(data, id, originalFileName);

                bool isRecipientOnline = _Users.Contains(userName);

                if (isRecipientOnline)
                {
                    Clients.User(userName).addNewMessageToPage(Context.User.Identity.Name, message);
                }
                else if (relay)
                {
                    // notify caller that the user is unavailable
                    Clients.User(Context.User.Identity.Name).notifyUserUnavailable(userName);
                }

                // we only store messages if we are using inbox mode (not relay mode)
                if (!relay)
                {
                    // get sender and recipient ids
                    string userId = Context.User.Identity.GetUserId();
                    MessagesRepository.Add(userId, userName, message, filePath, isRecipientOnline);
                }
            }
            catch (Exception ex)
            {
                Errl.Log(ex, null);
            }
        }

        public void Upload(string type, string arg, string data, string originalFileName)
        {
            try
            {
                var id = Context.User.Identity.GetUserId();

                // save image to uploads dir and return a file path
                string filePath = SaveFile(data, id, originalFileName);

                if (type.ToLower() == "profile")
                {
                    UsersRepository.UpdateProfileUri(id, filePath);
                    // notify caller that the user is unavailable
                    Clients.User(Context.User.Identity.Name).handleProfileUriUpdated(filePath);
                }
                else if (type.ToLower() == "focus")
                {
                    FocusesRepository.UpdateFocusUri(id, arg, filePath);
                    // notify caller that the user is unavailable
                    Clients.User(Context.User.Identity.Name).handleFocusUriUpdated(arg, filePath);
                }
            }
            catch (Exception ex)
            {
                Errl.Log(ex, null, false);
            }
        }

        #endregion

        #region Private Methods

        private static string SaveFile(string data, string subfolder, string originalFileName)
        {
            string filePath = null;
            try
            {
                
                if (data != null)
                {
                    // TODO: Handle file types other than images
                    var base64Data = Regex.Match(data, @"data:image/(?<type>.+?),(?<data>.+)").Groups["data"].Value;
                    var binData = Convert.FromBase64String(base64Data);

                    using (var stream = new MemoryStream(binData))
                    {
                        using (Bitmap img = new Bitmap(stream))
                        {
                            string[] fileSplit = originalFileName.Split('.');
                            string uri = Guid.NewGuid().ToString() + "." + fileSplit[fileSplit.Length - 1];
                            string uploadPath = HttpContext.Current.Server.MapPath("~/uploads/" + subfolder + "/" + uri);
                            img.Save(uploadPath);
                            filePath = "/uploads/" + subfolder + "/" + uri;
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                Errl.Log(ex,
                    new HoomanLogic.Server.Errl.MoreInfo()
                    {
                        State = new List<KeyValuePair<string, string>>() { 
                            new KeyValuePair<string, string>("data", data),
                            new KeyValuePair<string, string>("subfolder", subfolder),
                            new KeyValuePair<string, string>("originalFileName", originalFileName) 
                        }
                    },
                    false);
            }
            return filePath;
        }

        #endregion

        #region Events

        public override Task OnConnected()
        {

            if (!_Users.Contains(Context.User.Identity.Name)) {
                _Users.Add(Context.User.Identity.Name);
            }

            // on connection, send them all outstanding notifications
            var notifications = NotificationsRepository.GetNotifications(Context.User.Identity.Name);
            if (notifications.Count() > 0)
            {
                foreach (var notification in notifications)
                {
                    var result = new
                    {
                        id = notification.Id,
                        subject = notification.Subject,
                        occurredAt = notification.OccurredAt,
                        kind = notification.Kind,
                        readAt = notification.ReadAt
                    };
                    Clients.User(Context.User.Identity.Name).sendNotification(result);
                }
            }

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            if (_Users.Contains(Context.User.Identity.Name))
            {
                _Users.Remove(Context.User.Identity.Name);
            }
            return base.OnDisconnected(stopCalled);
        }

        #endregion
    }
}