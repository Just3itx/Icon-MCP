# Amp Setup

## 1. Edit your VS Code settings

Open your VS Code `settings.json` and add the `amp.mcpServers` key:

```jsonc
{
  "amp.mcpServers": {
    "icon-mcp": {
      "command": "node",
      "args": ["/path/to/icon-mcp/dist/index.js"]
    }
  }
}
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

> **Note:** If your `settings.json` already has other keys, merge the `amp.mcpServers` block into the existing file. Don't overwrite the whole file.

## 2. Restart

Restart VS Code for the changes to take effect.
