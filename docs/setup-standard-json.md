# Standard MCP JSON Format

Many clients use the same standard JSON config. If your client isn't listed with its own setup guide, use this format.

## Config Structure

Create or edit the config file at the path listed below for your client, and add `icon-mcp` under `mcpServers`:

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

## Config File Paths

| Client | Config File Path |
|---|---|
| **Amazon Q** | `~/.aws/q/mcp.json` |
| **Augment** | `~/.augment/settings.json` |
| **Codeium CLI** | `~/.codeium/mcp.json` |
| **Deep Agents** | `~/.deepagents/.mcp.json` |
| **Devin for Terminal** | `~/.config/devin/config.json` |
| **iFlow CLI** | `~/.iflow/settings.json` |
| **Kilo Code** | `~/.config/kilo/kilo.json` ¹ |
| **Kimi CLI** | `~/.kimi/mcp.json` |
| **Kiro CLI** | `~/.kiro/settings/mcp.json` |
| **Mistral Vibe** | `~/.vibe/config.toml` ² |
| **OpenHands** | `~/.openhands/mcp.json` |
| **PearAI** | `~/.pearai/mcp.json` |
| **Qwen Code** | `~/.qwen/settings.json` ³ |
| **Roo Code** | See paths below |
| **Rovo Dev** | `~/.rovodev/mcp_config.json` |
| **Sourcegraph Cody** | `~/.config/cody/mcp.json` |
| **Tabnine CLI** | `~/.tabnine/mcp_servers.json` |
| **Void Editor** | `~/.void/mcp.json` |

> ¹ Kilo Code uses `mcp` instead of `mcpServers` as the top-level key, with `"type": "local"` and `"command"` as an array.
>
> ² Mistral Vibe uses TOML format — see the [Codex guide](setup-codex.md) for TOML syntax reference.
>
> ³ Qwen Code requires `"trust": true` in the server entry.

### Roo Code Paths

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json` |
| Windows | `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\mcp_settings.json` |
| Linux | `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json` |

## After Editing

Restart your AI client for the changes to take effect.
