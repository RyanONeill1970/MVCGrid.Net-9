namespace MvcGridSharp.Examples;

public class Startup(IConfiguration configuration)
{
    public IConfiguration Configuration { get; } = configuration;

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        services.Configure<CookiePolicyOptions>(options =>
        {
            // This lambda determines whether user consent for non-essential cookies is needed for a given request.
            options.CheckConsentNeeded = context => true;
            options.MinimumSameSitePolicy = SameSiteMode.None;
        });

        services.AddHttpsRedirection(options =>
        {
            options.HttpsPort = 443;
        });
        services.AddMvcGrid();
        services.AddMvc(options =>
        {
            options.EnableEndpointRouting = false;
        });
        services.AddSignalR();
        services.AddMvcGridSignalR();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        //app.RegisterMvcGrid("TestGrid", GridTest.Test());
        //app.UseMvcGrid();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler("/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles(new StaticFileOptions
        {
            ServeUnknownFileTypes = true,
        });
        app.UseCookiePolicy();



        app.RegisterMvcGrid("TestGrid", GridTest.Test());
        app.RegisterMvcGrid("TestGrid2", GridTest.Test2());
        app.UseMvcGrid();
        app.UseMvcGridSignalR();
        app.UseMvc();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller=Example}/{action=Basic}/{id?}");
        });
    }
}
