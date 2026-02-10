# MvcGridSharp TypeScript Implementation

This directory contains the TypeScript version of MvcGridSharp.js and MvcGridSharpSignalR.js with strong typing support.

## Files

- **MvcGridSharp.ts** - The main TypeScript implementation with full type safety
- **MvcGridSharpSignalR.ts** - SignalR extension with real-time grid updates
- **MvcGridSharp.d.ts** - TypeScript declaration file for use with the original JavaScript
- **MvcGridSharpSignalR.d.ts** - TypeScript declaration file for SignalR functionality
- **tsconfig.json** - TypeScript compiler configuration
- **package.json** - NPM package configuration with dependencies

## Features

The TypeScript version includes:

### Strong Typing
- Strongly typed interfaces for all data structures
- Type-safe method parameters and return values
- Enum definitions for SortDirection, RenderingMode, and GridGenerationType
- Generic type definitions for better IntelliSense support
- SignalR Hub connection typing with proper method signatures

### Core Grid Interface Definitions
- **SortDirection** - Enum for sort directions (Unspecified, Asc, Dsc)
- **RenderingMode** - Enum for rendering modes (RenderingEngine, Controller)
- **ColumnVisibility** - Interface for column visibility settings
- **GridDefinition** - Interface for grid configuration
- **ClientData** - Interface for client-side data
- **QueryOptions** - Interface for query parameters

### SignalR Interface Definitions
- **GridGenerationType** - Enum for SignalR update types (Table, Row)
- **SignalRState** - Enum for SignalR connection states (INIT, STOP, UPDATE)
- **SignalRGridResponse** - Interface for server responses
- **SignalRConnection** - Extended SignalR connection with typed methods
- **MvcGridSharpSignalRInstance** - Interface for SignalR functionality

### Enhanced Error Handling
- Improved null/undefined checks
- Better type safety for DOM manipulation
- Safer function calls with existence checks
- SignalR connection error handling and reconnection logic
- Comprehensive try-catch blocks for JSON parsing

### Bug Fixes
- Implemented the missing `updateURLParameter` function that was referenced but not defined in the original JavaScript
- Fixed HTML generation issues in column visibility list
- Fixed variable name inconsistency in SignalR table update (tableHolderHtmlId vs tableHtmlId)
- Added proper error handling for SignalR connection failures

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript files:
   ```bash
   npm run build
   ```

3. For development with auto-compilation:
   ```bash
   npm run watch
   ```

## Usage

### Core Grid with TypeScript
```typescript
import { MvcGridSharpClass, SortDirection } from './MvcGridSharp';

// Use with full type safety
const grid = new MvcGridSharpClass();
grid.setSort('myGrid', 'columnName', SortDirection.Asc);
```

### SignalR with TypeScript
```typescript
import { MvcGridSharpSignalR, SignalRState } from './MvcGridSharpSignalR';

// Initialize SignalR connection
const signalRGrid = new MvcGridSharpSignalR();
signalRGrid.InitializeSignalR();

// Send messages to the hub
signalRGrid.sendMessage('myGrid', SignalRState.INIT)
  .then(() => console.log('Message sent'))
  .catch(err => console.error('Error:', err));
```

### With JavaScript (using .d.ts files)
```javascript
// Include the .d.ts files for IntelliSense in TypeScript-aware editors
// Use the global MvcGridSharp instance as before
MvcGridSharp.InitializeSignalR();
MvcGridSharp.setSort('myGrid', 'columnName', 1); // 1 = SortDirection.Asc
```

## SignalR Features

The TypeScript SignalR implementation provides:

### Real-time Updates
- **Table Updates** - Complete table replacement via SignalR
- **Row Updates** - Incremental row addition with summary updates
- **Automatic Reconnection** - Built-in reconnection handling
- **Connection State Management** - Proper connection lifecycle management

### Enhanced Reliability
- Connection error handling with detailed logging
- JSON parsing error handling
- DOM element existence checking before updates
- Promise-based message sending with error handling

### Type Safety
- Strongly typed SignalR hub method calls
- Type-safe message handling
- Enum-based state and message type management
- Interface-based response handling

## Dependencies

- **@types/jquery** - jQuery type definitions
- **@microsoft/signalr** - Official Microsoft SignalR client library
- **typescript** - TypeScript compiler

## Compilation

The TypeScript files compile to ES2017 JavaScript with:
- CommonJS module format for Node.js compatibility
- DOM library support for browser APIs
- Strict type checking enabled
- Declaration files generated automatically

## Compatibility

The TypeScript version maintains full compatibility with the original JavaScript API while adding:
- Complete type safety for both core grid and SignalR functionality
- Better IDE support with IntelliSense for all methods and properties
- Compile-time error checking
- Modern ES6+ features where appropriate
- Enhanced error handling and logging

## Migration

To migrate from the JavaScript version:
1. Replace the reference to `MvcGridSharp.js` with the compiled TypeScript output
2. Replace the reference to `MvcGridSharpSignalR.js` with the compiled SignalR TypeScript output
3. Include the `.d.ts` files for type definitions if using TypeScript
4. Install the SignalR client library: `npm install @microsoft/signalr`
5. No changes to existing usage code are required

The TypeScript versions are drop-in replacements for the original JavaScript implementations with enhanced functionality and type safety.