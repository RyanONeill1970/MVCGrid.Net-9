namespace MvcGridSharp.SignalR.Extensions;

public static class SignalRServiceExtension
{
    public static void AddMvcGridSignalR(this IServiceCollection services)
    {
        services.AddSignalRCore();
        services.AddScoped<SignalRHelper>();
    }
}
