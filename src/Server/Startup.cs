using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(HoomanLogic.Server.Startup))]

namespace HoomanLogic.Server
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            app.MapSignalR();
            Errl.Config = new Errl.Configuration()
            {
                Developer = "hoomanlogic",
                Key = "54263eb4-6ced-49bf-9bd7-14f0106c2a02",
                Product = "HoomanLogic",
                Environment = null,
                Version = "1.0.0",
                GetState = null,
                GetUser = () => { return "geoffrey.floyd"; }
            };
        }
    }
}
