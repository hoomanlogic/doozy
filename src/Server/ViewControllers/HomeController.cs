using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace HoomanLogic.Server.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Version = System.Configuration.ConfigurationManager.AppSettings["AppVersion"];
            if (Request.QueryString.Count > 1)
            {
                return Redirect("~/doozy" + Request.QueryString.ToString());
            }
            else
            {
                return View();
            }
        }
    }
}
