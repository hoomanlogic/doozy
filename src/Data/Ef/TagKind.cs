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
    
    public partial class TagKind
    {
        public TagKind()
        {
            this.Tags = new HashSet<Tag>();
        }
    
        public string Id { get; set; }
        public string Symbol { get; set; }
    
        public virtual ICollection<Tag> Tags { get; set; }
    }
}