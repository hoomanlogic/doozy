using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Mail;
using System.Configuration;

namespace Worker
{
    class Program
    {



        static void Main(string[] args)
        {
            DoNightlyProcess();
        }

        static void DoNightlyProcess()
        {
            /**
             * Notify actions that were added today
             */
            List<HoomanLogic.Data.EmailDistributions.Notification> activatedActions = HoomanLogic.Data.EmailDistributions.GetActivatedActions();
            foreach (var row in activatedActions)
            {
                if (row.SendEmail && !string.IsNullOrWhiteSpace(row.Email))
                {
                    SendEmail("HoomanLogic", row.Email, row.Subject, "Don't forget to " + row.Subject + "!");
                }
                if (row.SendNotification)
                {
                    HoomanLogic.Data.NotificationsRepository.AddNotification(row.UserId, "Reminder", row.Subject);
                }
            }
        }

        static void SendEmail(string role, string to, string subject, string body)
        {
            var fromAddress = new MailAddress(ConfigurationManager.AppSettings["SmtpAccount"], role);
            string smtpPwd = ConfigurationManager.AppSettings["SmtpPassword"];

            var toAddress = new MailAddress(to);
            
            using (var smtp = new SmtpClient()
            {
                Host = ConfigurationManager.AppSettings["SmtpHost"],
                Port = int.Parse(ConfigurationManager.AppSettings["SmtpPort"]),
                EnableSsl = bool.Parse(ConfigurationManager.AppSettings["SmtpSsl"]),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(fromAddress.Address, smtpPwd)
            })
            {
                using (var message = new MailMessage(fromAddress, toAddress)
                {
                    Subject = subject,
                    Body = body
                })
                {
                    smtp.Send(message);
                }
            }
        }
    }
}
