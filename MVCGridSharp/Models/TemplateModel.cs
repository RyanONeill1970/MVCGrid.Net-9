namespace MvcGridSharp.Models;

public class TemplateModel
{
    public TemplateModel()
    {
    }

    public string Value { get; set; }

    public IMvcGridSharpColumn GridColumn { get; set; }
    public dynamic Item { get; set; }
    public GridContext GridContext { get; set; }
    public Row Row { get; set; }
}
