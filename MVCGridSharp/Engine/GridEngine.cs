namespace MvcGridSharp.Engine;

public class GridEngine
{
    private static readonly Encoding LocalEncoding = Encoding.UTF8;

    public static IMvcGridSharpRenderingEngine GetRenderingEngine(GridContext gridContext)
    {
        IMvcGridSharpRenderingEngine renderingEngine = null;

        if (!String.IsNullOrWhiteSpace(gridContext.QueryOptions.RenderingEngineName))
        {
            foreach (KeyValuePair<string, RenderingEngine> configuredEngine in gridContext.GridDefinition.RenderingEngines)
            {
                if (String.Compare(gridContext.QueryOptions.RenderingEngineName, configuredEngine.Value.Name, true) == 0)
                {
                    string engineName = gridContext.QueryOptions.RenderingEngineName;

                    string typeString = gridContext.GridDefinition.RenderingEngines[engineName].Type;
                    Type engineType = Type.GetType(typeString, true);

                    renderingEngine = (IMvcGridSharpRenderingEngine)Activator.CreateInstance(engineType, true);
                }
            }
        }

        if (renderingEngine == null)
        {
            renderingEngine = GetRenderingEngineInternal(gridContext.GridDefinition);
        }

        return renderingEngine;
    }

    internal static IMvcGridSharpRenderingEngine GetRenderingEngineInternal(IMvcGridSharpDefinition gridDefinition)
    {
        string engineName = gridDefinition.DefaultRenderingEngineName;

        if (gridDefinition.RenderingEngines[engineName] == null)
        {
            throw new Exception(string.Format("The requested default rendering engine '{0}' was not found.", engineName));
        }

        string typeString = gridDefinition.RenderingEngines[engineName].Type;
        Type engineType = Type.GetType(typeString, true);
        IMvcGridSharpRenderingEngine renderingEngine = (IMvcGridSharpRenderingEngine)Activator.CreateInstance(engineType, true);
        return renderingEngine;
    }

    public void Run(IMvcGridSharpRenderingEngine renderingEngine, GridContext gridContext, TextWriter outputStream)
    {
        if (!renderingEngine.AllowsPaging)
        {
            gridContext.QueryOptions.ItemsPerPage = null;
        }

        var model = GenerateModel(gridContext);

        renderingEngine.Render(model, gridContext, outputStream);
    }

    public RenderingModel GenerateModel(GridContext gridContext)
    {
        int? totalRecords;
        var rows = ((GridDefinitionBase)gridContext.GridDefinition).GetData(gridContext, out totalRecords);

        // if a page was requested higher than available pages, requery for first page
        if (rows.Count == 0 && totalRecords.HasValue && totalRecords.Value > 0)
        {
            gridContext.QueryOptions.PageIndex = 0;
            rows = ((GridDefinitionBase)gridContext.GridDefinition).GetData(gridContext, out totalRecords);
        }

        var model = PrepModel(totalRecords, rows, gridContext);
        return model;
    }

    private RenderingModel PrepModel(int? totalRecords, List<Row> rows, MvcGridSharp.Models.GridContext gridContext)
    {
        RenderingModel model = new RenderingModel();
        string rootUrl = HtmlUtility.GetRootUrl();
        model.HandlerPath = HtmlUtility.GetHandlerPath(rootUrl);
        model.TableHtmlId = HtmlUtility.GetTableHtmlId(gridContext.GridName);

        PrepColumns(gridContext, model);
        model.Rows = rows;

        if (model.Rows.Count == 0)
        {
            model.NoResultsMessage = gridContext.GridDefinition.NoResultsMessage;
        }

        model.NextButtonCaption = gridContext.GridDefinition.NextButtonCaption;
        model.PreviousButtonCaption = gridContext.GridDefinition.PreviousButtonCaption;
        model.SummaryMessage = gridContext.GridDefinition.SummaryMessage;
        model.ProcessingMessage = gridContext.GridDefinition.ProcessingMessage;

        model.PagingModel = null;
        if (gridContext.QueryOptions.ItemsPerPage.HasValue)
        {
            model.PagingModel = new PagingModel();

            int currentPageIndex = gridContext.QueryOptions.PageIndex.Value;

            model.PagingModel.TotalRecords = totalRecords.Value;

            model.PagingModel.FirstRecord = (currentPageIndex * gridContext.QueryOptions.ItemsPerPage.Value) + 1;
            if (model.PagingModel.FirstRecord > model.PagingModel.TotalRecords)
            {
                model.PagingModel.FirstRecord = model.PagingModel.TotalRecords;
            }
            model.PagingModel.LastRecord = model.PagingModel.FirstRecord + gridContext.QueryOptions.ItemsPerPage.Value - 1;
            if (model.PagingModel.LastRecord > model.PagingModel.TotalRecords)
            {
                model.PagingModel.LastRecord = model.PagingModel.TotalRecords;
            }
            model.PagingModel.CurrentPage = currentPageIndex + 1;

            var numberOfPagesD = (model.PagingModel.TotalRecords + 0.0) / (gridContext.QueryOptions.ItemsPerPage.Value + 0.0);
            model.PagingModel.NumberOfPages = (int)Math.Ceiling(numberOfPagesD);

            for (int i = 1; i <= model.PagingModel.NumberOfPages; i++)
            {
                model.PagingModel.PageLinks.Add(i, HtmlUtility.MakeGotoPageLink(gridContext.GridName, i));
            }
        }

        model.ClientDataTransferHtmlBlock = MvcGridSharpHtmlGenerator.GenerateClientDataTransferHtml(gridContext);

        return model;
    }

    private void PrepColumns(GridContext gridContext, RenderingModel model)
    {
        foreach (var col in gridContext.GetVisibleColumns())
        {
            Column renderingColumn = new Column();
            model.Columns.Add(renderingColumn);
            renderingColumn.Name = col.ColumnName;
            renderingColumn.HeaderText = col.HeaderText;

            if (gridContext.GridDefinition.Sorting && col.EnableSorting)
            {
                SortDirection linkDirection;
                SortDirection iconDirection;

                if (gridContext.QueryOptions.SortColumnName == col.ColumnName && gridContext.QueryOptions.SortDirection == SortDirection.Asc)
                {
                    iconDirection = SortDirection.Asc;
                    linkDirection = SortDirection.Dsc;
                }
                else if (gridContext.QueryOptions.SortColumnName == col.ColumnName && gridContext.QueryOptions.SortDirection == SortDirection.Dsc)
                {
                    iconDirection = SortDirection.Dsc;
                    linkDirection = SortDirection.Asc;
                }
                else
                {
                    iconDirection = SortDirection.Unspecified;
                    linkDirection = SortDirection.Asc;
                }

                renderingColumn.Onclick = HtmlUtility.MakeSortLink(gridContext.GridName, col.ColumnName, linkDirection);
                renderingColumn.SortIconDirection = iconDirection;
            }
        }
    }

    public string GetBasePageHtml(string gridName, IMvcGridSharpDefinition grid, object pageParameters)
    {
        string preload = "";
        if (grid.QueryOnPageLoad && grid.PreloadData)
        {
            try
            {
                preload = RenderPreloadedGridHtml(grid, gridName, pageParameters);
            }
            catch (Exception ex)
            {
                bool showDetails = ConfigUtility.GetShowErrorDetailsSetting();

                if (showDetails)
                {
                    string detail = "<div class='alert alert-danger'>";
                    detail += HttpUtility.HtmlEncode(ex.ToString()).Replace("\r\n", "<br />");
                    detail += "</div>";

                    preload = detail;
                }
                else
                {
                    preload = grid.ErrorMessageHtml;
                }
            }
        }

        string rootUrl = HtmlUtility.GetRootUrl();
        string baseGridHtml = MvcGridSharpHtmlGenerator.GenerateBasePageHtml(gridName, grid, pageParameters, HtmlUtility.GetHandlerPath(rootUrl));
        baseGridHtml = baseGridHtml.Replace("%%PRELOAD%%", preload);

        ContainerRenderingModel containerRenderingModel = new ContainerRenderingModel() { InnerHtmlBlock = baseGridHtml };

        string html = RenderContainerHtml(grid, gridName, containerRenderingModel);

        return html;
    }

    private static string RenderContainerHtml(IMvcGridSharpDefinition grid, string gridName, ContainerRenderingModel containerRenderingModel)
    {
        string container = containerRenderingModel.InnerHtmlBlock;
        switch (grid.RenderingMode)
        {
            case RenderingMode.RenderingEngine:
                var renderingEngine = GetRenderingEngineInternal(grid);
                container = RenderContainerUsingRenderingEngine(grid, containerRenderingModel);
                break;
            case RenderingMode.Controller:
                if (!String.IsNullOrWhiteSpace(grid.ContainerViewPath))
                {
                    container = RenderContainerUsingController(grid, containerRenderingModel);
                }
                break;
            default:
                throw new InvalidOperationException();
        }

        if (!container.Contains(containerRenderingModel.InnerHtmlBlock))
        {
            throw new Exception("When rendering a container, you must output Model.InnerHtmlBlock inside the container (Raw).");
        }

        return container;
    }

    private static string RenderPreloadedGridHtml(IMvcGridSharpDefinition grid, string gridName, object pageParameters)
    {
        string preload = string.Empty;

        var options = QueryStringParser.ParseOptions(grid, HttpHelper.HttpContext.Request.ToNameValueCollection());

        // set the page parameters for the preloaded grid
        Dictionary<string, string> pageParamsDict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (pageParameters != null)
        {
            foreach (PropertyDescriptor descriptor in TypeDescriptor.GetProperties(pageParameters))
            {
                object obj2 = descriptor.GetValue(pageParameters);
                pageParamsDict.Add(descriptor.Name, obj2.ToString());
            }
        }
        if (grid.PageParameterNames.Count > 0)
        {
            foreach (var aqon in grid.PageParameterNames)
            {
                string val = "";

                if (pageParamsDict.ContainsKey(aqon))
                {
                    val = pageParamsDict[aqon];
                }

                options.PageParameters[aqon] = val;
            }
        }

        var gridContext = GridContextUtility.Create(/*HttpContext.Current,*/ gridName, grid, options);

        GridEngine engine = new GridEngine();

        switch (grid.RenderingMode)
        {
            case RenderingMode.RenderingEngine:
                preload = RenderUsingRenderingEngine(engine, gridContext);
                break;
            // TODO: Enable support for controller rendering
            //case Models.RenderingMode.Controller:
            //    preload = RenderUsingController(engine, gridContext);
            //    break;
            default:
                throw new InvalidOperationException();
        }
        return preload;
    }

    private static string RenderUsingController(GridEngine engine, GridContext gridContext)
    {
        return string.Empty;
        //var model = engine.GenerateModel(gridContext);

        //var controllerContext = helper.ViewContext.Controller.ControllerContext;
        //ViewDataDictionary vdd = new ViewDataDictionary(model);
        //TempDataDictionary tdd = new TempDataDictionary();
        //using (var sw = new StringWriter())
        //{
        //    var viewResult = ViewEngines.Engines.FindPartialView(controllerContext,
        //                                                             gridContext.GridDefinition.ViewPath);
        //    var viewContext = new ViewContext(controllerContext, viewResult.View, vdd, tdd, sw);
        //    viewResult.View.Render(viewContext, sw);
        //    viewResult.ViewEngine.ReleaseView(controllerContext, viewResult.View);
        //    return sw.GetStringBuilder().ToString();
        //}
    }

    private static string RenderUsingRenderingEngine(GridEngine engine, GridContext gridContext)
    {
        IMvcGridSharpRenderingEngine renderingEngine = GetRenderingEngine(gridContext);

        using (MemoryStream ms = new MemoryStream())
        {
            using (TextWriter tw = new StreamWriter(ms))
            {
                engine.Run(renderingEngine, gridContext, tw);
            }

            string result = LocalEncoding.GetString(ms.ToArray());
            return result;
        }
    }

    private static string RenderContainerUsingController(IMvcGridSharpDefinition gridDefinition, ContainerRenderingModel model)
    {
        return string.Empty;
        //var controllerContext = helper.ViewContext.Controller.ControllerContext;
        //ViewDataDictionary vdd = new ViewDataDictionary(model);
        //TempDataDictionary tdd = new TempDataDictionary();
        //using (var sw = new StringWriter())
        //{
        //    var viewResult = ViewEngines.Engines.FindPartialView(controllerContext,
        //                                                             gridDefinition.ContainerViewPath);
        //    var viewContext = new ViewContext(controllerContext, viewResult.View, vdd, tdd, sw);
        //    viewResult.View.Render(viewContext, sw);
        //    viewResult.ViewEngine.ReleaseView(controllerContext, viewResult.View);
        //    return sw.GetStringBuilder().ToString();
        //}
    }

    private static string RenderContainerUsingRenderingEngine(IMvcGridSharpDefinition gridDefinition, ContainerRenderingModel model)
    {
        IMvcGridSharpRenderingEngine renderingEngine = GetRenderingEngineInternal(gridDefinition);

        using (MemoryStream ms = new MemoryStream())
        {
            using (TextWriter tw = new StreamWriter(ms))
            {
                renderingEngine.RenderContainer(model, tw);
            }

            return LocalEncoding.GetString(ms.ToArray());
        }
    }

    public bool CheckAuthorization(GridContext gridContext)
    {
        bool allowAccess = false;

        switch (gridContext.GridDefinition.AuthorizationType)
        {
            case AuthorizationType.AllowAnonymous:
                allowAccess = true;
                break;
            case AuthorizationType.Authorized:
                allowAccess = HttpHelper.HttpContext.User.Identity.IsAuthenticated;
                break;
            default:
                throw new Exception("Unsupported AuthorizationType");
        }

        return allowAccess;
    }
}
