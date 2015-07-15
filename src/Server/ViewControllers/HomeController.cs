using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Version = System.Configuration.ConfigurationManager.AppSettings["AppVersion"];
            return View();
        }
    }
}
