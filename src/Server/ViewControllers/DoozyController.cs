using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class DoozyController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Version = System.Configuration.ConfigurationManager.AppSettings["AppVersion"];
            return View();
        }
    }
}
