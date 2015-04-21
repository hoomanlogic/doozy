using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class ConnectionModel
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Persona { get; set; }
        public string Name { get; set; }
        public string MyProfileUri { get; set; }
        public string ProfileUri { get; set; }
        public MessageModel LastMessage { get; set; }
    }
}