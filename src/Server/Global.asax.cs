using System;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace HoomanLogic.Server
{
    public class MvcApplication : HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            this.Error += MvcApplication_Error;
        }

        void MvcApplication_Error(object sender, System.EventArgs e)
        {
            var lastError = Server.GetLastError();

            if (lastError != null)
            {
                Errl.Log(lastError, this.Context);
            }
        }
    }
}
