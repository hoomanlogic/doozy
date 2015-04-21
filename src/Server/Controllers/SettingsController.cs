using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using HoomanLogic.Data;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class SettingsController : ApiController
    {
        public dynamic Get()
        {
            string userId = User.Identity.GetUserId();
            return Data.Preferences.Get(userId);
        }

        public void Put([FromBody] Models.Preference model)
        {
            string userId = User.Identity.GetUserId();
            Data.Preferences.Update(userId, model);
        }
    }
}
