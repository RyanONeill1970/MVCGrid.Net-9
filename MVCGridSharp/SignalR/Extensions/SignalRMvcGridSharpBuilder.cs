namespace MvcGridSharp.SignalR.Extensions;

public class SignalRMvcGridSharpBuilder : MvcGridSharpBuilder<dynamic>
{
    public SignalRMvcGridSharpBuilder(string gridName, SignalRGridType signalRGridType) : base()
    {
        InitializeSignalR(gridName, signalRGridType);
    }

    public SignalRMvcGridSharpBuilder(string gridName, SignalRGridType signalRGridType, GridDefaults gridDefaults) : base(gridDefaults, null)
    {
        InitializeSignalR(gridName, signalRGridType);
    }

    public SignalRMvcGridSharpBuilder(string gridName, SignalRGridType signalRGridType, ColumnDefaults columnDefaults) : base(null, columnDefaults)
    {
        InitializeSignalR(gridName, signalRGridType);
    }

    /// <summary>
    /// Indicates that this grid is a SignalR MvcGridSharp.
    /// </summary>
    /// <param name="gridName"></param>
    /// <returns></returns>
    public void InitializeSignalR(string gridName, SignalRGridType signalRGridType)
    {
        MvcGridSharpSignalR.SignalRGridSessions.TryAdd(gridName, new SignalRGridSession(gridName));
        this.WithRetrieveDataMethod((context) =>
        {
            QueryOptions queryOptions = context.QueryOptions;
            int pageIndex = queryOptions.PageIndex.Value;
            int pageSize = queryOptions.ItemsPerPage.Value;
            int totalCount = 0;

            List<dynamic> data = MvcGridSharpSignalR.SignalRGridSessions[context.GridName].Data.ToList();
            totalCount = data.Count;
            data = data.Skip(pageIndex * pageSize).Take(pageSize).ToList();

            return new QueryResult<dynamic>()
            {
                Items = data,
                TotalRecords = totalCount
            };
        });
    }
}
