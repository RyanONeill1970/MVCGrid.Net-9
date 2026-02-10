namespace MvcGridSharp.Examples.Grids;

public static class GridTest
{
    public static MvcGridSharpBuilder<Person> Test()
    {

        ColumnDefaults colDefauls = new ColumnDefaults()
        {
            EnableSorting = true
        };

        return new MvcGridSharpBuilder<Person>(colDefauls)
            .WithAuthorizationType(AuthorizationType.AllowAnonymous)
            .WithSorting(sorting: true, defaultSortColumn: "Id", defaultSortDirection: SortDirection.Dsc)
            .WithPaging(paging: true, itemsPerPage: 10, allowChangePageSize: true, maxItemsPerPage: 100)
            .AddColumns(cols =>
            {
                cols.Add("Id").WithValueExpression((p, c) => p.Id.ToString())
                    .WithAllowChangeVisibility(true);
                cols.Add("FirstName").WithHeaderText("First Name")
                    .WithVisibility(true, true)
                    .WithValueExpression(p => p.FirstName);
                cols.Add("LastName").WithHeaderText("Last Name")
                    .WithVisibility(true, true)
                    .WithValueExpression(p => p.LastName);
                cols.Add("FullName").WithHeaderText("Full Name")
                    .WithValueTemplate("{Model.FirstName} {Model.LastName}")
                    .WithVisibility(visible: false, allowChangeVisibility: true)
                    .WithSorting(false);
                cols.Add("StartDate").WithHeaderText("Start Date")
                    .WithVisibility(visible: true, allowChangeVisibility: true)
                    .WithValueExpression(p => p.StartDate == null ? p.StartDate.ToShortDateString() : "");
                cols.Add("Status")
                    .WithSortColumnData("Active")
                    .WithVisibility(visible: true, allowChangeVisibility: true)
                    .WithHeaderText("Status")
                    .WithValueExpression(p => p.Active ? "Active" : "Inactive")
                    .WithCellCssClassExpression(p => p.Active ? "success" : "danger");
                cols.Add("Gender").WithValueExpression((p, c) => p.Gender)
                    .WithAllowChangeVisibility(true);
                cols.Add("Email")
                    .WithVisibility(visible: false, allowChangeVisibility: true)
                    .WithValueExpression(p => p.Email);
            })
            .WithRetrieveDataMethod((context) =>
            {
                QueryOptions queryOptions = context.QueryOptions;
                int pageIndex = queryOptions.PageIndex.Value;
                int pageSize = queryOptions.ItemsPerPage.Value;
                int totalCount = 120;
                List<Person> persons = [];
                
                // Create varied data to make sorting more visible
                string[] firstNames = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Helen"];
                string[] lastNames = ["Anderson", "Brown", "Clark", "Davis", "Evans", "Fisher", "Garcia", "Harris"];
                string[] genders = ["Male", "Female", "Other"];
                
                Random random = new Random(42); // Fixed seed for consistent data
                
                for (int x = 0; totalCount > x; x++)
                {
                    Person person = new Person()
                    {
                        Id = x,
                        FirstName = firstNames[x % firstNames.Length],
                        LastName = lastNames[(x / firstNames.Length) % lastNames.Length],
                        Active = x % 3 != 0, // Make some inactive
                        Email = $"person{x}@example.com",
                        Employee = x % 2 == 0,
                        Gender = genders[x % genders.Length],
                        StartDate = DateTime.Now.AddDays(-random.Next(0, 1000)), // Random dates in the past
                    };
                    persons.Add(person);
                }

                // Apply sorting before pagination
                if (!string.IsNullOrEmpty(queryOptions.SortColumnName))
                {
                    string sortColumn = queryOptions.SortColumnName;
                    bool isDescending = queryOptions.SortDirection == SortDirection.Dsc;

                    persons = sortColumn.ToLower() switch
                    {
                        "id" => isDescending ? persons.OrderByDescending(p => p.Id).ToList() : persons.OrderBy(p => p.Id).ToList(),
                        "firstname" => isDescending ? persons.OrderByDescending(p => p.FirstName).ToList() : persons.OrderBy(p => p.FirstName).ToList(),
                        "lastname" => isDescending ? persons.OrderByDescending(p => p.LastName).ToList() : persons.OrderBy(p => p.LastName).ToList(),
                        "startdate" => isDescending ? persons.OrderByDescending(p => p.StartDate).ToList() : persons.OrderBy(p => p.StartDate).ToList(),
                        "active" => isDescending ? persons.OrderByDescending(p => p.Active).ToList() : persons.OrderBy(p => p.Active).ToList(), // For Status column
                        "gender" => isDescending ? persons.OrderByDescending(p => p.Gender).ToList() : persons.OrderBy(p => p.Gender).ToList(),
                        "email" => isDescending ? persons.OrderByDescending(p => p.Email).ToList() : persons.OrderBy(p => p.Email).ToList(),
                        _ => persons // Default: no sorting if column not recognized
                    };
                }

                // Apply pagination after sorting
                persons = persons.Skip(pageIndex * pageSize).Take(pageSize).ToList();

                return new QueryResult<Person>()
                {
                    Items = persons,
                    TotalRecords = totalCount
                };
            });
    }

    public static SignalRMvcGridSharpBuilder Test2()
    {
        ColumnDefaults colDefauls = new ColumnDefaults()
        {
            EnableSorting = true
        };

        return new SignalRMvcGridSharpBuilder("TestGrid2", SignalRGridType.Individual, colDefauls)
            .WithAuthorizationType(AuthorizationType.AllowAnonymous)
            .WithSorting(sorting: true, defaultSortColumn: "Id", defaultSortDirection: SortDirection.Dsc)
            .WithPaging(paging: true, itemsPerPage: 10, allowChangePageSize: true, maxItemsPerPage: 100)
            .AddColumns(cols =>
            {
                cols.Add("Id").WithValueExpression((p, c) => p.Id.ToString())
                    .WithAllowChangeVisibility(true);
                cols.Add("FirstName").WithHeaderText("First Name")
                    .WithVisibility(true, true)
                    .WithValueExpression(p => p.FirstName);
                cols.Add("LastName").WithHeaderText("Last Name")
                    .WithVisibility(true, true)
                    .WithValueExpression(p => p.LastName);
                cols.Add("FullName").WithHeaderText("Full Name")
                    .WithValueTemplate("{Model.FirstName} {Model.LastName}")
                    .WithVisibility(visible: false, allowChangeVisibility: true)
                    .WithSorting(false);
                cols.Add("StartDate").WithHeaderText("Start Date")
                    .WithVisibility(visible: true, allowChangeVisibility: true)
                    .WithValueExpression(p => p.StartDate == null ? p.StartDate.ToShortDateString() : "");
                cols.Add("Status")
                    .WithSortColumnData("Active")
                    .WithVisibility(visible: true, allowChangeVisibility: true)
                    .WithHeaderText("Status")
                    .WithValueExpression(p => p.Active ? "Active" : "Inactive")
                    .WithCellCssClassExpression(p => p.Active ? "success" : "danger");
                cols.Add("Gender").WithValueExpression((p, c) => p.Gender)
                    .WithAllowChangeVisibility(true);
                cols.Add("Email")
                    .WithVisibility(visible: false, allowChangeVisibility: true)
                    .WithValueExpression(p => p.Email);
            })
            .WithRetrieveDataMethod((context) =>
            {
                QueryOptions queryOptions = context.QueryOptions;
                int pageIndex = queryOptions.PageIndex.Value;
                int pageSize = queryOptions.ItemsPerPage.Value;
                int totalCount = 120;
                List<Person> persons = [];
                
                // Create varied data to make sorting more visible
                string[] firstNames = { "Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Helen" };
                string[] lastNames = { "Anderson", "Brown", "Clark", "Davis", "Evans", "Fisher", "Garcia", "Harris" };
                string[] genders = { "Male", "Female", "Other" };
                
                Random random = new Random(42); // Fixed seed for consistent data
                
                for (int x = 0; totalCount > x; x++)
                {
                    Person person = new Person()
                    {
                        Id = x,
                        FirstName = firstNames[x % firstNames.Length],
                        LastName = lastNames[(x / firstNames.Length) % lastNames.Length],
                        Active = x % 3 != 0, // Make some inactive
                        Email = $"person{x}@example.com",
                        Employee = x % 2 == 0,
                        Gender = genders[x % genders.Length],
                        StartDate = DateTime.Now.AddDays(-random.Next(0, 1000)), // Random dates in the past
                    };
                    persons.Add(person);
                }

                // Apply sorting before pagination
                if (!string.IsNullOrEmpty(queryOptions.SortColumnName))
                {
                    string sortColumn = queryOptions.SortColumnName;
                    bool isDescending = queryOptions.SortDirection == SortDirection.Dsc;

                    persons = sortColumn.ToLower() switch
                    {
                        "id" => isDescending ? persons.OrderByDescending(p => p.Id).ToList() : persons.OrderBy(p => p.Id).ToList(),
                        "firstname" => isDescending ? persons.OrderByDescending(p => p.FirstName).ToList() : persons.OrderBy(p => p.FirstName).ToList(),
                        "lastname" => isDescending ? persons.OrderByDescending(p => p.LastName).ToList() : persons.OrderBy(p => p.LastName).ToList(),
                        "startdate" => isDescending ? persons.OrderByDescending(p => p.StartDate).ToList() : persons.OrderBy(p => p.StartDate).ToList(),
                        "active" => isDescending ? persons.OrderByDescending(p => p.Active).ToList() : persons.OrderBy(p => p.Active).ToList(), // For Status column
                        "gender" => isDescending ? persons.OrderByDescending(p => p.Gender).ToList() : persons.OrderBy(p => p.Gender).ToList(),
                        "email" => isDescending ? persons.OrderByDescending(p => p.Email).ToList() : persons.OrderBy(p => p.Email).ToList(),
                        _ => persons // Default: no sorting if column not recognized
                    };
                }

                // Apply pagination after sorting
                persons = persons.Skip(pageIndex * pageSize).Take(pageSize).ToList();

                // Convert to dynamic list for SignalR compatibility
                List<dynamic> dynamicPersons = persons.Cast<dynamic>().ToList();

                return new QueryResult<dynamic>()
                {
                    Items = dynamicPersons,
                    TotalRecords = totalCount
                };
            })
            .ToSignalRGrid();
    }
}
