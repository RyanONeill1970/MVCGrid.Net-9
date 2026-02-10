declare enum SortDirection {
    Unspecified = 0,
    Asc = 1,
    Dsc = 2
}
declare enum RenderingMode {
    RenderingEngine = 0,
    Controller = 1
}
interface ColumnVisibility {
    columnName: string;
    visible: boolean;
    allow: boolean;
    headerText: string;
}
interface GridDefinition {
    name: string;
    preloaded: boolean;
    renderingMode: string;
    qsPrefix: string;
    pageParameters: Record<string, string>;
    clientLoading: string;
    clientLoadingComplete: string;
}
interface ClientData {
    columnVisibility: Record<string, ColumnVisibility>;
    filters: Record<string, string>;
    sortColumn: string;
    sortDirection: SortDirection;
    pageNumber: number;
    itemsPerPage: number;
    additionalQueryOptions: Record<string, string>;
}
interface QueryOptions {
    [key: string]: string | number | undefined;
    Name?: string;
    cols?: string;
    sort?: string;
    dir?: number;
    page?: number;
    pagesize?: number;
}
interface AjaxSettings {
    method: string;
    headers?: Record<string, string>;
    body?: string;
}
declare class MvcGridSharpClass {
    private handlerPath;
    private controllerPath;
    private showErrorDetails;
    private currentGrids;
    private queryOptions;
    init(): void;
    /**
     * Ensures queryOptions is initialized for the given grid name
     */
    private ensureQueryOptions;
    private findGridDef;
    private applyBoundFilters;
    private loadBoundFilters;
    private applyAdditionalQueryOptions;
    private loadAdditionalQueryOptions;
    private getGridName;
    private bindToolbarEvents;
    private getClientData;
    getColumnVisibility(mvcGridSharpName: string): Record<string, ColumnVisibility>;
    setColumnVisibility(mvcGridSharpName: string, obj: Record<string, boolean>): void;
    getFilters(mvcGridSharpName: string): Record<string, string>;
    setFilters(mvcGridSharpName: string, obj: Record<string, string>): void;
    getSortColumn(mvcGridSharpName: string): string;
    getSortDirection(mvcGridSharpName: string): SortDirection;
    setSort(mvcGridSharpName: string, sortColumn: string, sortDirection: SortDirection): void;
    getPage(mvcGridSharpName: string): number;
    setPage(mvcGridSharpName: string, pageNumber: number): void;
    getPageSize(mvcGridSharpName: string): number;
    setPageSize(mvcGridSharpName: string, pageSize: number): void;
    getAdditionalQueryOptions(mvcGridSharpName: string): Record<string, string>;
    setAdditionalQueryOptions(mvcGridSharpName: string, obj: Record<string, string>): void;
    reloadGrid(mvcGridSharpName: string): void;
    getExportUrl(mvcGridSharpName: string): string;
    getEngineExportUrl(mvcGridSharpName: string, engineName: string): string;
    private updateURLParameter;
}
declare const MvcGridSharp: MvcGridSharpClass;
