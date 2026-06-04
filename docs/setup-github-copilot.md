# GitHub Copilot Setup

## 1. Edit your config

Edit `~/.copilot/mcp-config.json`:

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

Restart your IDE or GitHub Copilot for the changes to take effect.
