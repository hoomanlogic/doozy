using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace HoomanLogic.Server.App_Start
{
    public class AntiForgeryHandleErrorAttribute : HandleErrorAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            if (context.Exception is HttpAntiForgeryException)
            {
                var url = string.Empty;
                if (!context.HttpContext.User.Identity.IsAuthenticated)
                {
                    var requestContext = new RequestContext(context.HttpContext, context.RouteData);
                    url = RouteTable.Routes.GetVirtualPath(requestContext, new RouteValueDictionary(new { Controller = "Account", action = "Login" })).VirtualPath;
                }
                else
                {
                    context.HttpContext.Response.StatusCode = 200;
                    context.ExceptionHandled = true;
                    url = GetRedirectUrl(context);
                }
                context.HttpContext.Response.Redirect(url, true);
            }
            else
            {
                base.OnException(context);
            }
        }

        private string GetRedirectUrl(ExceptionContext context)
        {
            try
            {
                var requestContext = new RequestContext(context.HttpContext, context.RouteData);
                //AlreadySignIn
                var url = RouteTable.Routes.GetVirtualPath(requestContext, new RouteValueDictionary(new { Controller = "Home", action = "Index" })).VirtualPath;

                return url;
            }
            catch (Exception)
            {
                throw new NullReferenceException();
            }
        }
    }
}