# Goose Setup

## 1. Locate your config file

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/block.goose/config.yaml` |
| Windows | `%APPDATA%\block.goose\config.yaml` |
| Linux | `~/.config/goose/config.yaml` |

## 2. Add the server

```yaml
extensions:
  icon-mcp:
    command: node
    args:
      - /path/to/icon-mcp/dist/index.js
    enabled: true
    type: stdio
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

## 3. Restart Goose

Restart Goose for the changes to take effect.
