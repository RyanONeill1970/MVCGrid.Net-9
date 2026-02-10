declare const signalR: any;
declare enum GridGenerationType {
    Table = 0,
    Row = 1
}
declare enum SignalRState {
    INIT = "INIT",
    STOP = "STOP",
    UPDATE = "UPDATE"
}
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
declare class MvcGridSharpSignalR implements MvcGridSharpSignalRClass {
    connection: SignalRConnection | null;
    /**
     * Placeholder method for refreshing SignalR connection
     */
    refreshSignalR(): void;
    /**
     * Initializes the SignalR connection for MvcGridSharp
     */
    InitializeSignalR(): void;
    /**
     * Handles table update from SignalR
     * @param gridname - The name of the grid to update
     * @param html - The HTML content for the table
     */
    private handleTableUpdate;
    /**
     * Handles row update from SignalR
     * @param gridname - The name of the grid to update
     * @param html - The HTML content for the row
     * @param summaryhtml - The HTML content for the summary
     */
    private handleRowUpdate;
    /**
     * Sends a message to the SignalR hub
     * @param gridName - The name of the grid
     * @param state - The state/action to perform
     * @param html - Optional HTML content
     */
    sendMessage(gridName: string, state: SignalRState, html?: string): Promise<void>;
    /**
     * Stops the SignalR connection
     */
    stop(): Promise<void>;
}
declare const mvcGridSharpSignalR: MvcGridSharpSignalR;
declare const windowObj: any;
