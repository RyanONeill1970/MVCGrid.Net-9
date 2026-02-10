namespace MvcGridSharp.Models;

public class QueryResult<T1>
{
    public int? TotalRecords { get; set; }
    public IEnumerable<T1> Items { get; set; }
    public static QueryResult<T1> Empty()
    {
        QueryResult<T1> queryResult = new QueryResult<T1>();
        queryResult.TotalRecords = 0;
        queryResult.Items = default(IEnumerable<T1>);
        return queryResult;
    }
}
