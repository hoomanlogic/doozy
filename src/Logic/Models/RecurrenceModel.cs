using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Models
{
    public class DayModel {
        public string Day { get; set; }
        public int Digit { get; set; }
    }
    public class RecurrenceModel
    {
        public string Kind { get; set; }
        public string Freq { get; set; }
        public int Count { get; set; }
        public int Interval { get; set; }
        public List<DayModel> ByDay { get; set; }
        public List<DateTime> Dates { get; set; }

        public static RecurrenceModel GetRecurrence(string item)
        {
            var kind = item.Split(':');

            // date lists: RDATE, EXDATE
            if (kind[0] == "RDATE" || kind[0] == "EXDATE") {
                var dateStrings = kind[1].Split(',');
                var dates = new List<DateTime>();
                // convert to array of datetime integers for easy comparison with underscore
                dateStrings.ToList().ForEach(a => {
                    dates.Add(DateTime.Parse(a));
                });
                return new RecurrenceModel() {
                    Kind = kind[0],
                    Dates = dates
                };
            }

            // rules: RRULE, EXRULE
            var rule = new RecurrenceModel() {
                Kind = kind[0],
                Freq = null,
                Count = 365000, // covers daily for 1000 years to avoid null check
                Interval = 1,
                ByDay = null
            };

            var props = kind[1].Split(';');

            for (var i = 0; i < props.Length; i++) {
                // split key from value
                var keyval = props[i].Split('=');

                if (keyval[0] == "BYDAY") {
                    rule.ByDay = new List<DayModel>();
                    var byday = keyval[1].Split(',');
                    for (var j = 0; j < byday.Length; j++) {
                        if (byday[j].Length == 2) {
                            rule.ByDay.Add(new DayModel()
                            { 
                                Day = byday[j].ToUpper(), 
                                Digit = 0 
                            });
                        } else {
                            // handle digit
                            rule.ByDay.Add(new DayModel()
                            {
                                Day = byday[j].Substring(byday[j].Length - 2, 2).ToUpper(),
                                Digit = int.Parse(byday[j].Substring(0, byday[j].Length - 2)) 
                            });
                        }
                    }
                } 
                else if (keyval[0] == "INTERVAL") {
                    rule.Interval = int.Parse(keyval[1]);
                } 
                else if (keyval[0] == "COUNT") {
                    rule.Count = int.Parse(keyval[1]);
                }
                else if (keyval[0] == "FREQ")
                {
                    rule.Freq = keyval[1];
                }
            }

            return rule;
        }

        public static bool ProcessRecurrence(DateTime today, DateTime enlist, RecurrenceModel rule)
        {
            if (rule.Kind == "RDATE" || rule.Kind == "EXDATE") {
                return rule.Dates.Contains(today.Date);
            }

            if (rule.Interval == 1 && rule.ByDay == null && rule.Count == 365000) {
                // simple comparison, daily is always true
                if (rule.Freq == "DAILY") {
                    // daily is always true
                } else if (rule.Freq == "WEEKLY") {
                    // weekly
                    if (today.DayOfWeek != enlist.DayOfWeek) {
                        return false;
                    }
                } else if (rule.Freq == "MONTHLY") {
                    // monthly
                    if (today.Day != enlist.Day) {
                        return false;
                    }
                } else if (rule.Freq == "YEARLY") {
                    // yearly
                    if (today.Month != enlist.Month || today.Day != enlist.Day) {
                        return false;
                    }
                } else {
                    throw new Exception("Unrecognized frequency");
                }

            } else if ((rule.Interval > 1 || rule.Count < 365000) && rule.ByDay == null) {
                // we have an interval or a count, so we need to step through each date the rule falls on
                var counter = 1;
                var matched = false;
                if (rule.Freq == "DAILY") {
                    // daily
                    while (enlist.Date <= today.Date && counter <= rule.Count)
                    {
                        // check for match
                        if (enlist.Date == today.Date)
                        {
                            matched = true;
                            break;
                        }

                        // continue with interval
                        enlist = enlist.AddDays(rule.Interval);
                        counter++;
                    }
                } else if (rule.Freq == "WEEKLY") {
                    // weekly
                    while (enlist.Date <= today.Date && counter <= rule.Count)
                    {
                        // check for match
                        if (enlist.Date == today.Date)
                        {
                            matched = true;
                            break;
                        }

                        // continue with interval
                        enlist = enlist.AddDays(7 * rule.Interval);
                        counter++;
                    }
                } else if (rule.Freq == "MONTHLY") {
                    // monthly
                    while (enlist.Date <= today.Date && counter <= rule.Count)
                    {
                        // check for match
                        if (enlist.Date == today.Date)
                        {
                            matched = true;
                            break;
                        }

                        // continue with interval
                        enlist = enlist.AddMonths(rule.Interval);
                        counter++;
                    }
                } else if (rule.Freq == "YEARLY") {
                    // yearly
                    while (enlist.Date <= today.Date && counter <= rule.Count)
                    {
                        // check for match
                        if (enlist.Date == today.Date)
                        {
                            matched = true;
                            break;
                        }

                        // continue with interval
                        enlist = enlist.AddYears(rule.Interval);
                        counter++;
                    }
                }
                // we didn"t match the date
                if (matched == false) {
                    return false;
                }
            } else {
                // complex stepping 
                //var thisday = hl.datetime.daysOfWeek[today.DayOfWeek].slice(0, 2).toUpperCase();
                var thisday = today.ToString("ddd").Substring(0, 2).ToUpper();

                if (rule.ByDay.Count() == rule.ByDay.Where(a => a.Digit == 0).Count())
                {
                    // simple byday
                    var days = rule.ByDay.Select(a => a.Day);
                    if (days.Contains(thisday) == false) {
                        return false;
                    }
                } else {
                    // oh shit, we have some thinking to do

                    // if yearly, then it would be the nth day of the week of the year

                    return false;
                }

            }

            return true;
        }
    }
}