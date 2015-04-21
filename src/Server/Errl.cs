using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net;
using System.Text;
using System.IO;
using System.Threading.Tasks;
using System.Runtime.Serialization.Json;
using System.Threading;
using System.Security.Principal;

namespace HoomanLogic.Server
{
    public static class Errl
    {

        public class LogErrorRequest
        {
            public string key { get; set; }
            public string productName { get; set; }
            public string environment { get; set; }
            public string version { get; set; }
            public string errorType { get; set; }
            public string errorDescription { get; set; }
            public string objectName { get; set; }
            public string subName { get; set; }
            public string details { get; set; }
            public string stackTrace { get; set; }
            public string state { get; set; }
            public string userId { get; set; }
        }

        public class Configuration
        {
            public string Developer { get; set; }
            public string Key { get; set; }
            public string Product { get; set; }
            public string Environment { get; set; }
            public string Version { get; set; }
            public Func<object> GetState { get; set; }
            public Func<string> GetUser { get; set; }
            public Action<string> OnLogged { get; set; }
        }

        public static Configuration Config = null;

        internal sealed class Mask
        {
            public static string NullString(string s)
            {
                return s == null ? string.Empty : s;
            }

            public static string EmptyString(string s, string filler)
            {
                return Mask.NullString(s).Length == 0 ? filler : s;
            }

            private Mask() { }
        }

        public class MoreInfo
        {
            public object State { get; set; }
        }

        public static dynamic Log(Exception ex, MoreInfo moreInfo, bool moreInfoIncluded)
        {
            string user = Mask.NullString(Thread.CurrentPrincipal.Identity.Name);

            return Log(ex, null, user, moreInfo);
        }

        public static dynamic Log(Exception ex, HttpContext context)
        {
            if (Errl.Config == null)
            {
                Console.Write("Errl.Log called, but Errl configuration is not set.");
                return null;
            }

            //string userId = null;

            //if (Errl.Config.GetUser != null)
            //{
            //    userId = Errl.Config.GetUser();
            //}

            if (ex == null)
                throw new ArgumentNullException("e");

            Exception baseException = ex.GetBaseException();

            //
            // Load the basic information.
            //

            //var hostName = Environment.TryGetMachineName(context);
            var typeName = baseException.GetType().FullName;
            var message = baseException.Message;
            var source = baseException.Source;
            var detail = ex.ToString();
            string user = Mask.NullString(Thread.CurrentPrincipal.Identity.Name);

            //
            // If this is an HTTP exception, then get the status code
            // and detailed HTML message provided by the host.
            //

            HttpException httpException = ex as HttpException;

            if (httpException != null)
            {
                var statusCode = httpException.GetHttpCode();
                //var webHostHtmlMessage = TryGetHtmlErrorMessage(httpException);
            }

            //
            // If the HTTP context is available, then capture the
            // collections that represent the state request as well as
            // the user.
            //

            if (context != null)
            {
                IPrincipal webUser = context.User;
                if (webUser != null
                    && Mask.NullString(webUser.Identity.Name).Length > 0)
                {
                    user = webUser.Identity.Name;
                }

                HttpRequest request = context.Request;

                //_serverVariables = CopyCollection(request.ServerVariables);

                //if (_serverVariables != null)
                //{
                //    // Hack for issue #140:
                //    // http://code.google.com/p/elmah/issues/detail?id=140

                //    const string authPasswordKey = "AUTH_PASSWORD";
                //    string authPassword = _serverVariables[authPasswordKey];
                //    if (authPassword != null) // yes, mask empty too!
                //        _serverVariables[authPasswordKey] = "*****";
                //}

                //_queryString = CopyCollection(request.QueryString);
                //_form = CopyCollection(request.Form);
                //_cookies = CopyCollection(request.Cookies);
            }

            if (user == string.Empty && Errl.Config.GetUser != null)
            {
                user = Errl.Config.GetUser();
            }

            return Log(ex, context, user, null);
        }

        public static dynamic Log(Exception ex, HttpContext context, string userId, MoreInfo moreInfo)
        {
            if (Errl.Config == null)
            {
                Console.Write("Errl.Log called, but Errl configuration is not set.");
                return null;
            }

            dynamic config = new
            {
                Key = "54263eb4-6ced-49bf-9bd7-14f0106c2a02",
                Product = "HoomanLogic",
                Environment = "(n/a)",
                Version = "1.0.0"
            };

            string err = ex.ToString();
            string errType = err.Split(':')[0].Trim();

            // object > json > string > bytes
            var sw = new StringWriter();
            var writer = new Newtonsoft.Json.JsonTextWriter(sw);
            var json = Newtonsoft.Json.JsonSerializer.Create();

            dynamic details = ex;

            // System.Data.Entity.Validation.DbEntityValidationException
            //if (ex is System.Data.Entity.Validation.DbEntityValidationException)
            //{
            //    var exEntityValidation = (System.Data.Entity.Validation.DbEntityValidationException)ex;

            //    List<object> entityValidationErrorList = new List<object>();
            //    if (exEntityValidation.EntityValidationErrors.ToList().Count > 0) {
                    
                    
            //        foreach (var entitiyValidationError in exEntityValidation.EntityValidationErrors.ToList()) {
            //            List<object> validationErrorList = new List<object>();
            //            foreach (var validationError in entitiyValidationError.ValidationErrors.ToList()) {
            //                validationErrorList.Add(new { errorMessage = validationError.ErrorMessage, propertyName = validationError.PropertyName });
            //            }
            //            entityValidationErrorList.Add(new { validationErrors = validationErrorList });
            //        }
            //        details = new { entityValidationErrors = entityValidationErrorList };
            //    }
            //}
            //// System.Exception
            //else 
            //{
                
            //}

            string detailsJsonString = "";
            if (details != null)
            {
                json.Serialize(writer, details);
                detailsJsonString = sw.ToString();
                sw.Close();
                writer.Close();
                sw = new StringWriter();
                writer = new Newtonsoft.Json.JsonTextWriter(sw);
            }

            string stateJsonString = "";
            if (moreInfo != null && moreInfo.State != null)
            {
                json.Serialize(writer, moreInfo.State);
                stateJsonString = sw.ToString();
                sw.Close();
                writer.Close();
                sw = new StringWriter();
                writer = new Newtonsoft.Json.JsonTextWriter(sw);
            }

            LogErrorRequest requestData = new LogErrorRequest()
            {
                key = Errl.Config.Key,
                productName = Errl.Config.Product,
                environment = Errl.Config.Environment,
                version = Errl.Config.Version,
                errorType = errType,
                errorDescription = ex.Message,
                objectName = ex.Source,
                subName = "(n/a)",
                details = detailsJsonString,
                stackTrace = ex.StackTrace,
                state = stateJsonString,
                userId = "geoffrey.floyd"
            };

            json.Serialize(writer, requestData);
            var jsonString = sw.ToString();
            var data = Encoding.ASCII.GetBytes(jsonString);
            sw.Close();
            writer.Close();

            // send request
            var request = (HttpWebRequest)WebRequest.Create("http://errl.hoomanlogic.com/api/logerror");
            //var request = (HttpWebRequest)WebRequest.Create("http://localhost:42026/api/logerror");
            request.ContentLength = data.Length;
            request.Method = "POST";
            request.ContentType = "application/json";
            request.Accept = "application/json, text/javascript, */*; q=0.01";

            using (var stream = new StreamWriter(request.GetRequestStream()))
            {
                stream.Write(jsonString);
                stream.Flush();
            }

            // get response
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(string));
            string errorId = (string)serializer.ReadObject(response.GetResponseStream());

            if (Errl.Config.OnLogged != null)
            {
                Errl.Config.OnLogged(errorId);
            }

            return errorId;
        }

    }
}