// TypeScript definitions for MvcGridSharpSignalR

// Use global signalR from CDN instead of importing
declare const signalR: any;

// Enums matching the C# backend
enum GridGenerationType {
    Table = 0,
    Row = 1
}

enum SignalRState {
    INIT = 'INIT',
    STOP = 'STOP',
    UPDATE = 'UPDATE'
}

// Interfaces matching the C# models
interface SignalRGridResponse {
    Type: string;
    Gridname: string;
    Html: string;
    SummaryHtml: string;
}

interface SignalRConnection {
    start(): Promise<void>;
    stop(): Promise<void>;
    invoke(methodName: string, ...args: any[]): Promise<void>;
    on(methodName: string, callback: (...args: any[]) => void): void;
    onclose(callback: (error?: Error) => void): void;
    onreconnecting(callback: (error?: Error) => void): void;
    onreconnected(callback: (connectionId?: string) => void): void;
}

interface MvcGridSharpSignalRClass {
    connection: SignalRConnection | null;
    
    refreshSignalR(): void;
    InitializeSignalR(): void;
}

class MvcGridSharpSignalR implements MvcGridSharpSignalRClass {
    public connection: SignalRConnection | null = null;

    /**
     * Placeholder method for refreshing SignalR connection
     */
    public refreshSignalR(): void {
        // Implementation placeholder
    }

    /**
     * Initializes the SignalR connection for MvcGridSharp
     */
    public InitializeSignalR(): void {
        if (typeof signalR === 'undefined') {
            console.error("SignalR library not found. Please include the SignalR client library.");
            return;
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/MvcGridSharpSignalR")
            .build() as SignalRConnection;

        this.connection = connection;

        connection.start()
            .then(() => {
                console.log("MvcGridSharp SignalR connected");
                const gridContainer = document.querySelector(".MvcGridSharpContainer") as HTMLElement;
                
                if (gridContainer && gridContainer.id) {
                    const gridName = gridContainer.id.replace("MvcGridSharpContainer_", "");
                    connection.invoke("Message", gridName, SignalRState.INIT, "")
                        .catch((err: any) => console.error(err.toString()));
                } else {
                    console.warn("No MvcGridSharp container found for SignalR initialization");
                }
            })
            .catch((err: any) => {
                console.error("Error starting SignalR connection: ", err);
            });

        // Handle MvcGridSharp messages (legacy handler - may not be used)
        connection.on('MvcGridSharp', (response: string) => {
            try {
                const obj: SignalRGridResponse = JSON.parse(response);
                console.log(obj);
                // Legacy handler - implementation would go here if needed
            } catch (error) {
                console.error("Error parsing MvcGridSharp response:", error);
            }
        });

        // Handle Message responses
        connection.on('Message', (response: string) => {
            try {
                const obj: SignalRGridResponse = JSON.parse(response);
                console.log(obj);
                
                const type = obj.Type;
                const gridname = obj.Gridname;
                const html = obj.Html;
                const summaryhtml = obj.SummaryHtml;

                if (type === GridGenerationType[GridGenerationType.Table]) {
                    this.handleTableUpdate(gridname, html);
                } else if (type === GridGenerationType[GridGenerationType.Row]) {
                    this.handleRowUpdate(gridname, html, summaryhtml);
                } else {
                    console.warn(`Unknown SignalR message type: ${type}`);
                }
            } catch (error) {
                console.error("Error parsing Message response:", error);
            }
        });

        // Handle connection errors
        connection.onclose((error?: Error) => {
            if (error) {
                console.error("SignalR connection closed with error:", error);
            } else {
                console.log("SignalR connection closed");
            }
        });

        connection.onreconnecting((error?: Error) => {
            console.log("SignalR connection reconnecting...", error);
        });

        connection.onreconnected((connectionId?: string) => {
            console.log("SignalR connection reconnected:", connectionId);
        });
    }

    /**
     * Handles table update from SignalR
     * @param gridname - The name of the grid to update
     * @param html - The HTML content for the table
     */
    private handleTableUpdate(gridname: string, html: string): void {
        const tableHolderHtmlId = `MvcGridSharpTableHolder_${gridname}`;
        const tableHolder = document.getElementById(tableHolderHtmlId);
        
        if (tableHolder) {
            tableHolder.innerHTML = html;
        } else {
            console.warn(`Table holder element not found: ${tableHolderHtmlId}`);
        }
    }

    /**
     * Handles row update from SignalR
     * @param gridname - The name of the grid to update
     * @param html - The HTML content for the row
     * @param summaryhtml - The HTML content for the summary
     */
    private handleRowUpdate(gridname: string, html: string, summaryhtml: string): void {
        // Remove "no results" message if it exists
        const noResultsElements = document.querySelectorAll(".noresults");
        noResultsElements.forEach(element => element.remove());
        
        const tableHtmlId = `MvcGridSharpTable_${gridname}`;
        const table = document.getElementById(tableHtmlId);
        const tableBody = table?.querySelector('tbody');
        
        if (tableBody) {
            tableBody.insertAdjacentHTML('beforeend', html);
        } else {
            console.warn(`Table body not found: ${tableHtmlId} tbody`);
        }

        // Update summary if provided
        if (summaryhtml) {
            const tableSummaryHtmlId = `MvcGridSharpTable_${gridname}_Summary`;
            const tableSummary = document.getElementById(tableSummaryHtmlId);
            
            if (tableSummary) {
                tableSummary.innerHTML = summaryhtml;
            } else {
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
    public sendMessage(gridName: string, state: SignalRState, html: string = ""): Promise<void> {
        if (!this.connection) {
            return Promise.reject(new Error("SignalR connection not initialized"));
        }

        return this.connection.invoke("Message", gridName, state, html)
            .catch((err: any) => {
                console.error("Error sending SignalR message:", err);
                throw err;
            });
    }

    /**
     * Stops the SignalR connection
     */
    public stop(): Promise<void> {
        if (this.connection) {
            return this.connection.stop();
        }
        return Promise.resolve();
    }
}

// Create instance and extend the global MvcGridSharp object
const mvcGridSharpSignalR = new MvcGridSharpSignalR();

// Extend the existing MvcGridSharp object if it exists
const windowObj = window as any;
if (typeof window !== 'undefined' && windowObj.MvcGridSharp) {
    windowObj.MvcGridSharp.refreshSignalR = mvcGridSharpSignalR.refreshSignalR.bind(mvcGridSharpSignalR);
    windowObj.MvcGridSharp.InitializeSignalR = mvcGridSharpSignalR.InitializeSignalR.bind(mvcGridSharpSignalR);
    windowObj.MvcGridSharp.signalR = mvcGridSharpSignalR;
} else {
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
} else {
    // Document is already loaded
    // Document ready logic if needed
}
