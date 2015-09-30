using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace HoomanLogic.Server
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                "~/js/jquery.js"));

            bundles.Add(new ScriptBundle("~/bundles/react-libs").Include(
                "~/js/react-with-addons.js",
                "~/js/libs.js"));

            bundles.Add(new ScriptBundle("~/bundles/react-doozy").Include(
                "~/js/react-doozy.js"));

            bundles.Add(new StyleBundle("~/bundles/css").Include(
                "~/css/login.css"));

            //bundles.Add(new StyleBundle("~/bundles/react/css")
            //    .Include("~/css/all.css")
            //    .Include("~/css/font-awesome.css", new CssRewriteUrlTransform()));
        }
    }
}
