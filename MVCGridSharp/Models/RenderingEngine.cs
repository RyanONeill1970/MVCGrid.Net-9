namespace MvcGridSharp.Models;

public class RenderingEngine(string Name, string Type)
{
    public string Name { get; set; } = Name;
    public string Type { get; set; } = Type;

    public static RenderingEngine BootstrapRenderingEngine
    {
        get
        {
            return new RenderingEngine("BootstrapRenderingEngine", "MvcGridSharp.Rendering.BootstrapRenderingEngine, MvcGridSharp");
        }
    }
    public static RenderingEngine ExportDefault
    {
        get
        {
            return new RenderingEngine("Export", "MvcGridSharp.Rendering.CsvRenderingEngine, MvcGridSharp");
        }
    }
}

public class RenderingEngineCollection : Dictionary<string, RenderingEngine>
{
    public RenderingEngineCollection() : base()
    {

    }
    public void Add(RenderingEngine renderingEngine)
    {
        base.Add(renderingEngine.Name, renderingEngine);
    }
}
