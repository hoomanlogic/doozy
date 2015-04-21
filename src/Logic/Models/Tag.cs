using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class TagModel
    {
        public TagModel()
        {
            Parent = null;
            Items = new List<TagModel>();
        }
        public Guid Id { get; set; }
        public string Kind { get; set; }
        public string Name { get; set; }
        public string Path { get; set; }
        public bool IsFocus { get; set; }
        public TagModel Parent { get; set; }
        public List<TagModel> Items { get; set; }
    }
}