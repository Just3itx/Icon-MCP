# Windsurf Setup

## 1. Edit your config

Edit `~/.codeium/windsurf/mcp_config.json`:

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

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

## 2. Restart Windsurf

Restart the editor for the changes to take effect.
