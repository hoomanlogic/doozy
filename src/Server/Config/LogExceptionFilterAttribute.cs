using System.Web.Http.Filters;

namespace HoomanLogic.Server
{
    public class LogExceptionFilterAttribute : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext context)
        {
            
            // ignore this error
            if (context.Exception is System.OperationCanceledException && ((System.OperationCanceledException)context.Exception).CancellationToken.IsCancellationRequested == true)
            {
                return;
            }
            
            Errl.Log(context.Exception, null);
        }
    }
}

