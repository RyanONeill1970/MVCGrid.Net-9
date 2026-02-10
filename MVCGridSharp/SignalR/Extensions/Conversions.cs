namespace MvcGridSharp.SignalR.Extensions;

public static class Conversions
{
    public static SignalRMvcGridSharpBuilder ToSignalRGrid(this MvcGridSharpBuilder<dynamic> builder)
    {
        return (SignalRMvcGridSharpBuilder)builder;
    }
}
