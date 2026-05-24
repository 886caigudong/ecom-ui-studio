const modelHints = {
  "gemini-2.5-flash-image": "快速生成主图、场景图、轻量详情图，适合 MVP 阶段批量出稿。",
  "gemini-3-pro-image-preview": "更适合复杂构图、文字渲染、专业商品资产和高一致性详情页。",
  "gpt-image-2": "适合高质量视觉创意、局部编辑、参考图改造和品牌化素材生成。",
  "seedream-4": "适合中文电商审美、海报感画面和多尺寸营销图扩展。"
};

const modelPlans = [
  {
    name: "Gemini 2.5 Flash Image",
    code: "gemini-2.5-flash-image",
    use: "Nano Banana。用于主图草案、场景图、商品摆拍和批量变体。"
  },
  {
    name: "Gemini 3 Pro Image Preview",
    code: "gemini-3-pro-image-preview",
    use: "Nano Banana Pro。用于高质量广告图、复杂文字、品牌一致性详情图。"
  },
  {
    name: "OpenAI GPT Image 2",
    code: "gpt-image-2",
    use: "用于精修、局部重绘、参考图编辑和更稳定的设计语言。"
  },
  {
    name: "服务端代理",
    code: "/api/images/generate",
    use: "前端永远不直接暴露 API Key，统一由服务端做鉴权、限流、成本记录。"
  }
];

const promptLibrary = [
  {
    title: "商品主图",
    meta: "1:1 / 4:5",
    body: "白底或浅场景，突出产品体积、质感、核心卖点标签，适合电商搜索流量首屏。"
  },
  {
    title: "生活方式场景图",
    meta: "4:5 / 16:9",
    body: "把商品放入真实使用场景，强调目标人群、使用动作和情绪价值。"
  },
  {
    title: "详情页分屏",
    meta: "750px 长图",
    body: "按痛点、卖点、参数、对比、信任背书、转化收口生成模块化长图。"
  },
  {
    title: "竞品差异图",
    meta: "对比布局",
    body: "突出本品优势，适合价格带、材质、功能、售后服务的横向比较。"
  },
  {
    title: "促销活动图",
    meta: "强转化",
    body: "突出限时优惠、赠品、套装、保障信息，用于活动页和首屏氛围图。"
  },
  {
    title: "社媒种草图",
    meta: "小红书风格",
    body: "更自然的生活化构图，弱化硬广，强调使用体验和可分享感。"
  }
];

const fields = {
  productName: document.querySelector("#productName"),
  sellingPoints: document.querySelector("#sellingPoints"),
  platform: document.querySelector("#platform"),
  priceTier: document.querySelector("#priceTier"),
  audience: document.querySelector("#audience"),
  visualStyle: document.querySelector("#visualStyle"),
  brandName: document.querySelector("#brandName"),
  brandColor: document.querySelector("#brandColor"),
  brandTone: document.querySelector("#brandTone"),
  brandLogo: document.querySelector("#brandLogo"),
  paletteReference: document.querySelector("#paletteReference"),
  imageSize: document.querySelector("#imageSize"),
  imageCount: document.querySelector("#imageCount"),
  negativePrompt: document.querySelector("#negativePrompt"),
  heroComposition: document.querySelector("#heroComposition"),
  ctaStyle: document.querySelector("#ctaStyle"),
  heroBadges: document.querySelector("#heroBadges"),
  showPromo: document.querySelector("#showPromo"),
  showTrust: document.querySelector("#showTrust"),
  showPrice: document.querySelector("#showPrice"),
  detailNotes: document.querySelector("#detailNotes"),
  referenceImage: document.querySelector("#referenceImage"),
  briefDocument: document.querySelector("#briefDocument"),
  modelSelect: document.querySelector("#modelSelect")
};

const promptOutput = document.querySelector("#promptOutput");
const statusText = document.querySelector("#statusText");
const promptMeta = document.querySelector("#promptMeta");
const galleryGrid = document.querySelector("#galleryGrid");
const galleryStatus = document.querySelector("#galleryStatus");
const jobSummary = document.querySelector("#jobSummary");
const referencePreview = document.querySelector("#referencePreview");
const referenceOverlay = document.querySelector("#referenceOverlay");
const historyList = document.querySelector("#historyList");
const logoPreview = document.querySelector("#logoPreview");
const qualityScore = document.querySelector("#qualityScore");
const qualityTitle = document.querySelector("#qualityTitle");
const qualityList = document.querySelector("#qualityList");
const briefPreview = document.querySelector("#briefPreview");
const palettePreview = document.querySelector("#palettePreview");
const complianceGrid = document.querySelector("#complianceGrid");
const complianceStatus = document.querySelector("#complianceStatus");
const selfCheck = document.querySelector("#selfCheck");

let referenceAsset = null;
let brandLogoAsset = null;
let paletteAsset = null;
let clientBrief = null;
let currentJob = null;
const historyKey = "productframe-ai-history";

function collectInput() {
  return {
    productName: fields.productName.value.trim() || "未命名商品",
    sellingPoints: fields.sellingPoints.value.trim(),
    platform: fields.platform.value,
    priceTier: fields.priceTier.value,
    audience: fields.audience.value.trim(),
    visualStyle: fields.visualStyle.value,
    brandName: fields.brandName.value.trim(),
    brandColor: fields.brandColor.value,
    brandTone: fields.brandTone.value,
    hasBrandLogo: Boolean(brandLogoAsset),
    hasPaletteReference: Boolean(paletteAsset),
    paletteColor: paletteAsset?.color || fields.brandColor.value,
    paletteReferenceName: paletteAsset?.name || "",
    imageSize: fields.imageSize.value,
    imageCount: clamp(Number(fields.imageCount.value || 2), 1, 6),
    negativePrompt: fields.negativePrompt.value.trim(),
    heroComposition: fields.heroComposition.value,
    ctaStyle: fields.ctaStyle.value,
    heroBadges: splitBadges(fields.heroBadges.value),
    showPromo: fields.showPromo.checked,
    showTrust: fields.showTrust.checked,
    showPrice: fields.showPrice.checked,
    detailModules: getSelectedDetailModules(),
    detailNotes: fields.detailNotes.value.trim(),
    hasReferenceImage: Boolean(referenceAsset),
    hasClientBrief: Boolean(clientBrief),
    clientBriefName: clientBrief?.name || "",
    clientBriefText: clientBrief?.text || "",
    clientBriefKind: clientBrief?.kind || "",
    clientBriefType: clientBrief?.type || "",
    clientBriefSize: clientBrief?.size || 0,
    clientBriefDataUrl: clientBrief?.kind === "image" ? clientBrief?.dataUrl || "" : "",
    model: fields.modelSelect.value,
    generationMode: getGenerationMode()
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getSelectedDetailModules() {
  return Array.from(document.querySelectorAll(".detail-module:checked")).map((item) => item.value);
}

function getGenerationMode() {
  return document.querySelector('input[name="generationMode"]:checked')?.value || "mock";
}

function splitBadges(value) {
  return String(value || "")
    .split(/[、,，/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function buildHeroPrompt(data) {
  return [
    `为${data.platform}生成一张电商商品主图。`,
    `商品：${data.productName}。`,
    `核心卖点：${data.sellingPoints}。`,
    `目标人群：${data.audience}。`,
    `价格定位：${data.priceTier}。`,
    `视觉风格：${data.visualStyle}。`,
    `主页首屏布局：${data.heroComposition}；卖点标签：${data.heroBadges.join("、") || "无"}；CTA：${data.ctaStyle}；促销区：${data.showPromo ? "显示" : "不显示"}；信任背书：${data.showTrust ? "显示" : "不显示"}；价格锚点：${data.showPrice ? "显示" : "不显示"}。`,
    `品牌资产：品牌名 ${data.brandName || "无"}，品牌主色 ${data.brandColor}，品牌调性 ${data.brandTone}，品牌Logo ${data.hasBrandLogo ? "已上传，保持清晰且不要重绘变形" : "未上传"}。`,
    `主色调参考：${data.hasPaletteReference ? `已上传 ${data.paletteReferenceName}，提取主色 ${data.paletteColor}，整体画面需贴近该色彩氛围` : "未上传，以品牌主色为准"}。`,
    `客户要求文档：${data.hasClientBrief ? data.clientBriefText : "未上传，以当前表单信息为准"}。`,
    `参考图：${data.hasReferenceImage ? "参考上传图片的商品轮廓、材质和颜色，不要改变核心结构。" : "无参考图，按商品描述生成。"}。`,
    `画面限制：${data.negativePrompt || "避免杂乱背景、错误文字和错误品牌标识"}。`,
    "画面要求：主体商品清晰居中，质感真实，光影干净，保留可放促销标签的留白。",
    `构图要求：${data.imageSize}，适合搜索列表和商品首页首屏，中文卖点文字不超过 12 个字。`,
    "输出方向：高转化、可信、专业，不要夸张变形，不要出现错误品牌 Logo。"
  ].join("\n");
}

function buildDetailPrompt(data) {
  return [
    `为${data.productName}设计电商详情页长图结构。`,
    `平台：${data.platform}；风格：${data.visualStyle}；定位：${data.priceTier}。`,
    `品牌资产：品牌名 ${data.brandName || "无"}，品牌主色 ${data.brandColor}，品牌调性 ${data.brandTone}，品牌Logo ${data.hasBrandLogo ? "已上传，详情页角标和品牌区可使用" : "未上传"}。`,
    `主色调参考：${data.hasPaletteReference ? `已上传 ${data.paletteReferenceName}，提取主色 ${data.paletteColor}，详情页配色需保持一致` : "未上传，以品牌主色为准"}。`,
    `客户要求文档：${data.hasClientBrief ? data.clientBriefText : "未上传，以当前表单信息为准"}。`,
    `卖点：${data.sellingPoints}。`,
    `画面限制：${data.negativePrompt || "避免虚假承诺和错误品牌标识"}。`,
    `详情页模块顺序：${data.detailModules.join(" -> ")}。`,
    `详情页补充要求：${data.detailNotes || "无"}。`,
    "每个模块需要包含画面建议、主标题、辅助文案和适合图像生成的描述。"
  ].join("\n");
}

function updatePreview() {
  const data = collectInput();
  document.querySelector("#previewPlatform").textContent = data.platform;
  document.querySelector("#previewTitle").textContent = data.productName;
  document.querySelector("#previewSubtitle").textContent = summarize(data.sellingPoints);
  document.querySelector("#headlineCopy").textContent = `${data.productName}，让核心卖点一眼被看见`;
  renderHeroLayoutPreview(data);

  const points = [
    `首屏：用${data.visualStyle}呈现产品质感和购买理由`,
    `痛点：面向${data.audience || "目标用户"}描述真实使用问题`,
    `卖点：突出${summarize(data.sellingPoints)}`,
    `信任：补充参数、材质、售后、使用步骤`,
    `收口：结合${data.priceTier}设计购买理由`
  ];

  const copyList = document.querySelector("#copyList");
  copyList.innerHTML = points.map((item) => `<li>${item}</li>`).join("");
  renderDetailPreview(data);
  updateQualityPanel(data);
  updateCompliancePanel(data);
}

function renderDetailPreview(data = collectInput()) {
  const modules = data.detailModules.length ? data.detailModules : ["首屏利益点", "痛点场景", "核心卖点拆解", "信任背书", "转化收口"];
  document.querySelector("#detailPreview").innerHTML = modules.map((module, index) => {
    const copy = detailModuleCopy(module, data);
    return `<div class="detail-block">${index + 1}. ${module}：${copy}</div>`;
  }).join("");
}

function detailModuleCopy(module, data) {
  const map = {
    "首屏利益点": `突出 ${data.productName} 的核心购买理由`,
    "痛点场景": `面向 ${data.audience || "目标用户"} 呈现真实问题`,
    "核心卖点拆解": summarize(data.sellingPoints),
    "参数规格": "用参数、规格和使用方式建立信任",
    "对比竞品": "用差异化对比突出本品优势",
    "使用步骤": "展示使用流程，降低理解成本",
    "信任背书": "补充材质、售后、口碑或认证信息",
    "转化收口": data.detailNotes || "强化自用、送礼或限时购买理由"
  };
  return map[module] || "按客户要求生成对应详情模块";
}

function summarize(text) {
  const clean = text.replace(/\s+/g, " ").replace(/[。；;]/g, "，");
  return clean.length > 34 ? `${clean.slice(0, 34)}...` : clean;
}

function renderHeroLayoutPreview(data) {
  const badges = data.heroBadges.length ? data.heroBadges : ["核心卖点", "品质保障"];
  document.querySelector("#previewBadges").innerHTML = badges.map((badge) => `<span>${badge}</span>`).join("");

  const commerce = [];
  if (data.showPromo) commerce.push(`<span class="commerce-pill">${data.ctaStyle}</span>`);
  if (data.showPrice) commerce.push('<span class="commerce-note">价格锚点：突出到手价/券后价</span>');
  if (data.showTrust) commerce.push('<span class="commerce-note">信任背书：售后保障 / 正品承诺</span>');
  document.querySelector("#previewCommerce").innerHTML = commerce.join("");

  const preview = document.querySelector("#heroPreview");
  preview.dataset.composition = data.heroComposition;
}

function auditInput(data) {
  let score = 45;
  const suggestions = [];

  if (data.productName.length >= 4) score += 8;
  else suggestions.push("商品名称太短，建议写清品类和核心特征。");

  if (data.sellingPoints.length >= 36) score += 14;
  else suggestions.push("核心卖点还不够具体，建议补充材质、参数、使用场景或差异点。");

  if (data.audience.length >= 8) score += 8;
  else suggestions.push("目标人群不够明确，建议写出具体使用者和购买动机。");

  if (data.negativePrompt.length >= 12) score += 8;
  else suggestions.push("建议填写禁忌词，减少错误 Logo、夸大功效和画面杂乱。");

  if (data.hasReferenceImage) score += 8;
  else suggestions.push("如果有实拍商品图，上传参考图能提升结构和材质一致性。");

  if (data.hasBrandLogo) score += 5;
  else suggestions.push("上传 PNG 品牌 Logo 后，主图和详情页的品牌一致性会更稳定。");

  if (data.hasClientBrief) score += 10;
  else suggestions.push("如果客户已有主图或详情图要求，上传文档可以减少返工。");

  if (data.hasPaletteReference) score += 5;
  else suggestions.push("如果客户有偏好的视觉色调，上传主色调参考图可以提升风格一致性。");

  if (isPlatformSizeFit(data.platform, data.imageSize)) score += 8;
  else suggestions.push(`${data.platform} 当前更建议使用 ${recommendedSize(data.platform)}。`);

  const compliance = auditPlatformCompliance(data);
  const riskCount = compliance.filter((item) => item.level === "risk").length;
  const warnCount = compliance.filter((item) => item.level === "warn").length;
  score -= riskCount * 8 + warnCount * 3;
  if (riskCount) suggestions.push("平台规范存在高风险项，建议先调整再正式生成。");

  if (data.brandName && data.brandTone) score += 4;

  const finalScore = clamp(score, 0, 100);
  const title = finalScore >= 86 ? "适合提交正式生成" : finalScore >= 70 ? "可以生成，仍有优化空间" : "建议先补齐关键信息";

  return {
    score: finalScore,
    title,
    suggestions: suggestions.slice(0, 4)
  };
}

function isPlatformSizeFit(platform, size) {
  if (platform.includes("小红书")) return ["3:4", "4:5"].includes(size);
  if (platform.includes("抖音")) return ["4:5", "1:1"].includes(size);
  if (platform.includes("Amazon")) return size === "1:1";
  if (platform.includes("天猫") || platform.includes("淘宝") || platform.includes("京东")) return ["1:1", "750:1800"].includes(size);
  return true;
}

function recommendedSize(platform) {
  if (platform.includes("小红书")) return "3:4 或 4:5";
  if (platform.includes("抖音")) return "4:5 或 1:1";
  if (platform.includes("Amazon")) return "1:1";
  if (platform.includes("天猫") || platform.includes("淘宝") || platform.includes("京东")) return "1:1 或 750:1800";
  return "1:1";
}

function updateQualityPanel(data = collectInput()) {
  const result = auditInput(data);
  qualityScore.textContent = result.score;
  qualityTitle.textContent = result.title;
  qualityList.innerHTML = result.suggestions.length
    ? result.suggestions.map((item) => `<li>${item}</li>`).join("")
    : "<li>输入质量良好，可以进入生成任务。</li>";
}

function auditPlatformCompliance(data) {
  const text = `${data.sellingPoints} ${data.negativePrompt} ${data.clientBriefText}`.toLowerCase();
  const riskyClaims = ["治疗", "治愈", "永久", "第一", "最强", "绝对", "100%", "医用", "疗效"];
  const hasRiskyClaim = riskyClaims.some((word) => text.includes(word.toLowerCase()));
  const sizeFit = isPlatformSizeFit(data.platform, data.imageSize);
  const isAmazon = data.platform.includes("Amazon");
  const isXhs = data.platform.includes("小红书");
  const isDouyin = data.platform.includes("抖音");
  const isPdd = data.platform.includes("拼多多");
  const isTmall = data.platform.includes("天猫") || data.platform.includes("淘宝");

  return [
    {
      title: "尺寸适配",
      level: sizeFit ? "pass" : "warn",
      message: sizeFit ? `当前 ${data.imageSize} 适合 ${data.platform}` : `建议改为 ${recommendedSize(data.platform)}`
    },
    {
      title: "功效/极限词",
      level: hasRiskyClaim ? "risk" : "pass",
      message: hasRiskyClaim ? "发现可能的极限词或功效承诺，建议替换成客观描述。" : "暂未发现明显极限词风险。"
    },
    {
      title: "Logo 与品牌",
      level: data.hasBrandLogo ? "pass" : isAmazon ? "warn" : "pass",
      message: data.hasBrandLogo ? "已上传品牌 Logo，可用于详情页品牌区。" : isAmazon ? "Amazon 主图通常应弱化额外 Logo 和促销元素。" : "未上传 Logo，生成将以品牌名和主色保持一致。"
    },
    {
      title: "文字密度",
      level: isAmazon && data.imageSize === "1:1" ? "warn" : "pass",
      message: isAmazon ? "Amazon 主图建议减少中文卖点文字，突出商品本体。" : "可保留简短卖点标签，建议不超过 12 字。"
    },
    {
      title: "内容种草适配",
      level: isXhs || isDouyin ? (data.hasPaletteReference || data.hasClientBrief ? "pass" : "warn") : "pass",
      message: isXhs || isDouyin ? "建议使用生活方式场景、色调参考或客户脚本提升内容感。" : "当前平台更偏货架电商，优先保证商品清晰。"
    },
    {
      title: "促销表达",
      level: isPdd || isTmall ? "warn" : "pass",
      message: isPdd ? "拼多多可强化优惠，但要避免虚假低价和夸大承诺。" : isTmall ? "天猫/淘宝建议促销信息清晰，但不要遮挡商品主体。" : "当前平台不建议过度促销化。"
    }
  ];
}

function updateCompliancePanel(data = collectInput()) {
  const items = auditPlatformCompliance(data);
  const riskCount = items.filter((item) => item.level === "risk").length;
  const warnCount = items.filter((item) => item.level === "warn").length;
  complianceStatus.textContent = riskCount ? `${riskCount} 项风险` : warnCount ? `${warnCount} 项提醒` : "规范良好";
  complianceGrid.innerHTML = items.map((item) => `
    <article class="compliance-item ${item.level}">
      <strong>${item.title}</strong>
      <span>${item.message}</span>
    </article>
  `).join("");
}

function generatePlan() {
  const data = collectInput();
  updatePreview();
  promptOutput.value = buildHeroPrompt(data);
  promptMeta.textContent = "商品主图 · 1:1";
  statusText.textContent = "已生成视觉方案";
}

function getActiveMode() {
  const activeTab = document.querySelector(".tab.active");
  return activeTab ? activeTab.dataset.tab : "hero";
}

async function submitImageJob() {
  const data = collectInput();
  const audit = auditInput(data);
  const mode = getActiveMode();
  statusText.textContent = audit.score >= 70 ? "正在提交生成任务" : "输入质量偏低，仍继续提交";
  galleryStatus.textContent = "生成中";

  try {
    const response = await fetch("/api/images/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...data,
        mode,
        prompt: promptOutput.value,
        referenceAsset,
        brandLogoAsset,
        paletteAsset,
        clientBrief,
        generationMode: data.generationMode
      })
    });

    if (!response.ok) {
      throw new Error(`生成接口返回 ${response.status}`);
    }

    const job = await response.json();
    currentJob = job;
    job.selfCheck = runSelfCheck(job, data);
    renderGallery(job);
    saveHistory(job, data);
    renderHistory();
    statusText.textContent = "生成任务已完成";
    galleryStatus.textContent = `${job.images.length} 张结果`;
  } catch (error) {
    statusText.textContent = "生成任务失败";
    galleryStatus.textContent = error.message;
  }
}

function renderGallery(job) {
  galleryGrid.innerHTML = job.images.map((image) => `
    <article class="gallery-item">
      <div class="gallery-art image-card" style="--swatch:${image.swatch}">
        <img src="${createPreviewSvg(job, image)}" alt="${image.title}">
      </div>
      <div class="gallery-copy">
        <h3>${image.title}</h3>
        <p>${image.description}</p>
        <span>${job.model} · ${job.platform}</span>
        <div class="gallery-actions">
          <button class="download-btn" data-download="${image.id}">下载说明</button>
          <button class="download-btn" data-download-png="${image.id}">下载 PNG</button>
        </div>
        <div class="tune-box">
          <input data-tune-input="${image.id}" placeholder="只微调这张图，例如：背景更亮、Logo放右上角">
          <button class="download-btn" data-tune-image="${image.id}">微调</button>
        </div>
      </div>
    </article>
  `).join("");

  jobSummary.textContent = `任务 ${job.id} · 模型 ${job.model} · 尺寸 ${job.imageSize} · 数量 ${job.imageCount} · 参考图 ${job.hasReferenceImage ? "已使用" : "未使用"}`;
  renderSelfCheck(job.selfCheck);
  galleryGrid.querySelectorAll("[data-download]").forEach((button) => {
    button.addEventListener("click", () => downloadImageBrief(job, button.dataset.download));
  });
  galleryGrid.querySelectorAll("[data-download-png]").forEach((button) => {
    button.addEventListener("click", () => downloadPreviewPng(job, button.dataset.downloadPng));
  });
  galleryGrid.querySelectorAll("[data-tune-image]").forEach((button) => {
    button.addEventListener("click", () => tuneSingleImage(job, button.dataset.tuneImage));
  });
}

function runSelfCheck(job, input) {
  const issues = [];
  const text = `${job.prompt} ${job.images.map((image) => image.description).join(" ")}`;
  const typoMap = [
    ["磨沙", "磨砂"],
    ["按磨", "按摩"],
    ["详请", "详情"],
    ["恢愎", "恢复"]
  ];
  const bannedWords = ["治疗", "治愈", "永久", "第一", "最强", "绝对", "100%", "医用", "疗效"];

  typoMap.forEach(([wrong, right]) => {
    if (text.includes(wrong)) issues.push({ level: "warn", message: `疑似错别字：“${wrong}”，建议改为“${right}”。` });
  });

  bannedWords.forEach((word) => {
    if (text.includes(word)) issues.push({ level: "risk", message: `发现可能违规或高风险词：“${word}”。` });
  });

  if (input.hasClientBrief && !text.includes("客户")) {
    issues.push({ level: "warn", message: "客户要求已上传，但结果说明中没有明确体现客户要求约束。" });
  }

  if (!isPlatformSizeFit(input.platform, job.imageSize)) {
    issues.push({ level: "warn", message: `尺寸 ${job.imageSize} 可能不适合 ${input.platform}，建议 ${recommendedSize(input.platform)}。` });
  }

  if (input.hasBrandLogo && !job.hasBrandLogo) {
    issues.push({ level: "risk", message: "用户上传了品牌 Logo，但生成任务未纳入 Logo 状态。" });
  }

  return {
    passed: !issues.some((item) => item.level === "risk"),
    issues,
    summary: issues.length ? `发现 ${issues.length} 项需要关注的问题。` : "未发现明显错别字、违规词或需求偏离。"
  };
}

function renderSelfCheck(result) {
  if (!result) {
    selfCheck.innerHTML = "<strong>生成后自检</strong><span>生成方案后会自动检查错别字、违规词、平台规范和客户要求匹配度。</span>";
    return;
  }

  const badge = result.passed ? "通过" : "需处理";
  selfCheck.innerHTML = `
    <strong>生成后自检 · ${badge}</strong>
    <span>${result.summary}</span>
    <ul>
      ${(result.issues.length ? result.issues : [{ message: "方案可进入人工确认或单图微调。" }]).map((item) => `<li>${item.message}</li>`).join("")}
    </ul>
  `;
}

async function tuneSingleImage(job, imageId) {
  const input = galleryGrid.querySelector(`[data-tune-input="${imageId}"]`);
  const instruction = input?.value.trim();
  if (!instruction) {
    statusText.textContent = "请先输入这张图的微调要求";
    return;
  }

  const image = job.images.find((item) => item.id === imageId);
  if (!image) return;

  statusText.textContent = "正在微调指定图片";

  try {
    const response = await fetch("/api/images/tune", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobId: job.id,
        image,
        instruction,
        generationMode: collectInput().generationMode,
        prompt: job.prompt
      })
    });

    if (!response.ok) throw new Error(`微调接口返回 ${response.status}`);
    const tunedImage = await response.json();
    job.images = job.images.map((item) => item.id === imageId ? tunedImage : item);
    job.selfCheck = runSelfCheck(job, collectInput());
    renderGallery(job);
    currentJob = job;
    statusText.textContent = `已只微调 ${tunedImage.title}`;
  } catch (error) {
    statusText.textContent = `微调失败：${error.message}`;
  }
}

function createPreviewSvg(job, image) {
  const title = escapeXml(job.productName);
  const platform = escapeXml(job.platform);
  const brand = escapeXml(job.brand?.name || "Brand");
  const tone = escapeXml(job.brand?.tone || "专业可信");
  const color = image.swatch || "#1f6f5b";
  const ratio = image.ratio === "750:1800" ? { w: 750, h: 1200 } : image.ratio === "4:5" ? { w: 900, h: 1125 } : image.ratio === "3:4" ? { w: 900, h: 1200 } : { w: 1000, h: 1000 };
  const fontSize = ratio.w > ratio.h ? 54 : 48;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ratio.w}" height="${ratio.h}" viewBox="0 0 ${ratio.w} ${ratio.h}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f8faf4"/>
          <stop offset="0.55" stop-color="#eef3eb"/>
          <stop offset="1" stop-color="${color}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#14211f" flood-opacity="0.22"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="${ratio.w * 0.22}" cy="${ratio.h * 0.18}" r="${ratio.w * 0.14}" fill="#ffffff" opacity="0.35"/>
      <circle cx="${ratio.w * 0.82}" cy="${ratio.h * 0.82}" r="${ratio.w * 0.18}" fill="#ffffff" opacity="0.22"/>
      <g filter="url(#shadow)" transform="translate(${ratio.w * 0.5}, ${ratio.h * 0.45}) rotate(-12)">
        <rect x="-70" y="-210" width="140" height="420" rx="70" fill="#fdfefb"/>
        <rect x="-96" y="-168" width="192" height="76" rx="38" fill="#253b36"/>
        <circle cx="0" cy="-130" r="18" fill="${color}"/>
      </g>
      <text x="${ratio.w * 0.08}" y="${ratio.h * 0.11}" fill="#16473c" font-size="28" font-family="Microsoft YaHei, Arial" font-weight="700">${platform}</text>
      <text x="${ratio.w * 0.08}" y="${ratio.h * 0.78}" fill="#14211f" font-size="${fontSize}" font-family="Microsoft YaHei, Arial" font-weight="800">${title}</text>
      <text x="${ratio.w * 0.08}" y="${ratio.h * 0.84}" fill="#50645d" font-size="26" font-family="Microsoft YaHei, Arial">${tone} · ${image.ratio}</text>
      <rect x="${ratio.w * 0.08}" y="${ratio.h * 0.88}" width="${Math.min(310, ratio.w * 0.44)}" height="54" rx="12" fill="#14211f"/>
      <text x="${ratio.w * 0.105}" y="${ratio.h * 0.88 + 36}" fill="#ffffff" font-size="24" font-family="Microsoft YaHei, Arial">${brand}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(job, input) {
  const history = getHistory();
  const item = {
    id: job.id,
    createdAt: job.createdAt,
    productName: job.productName,
    platform: job.platform,
    model: job.model,
    imageSize: job.imageSize,
    imageCount: job.imageCount,
    brandName: input.brandName,
    brandColor: input.brandColor,
    brandTone: input.brandTone,
    hasBrandLogo: input.hasBrandLogo,
    hasPaletteReference: input.hasPaletteReference,
    paletteColor: input.paletteColor,
    paletteReferenceName: input.paletteReferenceName,
    hasClientBrief: input.hasClientBrief,
    clientBriefName: input.clientBriefName,
    clientBriefKind: input.clientBriefKind,
    input,
    job
  };
  localStorage.setItem(historyKey, JSON.stringify([item, ...history].slice(0, 20)));
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    historyList.innerHTML = '<div class="history-empty">暂无历史任务，提交生成任务后会自动保存最近 20 条。</div>';
    return;
  }

  historyList.innerHTML = history.map((item) => `
    <article class="history-item">
      <div>
        <h3>${item.productName} · ${item.platform}</h3>
        <p>${formatTime(item.createdAt)} · ${item.model} · ${item.imageSize} · ${item.imageCount} 张 · ${item.brandName || "未设置品牌"}</p>
      </div>
      <div class="history-actions">
        <button class="download-btn" data-load-history="${item.id}">回填</button>
        <button class="download-btn" data-preview-history="${item.id}">查看</button>
      </div>
    </article>
  `).join("");

  historyList.querySelectorAll("[data-load-history]").forEach((button) => {
    button.addEventListener("click", () => loadHistoryItem(button.dataset.loadHistory));
  });
  historyList.querySelectorAll("[data-preview-history]").forEach((button) => {
    button.addEventListener("click", () => previewHistoryItem(button.dataset.previewHistory));
  });
}

function formatTime(value) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function findHistoryItem(id) {
  return getHistory().find((item) => item.id === id);
}

function loadHistoryItem(id) {
  const item = findHistoryItem(id);
  if (!item) return;
  const input = item.input;
  fields.productName.value = input.productName || "";
  fields.sellingPoints.value = input.sellingPoints || "";
  fields.platform.value = input.platform || "天猫 / 淘宝";
  fields.priceTier.value = input.priceTier || "中端实用型";
  fields.audience.value = input.audience || "";
  fields.visualStyle.value = input.visualStyle || "清爽科技感";
  fields.heroComposition.value = input.heroComposition || "居中大主体";
  fields.ctaStyle.value = input.ctaStyle || "立即购买";
  fields.heroBadges.value = (input.heroBadges || []).join("、") || "低噪快充、6档调节、便携收纳";
  fields.showPromo.checked = input.showPromo !== false;
  fields.showTrust.checked = input.showTrust !== false;
  fields.showPrice.checked = Boolean(input.showPrice);
  fields.brandName.value = input.brandName || "";
  fields.brandColor.value = input.brandColor || "#1f6f5b";
  fields.brandTone.value = input.brandTone || "专业可信";
  brandLogoAsset = null;
  renderLogoPreview(null);
  paletteAsset = input.hasPaletteReference ? {
    name: input.paletteReferenceName || "历史主色调参考图",
    color: input.paletteColor || input.brandColor || "#1f6f5b"
  } : null;
  renderPalettePreview(paletteAsset);
  clientBrief = input.hasClientBrief ? {
    name: input.clientBriefName || "历史客户要求",
    text: input.clientBriefText || "",
    size: input.clientBriefSize || input.clientBriefText?.length || 0,
    type: input.clientBriefType || "",
    kind: input.clientBriefKind || "text",
    dataUrl: input.clientBriefDataUrl || ""
  } : null;
  renderBriefPreview(clientBrief);
  fields.imageSize.value = input.imageSize || "1:1";
  fields.imageCount.value = input.imageCount || 2;
  fields.negativePrompt.value = input.negativePrompt || "";
  generatePlan();
  renderGallery(item.job);
  statusText.textContent = "历史任务已回填";
}

function previewHistoryItem(id) {
  const item = findHistoryItem(id);
  if (!item) return;
  currentJob = item.job;
  renderGallery(item.job);
  statusText.textContent = "正在查看历史任务";
}

function downloadImageBrief(job, imageId) {
  const image = job.images.find((item) => item.id === imageId);
  if (!image) return;

  const content = [
    `任务ID：${job.id}`,
    `商品：${job.productName}`,
    `平台：${job.platform}`,
    `模型：${job.model}`,
    `尺寸：${image.ratio}`,
    `标题：${image.title}`,
    `说明：${image.description}`,
    "",
    "提示词：",
    job.prompt
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${job.productName}-${image.id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

async function downloadPreviewPng(job, imageId) {
  const image = job.images.find((item) => item.id === imageId);
  if (!image) return;

  const dataUrl = createPreviewSvg(job, image);
  const pngUrl = await svgToPng(dataUrl, image.ratio);
  const link = document.createElement("a");
  link.href = pngUrl;
  link.download = `${job.productName}-${image.id}.png`;
  link.click();
  URL.revokeObjectURL(pngUrl);
}

function svgToPng(svgUrl, ratio) {
  const size = ratio === "750:1800" ? { w: 750, h: 1200 } : ratio === "4:5" ? { w: 900, h: 1125 } : ratio === "3:4" ? { w: 900, h: 1200 } : { w: 1000, h: 1000 };

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size.w;
      canvas.height = size.h;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, size.w, size.h);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG 生成失败"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    };
    image.onerror = reject;
    image.src = svgUrl;
  });
}

function exportCurrentPlanTxt() {
  if (!currentJob) {
    statusText.textContent = "请先提交生成任务再导出方案";
    return;
  }

  const input = collectInput();
  const compliance = auditPlatformCompliance(input);
  const self = currentJob.selfCheck || runSelfCheck(currentJob, input);
  const lines = [
    "电商产品主页 UI 优化方案",
    "",
    `任务ID：${currentJob.id}`,
    `商品名称：${currentJob.productName}`,
    `目标平台：${currentJob.platform}`,
    `模型：${currentJob.model}`,
    `尺寸：${currentJob.imageSize}`,
    `数量：${currentJob.imageCount}`,
    `品牌：${input.brandName || "未设置"}`,
    `品牌主色：${input.brandColor}`,
    `品牌调性：${input.brandTone}`,
    `商品参考图：${currentJob.hasReferenceImage ? "已使用" : "未使用"}`,
    `品牌Logo：${currentJob.hasBrandLogo ? "已使用" : "未使用"}`,
    `主色调参考：${currentJob.hasPaletteReference ? currentJob.paletteColor : "未使用"}`,
    `客户要求文档：${currentJob.hasClientBrief ? currentJob.clientBriefName : "未上传"}`,
    "",
    "核心卖点",
    input.sellingPoints || "未填写",
    "",
    "图像生成提示词",
    currentJob.prompt,
    "",
    "平台规范检查",
    ...compliance.map((item) => `- [${item.level}] ${item.title}：${item.message}`),
    "",
    "生成后自检",
    self.summary,
    ...(self.issues.length ? self.issues.map((item) => `- [${item.level}] ${item.message}`) : ["- 未发现明显问题"]),
    "",
    "生成图片方案",
    ...currentJob.images.flatMap((image, index) => [
      `${index + 1}. ${image.title}`,
      `   尺寸：${image.ratio}`,
      `   说明：${image.description}`,
      `   微调：${image.tuneInstruction || "无"}`
    ])
  ];

  downloadTextFile(`${currentJob.productName}-方案交付.txt`, lines.join("\n"));
  statusText.textContent = "方案 TXT 已导出";
}

function exportCurrentPlanJson() {
  if (!currentJob) {
    statusText.textContent = "请先提交生成任务再导出 JSON";
    return;
  }

  const input = collectInput();
  const payload = {
    input,
    job: currentJob,
    compliance: auditPlatformCompliance(input),
    exportedAt: new Date().toISOString()
  };

  downloadTextFile(`${currentJob.productName}-生成任务.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  statusText.textContent = "任务 JSON 已导出";
}

function downloadTextFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function handleReferenceUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    referenceAsset = null;
    renderReferencePreview(null);
    updatePreview();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    referenceAsset = {
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: reader.result
    };
    renderReferencePreview(referenceAsset);
    updatePreview();
    generatePlan();
  };
  reader.readAsDataURL(file);
}

function renderReferencePreview(asset) {
  if (!asset) {
    referencePreview.classList.add("empty");
    referencePreview.innerHTML = "<span>暂无参考图</span>";
    referenceOverlay.removeAttribute("src");
    referenceOverlay.classList.remove("has-image");
    return;
  }

  referencePreview.classList.remove("empty");
  referencePreview.innerHTML = `<img src="${asset.dataUrl}" alt="${asset.name}">`;
  referenceOverlay.src = asset.dataUrl;
  referenceOverlay.classList.add("has-image");
}

function handleLogoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    brandLogoAsset = null;
    renderLogoPreview(null);
    generatePlan();
    return;
  }

  if (file.type !== "image/png") {
    statusText.textContent = "品牌 Logo 仅支持 PNG";
    fields.brandLogo.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    brandLogoAsset = {
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: reader.result
    };
    renderLogoPreview(brandLogoAsset);
    generatePlan();
  };
  reader.readAsDataURL(file);
}

function renderLogoPreview(asset) {
  if (!asset) {
    logoPreview.classList.add("empty");
    logoPreview.innerHTML = "<span>暂无品牌 Logo</span>";
    return;
  }

  logoPreview.classList.remove("empty");
  logoPreview.innerHTML = `<img src="${asset.dataUrl}" alt="${asset.name}">`;
}

function handlePaletteUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    paletteAsset = null;
    renderPalettePreview(null);
    generatePlan();
    return;
  }

  if (!["image/png", "image/jpeg"].includes(file.type) && !/\.(png|jpg|jpeg)$/i.test(file.name)) {
    statusText.textContent = "主色调参考图仅支持 PNG / JPG";
    fields.paletteReference.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    extractDominantColor(reader.result).then((color) => {
      paletteAsset = {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
        color
      };
      fields.brandColor.value = color;
      renderPalettePreview(paletteAsset);
      generatePlan();
      statusText.textContent = "已提取主色调并同步到品牌主色";
    }).catch(() => {
      statusText.textContent = "主色调提取失败，请换一张图片";
    });
  };
  reader.readAsDataURL(file);
}

function extractDominantColor(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 48;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, size, size);
      const { data } = context.getImageData(0, 0, size, size);
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3];
        if (alpha < 128) continue;
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        const brightness = (red + green + blue) / 3;
        if (brightness > 245 || brightness < 18) continue;
        r += red;
        g += green;
        b += blue;
        count += 1;
      }

      if (!count) {
        reject(new Error("No color pixels"));
        return;
      }

      resolve(rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count)));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function renderPalettePreview(asset) {
  if (!asset) {
    palettePreview.classList.add("empty");
    palettePreview.innerHTML = "<span>上传图片后自动提取参考主色</span>";
    return;
  }

  palettePreview.classList.remove("empty");
  const imageMarkup = asset.dataUrl ? `<img src="${asset.dataUrl}" alt="${asset.name}">` : "";
  palettePreview.innerHTML = `
    ${imageMarkup}
    <div class="palette-meta">
      <strong>${asset.name}</strong>
      <span>提取主色：${asset.color}</span>
      <div class="palette-chip" style="--chip:${asset.color}"></div>
    </div>
  `;
}

function handleBriefUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    clearClientBrief();
    return;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const isTextBrief = ["txt", "md", "json", "csv"].includes(extension) || [
    "text/plain",
    "text/markdown",
    "application/json",
    "text/csv"
  ].includes(file.type);
  const isImageBrief = ["png", "jpg", "jpeg"].includes(extension) || ["image/png", "image/jpeg"].includes(file.type);
  const isDeferredBrief = ["pdf", "docx"].includes(extension) || [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ].includes(file.type);
  const allowed = isTextBrief || isImageBrief || isDeferredBrief;

  if (!allowed) {
    statusText.textContent = "当前支持 txt / md / json / csv / png / jpg / pdf / docx";
    fields.briefDocument.value = "";
    return;
  }

  if (isImageBrief) {
    const reader = new FileReader();
    reader.onload = () => {
      clientBrief = {
        name: file.name,
        type: file.type || `image/${extension}`,
        size: file.size,
        kind: "image",
        text: `客户上传了图片型要求文档：${file.name}。请参考图片中的版式、标注、构图、文案层级和视觉要求。`,
        dataUrl: reader.result
      };
      renderBriefPreview(clientBrief);
      generatePlan();
      statusText.textContent = "客户图片要求已读取并写入提示词";
    };
    reader.readAsDataURL(file);
    return;
  }

  if (isDeferredBrief) {
    parseDeferredBrief(file, extension);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const text = normalizeBriefText(String(reader.result || "")).slice(0, 3000);
    clientBrief = {
      name: file.name,
      type: file.type,
      size: file.size,
      kind: "text",
      text
    };
    renderBriefPreview(clientBrief);
    generatePlan();
    statusText.textContent = "客户要求已读取并写入提示词";
  };
  reader.readAsText(file, "utf-8");
}

function parseDeferredBrief(file, extension) {
  statusText.textContent = `正在解析 ${extension.toUpperCase()} 要求文档`;
  fileToBase64(file).then((base64) => {
    return fetch("/api/documents/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: file.name,
        type: file.type || extension,
        kind: extension,
        size: file.size,
        contentBase64: base64
      })
    });
  }).then((response) => {
    if (!response.ok) throw new Error(`解析接口返回 ${response.status}`);
    return response.json();
  }).then((result) => {
    clientBrief = {
      name: result.name,
      type: file.type || extension,
      size: result.size || file.size,
      kind: result.kind || extension,
      text: result.extractedText,
      parseId: result.id,
      parseSummary: result.summary,
      checklist: result.checklist || []
    };
    renderBriefPreview(clientBrief);
    generatePlan();
    statusText.textContent = `${extension.toUpperCase()} 要求文档已解析并写入提示词`;
  }).catch((error) => {
    clientBrief = {
      name: file.name,
      type: file.type || extension,
      size: file.size,
      kind: extension,
      text: `客户上传了 ${extension.toUpperCase()} 要求文档：${file.name}。解析失败：${error.message}。请人工补充关键要求。`
    };
    renderBriefPreview(clientBrief);
    generatePlan();
    statusText.textContent = "文档解析失败，已保留文件状态";
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeBriefText(text) {
  return text
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function renderBriefPreview(brief) {
  if (!brief) {
    briefPreview.classList.add("empty");
    briefPreview.innerHTML = "<span>支持 txt / md / json / csv / png / jpg / pdf / docx。文本会自动读取，图片可预览，PDF/DOCX 会进入解析队列。</span>";
    return;
  }

  briefPreview.classList.remove("empty");
  if (brief.kind === "image") {
    briefPreview.innerHTML = `<strong>${brief.name} · ${formatFileSize(brief.size)}</strong>${escapeHtml(brief.text)}<img src="${brief.dataUrl}" alt="${brief.name}">`;
    return;
  }

  if (["pdf", "docx"].includes(brief.kind)) {
    briefPreview.innerHTML = `
      <div class="brief-file-card">
        <strong>${brief.name} · ${formatFileSize(brief.size)}</strong>
        <code>${brief.kind.toUpperCase()}</code>
        <span>${escapeHtml(brief.parseSummary || brief.text)}</span>
        ${brief.checklist?.length ? `<ul>${brief.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      </div>
    `;
    return;
  }

  const previewText = escapeHtml(brief.text.slice(0, 900));
  briefPreview.innerHTML = `<strong>${brief.name} · ${brief.text.length} 字</strong>${previewText}${brief.text.length > 900 ? "\n..." : ""}`;
}

function formatFileSize(size) {
  if (!size) return "0 KB";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function clearClientBrief() {
  clientBrief = null;
  fields.briefDocument.value = "";
  renderBriefPreview(null);
  generatePlan();
  statusText.textContent = "客户要求已清除";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  document.querySelector("#heroPreview").classList.toggle("hidden", tab !== "hero");
  document.querySelector("#detailPreview").classList.toggle("hidden", tab !== "detail");
  document.querySelector("#copyPreview").classList.toggle("hidden", tab !== "copy");

  const data = collectInput();
  if (tab === "detail") {
    promptOutput.value = buildDetailPrompt(data);
    promptMeta.textContent = "详情长图 · 750px";
  } else if (tab === "copy") {
    promptOutput.value = [
      `为${data.productName}生成电商首页首屏和详情页文案。`,
    `核心卖点：${data.sellingPoints}。`,
    `目标人群：${data.audience}。`,
    `品牌调性：${data.brandTone}，品牌名：${data.brandName || "无"}，品牌Logo：${data.hasBrandLogo ? "已上传" : "未上传"}。`,
    `主色调参考：${data.hasPaletteReference ? data.paletteColor : "无"}。`,
    `客户要求文档：${data.hasClientBrief ? data.clientBriefText : "无客户要求文档"}。`,
    `禁忌和限制：${data.negativePrompt || "避免虚假承诺和夸大功效"}。`,
      "要求：短句、有转化力、避免虚假承诺，适合放在商品主图和详情页模块。"
    ].join("\n");
    promptMeta.textContent = "页面文案 · 结构化";
  } else {
    promptOutput.value = buildHeroPrompt(data);
    promptMeta.textContent = "商品主图 · 1:1";
  }
}

function renderLibrary() {
  document.querySelector("#promptLibrary").innerHTML = promptLibrary.map((item) => `
    <article class="library-card">
      <h3>${item.title}</h3>
      <p><strong>${item.meta}</strong></p>
      <p>${item.body}</p>
    </article>
  `).join("");
}

function renderModels() {
  document.querySelector("#modelList").innerHTML = modelPlans.map((item) => `
    <article class="model-row">
      <h3>${item.name}</h3>
      <p><code>${item.code}</code></p>
      <p>${item.use}</p>
    </article>
  `).join("");
}

async function renderProviderStatus() {
  const container = document.querySelector("#providerStatus");
  try {
    const response = await fetch("/api/providers/status");
    if (!response.ok) throw new Error(`状态接口返回 ${response.status}`);
    const data = await response.json();
    container.innerHTML = `
      <div class="provider-status-grid">
        ${data.providers.map((provider) => `
          <article class="provider-card ${provider.configured ? "configured" : "missing"}">
            <h3>${provider.name}</h3>
            <p>${provider.use}</p>
            <p>${provider.configured ? "已检测到服务端 API Key" : "未检测到服务端 API Key"}</p>
            <code>${provider.envKey}</code>
            <code>${provider.baseUrlKey}</code>
          </article>
        `).join("")}
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<span>模型配置状态读取失败：${error.message}</span>`;
  }
}

function switchView(view) {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.remove("active");
  });
  document.querySelector(`#${view}View`).classList.add("active");
}

document.querySelector("#generateBtn").addEventListener("click", generatePlan);
document.querySelector("#resetBtn").addEventListener("click", () => {
  fields.productName.value = "便携式筋膜按摩仪";
  fields.sellingPoints.value = "深层放松肌肉，低噪电机，Type-C 快充，6 档力度调节，适合办公室和运动后恢复。";
  fields.platform.value = "天猫 / 淘宝";
  fields.priceTier.value = "中端实用型";
  fields.audience.value = "久坐办公人群、健身爱好者、送礼用户";
  fields.visualStyle.value = "清爽科技感";
  fields.heroComposition.value = "居中大主体";
  fields.ctaStyle.value = "立即购买";
  fields.heroBadges.value = "低噪快充、6档调节、便携收纳";
  fields.showPromo.checked = true;
  fields.showTrust.checked = true;
  fields.showPrice.checked = false;
  fields.detailNotes.value = "参数区强调续航和充电方式，最后一屏突出自用和送礼都合适。";
  document.querySelectorAll(".detail-module").forEach((item) => {
    item.checked = ["首屏利益点", "痛点场景", "核心卖点拆解", "参数规格", "信任背书", "转化收口"].includes(item.value);
  });
  generatePlan();
});

document.querySelector("#copyPromptBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptOutput.value);
  statusText.textContent = "提示词已复制";
});

document.querySelector("#submitImageBtn").addEventListener("click", submitImageJob);
document.querySelector("#exportTxtBtn").addEventListener("click", exportCurrentPlanTxt);
document.querySelector("#exportJsonBtn").addEventListener("click", exportCurrentPlanJson);
document.querySelector("#clearHistoryBtn").addEventListener("click", () => {
  localStorage.removeItem(historyKey);
  renderHistory();
  statusText.textContent = "历史任务已清空";
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

fields.modelSelect.addEventListener("change", () => {
  document.querySelector("#modelHint").textContent = modelHints[fields.modelSelect.value];
  generatePlan();
});

document.querySelectorAll('input[name="generationMode"]').forEach((input) => {
  input.addEventListener("change", () => {
    const mode = getGenerationMode();
    statusText.textContent = mode === "real" ? "已切换到真实 API 模式，请确认模型已配置" : "已切换到模拟生成模式";
  });
});

fields.referenceImage.addEventListener("change", handleReferenceUpload);
fields.brandLogo.addEventListener("change", handleLogoUpload);
fields.paletteReference.addEventListener("change", handlePaletteUpload);
fields.briefDocument.addEventListener("change", handleBriefUpload);
document.querySelector("#clearBriefBtn").addEventListener("click", clearClientBrief);
document.querySelectorAll(".detail-module").forEach((item) => {
  item.addEventListener("change", generatePlan);
});
["showPromo", "showTrust", "showPrice"].forEach((id) => {
  fields[id].addEventListener("change", generatePlan);
});

Object.values(fields).forEach((field) => {
  if (field instanceof HTMLElement && !["modelSelect", "referenceImage", "brandLogo", "paletteReference", "briefDocument"].includes(field.id)) {
    field.addEventListener("input", updatePreview);
  }
});

renderLibrary();
renderModels();
renderProviderStatus();
generatePlan();
renderHistory();
