// Type definitions for MvcGridSharpSignalR
// Project: MvcGridSharp SignalR extension
// Definitions by: TypeScript port of MvcGridSharpSignalR.js

declare enum GridGenerationType {
    Table = 0,
    Row = 1
}

declare enum SignalRState {
    INIT = 'INIT',
    STOP = 'STOP',
    UPDATE = 'UPDATE'
}

declare interface SignalRGridResponse {
    Type: string;
    Gridname: string;
    Html: string;
    SummaryHtml: string;
}

declare interface SignalRConnection {
    start(): Promise<void>;
    stop(): Promise<void>;
    invoke(methodName: string, ...args: any[]): Promise<void>;
    on(methodName: string, callback: (...args: any[]) => void): void;
    onclose(callback: (error?: Error) => void): void;
    onreconnecting(callback: (error?: Error) => void): void;
    onreconnected(callback: (connectionId?: string) => void): void;
}

declare interface MvcGridSharpSignalRInstance {
    connection: SignalRConnection | null;
    
    refreshSignalR(): void;
    InitializeSignalR(): void;
    sendMessage(gridName: string, state: SignalRState, html?: string): Promise<void>;
    stop(): Promise<void>;
}

declare interface MvcGridSharpWithSignalR {
    // Original MvcGridSharp methods
    init(): void;
    reloadGrid(gridName: string): void;
    // ... other original methods
    
    // SignalR extensions
    refreshSignalR(): void;
    InitializeSignalR(): void;
    signalR: MvcGridSharpSignalRInstance;
}

declare const MvcGridSharp: MvcGridSharpWithSignalR;

declare global {
    interface Window {
        MvcGridSharp: MvcGridSharpWithSignalR;
        signalR: any;
    }
    
    const signalR: any;
}

export {
    GridGenerationType,
    SignalRState,
    SignalRGridResponse,
    SignalRConnection,
    MvcGridSharpSignalRInstance,
    MvcGridSharpWithSignalR
};