# Cline Setup

## 1. Edit your config

Edit `~/.cline/data/settings/cline_mcp_settings.json`:

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

## 2. Restart

Restart VS Code for the changes to take effect.
