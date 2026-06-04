# Claude Code (CLI) Setup

## 1. Add the MCP server

Run this command in your terminal:

```bash
claude mcp add icon-mcp -- node /path/to/icon-mcp/dist/index.js
```

Replace `/path/to/icon-mcp` with the actual path where you cloned the repo.

This adds the server to your local project config. To add it globally instead, use:

```bash
claude mcp add --global icon-mcp -- node /path/to/icon-mcp/dist/index.js
```

## 2. Verify

```bash
claude mcp list
```

You should see `icon-mcp` in the output.
