<div align="center">
  <img src="explorer/icon.png" width="128" height="128" alt="Icon MCP Logo" />
  <h1>Icon MCP</h1>
  <p><strong>A Model Context Protocol (MCP) server for giving AI agents access to 200,000+ open-source icons.</strong></p>

  <p>
    <a href="https://github.com/Just3itx/icon-mcp/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-ISC-blue.svg" alt="License: ISC" /></a>
    <img src="https://img.shields.io/badge/MCP-Ready-brightgreen" alt="MCP Ready" />
    <img src="https://img.shields.io/badge/Node-≥18-orange" alt="Node >=18" />
  </p>
</div>

<hr />

## 🌟 Overview

**Icon MCP** bridges the gap between AI coding assistants and UI design. By leveraging the Iconify API, this server allows your AI agent (like Cursor, Claude Desktop, or Windsurf) to natively **search, customize, and generate** icons across 150+ libraries in real-time.

Whether you need a React component from `lucide`, a Vue SVG from `heroicons`, or a complete favicon kit, your AI can now generate it instantly.

## ✨ Features

- **🌐 Massive Library:** Search across 200,000+ icons from every Iconify-hosted library in a single query.
- **🎨 Deep Customization:** Adjust color, size, stroke width, rotation, padding, opacity, drop shadows, and flip orientation.
- **📦 Multi-Format Export:** Retrieve icons as `React`, `Vue`, `Svelte`, `Angular`, `Solid`, `Preact` components, or as raw `SVG`, `Data URL`, `PNG`, `WEBP`, `JPEG`, and `ICO`.
- **🛠 Favicon Generation:** Create complete favicon kits (ICO + PNGs + HTML link tags) from any icon.
- **🖼️ Built-in Explorer UI:** A local web app that launches with the server, letting you browse and preview icons visually at `http://127.0.0.1:16385`.

## 🚀 Quick Start

1. **Clone & Build:**
   ```bash
   git clone https://github.com/Just3itx/icon-mcp.git
   cd icon-mcp
   npm install
   npm run build
   ```

2. **Install (Automatic):**
   ```bash
   npm run install:harness
   ```
   > An interactive TUI will help you configure your preferred AI clients automatically.

## ⚙️ Manual Configuration

If you prefer to configure your AI client manually, see the individual setup guides in the [`docs/`](docs/) directory:

| Top Clients | Guide |
|---|---|
| **Cursor** | [Setup Guide](docs/setup-cursor.md) |
| **Claude Desktop** | [Setup Guide](docs/setup-claude-desktop.md) |
| **Windsurf** | [Setup Guide](docs/setup-windsurf.md) |
| **VS Code Copilot** | [Setup Guide](docs/setup-vscode-copilot.md) |
| **Antigravity** | [Setup Guide](docs/setup-antigravity.md) |
| **Gemini CLI** | [Setup Guide](docs/setup-gemini-cli.md) |

> 🔗 **Looking for another client?** Check the [Documentation Index](docs/README.md) for 30+ supported clients including Cline, Zed, Goose, Aider, and standard JSON formats.

## 🛠 Available Tools

Icon MCP exposes 14 tools to the AI. For full parameter definitions and example prompts, see the **📖 [Tools Reference](docs/tools-reference.md)**.

### Core Tools
- `query_search` — Search icons across all or specific libraries.
- `get_icon` — Retrieve and deeply customize an icon (returns framework code or raw images).
- `get_similar_icons` — Find icons based on visual or semantic similarity.
- `generate_favicon_kit` — Create a full favicon package from a single icon.
- `get_icon_spritesheet` — Build an optimized SVG spritesheet from multiple icons.
- `suggest_icon_pairings` — Recommend a cohesive icon set for a specific UI concept.

### Information Tools
- `list_icon_libraries` / `list_libraries_amount` / `get_library_stats`
- `get_collection_info` / `list_icons_in_collection`
- `extract_icon_metadata`

### UI Tools
- `open_explorer` — Launch the visual icon browser.
- `configure_explorer` — Toggle the auto-open behavior of the Explorer UI.

## 💻 Icon Explorer

When the server starts, it hosts a local Web UI at `http://127.0.0.1:16385`. This explorer allows you to:
- Browse all 150+ libraries visually
- Test customizations in real-time
- Copy import statements or download generated assets directly

## 🧪 Testing & Development

**Test the MCP server locally:**
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

**Development loop:**
1. Make changes in `src/index.ts`
2. Run `npm run build`
3. Restart your connected AI client

## 📄 License

This project is licensed under the [ISC License](LICENSE).
