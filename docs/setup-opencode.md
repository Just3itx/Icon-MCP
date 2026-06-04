# OpenCode Setup

## 1. Edit your config

Edit `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "icon-mcp": {
      "type": "local",
      "command": ["node", "/path/to/icon-mcp/dist/index.js"],
      "enabled": true
    }
  }
}
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

## 2. Restart

Restart OpenCode for the changes to take effect.
