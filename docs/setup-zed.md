# Zed Setup

## 1. Edit your config

Edit `~/.config/zed/settings.json` and add the `context_servers` key:

```jsonc
{
  "context_servers": {
    "icon-mcp": {
      "command": "node",
      "args": ["/path/to/icon-mcp/dist/index.js"]
    }
  }
}
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

> **Note:** If your `settings.json` already has other keys, merge the `context_servers` block into the existing file. Don't overwrite the whole file.

## 2. Restart Zed

Restart the editor for the changes to take effect.
