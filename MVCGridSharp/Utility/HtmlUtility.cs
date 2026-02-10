namespace MvcGridSharp.Utility;

public class HtmlUtility
{
    public static string GetRootUrl()
    {
        return string.Empty;
        //HttpRequest httpRequest = HttpHelper.HttpContext.Request;
        //string applicationPath = $"{httpRequest.Scheme}://{httpRequest.Host.Value}";
        //return applicationPath;
    }

    public const string ContainerCssClass = "MvcGridSharpContainer";

    public static string GetContainerHtmlId(string name)
    {
        return String.Format("MvcGridSharpContainer_{0}", name);
    }

    public static string GetTableHolderHtmlId(string name)
    {
        return String.Format("MvcGridSharpTableHolder_{0}", name);
    }

    public static string GetTableHtmlId(string name)
    {
        return String.Format("MvcGridSharpTable_{0}", name);
    }

    public static string MakeCssClassStirng(HashSet<string> classes)
    {
        StringBuilder sb = new StringBuilder();

        foreach (var c in classes)
        {
            if (sb.Length > 0)
            {
                sb.Append(" ");
            }
            sb.Append(c);
        }
        return sb.ToString();
    }

    public static string MakeCssClassAttributeStirng(HashSet<string> classes)
    {
        if (classes == null || classes.Count == 0)
            return string.Empty;

        return String.Format(" class='{0}'", MakeCssClassStirng(classes));
    }

    public static string MakeCssClassAttributeStirng(string classString)
    {
        if (String.IsNullOrWhiteSpace(classString))
            return string.Empty;

        return String.Format(" class='{0}'", classString);
    }

    public static string MakeGotoPageLink(string gridName, int pageNum)
    {
        return String.Format("MvcGridSharp.setPage(\"{0}\", {1}); return false;", gridName, pageNum);
    }

    public static string MakeSortLink(string gridName, string columnName, MvcGridSharp.Models.SortDirection direction)
    {
        return String.Format("MvcGridSharp.setSort(\"{0}\", \"{1}\", \"{2}\"); return false;", gridName, columnName, direction.ToString());
    }

    public static string GetHandlerPath()
    {
        return "/MvcGridSharpHandler.axd";
    }
    public static string GetHandlerPath(string rootUrl)
    {
        return rootUrl + GetHandlerPath();
    }
}
