namespace MvcGridSharp.Interfaces;

public interface IMvcGridSharpTemplatingEngine
{
    string Process(string template, TemplateModel model);
}
