namespace MvcGridSharp.SignalR.Models;

public class SignalRCollection<T>
{
    public string GridName { get; set; }
    protected ObservableCollection<T> Collection { get; set; }
    protected List<T> ModifiedItems { get; set; }

    public void Set(IEnumerable<T> items)
    {
        Collection.Clear();
        Add(items);
    }
    public void Add(T item)
    {
        Collection.Add(item);
    }
    public int Count()
    {
        return Collection.Count;
    }
    public void Add(IEnumerable<T> items)
    {
        foreach (T item in items)
        {
            Add(item);
        }
    }
    public void Remove(T item)
    {
        Collection.Remove(item);
    }
    public List<T> ToList()
    {
        return Collection.ToList();
    }
    public SignalRCollection(string GridName)
    {
        this.ModifiedItems = [];
        this.Collection = [];
        this.Collection.CollectionChanged += OnCollectionChanged;
        this.GridName = GridName;
    }
    void OnCollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
    {
        if (e.NewItems != null)
        {
            foreach (T newItem in e.NewItems)
            {
                SignalRHelper.SendGridData(GridName, GridGenerationType.Row).GetAwaiter().GetResult();
                //ModifiedItems.Add(newItem);
                //newItem.PropertyChanged += this.OnItemPropertyChanged;
            }
        }

        if (e.OldItems != null)
        {
            foreach (T oldItem in e.OldItems)
            {
                //ModifiedItems.Add(oldItem);
                //oldItem.PropertyChanged -= this.OnItemPropertyChanged;
            }
        }
    }
    //void OnItemPropertyChanged(object sender, PropertyChangedEventArgs e)
    //{
    //    Item item = sender as Item;
    //    if (item != null)
    //        ModifiedItems.Add(item);
    //}
}
