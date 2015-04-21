using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using System.Drawing;
using System.Text.RegularExpressions;

namespace HoomanLogic.Server.Controllers
{
    [Authorize]
    public class UploadFilesController : ApiController
    {
        public class FileUpload {
            public string DataUrl { get; set; }
            public string FileName { get; set; }

        }

        [Route("api/uploadfiles/{type}")]
        public List<string> Post(string type, [FromBody] FileUpload file)
        {
            List<string> messages = new List<string>();
            messages.Add("File uploaded as " + file.FileName);
            return messages;
           
        }

        public async Task<List<string>> PostBackupAsync(string type)
        {

            if (Request.Content.IsMimeMultipartContent())
            {
                string userId = User.Identity.GetUserId();

                string uploadPath = HttpContext.Current.Server.MapPath("~/uploads/" + userId + "/" + type);
                if (!System.IO.Directory.Exists(uploadPath))
                {
                    System.IO.Directory.CreateDirectory(uploadPath);
                }

                MyStreamProvider streamProvider = new MyStreamProvider(uploadPath);

                await Request.Content.ReadAsMultipartAsync(streamProvider);

                List<string> messages = new List<string>();
                foreach (var file in streamProvider.FileData)
                {
                    FileInfo fi = new FileInfo(file.LocalFileName);
                    messages.Add("File uploaded as " + fi.FullName + " (" + fi.Length + " bytes)");
                }

                return messages;
            }
            else
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.BadRequest, "Invalid Request!");
                throw new HttpResponseException(response);
            }
        }

    }

    public class MyStreamProvider : MultipartFormDataStreamProvider
    {
        public MyStreamProvider(string uploadPath)
            : base(uploadPath)
        {

        }

        public override string GetLocalFileName(HttpContentHeaders headers)
        {
            string fileName = headers.ContentDisposition.FileName;
            if (string.IsNullOrWhiteSpace(fileName))
            {
                fileName = Guid.NewGuid().ToString() + ".data";
            }
            return fileName.Replace("\"", string.Empty);
        }

        private static string SaveFile(string data, string originalFileName)
        {
            string filePath = null;
            if (data != null)
            {
                // TODO: Handle file types other than images
                var base64Data = Regex.Match(data, @"data:image/(?<type>.+?),(?<data>.+)").Groups["data"].Value;
                var binData = Convert.FromBase64String(base64Data);

                using (var stream = new MemoryStream(binData))
                {
                    Bitmap img = new Bitmap(stream);
                    string[] fileSplit = originalFileName.Split('.');
                    string uri = Guid.NewGuid().ToString() + "." + fileSplit[fileSplit.Length - 1];
                    string uploadPath = HttpContext.Current.Server.MapPath("~/uploads/" + uri);
                    img.Save(uploadPath);
                    filePath = "/uploads/" + uri;
                }
            }
            return filePath;
        }
    }
}
