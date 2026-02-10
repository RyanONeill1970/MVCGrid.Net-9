namespace MvcGridSharp.Interfaces;

public interface IMvcGridSharpRenderingEngine
{
    bool AllowsPaging { get; }
    void PrepareResponse(HttpResponse response);
    void Render(RenderingModel model, GridContext gridContext, TextWriter outputStream);
    void RenderContainer(ContainerRenderingModel model, TextWriter outputStream);
}
