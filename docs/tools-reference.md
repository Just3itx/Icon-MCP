# Tools Reference

Icon MCP exposes 14 tools via the Model Context Protocol.

## list_icon_libraries

List all available icon libraries with their name, license, and total icon count.

**Parameters:** None

---

## list_libraries_amount

Returns the total number of available icon libraries.

**Parameters:** None

---

## query_search

Search for icons across all libraries or within a specific library.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | ✅ | Search term (e.g., `"home"`, `"user"`) |
| `library` | string | — | Library prefix to filter by (e.g., `"lucide"`) |

---

## get_icon

Retrieve a specific icon and customize its appearance.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `icon_name` | string | ✅ | — | Full icon name (e.g., `"lucide:home"`) |
| `format` | string | — | `"SVG-CODE"` | Output format (see below) |
| `color` | string | — | `"#FFFFFF"` | Icon color |
| `background` | string | — | `"transparent"` | Background color |
| `size` | string | — | `"100%"` | Size (pixels or percentage) |
| `strokeWidth` | number | — | `0` | Stroke width |
| `padding` | number | — | `0` | Padding |
| `opacity` | number | — | `1` | Opacity (0–1) |
| `rotation` | number | — | `0` | Rotation in degrees |
| `shadow` | number | — | `0` | Drop shadow intensity |
| `flipHorizontal` | boolean | — | `false` | Flip horizontally |
| `flipVertical` | boolean | — | `false` | Flip vertically |

### Supported Formats

| Format | Output |
|---|---|
| `SVG-CODE` | Raw SVG markup (default) |
| `DataURL` | Base64-encoded SVG data URL |
| `PNG` | Rasterized PNG |
| `WEBP` | Rasterized WEBP |
| `JPEG` | Rasterized JPEG |
| `ICO` | Windows ICO favicon |
| `React` | React JSX component |
| `Vue` | Vue SFC component |
| `Svelte` | Svelte component |
| `Angular` | Angular standalone component |
| `Solid` | SolidJS component |
| `Preact` | Preact component |

---

## get_similar_icons

Find similar icons based on a concept or existing icon name.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `icon_name` | string | ✅ | Icon name or concept |
| `library` | string | — | Library to restrict results to |

---

## generate_favicon_kit

Generate a complete favicon package (ICO, PNGs, HTML tags) from a single icon.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `icon_name` | string | ✅ | — | Full icon name |
| `color` | string | — | `"#FFFFFF"` | Icon color |
| `background` | string | — | `"transparent"` | Background color |
| `padding` | number | — | `2` | Padding |

---

## get_icon_spritesheet

Generate an SVG spritesheet from an array of icon names.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `icon_names` | string[] | ✅ | — | Array of icon names |
| `color` | string | — | `"currentColor"` | Stroke color |
| `size` | number | — | `24` | Icon size |

---

## suggest_icon_pairings

Recommend a cohesive set of icons for UI concepts.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `concepts` | string[] | ✅ | — | List of concepts (e.g., `["cart", "profile"]`) |
| `library` | string | — | `"lucide"` | Library to source from |

---

## extract_icon_metadata

Get tags, categories, and aliases for a specific icon.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `icon_name` | string | ✅ | Full icon name |

---

## get_collection_info

Get detailed info about an icon collection (author, license, categories).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `prefix` | string | ✅ | Collection prefix (e.g., `"lucide"`) |

---

## list_icons_in_collection

List all icons in a specific collection.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `prefix` | string | ✅ | Collection prefix |

---

## get_library_stats

Get total icon and collection statistics.

**Parameters:** None

---

## open_explorer

Open the built-in Icon Explorer UI in your browser at `http://127.0.0.1:16385`.

**Parameters:** None

---

## configure_explorer

Toggle auto-open behavior for the Explorer.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `autoOpen` | boolean | ✅ | `true` to auto-open on startup |
