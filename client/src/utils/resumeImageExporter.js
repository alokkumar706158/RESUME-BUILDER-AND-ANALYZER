import { getFontEmbedCSS, toBlob } from 'html-to-image';

export const A4_PNG_WIDTH = 2480;
export const A4_PNG_HEIGHT = 3508;
const MM_TO_PX = 96 / 25.4;
export const A4_TEMPLATE_WIDTH = Math.round(210 * MM_TO_PX * 100) / 100;
export const A4_TEMPLATE_HEIGHT = Math.round(297 * MM_TO_PX * 100) / 100;
export const A4_PIXEL_RATIO = A4_PNG_WIDTH / A4_TEMPLATE_WIDTH;

const round = (value) => Math.round(value * 100) / 100;

const waitForImages = async (root) => {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));
};

const collectBlockingRects = (root) => {
  const rootRect = root.getBoundingClientRect();
  const rects = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') {
        return NodeFilter.FILTER_REJECT;
      }
      const style = window.getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node = walker.nextNode();
  while (node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const lineRects = range.getClientRects();
    for (let index = 0; index < lineRects.length; index += 1) {
      const rect = lineRects[index];
      if (rect.width > 0.5 && rect.height > 0.5) {
        rects.push({
          top: round(rect.top - rootRect.top),
          bottom: round(rect.bottom - rootRect.top)
        });
      }
    }
    node = walker.nextNode();
  }

  Array.from(root.querySelectorAll('img')).forEach((image) => {
    const rect = image.getBoundingClientRect();
    if (rect.width > 0.5 && rect.height > 0.5) {
      rects.push({
        top: round(rect.top - rootRect.top),
        bottom: round(rect.bottom - rootRect.top)
      });
    }
  });

  return rects.filter((rect) => rect.bottom > rect.top);
};

const isSafeBreak = (position, blockingRects) => blockingRects.every((rect) => (
  position <= rect.top + 0.5 || position >= rect.bottom - 0.5
));

export const buildA4PageRanges = (contentHeight, blockingRects) => {
  const height = Math.max(1, round(contentHeight));
  const candidates = new Set([0, height]);

  blockingRects.forEach((rect) => {
    if (rect.top >= 0 && rect.top <= height) candidates.add(round(rect.top));
    if (rect.bottom >= 0 && rect.bottom <= height) candidates.add(round(rect.bottom));
  });

  const sortedCandidates = Array.from(candidates).sort((a, b) => a - b);
  const ranges = [];
  let start = 0;
  let pageGuard = 0;

  while (start < height - 0.5 && pageGuard < 1000) {
    const target = start + A4_TEMPLATE_HEIGHT;
    const safeCandidates = sortedCandidates.filter((position) => (
      position > start + 0.5 &&
      position <= height &&
      isSafeBreak(position, blockingRects)
    ));
    const candidatesWithinPage = safeCandidates.filter((position) => position <= target + 0.5);

    let end;
    if (candidatesWithinPage.length > 0) {
      end = candidatesWithinPage[candidatesWithinPage.length - 1];
    } else if (safeCandidates.length > 0) {
      end = safeCandidates[0];
    } else {
      end = Math.min(target, height);
    }

    if (end - start > A4_TEMPLATE_HEIGHT + 0.5) {
      end = Math.min(target, height);
    }
    if (end <= start + 0.5) {
      end = Math.min(height, start + A4_TEMPLATE_HEIGHT);
    }

    ranges.push({ start: round(start), end: round(end) });
    start = end;
    pageGuard += 1;
  }

  if (ranges.length === 0) {
    ranges.push({ start: 0, end: height });
  }

  return ranges;
};

const isTransparentBackground = (color) => (
  !color ||
  color === 'transparent' ||
  /^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(color)
);

const prepareTemplateClone = (sourceTemplate) => {
  const templateClone = sourceTemplate.cloneNode(true);
  templateClone.style.width = `${A4_TEMPLATE_WIDTH}px`;
  templateClone.style.maxWidth = 'none';
  templateClone.style.margin = '0';
  templateClone.style.boxShadow = 'none';
  templateClone.style.borderRadius = '0';
  templateClone.style.transform = 'none';
  templateClone.style.transformOrigin = 'top left';
  return templateClone;
};

const buildMeasurementHost = (sourceTemplate) => {
  const host = document.createElement('div');
  host.setAttribute('data-resume-png-measure', 'true');
  host.className = 'resume-template-canvas';
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = `${A4_TEMPLATE_WIDTH}px`;
  host.style.background = '#ffffff';
  host.style.pointerEvents = 'none';

  const templateClone = prepareTemplateClone(sourceTemplate);
  host.appendChild(templateClone);
  document.body.appendChild(host);

  return { host, templateClone };
};

const applyBackgroundMask = (templateClone) => {
  const elements = [templateClone, ...templateClone.querySelectorAll('*')];
  const backgroundElements = elements.filter((element) => {
    const style = window.getComputedStyle(element);
    return style.backgroundImage !== 'none' || !isTransparentBackground(style.backgroundColor);
  });

  elements.forEach((element) => {
    element.style.visibility = 'hidden';
  });
  backgroundElements.forEach((element) => {
    element.style.visibility = 'visible';
  });
};

const buildPageHost = (sourceTemplate) => {
  const host = document.createElement('div');
  host.setAttribute('data-resume-png-export', 'true');
  host.className = 'resume-template-canvas';
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = `${A4_TEMPLATE_WIDTH}px`;
  host.style.background = '#ffffff';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '-1';

  const page = document.createElement('div');
  page.style.position = 'relative';
  page.style.width = `${A4_TEMPLATE_WIDTH}px`;
  page.style.height = `${A4_TEMPLATE_HEIGHT}px`;
  page.style.background = '#ffffff';

  const backgroundLayer = document.createElement('div');
  backgroundLayer.style.position = 'absolute';
  backgroundLayer.style.inset = '0';
  backgroundLayer.style.overflow = 'hidden';

  const backgroundShifter = document.createElement('div');
  backgroundShifter.style.position = 'absolute';
  backgroundShifter.style.left = '0';
  backgroundShifter.style.top = '0';
  backgroundShifter.style.width = `${A4_TEMPLATE_WIDTH}px`;

  const backgroundClone = prepareTemplateClone(sourceTemplate);
  backgroundShifter.appendChild(backgroundClone);
  backgroundLayer.appendChild(backgroundShifter);
  page.appendChild(backgroundLayer);

  const contentLayer = document.createElement('div');
  contentLayer.style.position = 'absolute';
  contentLayer.style.left = '0';
  contentLayer.style.top = '0';
  contentLayer.style.width = `${A4_TEMPLATE_WIDTH}px`;
  contentLayer.style.height = '0';
  contentLayer.style.overflow = 'hidden';

  const contentShifter = document.createElement('div');
  contentShifter.style.position = 'absolute';
  contentShifter.style.left = '0';
  contentShifter.style.top = '0';
  contentShifter.style.width = `${A4_TEMPLATE_WIDTH}px`;

  const contentClone = prepareTemplateClone(sourceTemplate);
  contentShifter.appendChild(contentClone);
  contentLayer.appendChild(contentShifter);
  page.appendChild(contentLayer);

  host.appendChild(page);
  document.body.appendChild(host);
  applyBackgroundMask(backgroundClone);

  return {
    host,
    page,
    backgroundShifter,
    backgroundClone,
    contentLayer,
    contentShifter
  };
};

export const downloadBlobAsFile = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 15000);
};

export const exportResumeAsA4Pngs = async (sourceTemplate, { onPageStart } = {}) => {
  if (!sourceTemplate) {
    throw new Error('Resume preview is not ready for export.');
  }

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  await waitForImages(sourceTemplate);

  let contentHeight = 0;
  let blockingRects = [];
  const measurement = buildMeasurementHost(sourceTemplate);
  try {
    await waitForImages(measurement.templateClone);
    contentHeight = round(measurement.templateClone.getBoundingClientRect().height);
    blockingRects = collectBlockingRects(measurement.templateClone);
  } finally {
    measurement.host.remove();
  }

  const pageRanges = buildA4PageRanges(contentHeight, blockingRects);
  const {
    host,
    page,
    backgroundShifter,
    backgroundClone,
    contentLayer,
    contentShifter
  } = buildPageHost(sourceTemplate);

  let fontEmbedCSS = '';
  try {
    fontEmbedCSS = await getFontEmbedCSS(sourceTemplate);
  } catch (error) {
    console.warn('Unable to embed resume fonts for PNG export:', error);
  }

  const blobs = [];
  try {
    for (let index = 0; index < pageRanges.length; index += 1) {
      const range = pageRanges[index];
      const segmentHeight = Math.max(0, range.end - range.start);
      const backgroundHeight = Math.max(contentHeight, range.start + A4_TEMPLATE_HEIGHT);

      backgroundShifter.style.top = `${-range.start}px`;
      backgroundClone.style.minHeight = `${backgroundHeight}px`;
      contentShifter.style.top = `${-range.start}px`;
      contentLayer.style.height = `${segmentHeight}px`;

      if (onPageStart) {
        onPageStart({ page: index + 1, total: pageRanges.length });
      }

      const options = {
        width: A4_TEMPLATE_WIDTH,
        height: A4_TEMPLATE_HEIGHT,
        canvasWidth: A4_PNG_WIDTH,
        canvasHeight: A4_PNG_HEIGHT,
        pixelRatio: 1,
        backgroundColor: '#ffffff'
      };
      if (fontEmbedCSS) {
        options.fontEmbedCSS = fontEmbedCSS;
      }

      const blob = await toBlob(page, options);
      if (!blob) {
        throw new Error(`Failed to render resume page ${index + 1}.`);
      }
      blobs.push(blob);
    }
  } finally {
    host.remove();
  }

  return { blobs, pageCount: blobs.length, pageRanges, contentHeight };
};

export const buildResumePngBaseName = (jobRole) => {
  const role = String(jobRole || 'Resume').trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');
  return `Resume_${role || 'Resume'}`;
};

export const downloadResumePngPages = (blobs, baseName) => {
  blobs.forEach((blob, index) => {
    window.setTimeout(() => {
      downloadBlobAsFile(blob, `${baseName}_Page_${index + 1}.png`);
    }, index * 350);
  });
};
