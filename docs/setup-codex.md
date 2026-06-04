# Codex Setup

## 1. Edit your config

Edit `~/.codex/config.toml`:

```toml
[mcp_servers.icon-mcp]
command = "node"
args = ["/path/to/icon-mcp/dist/index.js"]
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

## 2. Restart

Restart Codex for the changes to take effect.
