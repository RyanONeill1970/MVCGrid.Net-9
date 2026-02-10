namespace MvcGridSharp.Extensions;

public static class MvcServiceExtension
{
    public static IMvcBuilder AddMvcGrid(this IServiceCollection services)
    {
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        return null;
    }
}
