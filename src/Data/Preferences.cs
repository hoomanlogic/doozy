using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class Preferences
    {
        #region Public API

        public static Models.Preference Get(string userId)
        {
            string profileUri = UsersRepository.GetProfileUri(userId);
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                return (from t in db.Preferences
                        where t.UserId == userId
                        select new Models.Preference()
                        {
                            UserId = userId,
                            UserName = t.AspNetUser.UserName,
                            ProfileUri = profileUri,
                            WeekStarts = t.WeekStarts,
                            Email = t.AspNetUser.Email,
                            EmailNotifications = t.EmailNotifications,
                            Location = t.Location
                        }).FirstOrDefault();
            }
        }

        public static void Update(string userId, Models.Preference prefs)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var rowPrefs = (from t in db.Preferences
                                where t.UserId == userId
                                select t).FirstOrDefault();

                rowPrefs.Location = prefs.Location;
                rowPrefs.WeekStarts = prefs.WeekStarts;
                rowPrefs.EmailNotifications = prefs.EmailNotifications;
                rowPrefs.AspNetUser.Email = prefs.Email;

                db.SaveChangesAsync();
            }
        }

        #endregion
    }
}