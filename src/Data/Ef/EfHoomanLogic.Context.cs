﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class hoomanlogicEntities : DbContext
    {
        public hoomanlogicEntities()
            : base("name=hoomanlogicEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Action> Actions { get; set; }
        public virtual DbSet<AspNetUser> AspNetUsers { get; set; }
        public virtual DbSet<LogEntry> LogEntries { get; set; }
        public virtual DbSet<RecurrenceRule> RecurrenceRules { get; set; }
        public virtual DbSet<Achievement> Achievements { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<Persona> Personas { get; set; }
        public virtual DbSet<Message> Messages { get; set; }
        public virtual DbSet<ConnectionRequest> ConnectionRequests { get; set; }
        public virtual DbSet<Connection> Connections { get; set; }
        public virtual DbSet<ActionPathway> ActionPathways { get; set; }
        public virtual DbSet<Tag> Tags { get; set; }
        public virtual DbSet<Target> Targets { get; set; }
        public virtual DbSet<Focus> Focuses { get; set; }
        public virtual DbSet<Preference> Preferences { get; set; }
        public virtual DbSet<Attachment> Attachments { get; set; }
        public virtual DbSet<LogEntryPeanut> LogEntryPeanuts { get; set; }
    }
}
