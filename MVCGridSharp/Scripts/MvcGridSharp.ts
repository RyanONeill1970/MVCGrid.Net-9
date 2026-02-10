// TypeScript definitions for MvcGridSharp

enum SortDirection {
    Unspecified = 0,
    Asc = 1,
    Dsc = 2
}

enum RenderingMode {
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
    renderingMode: string; // This comes as a string from the server
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

class MvcGridSharpClass {
    private handlerPath: string = '%%HANDLERPATH%%';
    private controllerPath: string = '%%CONTROLLERPATH%%';
    private showErrorDetails: boolean = false; // TODO: Enable or remove injection of this value from C# - %%ERRORDETAILS%%;
    private currentGrids: GridDefinition[] = [];
    private queryOptions: Record<string, QueryOptions> = {};

    public init(): void {
        console.log('MvcGridSharp.init() called');
        
        const containers = document.querySelectorAll('.MvcGridSharpContainer');
        console.log(`Found ${containers.length} grid containers`);
        
        containers.forEach((element, index) => {
            console.log(`Processing container ${index}:`, element);
            
            const nameInput = element.querySelector("input[name='MvcGridSharpName']") as HTMLInputElement;
            if (nameInput) {
                const mvcGridSharpName = nameInput.value;
                console.log(`Found grid name: ${mvcGridSharpName}`);
                
                const jsonDataElement = document.getElementById(`MvcGridSharp_${mvcGridSharpName}_JsonData`);
                console.log(`Looking for JSON data element: MvcGridSharp_${mvcGridSharpName}_JsonData`, jsonDataElement);
                
                const jsonData = jsonDataElement?.innerHTML;
                if (jsonData) {
                    console.log(`Found JSON data for ${mvcGridSharpName}:`, jsonData);
                    try {
                        const gridDef = JSON.parse(jsonData) as GridDefinition;
                        this.currentGrids.push(gridDef);
                        this.queryOptions[mvcGridSharpName] = {};
                        console.log(`Successfully initialized grid: ${mvcGridSharpName}`);
                    } catch (error) {
                        console.error(`Error parsing JSON data for ${mvcGridSharpName}:`, error);
                    }
                } else {
                    console.warn(`No JSON data found for grid: ${mvcGridSharpName}`);
                }
            } else {
                console.warn('No MvcGridSharpName input found in container', element);
            }
        });

        console.log(`Total grids loaded: ${this.currentGrids.length}`, this.currentGrids);

        for (let i = 0; i < this.currentGrids.length; i++) {
            const obj = this.currentGrids[i];
            if (!obj.preloaded) {
                console.log(`Reloading non-preloaded grid: ${obj.name}`);
                this.reloadGrid(obj.name);
            }
        }

        this.bindToolbarEvents();
    }

    /**
     * Ensures queryOptions is initialized for the given grid name
     */
    private ensureQueryOptions(mvcGridSharpName: string): void {
        if (!this.queryOptions[mvcGridSharpName]) {
            this.queryOptions[mvcGridSharpName] = {};
            console.log(`Initialized queryOptions for grid: ${mvcGridSharpName}`);
        }
    }

    private findGridDef(mvcGridSharpName: string): GridDefinition | undefined {
        const gridDef = this.currentGrids.find(obj => obj.name === mvcGridSharpName);

        if (!gridDef) {
            console.warn(`Grid not found: ${mvcGridSharpName}. Available grids:`, this.currentGrids.map(g => g.name));
        }

        return gridDef;
    }

    private applyBoundFilters(mvcGridSharpName: string): void {
        const filters: Record<string, string> = {};

        const filterElements = document.querySelectorAll("[data-mvcgridsharp-type='filter']");
        filterElements.forEach((element) => {
            const gridName = this.getGridName(element);
            
            if (gridName === mvcGridSharpName) {
                const option = element.getAttribute('data-mvcgridsharp-option');
                const inputElement = element as HTMLInputElement | HTMLSelectElement;
                const val = inputElement.value;

                if (option) {
                    filters[option] = val;
                }
            }
        });

        this.setFilters(mvcGridSharpName, filters);
    }

    private loadBoundFilters(): void {
        const filterElements = document.querySelectorAll("[data-mvcgridsharp-type='filter']");
        filterElements.forEach((element) => {
            const gridName = this.getGridName(element);
            const option = element.getAttribute('data-mvcgridsharp-option');

            if (option) {
                const val = this.getFilters(gridName)[option];
                const inputElement = element as HTMLInputElement | HTMLSelectElement;
                inputElement.value = val || '';
            }
        });
    }

    private applyAdditionalQueryOptions(mvcGridSharpName: string): void {
        const options: Record<string, string> = {};
        
        const additionalElements = document.querySelectorAll("[data-mvcgridsharp-type='additionalQueryOption']");
        additionalElements.forEach((element) => {
            const gridName = this.getGridName(element);

            if (gridName === mvcGridSharpName) {
                const option = element.getAttribute('data-mvcgridsharp-option');
                const inputElement = element as HTMLInputElement | HTMLSelectElement;
                const val = inputElement.value;

                if (option) {
                    options[option] = val;
                }
            }
        });

        this.setAdditionalQueryOptions(mvcGridSharpName, options);
    }

    private loadAdditionalQueryOptions(): void {
        const additionalElements = document.querySelectorAll("[data-mvcgridsharp-type='additionalQueryOption']");
        additionalElements.forEach((element) => {
            const gridName = this.getGridName(element);
            const option = element.getAttribute('data-mvcgridsharp-option');

            if (option) {
                const val = this.getAdditionalQueryOptions(gridName)[option];
                const inputElement = element as HTMLInputElement | HTMLSelectElement;
                inputElement.value = val || '';
            }
        });
    }

    private getGridName(element: Element): string {
        let gridName = this.currentGrids[0]?.name || '';
        const nameAttr = element.getAttribute('data-mvcgridsharp-name');
        
        if (nameAttr !== null) {
            gridName = nameAttr;
        }
        
        return gridName;
    }

    private bindToolbarEvents(): void {
        this.loadBoundFilters();
        this.loadAdditionalQueryOptions();

        const applyFilterElements = document.querySelectorAll("[data-mvcgridsharp-apply-filter]");
        applyFilterElements.forEach((element) => {
            const eventName = element.getAttribute("data-mvcgridsharp-apply-filter");

            if (eventName) {
                element.addEventListener(eventName, () => {
                    const gridName = this.getGridName(element);
                    this.applyBoundFilters(gridName);
                });
            }
        });

        const applyAdditionalElements = document.querySelectorAll("[data-mvcgridsharp-apply-additional]");
        applyAdditionalElements.forEach((element) => {
            const eventName = element.getAttribute("data-mvcgridsharp-apply-additional");

            if (eventName) {
                element.addEventListener(eventName, () => {
                    const gridName = this.getGridName(element);
                    this.applyAdditionalQueryOptions(gridName);
                });
            }
        });

        const exportElements = document.querySelectorAll("[data-mvcgridsharp-type='export']");
        exportElements.forEach((element) => {
            element.addEventListener('click', () => {
                const gridName = this.getGridName(element);
                window.location.href = this.getExportUrl(gridName);
            });
        });

        const pageSizeElements = document.querySelectorAll("[data-mvcgridsharp-type='pageSize']");
        pageSizeElements.forEach((element) => {
            const selectElement = element as HTMLSelectElement;
            const gridName = this.getGridName(element);
            
            selectElement.value = this.getPageSize(gridName).toString();

            selectElement.addEventListener('change', () => {
                const gridName = this.getGridName(element);
                const pageSize = parseInt(selectElement.value, 10);
                this.setPageSize(gridName, pageSize);
            });
        });

        const columnVisibilityElements = document.querySelectorAll("[data-mvcgridsharp-type='columnVisibilityList']");
        columnVisibilityElements.forEach((element) => {
            const listElement = element as HTMLElement;
            const gridName = this.getGridName(listElement);
            const colVis = this.getColumnVisibility(gridName);

            Object.keys(colVis).forEach((colName: string) => {
                const col = colVis[colName];

                if (!col.visible && !col.allow) {
                    return;
                }

                let html = `<li><a><label><input type="checkbox" name="${gridName}cols" value="${colName}"`;
                
                if (col.visible) {
                    html += ' checked';
                }
                if (!col.allow) {
                    html += ' disabled';
                }
                
                html += `> ${col.headerText}</label></a></li>`;
                listElement.insertAdjacentHTML('beforeend', html);
            });

            // Add event listeners to checkboxes after they're created
            const checkboxes = document.querySelectorAll(`input:checkbox[name='${gridName}cols']`);
            checkboxes.forEach((checkbox) => {
                checkbox.addEventListener('change', () => {
                    const jsonData: Record<string, boolean> = {};
                    const closestUl = (checkbox as HTMLElement).closest('ul');
                    const gridName = this.getGridName(closestUl!);

                    const checkedBoxes = document.querySelectorAll(`input:checkbox[name='${gridName}cols']:checked`);
                    checkedBoxes.forEach((checkedBox) => {
                        const inputElement = checkedBox as HTMLInputElement;
                        const columnName = inputElement.value;
                        jsonData[columnName] = true;
                    });
                    
                    this.setColumnVisibility(gridName, jsonData);
                });
            });
        });
    }

    private getClientData(mvcGridSharpName: string): ClientData {
        const jsonDataElement = document.getElementById(`MvcGridSharp_${mvcGridSharpName}_ContextJsonData`);
        const jsonData = jsonDataElement?.innerHTML || '{}';
        return JSON.parse(jsonData) as ClientData;
    }

    public getColumnVisibility(mvcGridSharpName: string): Record<string, ColumnVisibility> {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.columnVisibility;
    }

    public setColumnVisibility(mvcGridSharpName: string, obj: Record<string, boolean>): void {
        this.ensureQueryOptions(mvcGridSharpName);
        let colString = '';
        
        Object.keys(obj).forEach(k => {
            if (obj[k]) {
                if (colString !== '') colString += ',';
                colString += k;
            }
        });

        this.queryOptions[mvcGridSharpName].cols = colString;
        this.reloadGrid(mvcGridSharpName);
    }

    public getFilters(mvcGridSharpName: string): Record<string, string> {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.filters;
    }

    public setFilters(mvcGridSharpName: string, obj: Record<string, string>): void {
        this.setAdditionalQueryOptions(mvcGridSharpName, obj);
    }

    public getSortColumn(mvcGridSharpName: string): string {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.sortColumn;
    }

    public getSortDirection(mvcGridSharpName: string): SortDirection {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.sortDirection;
    }

    public setSort(mvcGridSharpName: string, sortColumn: string, sortDirection: SortDirection): void {
        console.log(`setSort called for grid: ${mvcGridSharpName}, column: ${sortColumn}, direction: ${sortDirection}`);
        this.ensureQueryOptions(mvcGridSharpName);
        this.queryOptions[mvcGridSharpName].sort = sortColumn;
        this.queryOptions[mvcGridSharpName].dir = sortDirection;
        this.reloadGrid(mvcGridSharpName);
    }

    public getPage(mvcGridSharpName: string): number {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.pageNumber;
    }

    public setPage(mvcGridSharpName: string, pageNumber: number): void {
        this.ensureQueryOptions(mvcGridSharpName);
        this.queryOptions[mvcGridSharpName].page = pageNumber;
        this.reloadGrid(mvcGridSharpName);
    }

    public getPageSize(mvcGridSharpName: string): number {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.itemsPerPage;
    }

    public setPageSize(mvcGridSharpName: string, pageSize: number): void {
        this.ensureQueryOptions(mvcGridSharpName);
        this.queryOptions[mvcGridSharpName].pagesize = pageSize;
        this.reloadGrid(mvcGridSharpName);
    }

    public getAdditionalQueryOptions(mvcGridSharpName: string): Record<string, string> {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.additionalQueryOptions;
    }

    public setAdditionalQueryOptions(mvcGridSharpName: string, obj: Record<string, string>): void {
        this.ensureQueryOptions(mvcGridSharpName);
        Object.keys(obj).forEach(k => {
            this.queryOptions[mvcGridSharpName][k] = obj[k];
        });
        this.reloadGrid(mvcGridSharpName);
    }

    public reloadGrid(mvcGridSharpName: string): void {
        this.ensureQueryOptions(mvcGridSharpName);
        const tableHolderHtmlId = `MvcGridSharpTableHolder_${mvcGridSharpName}`;
        const loadingHtmlId = `MvcGridSharp_Loading_${mvcGridSharpName}`;
        const errorHtmlId = `MvcGridSharp_ErrorMessage_${mvcGridSharpName}`;

        const gridDef = this.findGridDef(mvcGridSharpName);
        if (!gridDef) return;

        let ajaxBaseUrl = this.handlerPath;

        if (gridDef.renderingMode === 'controller') {
            ajaxBaseUrl = this.controllerPath;
        }

        let fullAjaxUrl = ajaxBaseUrl + location.search;

        Object.keys(gridDef.pageParameters).forEach(k => {
            const thisPP = `_pp_${gridDef.qsPrefix}${k}`;
            fullAjaxUrl = this.updateURLParameter(fullAjaxUrl, thisPP, gridDef.pageParameters[k]);
        });

        this.queryOptions[mvcGridSharpName].Name = mvcGridSharpName;

        // Convert query options to URL parameters
        const params = new URLSearchParams();
        Object.keys(this.queryOptions[mvcGridSharpName]).forEach(key => {
            const value = this.queryOptions[mvcGridSharpName][key];
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const finalUrl = fullAjaxUrl + (fullAjaxUrl.includes('?') ? '&' : '?') + params.toString();

        // Show loading
        if (gridDef.clientLoading !== '') {
            const loadingFunction = (window as any)[gridDef.clientLoading];
            if (typeof loadingFunction === 'function') {
                loadingFunction();
            }
        }

        const loadingElement = document.getElementById(loadingHtmlId);
        if (loadingElement) {
            loadingElement.style.visibility = 'visible';
        }

        // Make fetch request
        fetch(finalUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(result => {
            const tableHolderElement = document.getElementById(tableHolderHtmlId);
            if (tableHolderElement) {
                tableHolderElement.innerHTML = result;
            }
        })
        .catch(error => {
            console.error('Error loading grid:', error);
            const errorElement = document.getElementById(errorHtmlId);
            const tableHolderElement = document.getElementById(tableHolderHtmlId);

            if (this.showErrorDetails && tableHolderElement) {
                tableHolderElement.innerHTML = `Error loading grid: ${error.message}`;
            } else if (errorElement && tableHolderElement) {
                tableHolderElement.innerHTML = errorElement.innerHTML || 'An error occurred loading the grid.';
            }
        })
        .finally(() => {
            if (gridDef.clientLoadingComplete !== '') {
                const loadingCompleteFunction = (window as any)[gridDef.clientLoadingComplete];
                if (typeof loadingCompleteFunction === 'function') {
                    loadingCompleteFunction();
                }
            }

            const loadingElement = document.getElementById(loadingHtmlId);
            if (loadingElement) {
                loadingElement.style.visibility = 'hidden';
            }
        });
    }

    public getExportUrl(mvcGridSharpName: string): string {
        return this.getEngineExportUrl(mvcGridSharpName, 'export');
    }

    public getEngineExportUrl(mvcGridSharpName: string, engineName: string): string {
        const gridDef = this.findGridDef(mvcGridSharpName);
        if (!gridDef) return '';

        const exportBaseUrl = this.handlerPath;
        let fullExportUrl = exportBaseUrl + location.search;
        
        fullExportUrl = this.updateURLParameter(fullExportUrl, 'engine', engineName);
        fullExportUrl = this.updateURLParameter(fullExportUrl, 'Name', mvcGridSharpName);

        Object.keys(gridDef.pageParameters).forEach(k => {
            const thisPP = `_pp_${gridDef.qsPrefix}${k}`;
            fullExportUrl = this.updateURLParameter(fullExportUrl, thisPP, gridDef.pageParameters[k]);
        });

        return fullExportUrl;
    }

    private updateURLParameter(url: string, param: string, paramVal: string): string {
        let newAdditionalURL = "";
        let tempArray = url.split("?");
        let baseURL = tempArray[0];
        let additionalURL = tempArray[1];
        let temp = "";
        
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].split('=')[0] != param) {
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }

        let rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    }
}

// Create global instance
const MvcGridSharp = new MvcGridSharpClass();

// Initialize on document ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM content loaded, initializing MvcGridSharp');
        MvcGridSharp.init();
    });
} else {
    // Document is already loaded
    console.log('Document already loaded, initializing MvcGridSharp immediately');
    MvcGridSharp.init();
}

// Make types and enums available globally for browser usage
(window as any).MvcGridSharp = MvcGridSharp;
(window as any).SortDirection = SortDirection;
(window as any).RenderingMode = RenderingMode;
