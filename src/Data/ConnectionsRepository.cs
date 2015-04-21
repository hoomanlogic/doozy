using HoomanLogic.Models;
using ef = HoomanLogic.Data.Ef;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HoomanLogic.Data
{
    public static class ConnectionsRepository
    {
        public static List<ConnectionModel> Get(string userId)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                var models = (from row in db.Connections
                              where row.UserId == userId
                              select new ConnectionModel()
                              {
                                  UserId = row.Them.Id,
                                  UserName = row.Them.UserName,
                                  Persona = row.Persona,
                                  MyProfileUri = row.MyPersona.ProfileUri,
                                  Name = row.TheirPersona.KnownAs,
                                  ProfileUri = row.TheirPersona.ProfileUri
                              }).ToList();

                foreach (var model in models)
                {
                    var lastMessage = db.Messages.Where(row => (row.UserId_From == userId && row.UserId_To == model.UserId) || (row.UserId_From == model.UserId && row.UserId_To == userId)).OrderByDescending(row => row.Sent).FirstOrDefault();
                    if (lastMessage != null)
                    {
                        model.LastMessage = new MessageModel()
                        {
                            UserName = model.UserName,
                            Direction = lastMessage.UserId_From == userId ? "Sent" : "Received",
                            Sent = lastMessage.Sent,
                            Text = lastMessage.Text,
                            FileUri = lastMessage.Uri
                        };
                    }
                }
                return models;
            }
        }

        public static void RequestConnection(string requestorId, string requestorName, string requesteeName)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {

                string requesteeId = db.AspNetUsers.Where(row => row.UserName == requesteeName).Select(row => row.Id).First();
                string persona = "Public";

                db.ConnectionRequests.Add(new ef.ConnectionRequest() { UserId = requesteeId, UserId_RequestedBy = requestorId, Persona = persona });
                db.SaveChanges();

                NotificationsRepository.AddNotification(db, requesteeId, "Connection Request", requestorName);
            }
        }

        public static ConnectionModel AcceptConnection(string acceptorId, string acceptorName, string requestorName)
        {

            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {

                string requestorId = db.AspNetUsers.Where(row => row.UserName == requestorName).Select(row => row.Id).First();

                var request = db.ConnectionRequests.Where(row => row.UserId == acceptorId && row.UserId_RequestedBy == requestorId).First();

                string persona = "Public";
                string personaRequestor = request.Persona;
                db.ConnectionRequests.Remove(request);

                db.Connections.Add(new ef.Connection() { UserId = acceptorId, UserId_Connection = requestorId, Persona = persona, Persona_Connection = personaRequestor });
                db.Connections.Add(new ef.Connection() { UserId = requestorId, UserId_Connection = acceptorId, Persona = personaRequestor, Persona_Connection = persona });

                db.SaveChanges();

                // notify requestor that the connection request has been accepted
                NotificationsRepository.AddNotification(db, requestorId, "Connection Accepted", acceptorName);

                // remove any existing notifications of this connection request
                NotificationsRepository.RemoveNotifications(db, requestorId, "Connection Request", requestorName);

                var acceptedConnection = (from row in db.Connections
                                          where row.UserId == acceptorId && row.UserId_Connection == requestorId
                                          select new ConnectionModel()
                                          {
                                              UserId = row.Them.Id,
                                              UserName = row.Them.UserName,
                                              Persona = row.Persona,
                                              Name = row.TheirPersona.KnownAs,
                                              MyProfileUri = row.MyPersona.ProfileUri,
                                              ProfileUri = row.TheirPersona.ProfileUri
                                          }).First();
                return acceptedConnection;
            }
        }

        public static void RejectConnection(string rejectorId, string rejectorName, string requestorName)
        {
            using (ef.hoomanlogicEntities db = new ef.hoomanlogicEntities())
            {
                // get id from username
                string requestorId = db.AspNetUsers.Where(row => row.UserName == requestorName).Select(row => row.Id).First();

                // remove requests from user if any exist
                var request = db.ConnectionRequests.Where(row => row.UserId == rejectorId && row.UserId_RequestedBy == requestorId).FirstOrDefault();
                if (request != null) 
                {
                    db.ConnectionRequests.Remove(request);
                    db.SaveChanges();

                    // remove any existing notifications of this connection request
                    NotificationsRepository.RemoveNotifications(db, rejectorId, "Connection Request", requestorName);

                    // if there was a request, then there were no connections
                    // so return now to save resources
                    return;
                }
                   
                // remove existing connections if any exist
                var connections = db.Connections.Where(row => (row.UserId == rejectorId && row.UserId_Connection == requestorId) || (row.UserId == requestorId && row.UserId_Connection == rejectorId));
                if (connections != null)
                {
                    db.Connections.RemoveRange(connections);
                }
            }
        }


    }
}