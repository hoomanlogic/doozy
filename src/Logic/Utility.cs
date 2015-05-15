using HoomanLogic.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace HoomanLogic
{
    public static class Utility
    {
        public static DateTime? GetNextOccurrence(List<RecurrenceModel> recurrenceRules, DateTime firstOccurrence, DateTime? latestOccurrence)
        {
            DateTime? nextDate = null;

            if (recurrenceRules.Count > 0)
            {
                DateTime date = latestOccurrence.HasValue ? latestOccurrence.Value.AddDays(1) : firstOccurrence;
                while (nextDate == null)
                {
                    bool occursToday = false;
                    // figure out the next date this action should be performed
                    foreach (var recur in recurrenceRules)
                    {
                        // process rule
                        bool match = RecurrenceModel.ProcessRecurrence(date, firstOccurrence, recur);
                        if (match == true && (recur.Kind == "RRULE" || recur.Kind == "RDATE"))
                        {
                            // might occur unless an exception overrides it
                            occursToday = true;
                        }
                        else if (match == true && (recur.Kind == "EXRULE" || recur.Kind == "EXDATE"))
                        {
                            // only takes one exception match to rule it out
                            occursToday = false;
                            break;
                        }
                    }

                    if (occursToday)
                    {
                        nextDate = date;
                    }

                    // iterate another day
                    date = date.AddDays(1);
                }
            }

            return nextDate;
        }
    }
}
