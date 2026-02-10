namespace MvcGridSharp.Helpers;

internal static class GridHelpers
{
    internal static string GenerateGrid(string gridName, out int statusCode, NameValueCollection nameValueCollection = null)
    {
        if (nameValueCollection == null)
            nameValueCollection = [];

        statusCode = 200;
        IMvcGridSharpDefinition grid = MvcGridDefinitionTable.GetDefinitionInterface(gridName);
        QueryOptions options = QueryStringParser.ParseOptions(grid, nameValueCollection);
        GridContext gridContext = MvcGridSharp.Utility.GridContextUtility.Create(/*context, */gridName, grid, options);

        GridEngine engine = new GridEngine();
        if (!engine.CheckAuthorization(gridContext))
        {
            //Forbidden
            statusCode = 403;
            return string.Empty;
        }

        IMvcGridSharpRenderingEngine renderingEngine = GridEngine.GetRenderingEngine(gridContext);

        // TODO: Reimplement this for csv exports and other rendering responses.
        //renderingEngine.PrepareResponse(context.Response);

        StringBuilder sb = new StringBuilder();
        TextWriter htmlWriter = new StringWriter(sb);
        engine.Run(renderingEngine, gridContext, htmlWriter);
        string html = sb.ToString();
        return html;
    }
    internal static string GenerateGrid(string gridName)
    {
        int statusCode = 0;
        NameValueCollection nameValueCollection = [];
        string html = GridHelpers.GenerateGrid(gridName, out statusCode, nameValueCollection);
        return html;
    }
}
