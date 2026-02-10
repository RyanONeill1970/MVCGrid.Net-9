namespace MvcGridSharp.Web;

public class MvcGridSharpController : Controller
{
    public IActionResult Grid()
    {
        string gridName = HttpContext.Request.Query["Name"];
        IMvcGridSharpDefinition grid = MvcGridDefinitionTable.GetDefinitionInterface(gridName);
        QueryOptions options = QueryStringParser.ParseOptions(grid, HttpHelper.HttpContext.Request.ToNameValueCollection());
        GridContext gridContext = GridContextUtility.Create(/*context, */gridName, grid, options);

        GridEngine engine = new GridEngine();
        if (!engine.CheckAuthorization(gridContext))
        {
            return new StatusCodeResult(403);
        }

        var renderingModel = engine.GenerateModel(gridContext);
        return PartialView(grid.ViewPath, renderingModel);
    }
}
