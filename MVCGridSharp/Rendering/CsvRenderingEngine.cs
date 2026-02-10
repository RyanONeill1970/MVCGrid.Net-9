namespace MvcGridSharp.Rendering;

public class CsvRenderingEngine : IMvcGridSharpRenderingEngine
{
    public bool AllowsPaging
    {
        get { return false; }
    }

    public virtual string GetFilename()
    {
        return "export.csv";
    }

    public virtual void PrepareResponse(HttpResponse httpResponse)
    {
        httpResponse.Clear();
        httpResponse.ContentType = "text/csv";
        httpResponse.Headers.Add("content-disposition", "attachment; filename=\"" + GetFilename() + "\"");
        //httpResponse.BufferOutput = false;
    }

    public void Render(Models.RenderingModel model, Models.GridContext gridContext, TextWriter outputStream)
    {
        var sw = outputStream;

        StringBuilder sbHeaderRow = new StringBuilder();
        foreach (var col in model.Columns)
        {
            if (sbHeaderRow.Length != 0)
            {
                sbHeaderRow.Append(",");
            }
            sbHeaderRow.Append(CsvEncode(col.Name));
        }
        sbHeaderRow.AppendLine();
        sw.Write(sbHeaderRow.ToString());

        foreach (var item in model.Rows)
        {
            StringBuilder sbRow = new StringBuilder();
            foreach (var col in model.Columns)
            {
                var cell = item.Cells[col.Name];

                if (sbRow.Length != 0)
                {
                    sbRow.Append(",");
                }

                string val = cell.PlainText;

                sbRow.Append(CsvEncode(val));
            }
            sbRow.AppendLine();
            sw.Write(sbRow.ToString());
        }

    }

    private string CsvEncode(string s)
    {
        if (String.IsNullOrWhiteSpace(s))
        {
            return "\"\"";
        }

        string esc = s.Replace("\"", "\"\"");

        return String.Format("\"{0}\"", esc);
    }


    public void RenderContainer(Models.ContainerRenderingModel model, TextWriter outputStream)
    {
        throw new NotImplementedException("Csv Rendering Engine has no container");
    }
}
