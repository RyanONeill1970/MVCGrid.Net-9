namespace MvcGridSharp.SignalR;

public class MvcGridSharpSignalR : Hub
{
    public static ConcurrentDictionary<string, SignalRGridSession> SignalRGridSessions = new ConcurrentDictionary<string, SignalRGridSession>();

    public override Task OnConnectedAsync()
    {
        string connectionId = this.Context.ConnectionId;
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception exception)
    {
        string connectionId = this.Context.ConnectionId;
        for (int x = 0; SignalRGridSessions.Count > x; x++)
        {
            KeyValuePair<string, SignalRGridSession> session = SignalRGridSessions.ElementAt(x);
            session.Value.GridConnections.Remove(connectionId);
        }
        return base.OnDisconnectedAsync(exception);
    }

    public async Task Message(string gridName, string state, string html = "")
    {
        string connectionId = this.Context.ConnectionId;
        switch (state)
        {
            case "INIT":
                {
                    SignalRGridSessions[gridName].GridConnections.Add(connectionId);
                    break;
                }
            case "STOP":
                {

                    break;
                }
            case "UPDATE":
                {

                    break;
                }
        }
    }
}
