using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Data
{
    public static class NotificationsRepository
    {
        public static List<ef.Notification> GetNotifications(string userName)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                string userId = db.AspNetUsers.Where(row => row.UserName == userName).Select(row => row.Id).First();
                return db.Notifications.Where(row => row.UserId == userId).ToList();
            }
        }

        public static void AddNotification(string userId, string kind, string subject)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                AddNotification(db, userId, kind, subject);
            }
        }

        public static void AddNotification(ef.hoomanlogicEntities db, string userId, string kind, string subject)
        {
            db.Notifications.Add(new ef.Notification()
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Kind = kind,
                Subject = subject,
                OccurredAt = DateTime.UtcNow
            });
            db.SaveChanges();
        }

        public static void RemoveNotifications(ef.hoomanlogicEntities db, string userId, string kind, string subject)
        {
            var notifications = (from row in db.Notifications
                                 where row.UserId == userId && row.Kind == kind && row.Subject == subject
                                 select row);
            db.Notifications.RemoveRange(notifications);
            db.SaveChanges();
        }

        public static dynamic AcknowledgeNotification(Guid id)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var readAt = DateTime.UtcNow;
                var notification = (from row in db.Notifications
                                    where row.Id == id
                                    select row).First();
                notification.ReadAt = readAt;
                db.SaveChanges();

                return new { Id = id, ReadAt = readAt };
            }
        }
    }
}