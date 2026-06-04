# Cursor Setup

## Option 1: Automatic

```bash
npm run install-harness
```

Select **Cursor** from the interactive menu.

## Option 2: Manual

1. Open Cursor
2. Go to **Settings** > **Features** > **MCP**
3. Click **Add New MCP Server**
4. Fill in:
   - **Name:** `icon-mcp`
   - **Type:** `command`
   - **Command:** `node /path/to/icon-mcp/dist/index.js`

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

## Option 3: JSON Config

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "icon-mcp": {
      "command": "node",
      "args": ["/path/to/icon-mcp/dist/index.js"]
    }
  }
}
```

Restart Cursor to apply.
