namespace MvcGridSharp.SignalR.Extensions;

public static class SignalRApplicationBuilderExtensions
{
    public static void UseMvcGridSignalR(this IApplicationBuilder app)
    {
        app.UseRouting();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<MvcGridSharpSignalR>("/MvcGridSignalR");
        });

        SignalRHelper.Configure(app.ApplicationServices.GetRequiredService<IHubContext<MvcGridSharpSignalR>>());
    }
}
