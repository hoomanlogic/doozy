using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class EmailDistributions
    {
        #region Public API

        public class Notification
        {
            public string UserId { get; set; }
            public string Email { get; set; }
            public string Subject { get; set; }
            public bool SendEmail { get; set; }
            public bool SendNotification { get; set; }
        }

        public static dynamic GetActivatedActions()
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                List<Notification> activatedActions = (from a in db.Actions
                                                            where a.NextDate.HasValue
                                                                && a.NextDate.Value.Year == DateTime.Today.Year
                                                                && a.NextDate.Value.Month == DateTime.Today.Month
                                                                && a.NextDate.Value.Day == DateTime.Today.Day
                                                       select new Notification()
                                                            {
                                                                UserId = a.UserId,
                                                                Email = a.AspNetUser.Email,
                                                                Subject = a.Name,
                                                                SendEmail = true,
                                                                SendNotification = true
                                                            }).ToList();
                return activatedActions;
            }
        }
        #endregion
    }
}