namespace MvcGridSharp.SignalR.Models;

public class SignalRGridSession
{
    public SignalRGridSession(string GridName)
    {
        this.GridName = GridName;
        this.Data = new SignalRCollection<object>(GridName);
        this.GridConnections = [];
    }
    public SignalRGridSession(string ConnectionId, string GridName)
    {
        this.ConnectionId = ConnectionId;
        this.GridName = GridName;
        this.Data = new SignalRCollection<object>(GridName);
        this.GridConnections = [];
    }

    public string ConnectionId { get; set; }
    public string GridName { get; set; }
    public SignalRCollection<dynamic> Data { get; set; }
    public List<string> GridConnections { get; set; }
}
