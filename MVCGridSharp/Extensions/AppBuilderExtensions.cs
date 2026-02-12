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
            // When using app.Map(), the matched path prefix is stripped from context.Request.Path
            // So we need to check the original path using context.Request.PathBase + context.Request.Path
            // or check the specific patterns the route was mapped for
            string fullPath = context.Request.PathBase.Value + context.Request.Path.Value;
            string path = context.Request.Path.Value ?? string.Empty;

            // Check for image requests - either the remaining path or full path contains image extension
            if (path.Contains(".gif") || path.Contains(".png") || path.Contains(".jpg") ||
                fullPath.Contains(".gif") || fullPath.Contains(".png") || fullPath.Contains(".jpg"))
            {
                // Extract image filename from the full path
                string imageName = System.IO.Path.GetFileName(fullPath);
                string resourcePath = "Images/" + imageName;

                try
                {
                    byte[] image = GetResourceFileContentAsByteArray("MvcGridSharp", resourcePath);
                    context.Response.ContentType = imageName.EndsWith(".gif") ? "image/gif" : "image/png";
                    await context.Response.Body.WriteAsync(image, 0, image.Length);
                }
                catch (FileNotFoundException)
                {
                    context.Response.StatusCode = 404;
                    await context.Response.WriteAsync($"Image not found: {imageName}");
                }
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
            var path = context.Request.PathBase.Value;

            if (string.IsNullOrWhiteSpace(path))
            {
                return;
            }

            if (path.EndsWith("/MvcGridSharp.js", StringComparison.OrdinalIgnoreCase))
            {
                var script = GetResourceFileContentAsString("MvcGridSharp", "Scripts/dist/MvcGridSharp.js");
                script = script.Replace("%%CONTROLLERPATH%%", "gridmvc/grid");
                script = script.Replace("%%ERRORDETAILS%%", "false");
                script = script.Replace("%%HANDLERPATH%%", "../MvcGridSharp");
                context.Response.ContentType = "text/javascript";
                await context.Response.WriteAsync(script);
            }
            else if (path.EndsWith("/MvcGridSharpSignalR.js", StringComparison.OrdinalIgnoreCase))
            {
                string script = GetResourceFileContentAsString("MvcGridSharp", "Scripts/dist/MvcGridSignalR.js");
                context.Response.ContentType = "text/javascript";
                await context.Response.WriteAsync(script);
            }
        });
    }

    public static void UseMvcGrid(this IApplicationBuilder app)
    {
        HttpHelper.Configure(app.ApplicationServices.GetService<IHttpContextAccessor>());
        GridRegistration.RegisterAllGrids();

        var handlerPath = HtmlUtility.HandlerPath;

        // Register scripts
        app.Map($"{handlerPath}/MvcGridSharp.js", HandleMvcGridScript);
        app.Map($"{handlerPath}/MvcGridSharpSignalR.js", HandleMvcGridScript);

        // Register image routes BEFORE the main handler so they match first
        app.Map($"{handlerPath}/sortup.png", HandleMvcGridSharp);
        app.Map($"{handlerPath}/sortdown.png", HandleMvcGridSharp);
        app.Map($"{handlerPath}/sort.png", HandleMvcGridSharp);
        app.Map($"{handlerPath}/ajaxloader.gif", HandleMvcGridSharp);

        // Main grid handler - must be last so it doesn't catch image routes
        app.Map($"{handlerPath}", HandleMvcGridSharp);
    }
}
