namespace MvcGridSharp.Helpers;

public static partial class HttpHelper
{
    private static IHttpContextAccessor _accessor;
    public static void Configure(IHttpContextAccessor httpContextAccessor)
    {
        _accessor = httpContextAccessor;
        //AppBaseUrl = $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}";
    }

    public static HttpContext HttpContext => _accessor.HttpContext;

    public static NameValueCollection ToNameValueCollection(this HttpRequest httpRequest)
    {
        NameValueCollection nameValueCollection = [];
        foreach (KeyValuePair<string, StringValues> item in httpRequest.Query)
        {
            nameValueCollection.Add(item.Key, item.Value.ToString());
        }
        return nameValueCollection;
    }
}
