using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Data
{
    public static class MessagesRepository
    {
        public static void Add(string senderId, string receiverName, string text, string filePath, bool isRecipientOnline)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {

                string receiverId = db.AspNetUsers.Where(row => row.UserName == receiverName).Select(row => row.Id).First();

                ef.Message message = new ef.Message()
                {
                    Id = Guid.NewGuid(),
                    UserId_From = senderId,
                    UserId_To = receiverId,
                    Text = text,
                    Sent = DateTime.UtcNow,
                    Uri = filePath
                };

                db.Messages.Add(message);
                db.SaveChanges();
                
                // add row to notifications table if recipient isn't online
                if (!isRecipientOnline)
                {
                    string senderName = db.Personas.Where(a => a.UserId == senderId && a.Kind == "Public").Select(a => a.KnownAs).First();
                    NotificationsRepository.AddNotification(db, receiverId, "New Message", senderName);
                }

            }
        }

        public static List<MessageModel> GetConversationHistory(string userId, string contactUserName)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                string userIdConnection = db.AspNetUsers.Where(row => row.UserName == contactUserName).Select(row => row.Id).First();

                var models = db.Messages
                    .Where(row => (row.UserId_From == userId && row.UserId_To == userIdConnection) || (row.UserId_From == userIdConnection && row.UserId_To == userId))
                    .OrderByDescending(row => row.Sent)
                    .Take(50)
                    .Select(row => new MessageModel()
                    {
                        UserName = contactUserName,
                        Direction = row.UserId_From == userId ? "Sent" : "Received",
                        Sent = row.Sent,
                        Text = row.Text,
                        FileUri = row.Uri
                    }).ToList();

                return models;
            }
        }
    }
}