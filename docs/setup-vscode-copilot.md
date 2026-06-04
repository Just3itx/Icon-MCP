# VS Code Copilot Setup

## 1. Add via CLI

Run this command in your terminal:

```bash
code --add-mcp '{"name":"icon-mcp","command":"node","args":["/path/to/icon-mcp/dist/index.js"]}'
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

## 2. Verify

Open the Command Palette (`Ctrl+Shift+P`) and search for **MCP: List Servers** to confirm `icon-mcp` appears.
