"use strict";
// TypeScript definitions for MvcGridSharpSignalR
// Enums matching the C# backend
var GridGenerationType;
(function (GridGenerationType) {
    GridGenerationType[GridGenerationType["Table"] = 0] = "Table";
    GridGenerationType[GridGenerationType["Row"] = 1] = "Row";
})(GridGenerationType || (GridGenerationType = {}));
var SignalRState;
(function (SignalRState) {
    SignalRState["INIT"] = "INIT";
    SignalRState["STOP"] = "STOP";
    SignalRState["UPDATE"] = "UPDATE";
})(SignalRState || (SignalRState = {}));
class MvcGridSharpSignalR {
    constructor() {
        this.connection = null;
    }
    /**
     * Placeholder method for refreshing SignalR connection
     */
    refreshSignalR() {
        // Implementation placeholder
    }
    /**
     * Initializes the SignalR connection for MvcGridSharp
     */
    InitializeSignalR() {
        if (typeof signalR === 'undefined') {
            console.error("SignalR library not found. Please include the SignalR client library.");
            return;
        }
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/MvcGridSharpSignalR")
            .build();
        this.connection = connection;
        connection.start()
            .then(() => {
            console.log("MvcGridSharp SignalR connected");
            const gridContainer = document.querySelector(".MvcGridSharpContainer");
            if (gridContainer && gridContainer.id) {
                const gridName = gridContainer.id.replace("MvcGridSharpContainer_", "");
                connection.invoke("Message", gridName, SignalRState.INIT, "")
                    .catch((err) => console.error(err.toString()));
            }
            else {
                console.warn("No MvcGridSharp container found for SignalR initialization");
            }
        })
            .catch((err) => {
            console.error("Error starting SignalR connection: ", err);
        });
        // Handle MvcGridSharp messages (legacy handler - may not be used)
        connection.on('MvcGridSharp', (response) => {
            try {
                const obj = JSON.parse(response);
                console.log(obj);
                // Legacy handler - implementation would go here if needed
            }
            catch (error) {
                console.error("Error parsing MvcGridSharp response:", error);
            }
        });
        // Handle Message responses
        connection.on('Message', (response) => {
            try {
                const obj = JSON.parse(response);
                console.log(obj);
                const type = obj.Type;
                const gridname = obj.Gridname;
                const html = obj.Html;
                const summaryhtml = obj.SummaryHtml;
                if (type === GridGenerationType[GridGenerationType.Table]) {
                    this.handleTableUpdate(gridname, html);
                }
                else if (type === GridGenerationType[GridGenerationType.Row]) {
                    this.handleRowUpdate(gridname, html, summaryhtml);
                }
                else {
                    console.warn(`Unknown SignalR message type: ${type}`);
                }
            }
            catch (error) {
                console.error("Error parsing Message response:", error);
            }
        });
        // Handle connection errors
        connection.onclose((error) => {
            if (error) {
                console.error("SignalR connection closed with error:", error);
            }
            else {
                console.log("SignalR connection closed");
            }
        });
        connection.onreconnecting((error) => {
            console.log("SignalR connection reconnecting...", error);
        });
        connection.onreconnected((connectionId) => {
            console.log("SignalR connection reconnected:", connectionId);
        });
    }
    /**
     * Handles table update from SignalR
     * @param gridname - The name of the grid to update
     * @param html - The HTML content for the table
     */
    handleTableUpdate(gridname, html) {
        const tableHolderHtmlId = `MvcGridSharpTableHolder_${gridname}`;
        const tableHolder = document.getElementById(tableHolderHtmlId);
        if (tableHolder) {
            tableHolder.innerHTML = html;
        }
        else {
            console.warn(`Table holder element not found: ${tableHolderHtmlId}`);
        }
    }
    /**
     * Handles row update from SignalR
     * @param gridname - The name of the grid to update
     * @param html - The HTML content for the row
     * @param summaryhtml - The HTML content for the summary
     */
    handleRowUpdate(gridname, html, summaryhtml) {
        // Remove "no results" message if it exists
        const noResultsElements = document.querySelectorAll(".noresults");
        noResultsElements.forEach(element => element.remove());
        const tableHtmlId = `MvcGridSharpTable_${gridname}`;
        const table = document.getElementById(tableHtmlId);
        const tableBody = table === null || table === void 0 ? void 0 : table.querySelector('tbody');
        if (tableBody) {
            tableBody.insertAdjacentHTML('beforeend', html);
        }
        else {
            console.warn(`Table body not found: ${tableHtmlId} tbody`);
        }
        // Update summary if provided
        if (summaryhtml) {
            const tableSummaryHtmlId = `MvcGridSharpTable_${gridname}_Summary`;
            const tableSummary = document.getElementById(tableSummaryHtmlId);
            if (tableSummary) {
                tableSummary.innerHTML = summaryhtml;
            }
            else {
                console.warn(`Table summary element not found: ${tableSummaryHtmlId}`);
            }
        }
    }
    /**
     * Sends a message to the SignalR hub
     * @param gridName - The name of the grid
     * @param state - The state/action to perform
     * @param html - Optional HTML content
     */
    sendMessage(gridName, state, html = "") {
        if (!this.connection) {
            return Promise.reject(new Error("SignalR connection not initialized"));
        }
        return this.connection.invoke("Message", gridName, state, html)
            .catch((err) => {
            console.error("Error sending SignalR message:", err);
            throw err;
        });
    }
    /**
     * Stops the SignalR connection
     */
    stop() {
        if (this.connection) {
            return this.connection.stop();
        }
        return Promise.resolve();
    }
}
// Create instance and extend the global MvcGridSharp object
const mvcGridSharpSignalR = new MvcGridSharpSignalR();
// Extend the existing MvcGridSharp object if it exists
const windowObj = window;
if (typeof window !== 'undefined' && windowObj.MvcGridSharp) {
    windowObj.MvcGridSharp.refreshSignalR = mvcGridSharpSignalR.refreshSignalR.bind(mvcGridSharpSignalR);
    windowObj.MvcGridSharp.InitializeSignalR = mvcGridSharpSignalR.InitializeSignalR.bind(mvcGridSharpSignalR);
    windowObj.MvcGridSharp.signalR = mvcGridSharpSignalR;
}
else {
    // Create minimal MvcGridSharp object if it doesn't exist
    windowObj.MvcGridSharp = {
        refreshSignalR: mvcGridSharpSignalR.refreshSignalR.bind(mvcGridSharpSignalR),
        InitializeSignalR: mvcGridSharpSignalR.InitializeSignalR.bind(mvcGridSharpSignalR),
        signalR: mvcGridSharpSignalR
    };
}
// Make types and enums available globally for browser usage
windowObj.GridGenerationType = GridGenerationType;
windowObj.SignalRState = SignalRState;
windowObj.MvcGridSharpSignalR = mvcGridSharpSignalR;
// DOM Content Loaded event (equivalent to jQuery document ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Document ready logic if needed
    });
}
else {
    // Document is already loaded
    // Document ready logic if needed
}
