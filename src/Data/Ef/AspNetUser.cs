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
    
    public partial class AspNetUser
    {
        public AspNetUser()
        {
            this.Achievements = new HashSet<Achievement>();
            this.Notifications = new HashSet<Notification>();
            this.Personas = new HashSet<Persona>();
            this.SentMessages = new HashSet<Message>();
            this.ReceivedMessages = new HashSet<Message>();
            this.Connections = new HashSet<Connection>();
            this.Connections1 = new HashSet<Connection>();
            this.Tags = new HashSet<Tag>();
            this.Focuses = new HashSet<Focus>();
            this.Attachments = new HashSet<Attachment>();
            this.LogEntryPeanuts = new HashSet<LogEntryPeanut>();
            this.Actions = new HashSet<Action>();
            this.Plans = new HashSet<Plan>();
            this.Targets = new HashSet<Target>();
            this.LogEntries = new HashSet<LogEntry>();
        }
    
        public string Id { get; set; }
        public string Hometown { get; set; }
        public string Email { get; set; }
        public bool EmailConfirmed { get; set; }
        public string PasswordHash { get; set; }
        public string SecurityStamp { get; set; }
        public string PhoneNumber { get; set; }
        public bool PhoneNumberConfirmed { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public Nullable<System.DateTime> LockoutEndDateUtc { get; set; }
        public bool LockoutEnabled { get; set; }
        public int AccessFailedCount { get; set; }
        public string UserName { get; set; }
    
        public virtual ICollection<Achievement> Achievements { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<Persona> Personas { get; set; }
        public virtual ICollection<Message> SentMessages { get; set; }
        public virtual ICollection<Message> ReceivedMessages { get; set; }
        public virtual ICollection<Connection> Connections { get; set; }
        public virtual ICollection<Connection> Connections1 { get; set; }
        public virtual ICollection<Tag> Tags { get; set; }
        public virtual ICollection<Focus> Focuses { get; set; }
        public virtual Preference Preference { get; set; }
        public virtual ICollection<Attachment> Attachments { get; set; }
        public virtual ICollection<LogEntryPeanut> LogEntryPeanuts { get; set; }
        public virtual ICollection<Action> Actions { get; set; }
        public virtual ICollection<Plan> Plans { get; set; }
        public virtual ICollection<Target> Targets { get; set; }
        public virtual ICollection<LogEntry> LogEntries { get; set; }
    }
}
