#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import sharp from "sharp";
// @ts-ignore
import pngToIco from "png-to-ico";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let explorerUrl = "http://127.0.0.1:16385";
const CONFIG_PATH = path.resolve(__dirname, "..", "config.json");

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Failed to load config:", e);
  }
  return { autoOpen: false };
}

function saveConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error("Failed to save config:", e);
  }
}

const server = new Server(
  {
    name: "icon-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_icon_libraries",
        description: "List available icon libraries with their name, license, and total icon count.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_libraries_amount",
        description: "Returns the total number of available icon libraries.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "query_search",
        description: "Search for icons across all libraries or within a specific library.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query (e.g., 'home', 'user')" },
            library: { type: "string", description: "Optional library prefix to filter by (e.g., 'lucide', 'mdi')" }
          },
          required: ["query"]
        }
      },
      {
        name: "get_icon",
        description: "Retrieve a specific icon and customize its color, size, stroke, format, etc.",
        inputSchema: {
          type: "object",
          properties: {
            icon_name: { type: "string", description: "The full icon name (e.g., 'lucide:home', 'mdi:account')" },
            format: { 
              type: "string", 
              enum: ["React", "Vue", "Svelte", "Angular", "Solid", "Preact", "SVG-CODE", "DataURL", "PNG", "ICO", "WEBP", "JPEG"],
              default: "SVG-CODE"
            },
            color: { type: "string", default: "#FFFFFF" },
            background: { type: "string", default: "transparent" },
            size: { type: "string", description: "String percentage or pixel number", default: "100%" },
            strokeWidth: { type: "number", default: 0 },
            padding: { type: "number", default: 0 },
            opacity: { type: "number", default: 1 },
            rotation: { type: "number", default: 0 },
            shadow: { type: "number", default: 0 },
            flipHorizontal: { type: "boolean", default: false },
            flipVertical: { type: "boolean", default: false }
          },
          required: ["icon_name"]
        }
      },
      {
        name: "get_similar_icons",
        description: "Find visually or semantically similar icons based on a concept or an existing icon name.",
        inputSchema: {
          type: "object",
          properties: {
            icon_name: { type: "string", description: "The existing icon name or concept (e.g., 'trash-2', 'lucide:home')" },
            library: { type: "string", description: "Optional library to restrict results to (e.g., 'mdi')" }
          },
          required: ["icon_name"]
        }
      },
      {
        name: "generate_favicon_kit",
        description: "Generate a complete favicon package (ICO, PNGs, and HTML tags) from a single icon.",
        inputSchema: {
          type: "object",
          properties: {
            icon_name: { type: "string", description: "The full icon name (e.g., 'lucide:home')" },
            color: { type: "string", default: "#FFFFFF" },
            background: { type: "string", default: "transparent" },
            padding: { type: "number", default: 2 }
          },
          required: ["icon_name"]
        }
      },
      {
        name: "get_icon_spritesheet",
        description: "Generate an optimized SVG spritesheet from an array of icon names.",
        inputSchema: {
          type: "object",
          properties: {
            icon_names: { 
              type: "array", 
              items: { type: "string" },
              description: "Array of full icon names (e.g., ['lucide:home', 'lucide:settings'])" 
            },
            color: { type: "string", default: "currentColor" },
            size: { type: "number", default: 24 }
          },
          required: ["icon_names"]
        }
      },
      {
        name: "suggest_icon_pairings",
        description: "Recommend a cohesive set of icons for a specific UI context.",
        inputSchema: {
          type: "object",
          properties: {
            concepts: { type: "array", items: { type: "string" }, description: "List of abstract concepts (e.g., ['cart', 'profile', 'settings'])" },
            library: { type: "string", description: "The library to source icons from for consistency (e.g., 'lucide')", default: "lucide" }
          },
          required: ["concepts"]
        }
      },
      {
        name: "extract_icon_metadata",
        description: "Get detailed metadata about an icon, including tags, categories, and aliases.",
        inputSchema: {
          type: "object",
          properties: {
            icon_name: { type: "string", description: "The full icon name (e.g., 'lucide:home')" }
          },
          required: ["icon_name"]
        }
      },
      {
        name: "get_collection_info",
        description: "Get detailed information about an icon collection (author, license, categories, etc.).",
        inputSchema: {
          type: "object",
          properties: {
            prefix: { type: "string", description: "The collection prefix (e.g., 'lucide', 'mdi')" }
          },
          required: ["prefix"]
        }
      },
      {
        name: "list_icons_in_collection",
        description: "List all icons available in a specific collection.",
        inputSchema: {
          type: "object",
          properties: {
            prefix: { type: "string", description: "The collection prefix (e.g., 'lucide')" }
          },
          required: ["prefix"]
        }
      },
      {
        name: "get_library_stats",
        description: "Get statistics about the total number of icons and collections available.",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "open_explorer",
        description: "Manually open the Icon Explorer in the default browser.",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "configure_explorer",
        description: "Configure explorer behavior, such as whether it should automatically open on startup.",
        inputSchema: {
          type: "object",
          properties: {
            autoOpen: { type: "boolean", description: "Whether to automatically open the explorer on server startup." }
          },
          required: ["autoOpen"]
        }
      }
    ],
  };
});

interface IconifyLicense {
  title?: string;
  spdx?: string;
  url?: string;
}

interface IconifyCollection {
  name: string;
  total: number;
  license?: IconifyLicense;
  [key: string]: unknown;
}

function toPascalCase(str: string): string {
  return str.split(/[-_:]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[:_]/g, "-").toLowerCase();
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "list_icon_libraries") {
    try {
      const response = await fetch("https://api.iconify.design/collections");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = (await response.json()) as Record<string, IconifyCollection>;

      const libraries = Object.keys(data).map((key) => {
        const lib = data[key];
        return {
          id: key,
          name: lib.name,
          license: lib.license?.title || lib.license?.spdx || "Unknown",
          total: lib.total,
        };
      });

      return {
        content: [{ type: "text", text: JSON.stringify(libraries, null, 2) }],
      };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Error: ${error}` }] };
    }
  }

  if (request.params.name === "list_libraries_amount") {
    try {
      const response = await fetch("https://api.iconify.design/collections");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = (await response.json()) as Record<string, IconifyCollection>;
      return { content: [{ type: "text", text: `There are exactly ${Object.keys(data).length} icon libraries available.` }] };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Error: ${error}` }] };
    }
  }

  if (request.params.name === "query_search") {
    try {
      const { query, library } = request.params.arguments as any;
      const url = new URL("https://api.iconify.design/search");
      url.searchParams.set("query", query);
      if (library) url.searchParams.set("prefix", library);
      url.searchParams.set("limit", "100");

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return {
        content: [{ type: "text", text: JSON.stringify(data.icons || [], null, 2) }],
      };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Search failed: ${error}` }] };
    }
  }

  if (request.params.name === "get_icon") {
    try {
      const args = request.params.arguments as any;
      const icon_name = args.icon_name;
      const format = args.format || "SVG-CODE";
      const color = args.color || "#FFFFFF";
      const background = args.background || "transparent";
      const size = args.size === undefined ? "100%" : args.size;
      const strokeWidth = args.strokeWidth ?? 2;
      const padding = args.padding ?? 0;
      const opacity = args.opacity ?? 1;
      const rotation = args.rotation ?? 0;
      const shadow = args.shadow ?? 0;
      const flipHorizontal = args.flipHorizontal ?? false;
      const flipVertical = args.flipVertical ?? false;

      const [prefix, name] = icon_name.split(":");
      if (!prefix || !name) throw new Error("Invalid icon_name format. Expected prefix:name");

      const response = await fetch(`https://api.iconify.design/${prefix}.json?icons=${name}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      const iconData = data.icons?.[name];
      if (!iconData) throw new Error(`Icon ${icon_name} not found.`);

      const body = iconData.body;
      const compName = toPascalCase(icon_name) + "Icon";
      const kebabCompName = toKebabCase(icon_name) + "-icon";

      const transforms = [];
      if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
      if (flipHorizontal) transforms.push('scaleX(-1)');
      if (flipVertical) transforms.push('scaleY(-1)');
      const transformStr = transforms.join(' ');

      const viewBoxSize = 24 + (padding * 2);
      const viewBoxOffset = -padding;
      const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;
      const filterStr = shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : '';

      const rawSize = size === "100%" || size === undefined ? 256 : parseInt(size.toString().replace("%", "")) * 2.56 || 256;

      const pureSvgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${rawSize}" height="${rawSize}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="opacity:${opacity};${transformStr ? `transform:${transformStr};` : ''}${filterStr ? `filter:${filterStr};` : ''}${background !== 'transparent' ? `background-color:${background};` : ''}">${body}</svg>`;

      if (["PNG", "WEBP", "JPEG", "ICO"].includes(format)) {
        let buffer = Buffer.from(pureSvgCode);
        
        let outBuffer: Buffer;
        let mimeType: string;

        if (format === "PNG") {
          outBuffer = await sharp(buffer).png().toBuffer();
          mimeType = "image/png";
        } else if (format === "WEBP") {
          outBuffer = await sharp(buffer).webp().toBuffer();
          mimeType = "image/webp";
        } else if (format === "JPEG") {
          outBuffer = await sharp(buffer).flatten({ background: background !== 'transparent' ? background : '#FFFFFF' }).jpeg().toBuffer();
          mimeType = "image/jpeg";
        } else if (format === "ICO") {
          const pngBuf = await sharp(buffer).png().toBuffer();
          outBuffer = await pngToIco(pngBuf);
          mimeType = "image/x-icon";
        } else {
          throw new Error("Unsupported image format");
        }

        return {
          content: [
            {
              type: "image",
              data: outBuffer.toString("base64"),
              mimeType
            }
          ]
        };
      }

      let codeOutput = "";

      switch (format) {
        case "React":
          codeOutput = `import React from 'react';\n\nconst ${compName} = ({\n  size = ${typeof size === 'string' ? `'${size}'` : size},\n  color = '${color}',\n  strokeWidth = ${strokeWidth},\n  background = '${background}',\n  opacity = ${opacity},\n  rotation = ${rotation},\n  shadow = ${shadow},\n  flipHorizontal = ${flipHorizontal},\n  flipVertical = ${flipVertical},\n  padding = ${padding}\n}) => {\n  const transforms = [];\n  if (rotation !== 0) transforms.push(\`rotate(\${rotation}deg)\`);\n  if (flipHorizontal) transforms.push('scaleX(-1)');\n  if (flipVertical) transforms.push('scaleY(-1)');\n\n  const viewBoxSize = 24 + (padding * 2);\n  const viewBoxOffset = -padding;\n  const viewBox = \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n\n  return (\n    <svg\n      xmlns="http://www.w3.org/2000/svg"\n      viewBox={viewBox}\n      width={size}\n      height={size}\n      fill="none"\n      stroke={color}\n      strokeWidth={strokeWidth}\n      strokeLinecap="round"\n      strokeLinejoin="round"\n      style={{\n        opacity,\n        transform: transforms.join(' ') || undefined,\n        filter: shadow > 0 ? \`drop-shadow(0 \${shadow}px \${shadow * 2}px rgba(0,0,0,0.3))\` : undefined,\n        backgroundColor: background !== 'transparent' ? background : undefined\n      }}\n    >\n      ${body}\n    </svg>\n  );\n};\n\nexport default ${compName};`;
          break;
        case "Vue":
          codeOutput = `<template>\n  <svg\n    xmlns="http://www.w3.org/2000/svg"\n    :width="size"\n    :height="size"\n    :viewBox="viewBox"\n    fill="none"\n    :stroke="color"\n    :stroke-width="strokeWidth"\n    stroke-linecap="round"\n    stroke-linejoin="round"\n    :style="getStyle()"\n  >\n    ${body}\n  </svg>\n</template>\n\n<script>\nexport default {\n  name: '${compName}',\n  props: {\n    size: { type: [Number, String], default: ${typeof size === 'string' ? `'${size}'` : size} },\n    color: { type: String, default: '${color}' },\n    strokeWidth: { type: Number, default: ${strokeWidth} },\n    background: { type: String, default: '${background}' },\n    opacity: { type: Number, default: ${opacity} },\n    rotation: { type: Number, default: ${rotation} },\n    shadow: { type: Number, default: ${shadow} },\n    flipHorizontal: { type: Boolean, default: ${flipHorizontal} },\n    flipVertical: { type: Boolean, default: ${flipVertical} },\n    padding: { type: Number, default: ${padding} }\n  },\n  computed: {\n    viewBox() {\n      const viewBoxSize = 24 + (this.padding * 2);\n      const viewBoxOffset = -this.padding;\n      return \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n    },\n    getStyle() {\n      const transforms = [];\n      if (this.rotation !== 0) transforms.push(\`rotate(\${this.rotation}deg)\`);\n      if (this.flipHorizontal) transforms.push('scaleX(-1)');\n      if (this.flipVertical) transforms.push('scaleY(-1)');\n\n      return {\n        opacity: this.opacity,\n        transform: transforms.join(' ') || undefined,\n        filter: this.shadow > 0 ? \`drop-shadow(0 \${this.shadow}px \${this.shadow * 2}px rgba(0,0,0,0.3))\` : undefined,\n        backgroundColor: this.background !== 'transparent' ? this.background : undefined\n      };\n    }\n  }\n}\n</script>`;
          break;
        case "Svelte":
          codeOutput = `<script>\n  export let size = ${typeof size === 'string' ? `'${size}'` : size};\n  export let color = '${color}';\n  export let strokeWidth = ${strokeWidth};\n  export let background = '${background}';\n  export let opacity = ${opacity};\n  export let rotation = ${rotation};\n  export let shadow = ${shadow};\n  export let flipHorizontal = ${flipHorizontal};\n  export let flipVertical = ${flipVertical};\n  export let padding = ${padding};\n\n  $: transforms = [\n    rotation !== 0 ? \`rotate(\${rotation}deg)\` : '',\n    flipHorizontal ? 'scaleX(-1)' : '',\n    flipVertical ? 'scaleY(-1)' : ''\n  ].filter(Boolean).join(' ');\n\n  $: viewBoxSize = 24 + (padding * 2);\n  $: viewBoxOffset = -padding;\n  $: viewBox = \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n  $: bgColor = background !== 'transparent' ? background : undefined;\n</script>\n\n<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width={size}\n  height={size}\n  viewBox={viewBox}\n  fill="none"\n  stroke={color}\n  stroke-width={strokeWidth}\n  stroke-linecap="round"\n  stroke-linejoin="round"\n  style="opacity: {opacity}; transform: {transforms}; {shadow > 0 ? \`filter: drop-shadow(0 \${shadow}px \${shadow * 2}px rgba(0,0,0,0.3));\` : ''} {bgColor ? \`background-color: \${bgColor}\` : ''}"\n>\n  ${body}\n</svg>`;
          break;
        case "Angular":
          codeOutput = `import { Component, Input } from '@angular/core';\n\n@Component({\n  selector: 'app-${kebabCompName}',\n  template: \`\n    <svg\n      xmlns="http://www.w3.org/2000/svg"\n      [attr.width]="size"\n      [attr.height]="size"\n      [attr.viewBox]="getViewBox()"\n      fill="none"\n      [attr.stroke]="color"\n      [attr.stroke-width]="strokeWidth"\n      stroke-linecap="round"\n      stroke-linejoin="round"\n      [ngStyle]="getStyle()"\n    >\n      ${body}\n    </svg>\n  \`,\n  standalone: true\n})\nexport class ${compName}Component {\n  @Input() size: string | number = ${typeof size === 'string' ? `'${size}'` : size};\n  @Input() color: string = '${color}';\n  @Input() strokeWidth: number = ${strokeWidth};\n  @Input() background: string = '${background}';\n  @Input() opacity: number = ${opacity};\n  @Input() rotation: number = ${rotation};\n  @Input() shadow: number = ${shadow};\n  @Input() flipHorizontal: boolean = ${flipHorizontal};\n  @Input() flipVertical: boolean = ${flipVertical};\n  @Input() padding: number = ${padding};\n\n  getViewBox(): string {\n    const viewBoxSize = 24 + (this.padding * 2);\n    const viewBoxOffset = -this.padding;\n    return \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n  }\n\n  getStyle(): any {\n    const transforms = [];\n    if (this.rotation !== 0) transforms.push(\`rotate(\${this.rotation}deg)\`);\n    if (this.flipHorizontal) transforms.push('scaleX(-1)');\n    if (this.flipVertical) transforms.push('scaleY(-1)');\n\n    return {\n      opacity: this.opacity,\n      transform: transforms.join(' ') || undefined,\n      filter: this.shadow > 0 ? \`drop-shadow(0 \${this.shadow}px \${this.shadow * 2}px rgba(0,0,0,0.3))\` : undefined,\n      backgroundColor: this.background !== 'transparent' ? this.background : undefined\n    };\n  }\n}`;
          break;
        case "Solid":
          codeOutput = `import { Component, mergeProps } from 'solid-js';\n\ninterface ${compName}Props {\n  size?: string | number;\n  color?: string;\n  strokeWidth?: number;\n  background?: string;\n  opacity?: number;\n  rotation?: number;\n  shadow?: number;\n  flipHorizontal?: boolean;\n  flipVertical?: boolean;\n  padding?: number;\n}\n\nconst ${compName}: Component<${compName}Props> = (props) => {\n  const merged = mergeProps({\n    size: ${typeof size === 'string' ? `'${size}'` : size},\n    color: '${color}',\n    strokeWidth: ${strokeWidth},\n    background: '${background}',\n    opacity: ${opacity},\n    rotation: ${rotation},\n    shadow: ${shadow},\n    flipHorizontal: ${flipHorizontal},\n    flipVertical: ${flipVertical},\n    padding: ${padding}\n  }, props);\n\n  const transforms = () => {\n    const t = [];\n    if (merged.rotation !== 0) t.push(\`rotate(\${merged.rotation}deg)\`);\n    if (merged.flipHorizontal) t.push('scaleX(-1)');\n    if (merged.flipVertical) t.push('scaleY(-1)');\n    return t.join(' ') || undefined;\n  };\n\n  const viewBoxSize = () => 24 + (merged.padding * 2);\n  const viewBoxOffset = () => -merged.padding;\n  const viewBox = () => \`\${viewBoxOffset()} \${viewBoxOffset()} \${viewBoxSize()} \${viewBoxSize()}\`;\n\n  return (\n    <svg\n      xmlns="http://www.w3.org/2000/svg"\n      width={merged.size}\n      height={merged.size}\n      viewBox={viewBox()}\n      fill="none"\n      stroke={merged.color}\n      stroke-width={merged.strokeWidth}\n      stroke-linecap="round"\n      stroke-linejoin="round"\n      style={{\n        opacity: merged.opacity,\n        transform: transforms(),\n        filter: merged.shadow > 0 ? \`drop-shadow(0 \${merged.shadow}px \${merged.shadow * 2}px rgba(0,0,0,0.3))\` : undefined,\n        'background-color': merged.background !== 'transparent' ? merged.background : undefined\n      }}\n    >\n      ${body}\n    </svg>\n  );\n};\n\nexport default ${compName};`;
          break;
        case "Preact":
          codeOutput = `import { h } from 'preact';\n\nconst ${compName} = ({\n  size = ${typeof size === 'string' ? `'${size}'` : size},\n  color = '${color}',\n  strokeWidth = ${strokeWidth},\n  background = '${background}',\n  opacity = ${opacity},\n  rotation = ${rotation},\n  shadow = ${shadow},\n  flipHorizontal = ${flipHorizontal},\n  flipVertical = ${flipVertical},\n  padding = ${padding}\n}) => {\n  const transforms = [];\n  if (rotation !== 0) transforms.push(\`rotate(\${rotation}deg)\`);\n  if (flipHorizontal) transforms.push('scaleX(-1)');\n  if (flipVertical) transforms.push('scaleY(-1)');\n\n  const viewBoxSize = 24 + (padding * 2);\n  const viewBoxOffset = -padding;\n  const viewBox = \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n\n  return (\n    <svg\n      xmlns="http://www.w3.org/2000/svg"\n      viewBox={viewBox}\n      width={size}\n      height={size}\n      fill="none"\n      stroke={color}\n      strokeWidth={strokeWidth}\n      strokeLinecap="round"\n      strokeLinejoin="round"\n      style={{\n        opacity,\n        transform: transforms.join(' ') || undefined,\n        filter: shadow > 0 ? \`drop-shadow(0 \${shadow}px \${shadow * 2}px rgba(0,0,0,0.3))\` : undefined,\n        backgroundColor: background !== 'transparent' ? background : undefined\n      }}\n    >\n      ${body}\n    </svg>\n  );\n};\n\nexport default ${compName};`;
          break;
        case "SVG-CODE":
          codeOutput = pureSvgCode;
          break;
        case "DataURL":
          codeOutput = `data:image/svg+xml;base64,${Buffer.from(pureSvgCode).toString("base64")}`;
          break;
        default:
          codeOutput = pureSvgCode;
      }

      return {
        content: [
          {
            type: "text",
            text: codeOutput
          }
        ]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to process icon: ${errorMessage}` }]
      };
    }
  }

  if (request.params.name === "get_similar_icons") {
    try {
      const args = request.params.arguments as any;
      let query = args.icon_name;
      if (query.includes(":")) query = query.split(":")[1];
      query = query.replace(/[-_]/g, " ");

      const url = new URL("https://api.iconify.design/search");
      url.searchParams.set("query", query);
      if (args.library) url.searchParams.set("prefix", args.library);
      url.searchParams.set("limit", "15");

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return { content: [{ type: "text", text: JSON.stringify(data.icons || [], null, 2) }] };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Search failed: ${error}` }] };
    }
  }

  if (request.params.name === "generate_favicon_kit") {
    try {
      const args = request.params.arguments as any;
      const [prefix, name] = args.icon_name.split(":");
      if (!prefix || !name) throw new Error("Invalid icon_name format.");

      const response = await fetch(`https://api.iconify.design/${prefix}.json?icons=${name}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const iconData = data.icons?.[name];
      if (!iconData) throw new Error("Icon not found.");

      const padding = args.padding ?? 2;
      const color = args.color || "#FFFFFF";
      const background = args.background || "transparent";

      const viewBoxSize = 24 + (padding * 2);
      const viewBoxOffset = -padding;
      const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

      const rawSize = 512;
      const pureSvgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${rawSize}" height="${rawSize}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${background !== 'transparent' ? `background-color:${background};` : ''}">${iconData.body}</svg>`;
      const buffer = Buffer.from(pureSvgCode);

      const png192 = await sharp(buffer).resize(192, 192).png().toBuffer();
      const png512 = await sharp(buffer).resize(512, 512).png().toBuffer();
      const appleIcon = await sharp(buffer).resize(180, 180).png().flatten({ background: background !== 'transparent' ? background : '#FFFFFF' }).toBuffer();
      
      const png32 = await sharp(buffer).resize(32, 32).png().toBuffer();
      const icoBuf = await pngToIco(png32);

      const htmlTags = `
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
      `.trim();

      return {
        content: [
          { type: "text", text: `Here are the HTML tags to include in your <head>:\n\n${htmlTags}\n\nThe images are attached below (ICO, PNG-192, PNG-512, Apple-Touch-Icon).` },
          { type: "image", data: icoBuf.toString("base64"), mimeType: "image/x-icon" },
          { type: "image", data: png192.toString("base64"), mimeType: "image/png" },
          { type: "image", data: png512.toString("base64"), mimeType: "image/png" },
          { type: "image", data: appleIcon.toString("base64"), mimeType: "image/png" }
        ]
      };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Favicon kit generation failed: ${error}` }] };
    }
  }

  if (request.params.name === "get_icon_spritesheet") {
    try {
      const args = request.params.arguments as any;
      const icon_names = args.icon_names as string[];
      const color = args.color || "currentColor";
      const size = args.size || 24;

      let symbols = "";

      for (const icon_name of icon_names) {
        const [prefix, name] = icon_name.split(":");
        if (!prefix || !name) continue;
        const response = await fetch(`https://api.iconify.design/${prefix}.json?icons=${name}`);
        if (!response.ok) continue;
        const data = await response.json();
        const iconData = data.icons?.[name];
        if (!iconData) continue;
        
        symbols += `  <symbol id="${prefix}-${name}" viewBox="0 0 ${iconData.width || size} ${iconData.height || size}">\n    <g stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">\n      ${iconData.body}\n    </g>\n  </symbol>\n`;
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n<defs>\n${symbols}</defs>\n</svg>`;

      return { content: [{ type: "text", text: svg }] };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Spritesheet generation failed: ${error}` }] };
    }
  }

  if (request.params.name === "suggest_icon_pairings") {
    try {
      const args = request.params.arguments as any;
      const concepts = args.concepts as string[];
      const library = args.library || "lucide";
      
      const results: Record<string, string> = {};
      for (const concept of concepts) {
        const response = await fetch(`https://api.iconify.design/search?query=${concept}&prefix=${library}&limit=1`);
        const data = await response.json();
        if (data.icons && data.icons.length > 0) {
          results[concept] = data.icons[0];
        } else {
          results[concept] = "Not found";
        }
      }

      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Suggestion failed: ${error}` }] };
    }
  }

  if (request.params.name === "extract_icon_metadata") {
    try {
      const args = request.params.arguments as any;
      const [prefix, name] = args.icon_name.split(":");
      
      const searchRes = await fetch(`https://api.iconify.design/search?query=${name}&prefix=${prefix}&limit=1`);
      const searchData = await searchRes.json();
      
      return { content: [{ type: "text", text: JSON.stringify(searchData, null, 2) }] };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Metadata extraction failed: ${error}` }] };
    }
  }

  if (request.params.name === "get_collection_info") {
    try {
      const { prefix } = request.params.arguments as any;
      const response = await fetch(`https://api.iconify.design/collection?prefix=${prefix}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Failed to get collection info: ${error}` }] };
    }
  }

  if (request.params.name === "list_icons_in_collection") {
    try {
      const { prefix } = request.params.arguments as any;
      const response = await fetch(`https://api.iconify.design/${prefix}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const icons = Object.keys(data.icons || {});
      return { content: [{ type: "text", text: JSON.stringify(icons, null, 2) }] };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Failed to list icons: ${error}` }] };
    }
  }

  if (request.params.name === "open_explorer") {
    try {
      const platform = process.platform;
      let cmd = "";
      if (platform === "win32") {
        cmd = `start "" "${explorerUrl}"`;
      } else if (platform === "darwin") {
        cmd = `open "${explorerUrl}"`;
      } else {
        cmd = `xdg-open "${explorerUrl}"`;
      }

      return new Promise((resolve) => {
        exec(cmd, (error) => {
          if (error) {
            resolve({ isError: true, content: [{ type: "text", text: `Failed to open explorer: ${error.message}` }] });
          } else {
            resolve({ content: [{ type: "text", text: "Successfully requested browser to open explorer." }] });
          }
        });
      });
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Error: ${error}` }] };
    }
  }

  if (request.params.name === "configure_explorer") {
    try {
      const { autoOpen } = request.params.arguments as any;
      const config = loadConfig();
      config.autoOpen = autoOpen;
      saveConfig(config);
      return { content: [{ type: "text", text: `Explorer auto-open has been ${autoOpen ? "enabled" : "disabled"}. This setting will take effect on the next server startup.` }] };
    } catch (error: unknown) {
      return { isError: true, content: [{ type: "text", text: `Configuration failed: ${error}` }] };
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Icon MCP Server running on stdio");

  let explorerDir = path.resolve(__dirname, "explorer");
  
  if (!fs.existsSync(explorerDir)) {
    const devExplorerDir = path.resolve(__dirname, "..", "explorer");
    if (fs.existsSync(devExplorerDir)) {
      explorerDir = devExplorerDir;
    } else {
      console.error(`Error: Explorer directory not found at ${explorerDir}`);
      return;
    }
  }

  const httpServer = http.createServer(async (req, res) => {
    try {
      const urlPath = req.url?.split('?')[0] || '/';
      let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
      
      if (safePath === '/' || safePath === '\\' || safePath === '.') {
        safePath = 'index.html';
      }

      const filePath = path.join(explorerDir, safePath);

      if (!filePath.startsWith(explorerDir)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      // Handle on-the-fly compilation of app.ts to app.js during development
      if (path.basename(safePath) === 'app.js' && !fs.existsSync(filePath)) {
        const tsPath = path.join(explorerDir, 'app.ts');
        if (fs.existsSync(tsPath)) {
          try {
            const ts = await import("typescript");
            const tsCode = fs.readFileSync(tsPath, "utf8");
            const jsCode = ts.default.transpileModule(tsCode, {
              compilerOptions: { 
                target: ts.default.ScriptTarget.ES2022,
                module: ts.default.ModuleKind.ESNext
              }
            }).outputText;

            res.writeHead(200, { 
              "Content-Type": "text/javascript",
              "Cache-Control": "no-cache"
            });
            res.end(jsCode);
            return;
          } catch (tsError) {
            console.error("Failed to dynamically compile app.ts:", tsError);
          }
        }
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404);
          res.end("Not Found");
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimes: Record<string, string> = {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".png": "image/png",
          ".ico": "image/x-icon",
          ".svg": "image/svg+xml"
        };

        res.writeHead(200, { 
          "Content-Type": mimes[ext] || "text/plain",
          "Cache-Control": "no-cache"
        });
        
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
      });
    } catch (e) {
      console.error(`HTTP Server Error: ${e}`);
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  });

  httpServer.on('error', (err) => {
    console.error(`HTTP Server Listener Error: ${err.message}`);
  });

  httpServer.listen(16385, "127.0.0.1", () => {
    explorerUrl = `http://127.0.0.1:16385`;
    console.error(`Explorer available at: ${explorerUrl}`);

    const config = loadConfig();
    if (config.autoOpen) {
      const platform = process.platform;
      let cmd = "";
      if (platform === "win32") {
        cmd = `start "" "${explorerUrl}"`;
      } else if (platform === "darwin") {
        cmd = `open "${explorerUrl}"`;
      } else {
        cmd = `xdg-open "${explorerUrl}"`;
      }

      exec(cmd, (error) => {
        if (error) {
          console.error(`Failed to auto-open explorer: ${error.message}`);
        } else {
          console.error("Successfully auto-opened explorer.");
        }
      });
    } else {
      console.error("Auto-open is disabled. Use the 'open_explorer' tool to launch the UI.");
    }
  });
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
