namespace MvcGridSharp.SignalR.Helpers;

public class SignalRGridHelpers
{
    internal static SignalRGridResponse GenerateSignalRGrid(string gridName, GridGenerationType type)
    {
        string html = string.Empty;
        string summaryhtml = string.Empty;
        int statusCode = 0;
        NameValueCollection nameValueCollection = [];
        html = GridHelpers.GenerateGrid(gridName, out statusCode, nameValueCollection);

        if (type == GridGenerationType.Row)
        {
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            List<HtmlNode> trNodes = doc.DocumentNode.Descendants("tr").ToList();
            HtmlNode trNode = trNodes.LastOrDefault();
            HtmlNode summaryNode = doc.GetElementbyId($"MvcGridTable_{gridName}_Summary");

            if (trNode != null)
            {
                html = trNode.OuterHtml;
                if (html.Contains("noresults") == true)
                    html = string.Empty;
            }
            if (summaryNode != null)
            {
                summaryhtml = summaryNode.OuterHtml;
            }
        }

        return new SignalRGridResponse()
        {
            Type = Enum.GetName(typeof(GridGenerationType), type),
            Gridname = gridName,
            Html = html,
            SummaryHtml = summaryhtml,
        };
    }
}
