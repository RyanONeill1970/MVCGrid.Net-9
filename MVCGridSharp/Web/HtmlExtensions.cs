namespace MvcGridSharp.Web;

public static class HtmlExtensions
{
    public static IHtmlContent MvcGridNetCore<TModel>(this IHtmlHelper<TModel> html, string name)
    {
        var currentMapping = MvcGridDefinitionTable.GetDefinitionInterface(name);

        return MvcGridNetCore(html, name, currentMapping, null);
    }

    public static IHtmlContent MvcGridNetCore<TModel>(this IHtmlHelper<TModel> html, string name, object pageParameters)
    {
        var currentMapping = MvcGridDefinitionTable.GetDefinitionInterface(name);

        return MvcGridNetCore(html, name, currentMapping, pageParameters);
    }

    internal static IHtmlContent MvcGridNetCore<TModel>(this IHtmlHelper<TModel> helper, string name, IMvcGridSharpDefinition grid, object pageParameters)
    {
        GridEngine ge = new GridEngine();

        string html = ge.GetBasePageHtml(name, grid, pageParameters);

        return new HtmlString(html);
    }
}
