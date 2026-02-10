namespace MvcGridSharp.Extensions;

public static class MvcApplicationBuilderExtensions
{
    static Stream GetResourceStream(string resourcePath)
    {
        Assembly assembly = AppDomain.CurrentDomain.GetAssemblies().First(a => a.GetName().Name == "MvcGridSharp");
        List<string> resourceNames = [.. assembly.GetManifestResourceNames()];

        resourcePath = resourcePath.Replace(@"/", ".");
        resourcePath = resourceNames.FirstOrDefault(r => r.Contains(resourcePath));

        if (resourcePath == null)
            throw new FileNotFoundException("Resource not found");

        return assembly.GetManifestResourceStream(resourcePath);
    }
    static string GetResourceFileContentAsString(string thenamespace, string fileName)
    {
        Assembly assembly = AppDomain.CurrentDomain.GetAssemblies().First(a => a.GetName().Name == "MvcGridSharp");
        var resourceName = thenamespace + "." + fileName;

        string resource = null;
        using (Stream stream = GetResourceStream(resourceName))
        {
            using (StreamReader reader = new StreamReader(stream))
            {
                resource = reader.ReadToEnd();
            }
        }
        return resource;
    }
    static byte[] GetResourceFileContentAsByteArray(string thenamespace, string fileName)
    {
        Assembly assembly = AppDomain.CurrentDomain.GetAssemblies().First(a => a.GetName().Name == "MvcGridSharp");
        var resourceName = thenamespace + "." + fileName;

        byte[] bytes;
        using (Stream stream = GetResourceStream(resourceName))
        {
            using (var memoryStream = new MemoryStream())
            {
                stream.CopyTo(memoryStream);
                bytes = memoryStream.ToArray();
            }
        }
        return bytes;
    }

    public static void RegisterMvcGrid<T>(this IApplicationBuilder app, string name, MvcGridSharpBuilder<T> builder)
    {
        MvcGridDefinitionTable.Add(name, builder);
    }

    public static void HandleMvcGridSharp(IApplicationBuilder app)
    {
        app.Run(async context =>
        {
            string path = context.Request.PathBase.Value;
            if (path.Contains(".gif") || path.Contains(".png") || path.Contains(".jpg"))
            {
                path = "Images" + path.Replace(HtmlUtility.GetHandlerPath(), string.Empty);
                byte[] image = GetResourceFileContentAsByteArray("MvcGridSharp", path);
                context.Response.ContentType = "image/png";
                await context.Response.Body.WriteAsync(image, 0, image.Length);
            }
            else
            {
                HttpRequest httpRequest = context.Request;
                string gridName = httpRequest.Query["Name"];
                int statusCode;
                string html = GridHelpers.GenerateGrid(gridName, out statusCode, httpRequest.ToNameValueCollection());
                if (statusCode != 0)
                {
                    context.Response.StatusCode = statusCode;
                    await context.Response.WriteAsync(html);
                }
            }
        });
    }
    public static void HandleMvcGridScript(IApplicationBuilder app)
    {
        app.Run(async context =>
        {
            string path = context.Request.PathBase.Value;
            switch (path)
            {
                case "/MvcGridSharp.js":
                    {
                        string script = GetResourceFileContentAsString("MvcGridSharp", "Scripts/dist/MvcGridSharp.js");
                        script = script.Replace("%%CONTROLLERPATH%%", "gridmvc/grid");
                        script = script.Replace("%%ERRORDETAILS%%", "false");
                        script = script.Replace("%%HANDLERPATH%%", "../MvcGridSharp");
                        context.Response.ContentType = "text/javascript";
                        await context.Response.WriteAsync(script);
                        break;
                    }
                case "/MvcGridSignalR.js":
                    {
                        string script = GetResourceFileContentAsString("MvcGridSharp", "Scripts/dist/MvcGridSignalR.js");
                        context.Response.ContentType = "text/javascript";
                        await context.Response.WriteAsync(script);
                        break;
                    }
            }
        });
    }

    public static void UseMvcGrid(this IApplicationBuilder app)
    {
        HttpHelper.Configure(app.ApplicationServices.GetService<IHttpContextAccessor>());
        GridRegistration.RegisterAllGrids();

        var imageHandlerPath = HtmlUtility.GetHandlerPath();

        app.Map("/MvcGridSharp.js", HandleMvcGridScript);
        app.Map("/MvcGridSharpSignalR.js", HandleMvcGridScript);
        app.Map("/MvcGridSharp", HandleMvcGridSharp);
        app.Map($"{imageHandlerPath}/sortup.png", HandleMvcGridSharp);
        app.Map($"{imageHandlerPath}/sortdown.png", HandleMvcGridSharp);
        app.Map($"{imageHandlerPath}/sort.png", HandleMvcGridSharp);
        app.Map($"{imageHandlerPath}/ajaxloader.gif", HandleMvcGridSharp);
        app.Map("/ajaxloader.gif", HandleMvcGridSharp);
    }
}
