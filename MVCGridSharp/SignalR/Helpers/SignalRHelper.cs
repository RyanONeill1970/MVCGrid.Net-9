namespace MvcGridSharp.SignalR.Helpers;

public class SignalRHelper
{
    private static IHubContext<MvcGridSharpSignalR> _hubContext;
    public static void Configure(IHubContext<MvcGridSharpSignalR> hubContext)
    {
        _hubContext = hubContext;
    }

    public static async Task SendGridData(string gridName, GridGenerationType gridGenerationType)
    {
        SignalRGridSession session = MvcGridSharpSignalR.SignalRGridSessions[gridName];
        List<string> connectionIds = session.GridConnections;

        SignalRGridResponse signalrGridResponse = SignalRGridHelpers.GenerateSignalRGrid(gridName, gridGenerationType);
        string json = JsonConvert.SerializeObject(signalrGridResponse);
        await _hubContext.Clients.Clients(connectionIds).SendCoreAsync("Message", new object[] { json });
    }
}
