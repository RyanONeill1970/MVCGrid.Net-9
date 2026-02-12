"use strict";
// TypeScript definitions for MvcGridSharp
var SortDirection;
(function (SortDirection) {
    SortDirection[SortDirection["Unspecified"] = 0] = "Unspecified";
    SortDirection[SortDirection["Asc"] = 1] = "Asc";
    SortDirection[SortDirection["Dsc"] = 2] = "Dsc";
})(SortDirection || (SortDirection = {}));
var RenderingMode;
(function (RenderingMode) {
    RenderingMode[RenderingMode["RenderingEngine"] = 0] = "RenderingEngine";
    RenderingMode[RenderingMode["Controller"] = 1] = "Controller";
})(RenderingMode || (RenderingMode = {}));
class MvcGridSharpClass {
    constructor() {
        this.handlerPath = '%%HANDLERPATH%%';
        this.controllerPath = '%%CONTROLLERPATH%%';
        this.showErrorDetails = false; // TODO: Enable or remove injection of this value from C# - %%ERRORDETAILS%%;
        this.currentGrids = [];
        this.queryOptions = {};
    }
    init() {
        console.log('MvcGridSharp.init() called');
        const containers = document.querySelectorAll('.MvcGridSharpContainer');
        console.log(`Found ${containers.length} grid containers`);
        containers.forEach((element, index) => {
            console.log(`Processing container ${index}:`, element);
            const nameInput = element.querySelector("input[name='MvcGridSharpName']");
            if (nameInput) {
                const mvcGridSharpName = nameInput.value;
                console.log(`Found grid name: ${mvcGridSharpName}`);
                const jsonDataElement = document.getElementById(`MvcGridSharp_${mvcGridSharpName}_JsonData`);
                console.log(`Looking for JSON data element: MvcGridSharp_${mvcGridSharpName}_JsonData`, jsonDataElement);
                const jsonData = jsonDataElement === null || jsonDataElement === void 0 ? void 0 : jsonDataElement.innerHTML;
                if (jsonData) {
                    console.log(`Found JSON data for ${mvcGridSharpName}:`, jsonData);
                    try {
                        const gridDef = JSON.parse(jsonData);
                        this.currentGrids.push(gridDef);
                        this.queryOptions[mvcGridSharpName] = {};
                        console.log(`Successfully initialized grid: ${mvcGridSharpName}`);
                    }
                    catch (error) {
                        console.error(`Error parsing JSON data for ${mvcGridSharpName}:`, error);
                    }
                }
                else {
                    console.warn(`No JSON data found for grid: ${mvcGridSharpName}`);
                }
            }
            else {
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
    ensureQueryOptions(mvcGridSharpName) {
        if (!this.queryOptions[mvcGridSharpName]) {
            this.queryOptions[mvcGridSharpName] = {};
            console.log(`Initialized queryOptions for grid: ${mvcGridSharpName}`);
        }
    }
    findGridDef(mvcGridSharpName) {
        const gridDef = this.currentGrids.find(obj => obj.name === mvcGridSharpName);
        if (!gridDef) {
            console.warn(`Grid not found: ${mvcGridSharpName}. Available grids:`, this.currentGrids.map(g => g.name));
        }
        return gridDef;
    }
    applyBoundFilters(mvcGridSharpName) {
        const filters = {};
        const filterElements = document.querySelectorAll("[data-mvcgridsharp-type='filter']");
        filterElements.forEach((element) => {
            const gridName = this.getGridName(element);
            if (gridName === mvcGridSharpName) {
                const option = element.getAttribute('data-mvcgridsharp-option');
                const inputElement = element;
                const val = inputElement.value;
                if (option) {
                    filters[option] = val;
                }
            }
        });
        this.setFilters(mvcGridSharpName, filters);
    }
    loadBoundFilters() {
        const filterElements = document.querySelectorAll("[data-mvcgridsharp-type='filter']");
        filterElements.forEach((element) => {
            const gridName = this.getGridName(element);
            const option = element.getAttribute('data-mvcgridsharp-option');
            if (option) {
                const val = this.getFilters(gridName)[option];
                const inputElement = element;
                inputElement.value = val || '';
            }
        });
    }
    applyAdditionalQueryOptions(mvcGridSharpName) {
        const options = {};
        const additionalElements = document.querySelectorAll("[data-mvcgridsharp-type='additionalQueryOption']");
        additionalElements.forEach((element) => {
            const gridName = this.getGridName(element);
            if (gridName === mvcGridSharpName) {
                const option = element.getAttribute('data-mvcgridsharp-option');
                const inputElement = element;
                const val = inputElement.value;
                if (option) {
                    options[option] = val;
                }
            }
        });
        this.setAdditionalQueryOptions(mvcGridSharpName, options);
    }
    loadAdditionalQueryOptions() {
        const additionalElements = document.querySelectorAll("[data-mvcgridsharp-type='additionalQueryOption']");
        additionalElements.forEach((element) => {
            const gridName = this.getGridName(element);
            const option = element.getAttribute('data-mvcgridsharp-option');
            if (option) {
                const val = this.getAdditionalQueryOptions(gridName)[option];
                const inputElement = element;
                inputElement.value = val || '';
            }
        });
    }
    getGridName(element) {
        var _a;
        let gridName = ((_a = this.currentGrids[0]) === null || _a === void 0 ? void 0 : _a.name) || '';
        const nameAttr = element.getAttribute('data-mvcgridsharp-name');
        if (nameAttr !== null) {
            gridName = nameAttr;
        }
        return gridName;
    }
    bindToolbarEvents() {
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
            const selectElement = element;
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
            const listElement = element;
            const gridName = this.getGridName(listElement);
            const colVis = this.getColumnVisibility(gridName);
            Object.keys(colVis).forEach((colName) => {
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
            const checkboxes = document.querySelectorAll(`input[type="checkbox"][name='${gridName}cols']`);
            checkboxes.forEach((checkbox) => {
                checkbox.addEventListener('change', () => {
                    const jsonData = {};
                    const closestUl = checkbox.closest('ul');
                    const gridName = this.getGridName(closestUl);
                    const checkedBoxes = document.querySelectorAll(`input[type="checkbox"][name='${gridName}cols']:checked`);
                    checkedBoxes.forEach((checkedBox) => {
                        const inputElement = checkedBox;
                        const columnName = inputElement.value;
                        jsonData[columnName] = true;
                    });
                    this.setColumnVisibility(gridName, jsonData);
                });
            });
        });
    }
    getClientData(mvcGridSharpName) {
        const jsonDataElement = document.getElementById(`MvcGridSharp_${mvcGridSharpName}_ContextJsonData`);
        const jsonData = (jsonDataElement === null || jsonDataElement === void 0 ? void 0 : jsonDataElement.innerHTML) || '{}';
        return JSON.parse(jsonData);
    }
    getColumnVisibility(mvcGridSharpName) {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.columnVisibility;
    }
    setColumnVisibility(mvcGridSharpName, obj) {
        this.ensureQueryOptions(mvcGridSharpName);
        let colString = '';
        Object.keys(obj).forEach(k => {
            if (obj[k]) {
                if (colString !== '')
                    colString += ',';
                colString += k;
            }
        });
        this.queryOptions[mvcGridSharpName].cols = colString;
        this.reloadGrid(mvcGridSharpName);
    }
    getFilters(mvcGridSharpName) {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.filters;
    }
    setFilters(mvcGridSharpName, obj) {
        this.setAdditionalQueryOptions(mvcGridSharpName, obj);
    }
    getSortColumn(mvcGridSharpName) {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.sortColumn;
    }
    getSortDirection(mvcGridSharpName) {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.sortDirection;
    }
    setSort(mvcGridSharpName, sortColumn, sortDirection) {
        console.log(`setSort called for grid: ${mvcGridSharpName}, column: ${sortColumn}, direction: ${sortDirection}`);
        this.ensureQueryOptions(mvcGridSharpName);
        this.queryOptions[mvcGridSharpName].sort = sortColumn;
        this.queryOptions[mvcGridSharpName].dir = sortDirection;
        this.reloadGrid(mvcGridSharpName);
    }
    getPage(mvcGridSharpName) {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.pageNumber;
    }
    setPage(mvcGridSharpName, pageNumber) {
        this.ensureQueryOptions(mvcGridSharpName);
        this.queryOptions[mvcGridSharpName].page = pageNumber;
        this.reloadGrid(mvcGridSharpName);
    }
    getPageSize(mvcGridSharpName) {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.itemsPerPage;
    }
    setPageSize(mvcGridSharpName, pageSize) {
        this.ensureQueryOptions(mvcGridSharpName);
        this.queryOptions[mvcGridSharpName].pagesize = pageSize;
        this.reloadGrid(mvcGridSharpName);
    }
    getAdditionalQueryOptions(mvcGridSharpName) {
        const clientJson = this.getClientData(mvcGridSharpName);
        return clientJson.additionalQueryOptions;
    }
    setAdditionalQueryOptions(mvcGridSharpName, obj) {
        this.ensureQueryOptions(mvcGridSharpName);
        Object.keys(obj).forEach(k => {
            this.queryOptions[mvcGridSharpName][k] = obj[k];
        });
        this.reloadGrid(mvcGridSharpName);
    }
    reloadGrid(mvcGridSharpName) {
        this.ensureQueryOptions(mvcGridSharpName);
        const tableHolderHtmlId = `MvcGridSharpTableHolder_${mvcGridSharpName}`;
        const loadingHtmlId = `MvcGridSharp_Loading_${mvcGridSharpName}`;
        const errorHtmlId = `MvcGridSharp_ErrorMessage_${mvcGridSharpName}`;
        const gridDef = this.findGridDef(mvcGridSharpName);
        if (!gridDef)
            return;
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
            const loadingFunction = window[gridDef.clientLoading];
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
            }
            else if (errorElement && tableHolderElement) {
                tableHolderElement.innerHTML = errorElement.innerHTML || 'An error occurred loading the grid.';
            }
        })
            .finally(() => {
            if (gridDef.clientLoadingComplete !== '') {
                const loadingCompleteFunction = window[gridDef.clientLoadingComplete];
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
    getExportUrl(mvcGridSharpName) {
        return this.getEngineExportUrl(mvcGridSharpName, 'export');
    }
    getEngineExportUrl(mvcGridSharpName, engineName) {
        const gridDef = this.findGridDef(mvcGridSharpName);
        if (!gridDef)
            return '';
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
    updateURLParameter(url, param, paramVal) {
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
}
else {
    // Document is already loaded
    console.log('Document already loaded, initializing MvcGridSharp immediately');
    MvcGridSharp.init();
}
// Make types and enums available globally for browser usage
window.MvcGridSharp = MvcGridSharp;
window.SortDirection = SortDirection;
window.RenderingMode = RenderingMode;
