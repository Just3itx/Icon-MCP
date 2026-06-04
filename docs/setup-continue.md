# Continue Setup

Also applies to **JetBrains Gateway**.

## 1. Edit your config

Edit `~/.continue/config.yaml` (or `~/.config/JetBrains/Gateway/config.yaml` for JetBrains Gateway):

```yaml
mcpServers:
  - name: icon-mcp
    command: node
    args:
      - /path/to/icon-mcp/dist/index.js
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

## 2. Restart

Restart your IDE for the changes to take effect.
