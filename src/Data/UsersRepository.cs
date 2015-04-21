using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HoomanLogic.Data
{
    public static class UsersRepository
    {
        #region Public API

        public static List<string> GetUserIds()
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                return db.AspNetUsers.Select(r => r.Id).ToList();
            }
        }

        public static void UpdateProfileUri(string userId, string uri)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // sync this model along with all children and related 
                ef.Persona row = db.Personas.Where(r => r.UserId == userId && r.Kind == "Public").First();

                row.ProfileUri = uri;

                // persist changes
                db.SaveChanges();
            }
        }

        public static string GetProfileUri(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                string uri = db.Personas.Where(r => r.UserId == userId && r.Kind == "Public").Select(r => r.ProfileUri).FirstOrDefault();
                return uri;
            }
        }

        #endregion
    }
}