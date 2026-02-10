// Type definitions for MvcGridSharp
// Project: MvcGridSharp
// Definitions by: TypeScript port of MvcGridSharp.js

declare enum SortDirection {
    Unspecified = 0,
    Asc = 1,
    Dsc = 2
}

declare enum RenderingMode {
    RenderingEngine = 0,
    Controller = 1
}

declare interface ColumnVisibility {
    columnName: string;
    visible: boolean;
    allow: boolean;
    headerText: string;
}

declare interface GridDefinition {
    name: string;
    preloaded: boolean;
    renderingMode: string; // This comes as a string from the server
    qsPrefix: string;
    pageParameters: Record<string, string>;
    clientLoading: string;
    clientLoadingComplete: string;
}

declare interface ClientData {
    columnVisibility: Record<string, ColumnVisibility>;
    filters: Record<string, string>;
    sortColumn: string;
    sortDirection: SortDirection;
    pageNumber: number;
    itemsPerPage: number;
    additionalQueryOptions: Record<string, string>;
}

declare interface QueryOptions {
    [key: string]: string | number | undefined;
    Name?: string;
    cols?: string;
    sort?: string;
    dir?: number;
    page?: number;
    pagesize?: number;
}

declare interface MvcGridSharpInstance {
    init(): void;
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
}

declare const MvcGridSharp: MvcGridSharpInstance;

declare global {
    interface Window {
        MvcGridSharp: MvcGridSharpInstance;
    }
}

export {
    SortDirection,
    RenderingMode,
    ColumnVisibility,
    GridDefinition,
    ClientData,
    QueryOptions,
    MvcGridSharpInstance
};