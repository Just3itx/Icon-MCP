const API_BASE = "https://api.iconify.design";


const state = {
  view: 'home',
  collections: null,
  currentLibrary: null,
  currentLibraryIcons: [],
  currentLibraryFilter: '',
  renderLimit: 200,
  searchQuery: '',
  currentIcon: null
};


const views = {
  home: document.getElementById('view-home'),
  library: document.getElementById('view-library'),
  customize: document.getElementById('view-customize')
};

const el = {
  logoBtn: document.getElementById('nav-home'),
  searchInput: document.getElementById('search-input'),
  libraryGrid: document.getElementById('library-grid'),
  recommendedGrid: document.getElementById('recommended-grid'),
  recommendedSection: document.getElementById('recommended-section'),
  libSearchInput: document.getElementById('lib-search-input'),
  libIconSearch: document.getElementById('lib-icon-search'),
  btnLibraryCustomize: document.getElementById('btn-library-customize'),
  custTags: document.getElementById('cust-tags'),
  
  libTitle: document.getElementById('lib-title'),
  libSubtitle: document.getElementById('lib-subtitle'),
  iconGrid: document.getElementById('icon-grid'),
  btnBackLib: document.getElementById('btn-back-lib'),
  
  custTitle: document.getElementById('cust-title'),
  btnBackCust: document.getElementById('btn-back-cust'),
  previewIcon: document.getElementById('cust-preview-icon'),
  

  cFormat: document.getElementById('cust-format'),
  cColor: document.getElementById('cust-color'),
  cColorPicker: document.getElementById('cust-color-picker'),
  cSize: document.getElementById('cust-size'),
  cStroke: document.getElementById('cust-stroke'),
  strokeVal: document.getElementById('stroke-val'),
  cRotation: document.getElementById('cust-rotation'),
  cPadding: document.getElementById('cust-padding'),
  paddingVal: document.getElementById('padding-val'),
  cOpacity: document.getElementById('cust-opacity'),
  opacityVal: document.getElementById('opacity-val'),
  cShadow: document.getElementById('cust-shadow'),
  shadowVal: document.getElementById('shadow-val'),
  cFlipH: document.getElementById('cust-flip-h'),
  cFlipV: document.getElementById('cust-flip-v'),
  
  btnCopy: document.getElementById('btn-copy-cmd'),
  promptOut: document.getElementById('prompt-output'),
  toastRegion: document.getElementById('toast-region'),

  floatingConfigPanel: document.getElementById('floating-config-panel'),
  btnOpenCustomize: document.getElementById('btn-open-customize'),
  btnCloseFloating: document.getElementById('btn-close-floating'),

  btnResetCustomize: document.getElementById('btn-reset-customize'),

  libraryConfigMenu: document.getElementById('library-config-menu'),
  globalColor: document.getElementById('global-color'),
  globalColorText: document.getElementById('global-color-text'),
  btnGlobalReset: document.getElementById('btn-global-reset'),

  formatSelectWrapper: document.getElementById('format-select-wrapper'),
  formatSelectTrigger: document.getElementById('format-select-trigger'),
  formatSelectMenu: document.getElementById('format-select-menu'),
  formatTriggerLabel: document.getElementById('format-trigger-label'),
  formatTriggerBadge: document.getElementById('format-trigger-badge')
};


const previewObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const prefix = entry.target.dataset.prefix;
      if (prefix && !entry.target.dataset.loaded) {
        entry.target.dataset.loaded = "true";
        fetchLibraryPreview(prefix, entry.target.querySelector('.lib-preview'));
      }
    }
  });
}, { rootMargin: '0px 0px 200px 0px' });


const infiniteScrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      infiniteScrollObserver.unobserve(entry.target);
      entry.target.remove();
      state.renderLimit += 200;
      appendLibraryIcons();
    }
  });
}, { rootMargin: '0px 0px 400px 0px' });


async function init() {
  setupEventListeners();
  await loadCollections();
  renderView('home');
}

function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!views.customize.classList.contains('hidden')) {
        el.btnBackCust.click();
      } else if (!views.library.classList.contains('hidden')) {
        el.btnBackLib.click();
      } else if (document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur();
      }
    }
  });

  el.logoBtn.addEventListener('click', () => {
    state.searchQuery = '';
    el.searchInput.value = '';
    renderView('home');
  });

  el.btnBackLib.addEventListener('click', () => renderView('home'));
  
  el.btnBackCust.addEventListener('click', () => {
    if (state.currentLibrary) renderView('library', state.currentLibrary);
    else renderView('home'); // Fallback
  });
  
  if (el.btnOpenCustomize) {
    el.btnOpenCustomize.addEventListener('click', () => {
      el.floatingConfigPanel.classList.remove('hidden');
    });
  }
  
  if (el.btnOpenCustomize) {
    el.btnOpenCustomize.addEventListener('click', () => {
      el.floatingConfigPanel.classList.remove('hidden');
    });
  }

  if (el.btnLibraryCustomize) {
    el.btnLibraryCustomize.addEventListener('click', () => {
      el.floatingConfigPanel.classList.remove('hidden');
    });
  }

  if (el.btnCloseFloating) {
    el.btnCloseFloating.addEventListener('click', () => {
      el.floatingConfigPanel.classList.add('hidden');
    });
  }

  if (el.btnResetCustomize) {
    el.btnResetCustomize.addEventListener('click', () => {
      if (state.currentIcon) {
        renderCustomize(state.currentIcon);
        showToast('Settings Reset');
      } else if (state.view === 'library') {
        document.documentElement.style.removeProperty('--global-icon-color');
        document.documentElement.style.removeProperty('--global-icon-color-hover');
        if (window.custColorPickr) custColorPickr.setColor('#ffffff');
        showToast('Library Settings Reset');
      }
    });
  }

  let searchTimeout;
  el.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    state.searchQuery = e.target.value.trim();
    searchTimeout = setTimeout(() => {
      if (state.searchQuery) {
        doGlobalSearch(state.searchQuery);
      } else {
        renderView('home');
      }
    }, 400);
  });

  el.libSearchInput.addEventListener('input', (e) => {
    renderLibraries(e.target.value.trim().toLowerCase());
  });


  document.querySelectorAll('.cat-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (cat === "All") {
        el.searchInput.value = "";
        state.searchQuery = "";
        renderLibraries();
      } else {
        renderLibraries('', cat);
      }
    });
  });

  el.libIconSearch.addEventListener('input', (e) => {
    renderLibraryIcons(e.target.value.trim().toLowerCase());
  });


  const pickrConfig = {
    theme: 'monolith',
    swatches: [
      '#ffffff',
      '#000000',
      '#ef4444',
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899'
    ],
    components: {
      preview: true,
      opacity: true,
      hue: true,
      interaction: {
        hex: true,
        rgba: true,
        input: true,
        save: true
      }
    }
  };


  const custColorPickr = window.custColorPickr = Pickr.create({
    el: '#cust-color-picker-container',
    default: '#ffffff',
    ...pickrConfig
  });

  const custBgPickr = window.custBgPickr = Pickr.create({
    el: '#cust-bg-picker-container',
    default: 'transparent',
    ...pickrConfig
  });

  const cBg = document.getElementById('cust-bg');


  if (el.formatSelectTrigger) {
    el.formatSelectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      el.formatSelectWrapper.classList.toggle('open');
      el.formatSelectMenu.classList.toggle('hidden');
      el.formatSelectTrigger.setAttribute('aria-expanded', !el.formatSelectMenu.classList.contains('hidden'));
    });

    document.querySelectorAll('.custom-option').forEach(option => {
      option.addEventListener('click', (e) => {
        document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        el.cFormat.value = option.dataset.value;
        el.formatTriggerLabel.textContent = option.querySelector('span:first-child').textContent;
        el.formatTriggerBadge.textContent = option.dataset.badge;
        
        el.formatSelectWrapper.classList.remove('open');
        el.formatSelectMenu.classList.add('hidden');
        el.formatSelectTrigger.setAttribute('aria-expanded', 'false');
        
        syncCustomizer();
      });
    });

    document.addEventListener('click', (e) => {
      if (el.formatSelectWrapper && !el.formatSelectWrapper.contains(e.target)) {
        el.formatSelectWrapper.classList.remove('open');
        el.formatSelectMenu.classList.add('hidden');
        el.formatSelectTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  const syncCustomizer = () => {
    updatePromptPreview();
    const format = el.cFormat.value;
    const isImage = ["PNG", "JPEG", "WEBP"].includes(format);
    document.getElementById('copy-btn-text').textContent = isImage ? 'Copy Image' : 'Copy Code';
    

    const rot = el.cRotation.value;
    const pad = el.cPadding.value;
    const op = el.cOpacity.value;
    const shad = el.cShadow.value;
    const flipH = el.cFlipH.checked ? -1 : 1;
    const flipV = el.cFlipV.checked ? -1 : 1;
    
    let transformStr = `rotate(${rot}deg)`;
    if (flipH === -1 || flipV === -1) {
      transformStr += ` scale(${flipH}, ${flipV})`;
    }
    
    el.previewIcon.style.transform = transformStr;
    el.previewIcon.style.padding = `${pad}px`;
    el.previewIcon.style.opacity = op;
    el.previewIcon.style.filter = shad > 0 ? `drop-shadow(0 ${shad}px ${shad * 2}px rgba(0,0,0,0.5))` : 'none';
  };
  
  el.cFormat.addEventListener('change', syncCustomizer);
  el.cSize.addEventListener('input', syncCustomizer);
  el.cRotation.addEventListener('change', syncCustomizer);
  el.cFlipH.addEventListener('change', syncCustomizer);
  el.cFlipV.addEventListener('change', syncCustomizer);


  custColorPickr.on('save', (color) => {
    const hex = color ? color.toHEXA().toString() : 'transparent';
    el.cColor.value = hex;
    el.previewIcon.style.color = hex;
    if (state.view === 'library') {
      document.documentElement.style.setProperty('--global-icon-color', hex);
      document.documentElement.style.setProperty('--global-icon-color-hover', hex);
    }
    syncCustomizer();
    custColorPickr.hide();
  }).on('change', (color) => {
    const hex = color ? color.toHEXA().toString() : 'transparent';
    el.cColor.value = hex;
    el.previewIcon.style.color = hex;
    if (state.view === 'library') {
      document.documentElement.style.setProperty('--global-icon-color', hex);
      document.documentElement.style.setProperty('--global-icon-color-hover', hex);
    }
    syncCustomizer();
  });

  el.cColor.addEventListener('input', (e) => {
    custColorPickr.setColor(e.target.value);
    el.previewIcon.style.color = e.target.value;
    if (state.view === 'library') {
      document.documentElement.style.setProperty('--global-icon-color', e.target.value);
      document.documentElement.style.setProperty('--global-icon-color-hover', e.target.value);
    }
    syncCustomizer();
  });

  custBgPickr.on('save', (color) => {
    const hex = color ? color.toHEXA().toString() : 'transparent';
    cBg.value = hex;
    document.getElementById('preview-stage').style.backgroundColor = hex;
    syncCustomizer();
    custBgPickr.hide();
  }).on('change', (color) => {
    const hex = color ? color.toHEXA().toString() : 'transparent';
    cBg.value = hex;
    document.getElementById('preview-stage').style.backgroundColor = hex;
    syncCustomizer();
  });

  cBg.addEventListener('input', (e) => {
    custBgPickr.setColor(e.target.value);
    document.getElementById('preview-stage').style.backgroundColor = e.target.value;
    syncCustomizer();
  });


  document.querySelectorAll('.color-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const color = e.target.dataset.color;
      el.cColor.value = color;
      custColorPickr.setColor(color);
      el.previewIcon.style.color = color;
      syncCustomizer();
    });
  });

  document.querySelectorAll('.bg-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const color = e.target.dataset.color;
      cBg.value = color;
      if (color !== 'transparent') custBgPickr.setColor(color);
      document.getElementById('preview-stage').style.backgroundColor = color;
      syncCustomizer();
    });
  });
  
  el.cPadding.addEventListener('input', (e) => {
    el.paddingVal.textContent = e.target.value;
    syncCustomizer();
  });
  
  el.cOpacity.addEventListener('input', (e) => {
    el.opacityVal.textContent = Math.round(e.target.value * 100);
    syncCustomizer();
  });
  
  el.cShadow.addEventListener('input', (e) => {
    el.shadowVal.textContent = e.target.value;
    syncCustomizer();
  });
  
  el.cColor.addEventListener('input', (e) => {
    custColorPickr.setColor(e.target.value);
    el.previewIcon.style.color = e.target.value;
    syncCustomizer();
  });

  cBg.addEventListener('input', (e) => {
    custBgPickr.setColor(e.target.value);
    document.getElementById('preview-stage').style.backgroundColor = e.target.value;
    syncCustomizer();
  });
  
  el.cStroke.addEventListener('input', (e) => {
    el.strokeVal.textContent = e.target.value;

    const val = parseFloat(e.target.value);
    el.previewIcon.style.strokeWidth = val > 0 ? val : 'inherit';
    syncCustomizer();
  });

  el.btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(el.promptOut.textContent).then(() => {
      showToast('Command Copied');
    });
  });

  const getPxSize = () => {
    let sizeVal = el.cSize.value || "256";
    let size = parseInt(sizeVal);
    if (sizeVal.includes('%')) {
       size = Math.round(256 * (size / 100));
    }
    return size;
  };

  const generateRawSvg = async () => {
    const color = el.cColor.value;
    let bg = document.getElementById('cust-bg').value;
    const size = getPxSize();
    const stroke = parseFloat(el.cStroke.value);
    const rotation = parseInt(el.cRotation.value) || 0;
    const padding = parseInt(el.cPadding.value) || 0;
    const opacity = parseFloat(el.cOpacity.value) || 1;
    const shadow = parseInt(el.cShadow.value) || 0;
    const flipH = el.cFlipH.checked;
    const flipV = el.cFlipV.checked;

    const [prefix, name] = state.currentIcon.split(':');
    
    try {
      const res = await fetch(`${API_BASE}/${prefix}.json?icons=${name}`);
      const data = await res.json();
      const iconData = data.icons[name];
      
      let body = iconData.body;
      

      body = body.replaceAll('currentColor', color);
      if (stroke > 0) {
        body = body.replace(/stroke-width="[0-9.]+"/g, `stroke-width="${stroke}"`);
      }
      
      const vWidth = iconData.width || 24;
      const vHeight = iconData.height || 24;
      const viewBoxSizeW = vWidth + (padding * 2);
      const viewBoxSizeH = vHeight + (padding * 2);
      const viewBox = `${-padding} ${-padding} ${viewBoxSizeW} ${viewBoxSizeH}`;
      
      const transforms = [];
      if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
      if (flipH) transforms.push('scaleX(-1)');
      if (flipV) transforms.push('scaleY(-1)');
      const transformStr = transforms.join(' ');
      
      const filterStr = shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.5))` : '';
      
      let styleStr = `opacity: ${opacity}; color: ${color};`;
      if (bg && bg !== 'transparent') styleStr += ` background-color: ${bg};`;
      if (filterStr) styleStr += ` filter: ${filterStr};`;
      
      let strokeAttrs = stroke > 0 ? `stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none"` : '';

      if (transformStr) {
        const cx = vWidth / 2;
        const cy = vHeight / 2;
        body = `<g transform="${transformStr}" transform-origin="${cx} ${cy}">${body}</g>`;
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}" style="${styleStr}" ${strokeAttrs}>${body}</svg>`;
    } catch(e) {
      return null;
    }
  };

  const rasterizeSvg = (svgString, format, callback) => {
    const size = getPxSize();
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      let bg = document.getElementById('cust-bg').value;
      if (format === 'image/jpeg' && (bg === 'transparent' || !bg)) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
      }
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      
      if (callback) {
         canvas.toBlob(blob => callback(blob), format, 1.0);
      }
    };
    img.src = url;
  };

  const generateFormattedCode = async (svgRaw) => {
    const format = el.cFormat.value;
    const [prefix, name] = state.currentIcon.split(':');

    if (format === "SVG-CODE") return svgRaw;
    if (format === "DataURL") return `data:image/svg+xml;base64,${btoa(svgRaw)}`;

    const color = el.cColor.value;
    let bg = document.getElementById('cust-bg').value;
    const size = el.cSize.value || "256";
    const stroke = parseFloat(el.cStroke.value);
    const rotation = parseInt(el.cRotation.value) || 0;
    const padding = parseInt(el.cPadding.value) || 0;
    const opacity = parseFloat(el.cOpacity.value) || 1;
    const shadow = parseInt(el.cShadow.value) || 0;


    const bodyMatch = svgRaw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    const body = bodyMatch ? bodyMatch[1] : '';

    const toPascalCase = (str) => str.split(/[-_:]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const toKebabCase = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[:_]/g, "-").toLowerCase();

    const compName = toPascalCase(state.currentIcon) + "Icon";
    const kebabCompName = toKebabCase(state.currentIcon) + "-icon";

    if (format === "React") {
      return `import React from 'react';\n\nconst ${compName} = ({\n  size = ${typeof size === 'string' ? `'${size}'` : size},\n  color = '${color}',\n  strokeWidth = ${stroke},\n  background = '${bg}',\n  opacity = ${opacity},\n  rotation = ${rotation},\n  shadow = ${shadow},\n  padding = ${padding}\n}) => {\n  const transforms = [];\n  if (rotation !== 0) transforms.push(\`rotate(\${rotation}deg)\`);\n\n  const viewBoxSize = 24 + (padding * 2);\n  const viewBoxOffset = -padding;\n  const viewBox = \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n\n  return (\n    <svg\n      xmlns="http://www.w3.org/2000/svg"\n      viewBox={viewBox}\n      width={size}\n      height={size}\n      fill="none"\n      stroke={color}\n      strokeWidth={strokeWidth}\n      strokeLinecap="round"\n      strokeLinejoin="round"\n      style={{\n        opacity,\n        transform: transforms.join(' ') || undefined,\n        filter: shadow > 0 ? \`drop-shadow(0 \${shadow}px \${shadow * 2}px rgba(0,0,0,0.5))\` : undefined,\n        backgroundColor: background !== 'transparent' ? background : undefined\n      }}\n    >\n      ${body}\n    </svg>\n  );\n};\n\nexport default ${compName};`;
    }
    
    if (format === "Vue") {
      return `<template>\n  <svg\n    xmlns="http://www.w3.org/2000/svg"\n    :width="size"\n    :height="size"\n    :viewBox="viewBox"\n    fill="none"\n    :stroke="color"\n    :stroke-width="strokeWidth"\n    stroke-linecap="round"\n    stroke-linejoin="round"\n    :style="getStyle()"\n  >\n    ${body}\n  </svg>\n</template>\n\n<script>\nexport default {\n  name: '${compName}',\n  props: {\n    size: { type: [Number, String], default: ${typeof size === 'string' ? `'${size}'` : size} },\n    color: { type: String, default: '${color}' },\n    strokeWidth: { type: Number, default: ${stroke} },\n    background: { type: String, default: '${bg}' },\n    opacity: { type: Number, default: ${opacity} },\n    rotation: { type: Number, default: ${rotation} },\n    shadow: { type: Number, default: ${shadow} },\n    padding: { type: Number, default: ${padding} }\n  },\n  computed: {\n    viewBox() {\n      const viewBoxSize = 24 + (this.padding * 2);\n      const viewBoxOffset = -this.padding;\n      return \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n    },\n    getStyle() {\n      const transforms = [];\n      if (this.rotation !== 0) transforms.push(\`rotate(\${this.rotation}deg)\`);\n      return {\n        opacity: this.opacity,\n        transform: transforms.join(' ') || undefined,\n        filter: this.shadow > 0 ? \`drop-shadow(0 \${this.shadow}px \${this.shadow * 2}px rgba(0,0,0,0.5))\` : undefined,\n        backgroundColor: this.background !== 'transparent' ? this.background : undefined\n      };\n    }\n  }\n}\n</script>`;
    }
    
    if (format === "Svelte") {
      return `<script>\n  export let size = ${typeof size === 'string' ? `'${size}'` : size};\n  export let color = '${color}';\n  export let strokeWidth = ${stroke};\n  export let background = '${bg}';\n  export let opacity = ${opacity};\n  export let rotation = ${rotation};\n  export let shadow = ${shadow};\n  export let padding = ${padding};\n\n  $: transforms = [\n    rotation !== 0 ? \`rotate(\${rotation}deg)\` : ''\n  ].filter(Boolean).join(' ');\n\n  $: viewBoxSize = 24 + (padding * 2);\n  $: viewBoxOffset = -padding;\n  $: viewBox = \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n  $: bgColor = background !== 'transparent' ? background : undefined;\n</script>\n\n<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width={size}\n  height={size}\n  viewBox={viewBox}\n  fill="none"\n  stroke={color}\n  stroke-width={strokeWidth}\n  stroke-linecap="round"\n  stroke-linejoin="round"\n  style="opacity: {opacity}; transform: {transforms}; {shadow > 0 ? \`filter: drop-shadow(0 \${shadow}px \${shadow * 2}px rgba(0,0,0,0.5));\` : ''} {bgColor ? \`background-color: \${bgColor}\` : ''}"\n>\n  ${body}\n</svg>`;
    }

    if (format === "Angular") {
      return `import { Component, Input } from '@angular/core';\n\n@Component({\n  selector: 'app-${kebabCompName}',\n  template: \`\n    <svg\n      xmlns="http://www.w3.org/2000/svg"\n      [attr.width]="size"\n      [attr.height]="size"\n      [attr.viewBox]="getViewBox()"\n      fill="none"\n      [attr.stroke]="color"\n      [attr.stroke-width]="strokeWidth"\n      stroke-linecap="round"\n      stroke-linejoin="round"\n      [ngStyle]="getStyle()"\n    >\n      ${body}\n    </svg>\n  \`,\n  standalone: true\n})\nexport class ${compName}Component {\n  @Input() size: string | number = ${typeof size === 'string' ? `'${size}'` : size};\n  @Input() color: string = '${color}';\n  @Input() strokeWidth: number = ${stroke};\n  @Input() background: string = '${bg}';\n  @Input() opacity: number = ${opacity};\n  @Input() rotation: number = ${rotation};\n  @Input() shadow: number = ${shadow};\n  @Input() padding: number = ${padding};\n\n  getViewBox(): string {\n    const viewBoxSize = 24 + (this.padding * 2);\n    const viewBoxOffset = -this.padding;\n    return \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n  }\n\n  getStyle(): any {\n    const transforms = [];\n    if (this.rotation !== 0) transforms.push(\`rotate(\${this.rotation}deg)\`);\n\n    return {\n      opacity: this.opacity,\n      transform: transforms.join(' ') || undefined,\n      filter: this.shadow > 0 ? \`drop-shadow(0 \${this.shadow}px \${this.shadow * 2}px rgba(0,0,0,0.5))\` : undefined,\n      backgroundColor: this.background !== 'transparent' ? this.background : undefined\n    };\n  }\n}`;
    }

    if (format === "Solid") {
      return `import { Component, mergeProps } from 'solid-js';\n\ninterface ${compName}Props {\n  size?: string | number;\n  color?: string;\n  strokeWidth?: number;\n  background?: string;\n  opacity?: number;\n  rotation?: number;\n  shadow?: number;\n  padding?: number;\n}\n\nconst ${compName}: Component<${compName}Props> = (props) => {\n  const merged = mergeProps({\n    size: ${typeof size === 'string' ? `'${size}'` : size},\n    color: '${color}',\n    strokeWidth: ${stroke},\n    background: '${bg}',\n    opacity: ${opacity},\n    rotation: ${rotation},\n    shadow: ${shadow},\n    padding: ${padding}\n  }, props);\n\n  const transforms = () => {\n    const t = [];\n    if (merged.rotation !== 0) t.push(\`rotate(\${merged.rotation}deg)\`);\n    return t.join(' ') || undefined;\n  };\n\n  const viewBoxSize = () => 24 + (merged.padding * 2);\n  const viewBoxOffset = () => -merged.padding;\n  const viewBox = () => \`\${viewBoxOffset()} \${viewBoxOffset()} \${viewBoxSize()} \${viewBoxSize()}\`;\n\n  return (\n    <svg\n      xmlns="http://www.w3.org/2000/svg"\n      width={merged.size}\n      height={merged.size}\n      viewBox={viewBox()}\n      fill="none"\n      stroke={merged.color}\n      stroke-width={merged.strokeWidth}\n      stroke-linecap="round"\n      stroke-linejoin="round"\n      style={{\n        opacity: merged.opacity,\n        transform: transforms(),\n        filter: merged.shadow > 0 ? \`drop-shadow(0 \${merged.shadow}px \${merged.shadow * 2}px rgba(0,0,0,0.5))\` : undefined,\n        'background-color': merged.background !== 'transparent' ? merged.background : undefined\n      }}\n    >\n      ${body}\n    </svg>\n  );\n};\n\nexport default ${compName};`;
    }

    if (format === "Preact") {
      return `import { h } from 'preact';\n\nconst ${compName} = ({\n  size = ${typeof size === 'string' ? `'${size}'` : size},\n  color = '${color}',\n  strokeWidth = ${stroke},\n  background = '${bg}',\n  opacity = ${opacity},\n  rotation = ${rotation},\n  shadow = ${shadow},\n  padding = ${padding}\n}) => {\n  const transforms = [];\n  if (rotation !== 0) transforms.push(\`rotate(\${rotation}deg)\`);\n\n  const viewBoxSize = 24 + (padding * 2);\n  const viewBoxOffset = -padding;\n  const viewBox = \`\${viewBoxOffset} \${viewBoxOffset} \${viewBoxSize} \${viewBoxSize}\`;\n\n  return (\n    <svg\n      xmlns="http://www.w3.org/2000/svg"\n      viewBox={viewBox}\n      width={size}\n      height={size}\n      fill="none"\n      stroke={color}\n      strokeWidth={strokeWidth}\n      strokeLinecap="round"\n      strokeLinejoin="round"\n      style={{\n        opacity,\n        transform: transforms.join(' ') || undefined,\n        filter: shadow > 0 ? \`drop-shadow(0 \${shadow}px \${shadow * 2}px rgba(0,0,0,0.5))\` : undefined,\n        backgroundColor: background !== 'transparent' ? background : undefined\n      }}\n    >\n      ${body}\n    </svg>\n  );\n};\n\nexport default ${compName};`;
    }

    return svgRaw;
  };

  document.getElementById('btn-copy-direct').addEventListener('click', async () => {
    const svg = await generateRawSvg();
    if (!svg) { showToast('Could not generate icon.'); return; }
    
    const format = el.cFormat.value;
    if (["PNG", "JPEG", "WEBP", "ICO"].includes(format)) {

       rasterizeSvg(svg, 'image/png', async (blob) => {
         try {
           const item = new ClipboardItem({ 'image/png': blob });
           await navigator.clipboard.write([item]);
           showToast('Image Copied');
         } catch (err) {
           showToast('Browser format not supported.');
         }
       });
    } else {
       const formattedCode = await generateFormattedCode(svg);
       navigator.clipboard.writeText(formattedCode).then(() => showToast('Code Copied'));
    }
  });

  document.getElementById('btn-download-direct').addEventListener('click', async () => {
    const svg = await generateRawSvg();
    if (!svg) { showToast('Failed to generate icon.'); return; }
    
    const format = el.cFormat.value;
    const filename = `${state.currentIcon.replace(':', '-')}`;

    if (["PNG", "JPEG", "WEBP", "ICO"].includes(format)) {
       const mime = format === 'JPEG' ? 'image/jpeg' : format === 'WEBP' ? 'image/webp' : 'image/png';
       rasterizeSvg(svg, mime, async (blob) => {
         let finalBlob = blob;
         
         if (format === 'ICO') {
            const arrayBuffer = await blob.arrayBuffer();
            const pngBytes = new Uint8Array(arrayBuffer);
            const len = pngBytes.length;
            const size = getPxSize();
            const w = size >= 256 ? 0 : size;
            
            const header = new Uint8Array(22);
            header[2] = 1;
            header[4] = 1;
            header[6] = w;
            header[7] = w;
            header[10] = 1;
            header[12] = 32;
            header[14] = len & 0xff;
            header[15] = (len >> 8) & 0xff;
            header[16] = (len >> 16) & 0xff;
            header[17] = (len >> 24) & 0xff;
            header[18] = 22;
            
            finalBlob = new Blob([header, pngBytes], { type: 'image/x-icon' });
         }

         const url = URL.createObjectURL(finalBlob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `${filename}.${format.toLowerCase()}`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
         showToast('Download Started');
       });
    } else {
       const formattedCode = await generateFormattedCode(svg);
       const blob = new Blob([formattedCode], { type: 'text/plain;charset=utf-8' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       
       let ext = "svg";
       if (format === "React" || format === "Solid" || format === "Preact") ext = "jsx";
       else if (format === "Vue") ext = "vue";
       else if (format === "Svelte") ext = "svelte";
       else if (format === "Angular") ext = "ts";
       else if (format === "DataURL") ext = "txt";
       
       a.download = `${filename}.${ext}`;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
       showToast('Download Started');
    }
  });
}

function resetCustomizerState() {
  document.documentElement.style.removeProperty('--global-icon-color');
  document.documentElement.style.removeProperty('--global-icon-color-hover');
  if (window.custColorPickr) window.custColorPickr.setColor('#ffffff', true);
  if (window.custBgPickr) window.custBgPickr.setColor('transparent', true);
  
  if (el.cColor) el.cColor.value = "#ffffff";
  const cBg = document.getElementById('cust-bg');
  if (cBg) cBg.value = 'transparent';
  if (el.cSize) el.cSize.value = "24";
  if (el.cStroke) el.cStroke.value = "0";
  if (el.strokeVal) el.strokeVal.textContent = "0";
  if (el.cRotation) el.cRotation.value = "0";
  if (el.cPadding) el.cPadding.value = "0";
  if (el.paddingVal) el.paddingVal.textContent = "0";
  if (el.cOpacity) el.cOpacity.value = "1";
  if (el.opacityVal) el.opacityVal.textContent = "100";
  if (el.cShadow) el.cShadow.value = "0";
  if (el.shadowVal) el.shadowVal.textContent = "0";
  if (el.cFlipH) el.cFlipH.checked = false;
  if (el.cFlipV) el.cFlipV.checked = false;
}


function renderView(viewName, param = null) {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  window.scrollTo(0, 0);
  
  if (state.view !== viewName) {
    el.floatingConfigPanel.classList.add('hidden');
    resetCustomizerState();
  }
  
  state.view = viewName;

  if (viewName === 'home') {
    views.home.classList.remove('hidden');
    renderLibraries();
    if (document.activeElement === document.body) {
      el.searchInput.focus();
    }
  } else if (viewName === 'library') {
    views.library.classList.remove('hidden');
    state.currentLibrary = param;
    renderLibrary(param);
    el.btnBackLib.focus();
  } else if (viewName === 'customize') {
    views.customize.classList.remove('hidden');
    state.currentIcon = param;
    renderCustomize(param);
    el.btnBackCust.focus();
  }
}


async function loadCollections() {
  try {
    const res = await fetch(`${API_BASE}/collections`);
    const data = await res.json();

    state.collections = Object.keys(data).map(key => ({ id: key, ...data[key] }))
      .sort((a, b) => b.total - a.total);
  } catch (e) {
    showToast('Could not load libraries.');
  }
}

async function fetchLibraryPreview(prefix, container) {
  try {

    const res = await fetch(`${API_BASE}/collection?prefix=${prefix}`);
    const data = await res.json();
    const icons = data.uncategorized || [];

    if (icons.length === 0 && data.categories) {
      const firstCat = Object.keys(data.categories)[0];
      if (firstCat) icons.push(...data.categories[firstCat]);
    }
    
    container.innerHTML = '';
    icons.slice(0, 5).forEach(name => {
      const ic = document.createElement('iconify-icon');
      ic.setAttribute('icon', `${prefix}:${name}`);
      container.appendChild(ic);
    });
  } catch (e) {

  }
}


function renderLibraries(filterQuery = '', filterCategory = '') {
  document.getElementById('home-subtitle').textContent = `Browse ${state.collections.length} libraries`;
  el.libraryGrid.innerHTML = '';
  if(el.recommendedGrid) el.recommendedGrid.innerHTML = '';
  
  const recommendedIds = ['lucide', 'heroicons', 'material-symbols', 'tabler', 'radix-icons', 'fa6-solid', 'feather', 'simple-icons'];
  
  let hasRecommended = false;

  state.collections.forEach(lib => {
    if (filterQuery && !lib.name.toLowerCase().includes(filterQuery) && !lib.id.toLowerCase().includes(filterQuery)) {
      return;
    }
    
    if (filterCategory && lib.category !== filterCategory) {
      if (!lib.category || !lib.category.toLowerCase().includes(filterCategory.toLowerCase())) {
         return;
      }
    }

    const author = lib.author?.name || 'Unknown Author';
    const license = lib.license?.title || lib.license?.spdx || 'No License';

    const card = document.createElement('button');
    card.className = 'lib-card';
    card.dataset.prefix = lib.id;
    card.innerHTML = `
      <div class="lib-card-header">
        <div>
          <div class="lib-name">${lib.name}</div>
          <div class="lib-author">by ${author}</div>
        </div>
        <span class="lib-count">${new Intl.NumberFormat().format(lib.total)}</span>
      </div>
      <div class="lib-preview">
        <!-- Lazy loaded -->
      </div>
      <div class="lib-meta">
        <span class="lib-license">${license}</span>
      </div>
    `;
    
    card.addEventListener('click', () => renderView('library', lib));
    
    if (!filterQuery && !filterCategory && recommendedIds.includes(lib.id) && el.recommendedGrid) {
      el.recommendedGrid.appendChild(card);
      hasRecommended = true;
    } else {
      el.libraryGrid.appendChild(card);
    }
    
    previewObserver.observe(card);
  });

  if (el.recommendedSection) {
    if (hasRecommended && !filterQuery && !filterCategory) {
      el.recommendedSection.style.display = 'block';
      document.getElementById('all-libs-title').textContent = 'All Libraries';
    } else {
      el.recommendedSection.style.display = 'none';
      let title = 'All Libraries';
      if (filterQuery) title = `Search Results for "${filterQuery}"`;
      if (filterCategory) title = `${filterCategory} Libraries`;
      document.getElementById('all-libs-title').textContent = title;
    }
  }
}

async function renderLibrary(lib) {
  el.libTitle.textContent = lib.name;
  el.libSubtitle.textContent = `${new Intl.NumberFormat().format(lib.total)} icons`;
  el.iconGrid.innerHTML = '';

  el.libIconSearch.value = '';

  try {
    const res = await fetch(`${API_BASE}/collection?prefix=${lib.id}`);
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    
    let allIcons = [];
    if (data.uncategorized) allIcons.push(...data.uncategorized);
    if (data.categories) {
      Object.values(data.categories).forEach(arr => allIcons.push(...arr));
    }
    
    state.currentLibraryIcons = allIcons;
    renderLibraryIcons();
  } catch (e) {
    showToast('Could not load icons.');
  } finally {
    
  }
}

function renderLibraryIcons(query = '') {
  el.iconGrid.innerHTML = '';
  state.renderLimit = 200;
  
  appendLibraryIcons(query);
}

function appendLibraryIcons(query = '') {
  const filtered = query 
    ? state.currentLibraryIcons.filter(name => name.toLowerCase().includes(query))
    : state.currentLibraryIcons;
  

  const oldTrigger = document.getElementById('scroll-trigger');
  if (oldTrigger) oldTrigger.remove();
  const oldMsg = document.getElementById('scroll-msg');
  if (oldMsg) oldMsg.remove();

  const start = el.iconGrid.children.length;
  const toRender = filtered.slice(start, state.renderLimit);
  
  toRender.forEach(name => {
    createIconCard(`${state.currentLibrary.id}:${name}`, name);
  });

  if (filtered.length > state.renderLimit) {
    const trigger = document.createElement('div');
    trigger.id = 'scroll-trigger';
    trigger.style.gridColumn = '1 / -1';
    trigger.style.height = '100px';
    el.iconGrid.appendChild(trigger);
    infiniteScrollObserver.observe(trigger);
    
    const msg = document.createElement('div');
    msg.id = 'scroll-msg';
    msg.style.gridColumn = '1 / -1';
    msg.style.padding = '24px';
    msg.style.textAlign = 'center';
    msg.style.color = 'var(--text-muted)';
    msg.style.fontSize = '0.875rem';
    msg.textContent = `Scroll down to load more (Showing ${state.renderLimit} of ${filtered.length})`;
    el.iconGrid.appendChild(msg);
  } else if (filtered.length === 0 && start === 0) {
    const msg = document.createElement('div');
    msg.style.gridColumn = '1 / -1';
    msg.style.padding = '48px 24px';
    msg.style.textAlign = 'center';
    msg.style.color = 'var(--text-muted)';
    msg.textContent = 'No icons match your search.';
    el.iconGrid.appendChild(msg);
  }
}

async function doGlobalSearch(query) {
  views.home.classList.add('hidden');
  views.customize.classList.add('hidden');
  views.library.classList.remove('hidden');
  
  el.libTitle.textContent = `Search: "${query}"`;
  el.libSubtitle.textContent = 'Searching...';
  el.iconGrid.innerHTML = '';

  el.btnBackLib.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}&limit=100`);
    let dataIcons = [];
    if (res.ok) {
      const data = await res.json();
      dataIcons = data.icons || [];
    }
    
    el.libSubtitle.textContent = `${dataIcons.length} results`;
    
    dataIcons.forEach(fullName => {
      const [, name] = fullName.split(':');
      createIconCard(fullName, name);
    });
  } catch (e) {
    showToast('Search failed.');
  } finally {
    
  }
}

function createIconCard(fullName, shortName) {
  const card = document.createElement('button');
  card.className = 'icon-card';
  
  card.innerHTML = `
    <iconify-icon icon="${fullName}"></iconify-icon>
    <span class="icon-label">${shortName}</span>
  `;
  
  card.addEventListener('click', () => renderView('customize', fullName));
  el.iconGrid.appendChild(card);
}

function renderCustomize(iconName) {
  el.custTitle.textContent = iconName;
  const previewStage = document.getElementById('preview-stage');
  previewStage.innerHTML = `<iconify-icon id="cust-preview-icon" icon="${iconName}" width="160" height="160" style="transition: all 0.2s var(--ease);"></iconify-icon>`;
  el.previewIcon = document.getElementById('cust-preview-icon');

  el.btnBackLib.style.display = 'flex';
  

  const baseColor = document.documentElement.style.getPropertyValue('--global-icon-color') || "#ffffff";
  

  el.cFormat.value = "SVG-CODE";
  

  const defaultOption = document.querySelector('.custom-option[data-value="SVG-CODE"]');
  if (defaultOption) {
    document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
    defaultOption.classList.add('selected');
    el.formatTriggerLabel.textContent = defaultOption.querySelector('span:first-child').textContent;
    el.formatTriggerBadge.textContent = defaultOption.dataset.badge;
  }

  el.cColor.value = baseColor;
  if (window.custColorPickr) window.custColorPickr.setColor(baseColor, true);
  el.cSize.value = "24";
  el.cStroke.value = "0";
  el.strokeVal.textContent = "0";
  
  const cBg = document.getElementById('cust-bg');
  cBg.value = "transparent";
  if (window.custBgPickr) window.custBgPickr.setColor('transparent', true);

  el.cRotation.value = "0";
  el.cPadding.value = "0";
  el.paddingVal.textContent = "0";
  el.cOpacity.value = "1";
  el.opacityVal.textContent = "100";
  el.cShadow.value = "0";
  el.shadowVal.textContent = "0";
  el.cFlipH.checked = false;
  el.cFlipV.checked = false;
  

  el.previewIcon.style.color = baseColor;
  el.previewIcon.style.strokeWidth = "inherit";
  el.previewIcon.style.transform = "rotate(0deg) scale(1, 1)";
  el.previewIcon.style.padding = "0px";
  el.previewIcon.style.opacity = "1";
  el.previewIcon.style.filter = "none";
  document.getElementById('preview-stage').style.backgroundColor = "transparent";

  updatePromptPreview();
  fetchAndRenderTags(iconName);
}

async function fetchAndRenderTags(iconName) {
  if (!el.custTags) return;
  el.custTags.innerHTML = '<span class="subtitle">Loading tags...</span>';
  const [prefix, name] = iconName.split(':');
  
  try {

    const tags = new Set(name.split('-'));
    
    if (tags.size === 0) {
      el.custTags.innerHTML = '<span class="subtitle">No tags found.</span>';
      return;
    }

    el.custTags.innerHTML = '';
    tags.forEach(tag => {
      if (tag.length < 2) return;
      const btn = document.createElement('button');
      btn.className = 'tag-pill';
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        history.pushState(null, '', `#/tags/${encodeURIComponent(tag)}`);
        el.searchInput.value = tag;
        state.searchQuery = tag;
        doGlobalSearch(tag);
      });
      el.custTags.appendChild(btn);
    });
  } catch (e) {
    el.custTags.innerHTML = '<span class="subtitle">Could not load tags.</span>';
  }
}

function updatePromptPreview() {
  const format = el.cFormat.value;
  const color = el.cColor.value;
  const size = el.cSize.value || "24";
  const stroke = el.cStroke.value;
  const rotation = el.cRotation ? el.cRotation.value : "0";
  const padding = el.cPadding ? el.cPadding.value : "0";
  const opacity = el.cOpacity ? el.cOpacity.value : "1";
  const shadow = el.cShadow ? el.cShadow.value : "0";
  const flipH = el.cFlipH ? el.cFlipH.checked : false;
  const flipV = el.cFlipV ? el.cFlipV.checked : false;
  
  const payload = {
    icon_name: state.currentIcon,
    format: format,
    color: color,
    size: size,
    strokeWidth: parseFloat(stroke)
  };

  if (rotation !== "0") payload.rotation = parseInt(rotation);
  if (padding !== "0") payload.padding = parseInt(padding);
  if (opacity !== "1") payload.opacity = parseFloat(opacity);
  if (shadow !== "0") payload.shadow = parseInt(shadow);
  if (flipH) payload.flipHorizontal = true;
  if (flipV) payload.flipVertical = true;

  const jsonString = JSON.stringify(payload, null, 2);
  const prompt = `Please fetch this icon using the \`get_icon\` tool with the following JSON configuration:\n\n${jsonString}`;
  
  el.promptOut.textContent = prompt;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  el.toastRegion.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}


init();

