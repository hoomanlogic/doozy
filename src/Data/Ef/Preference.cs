//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace HoomanLogic.Data.Ef
{
    using System;
    using System.Collections.Generic;
    
    public partial class Preference
    {
        public string UserId { get; set; }
        public byte WeekStarts { get; set; }
        public string Location { get; set; }
        public bool EmailNotifications { get; set; }
        public string GcmEndpoint { get; set; }
    
        public virtual AspNetUser AspNetUser { get; set; }
    }
}
