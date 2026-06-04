# Gemini CLI Setup

## 1. Edit your config

Edit `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "icon-mcp": {
      "command": "node",
      "args": ["/path/to/icon-mcp/dist/index.js"],
      "trust": true
    }
  }
}
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

> **Note:** The `"trust": true` field is required for Gemini CLI.

## 2. Restart

Restart Gemini CLI for the changes to take effect.
