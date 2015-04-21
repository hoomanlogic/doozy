using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class MessageModel
    {
        public DateTime Sent { get; set; }
        public string UserName { get; set; }
        public string Direction { get; set; }
        public string Text { get; set; }
        public string FileUri { get; set; }
    }
}