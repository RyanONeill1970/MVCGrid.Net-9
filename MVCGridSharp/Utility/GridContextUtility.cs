namespace MvcGridSharp.Utility;

public partial class GridContextUtility
{
    internal static GridContext Create(/*HttpContext context, */string gridName, IMvcGridSharpDefinition grid, QueryOptions options)
    {
        //var httpContext = new HttpContextWrapper(context);
        var gridContext = new GridContext()
        {
            GridName = gridName,
            //CurrentHttpContext = context,
            GridDefinition = grid,
            QueryOptions = options,
        };

        return gridContext;
    }
}
