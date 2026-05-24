const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 5173;
const types = {
  ".html": "text/html;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".js": "text/javascript;charset=utf-8"
};

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json;charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function createMockImageJob(input) {
  const timestamp = new Date().toISOString();
  const prompt = String(input.prompt || "").slice(0, 1200);
  const productName = input.productName || "未命名商品";
  const platform = input.platform || "通用电商平台";
  const model = input.model || "gemini-2.5-flash-image";
  const imageCount = Math.min(Math.max(Number(input.imageCount || 2), 1), 6);
  const imageSize = input.imageSize || (input.mode === "detail" ? "750:1800" : "1:1");
  const hasReferenceImage = Boolean(input.referenceAsset);
  const hasBrandLogo = Boolean(input.brandLogoAsset);
  const hasPaletteReference = Boolean(input.paletteAsset);
  const hasClientBrief = Boolean(input.clientBrief && input.clientBrief.text);
  const clientBriefKind = input.clientBrief?.kind || "";
  const brand = {
    name: input.brandName || "",
    color: input.paletteAsset?.color || input.brandColor || "#1f6f5b",
    tone: input.brandTone || "专业可信"
  };
  const swatches = ["#1f6f5b", "#456f91", "#a87824", "#a14f55", "#4d6074", "#6f7c3f"];
  const images = Array.from({ length: imageCount }, (_, index) => {
    const variant = index + 1;

    return {
      id: `variant_${variant}`,
      title: `${productName} 方案 ${variant}`,
      ratio: imageSize,
      description: `面向${platform}的${input.visualStyle || "清爽科技感"}视觉方案${variant}，品牌调性为${brand.tone}，${hasReferenceImage ? "参考了上传商品图，" : "基于文本描述生成，"}${hasBrandLogo ? "已纳入品牌 Logo，" : "未使用品牌 Logo，"}${hasClientBrief ? `已按客户${clientBriefKind || "文本"}要求约束。` : "未提供客户要求文档。"}`,
      swatch: index === 0 ? brand.color : swatches[index % swatches.length]
    };
  });

  return {
    id: `job_${Date.now()}`,
    status: "completed",
    mode: input.mode || "hero",
    model,
    productName,
    platform,
    imageSize,
    imageCount,
    hasReferenceImage,
    hasBrandLogo,
    hasPaletteReference,
    paletteColor: input.paletteAsset?.color || "",
    paletteReferenceName: input.paletteAsset?.name || "",
    hasClientBrief,
    clientBriefName: input.clientBrief?.name || "",
    clientBriefKind,
    brand,
    prompt,
    createdAt: timestamp,
    images
  };
}

function createDocumentParseJob(input) {
  const extension = String(input.kind || input.name?.split(".").pop() || "document").toLowerCase();
  const sizeKb = Math.ceil(Number(input.size || 0) / 1024);
  const name = input.name || `brief.${extension}`;

  return {
    id: `doc_${Date.now()}`,
    status: "parsed",
    name,
    kind: extension,
    size: input.size || 0,
    summary: `${name} 已进入服务端解析流程。当前 MVP 已识别文件类型为 ${extension.toUpperCase()}，文件大小约 ${sizeKb} KB。`,
    extractedText: [
      `客户上传了 ${extension.toUpperCase()} 要求文档：${name}。`,
      "请优先遵循文档中的版式要求、图片风格、主图/详情图结构、禁忌词和交付目标。",
      "当前版本为无依赖解析占位，后续可接入 pdf-parse、mammoth 或 OCR 提取正文。"
    ].join("\n"),
    checklist: [
      "确认主图构图是否符合客户要求",
      "确认详情页模块顺序是否符合客户要求",
      "确认品牌 Logo、主色调、参考图是否被纳入生成",
      "确认平台规范和禁忌词是否冲突"
    ]
  };
}

function getProviderStatus() {
  const providers = [
    {
      id: "gemini-2.5-flash-image",
      name: "Gemini 2.5 Flash Image / Nano Banana",
      envKey: "GOOGLE_API_KEY",
      baseUrlKey: "GOOGLE_BASE_URL",
      use: "快速生成主图、场景图和轻量详情图。"
    },
    {
      id: "gemini-3-pro-image-preview",
      name: "Gemini 3 Pro Image / Nano Banana Pro",
      envKey: "GOOGLE_API_KEY",
      baseUrlKey: "GOOGLE_BASE_URL",
      use: "复杂构图、文字渲染和高质量品牌资产。"
    },
    {
      id: "gpt-image-2",
      name: "OpenAI GPT Image 2",
      envKey: "OPENAI_API_KEY",
      baseUrlKey: "OPENAI_BASE_URL",
      use: "高质量商品图、局部编辑和风格统一。"
    },
    {
      id: "seedream-4",
      name: "Seedream 4",
      envKey: "SEEDREAM_API_KEY",
      baseUrlKey: "SEEDREAM_BASE_URL",
      use: "中文电商审美、海报图和多尺寸营销图。"
    }
  ];

  return {
    updatedAt: new Date().toISOString(),
    providers: providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      use: provider.use,
      configured: Boolean(process.env[provider.envKey]),
      hasBaseUrl: Boolean(process.env[provider.baseUrlKey]),
      envKey: provider.envKey,
      baseUrlKey: provider.baseUrlKey
    }))
  };
}

function getProviderConfig(model) {
  const providerMap = {
    "gemini-2.5-flash-image": { envKey: "GOOGLE_API_KEY", baseUrlKey: "GOOGLE_BASE_URL" },
    "gemini-3-pro-image-preview": { envKey: "GOOGLE_API_KEY", baseUrlKey: "GOOGLE_BASE_URL" },
    "gpt-image-2": { envKey: "OPENAI_API_KEY", baseUrlKey: "OPENAI_BASE_URL" },
    "seedream-4": { envKey: "SEEDREAM_API_KEY", baseUrlKey: "SEEDREAM_BASE_URL" }
  };
  const provider = providerMap[model] || providerMap["gemini-2.5-flash-image"];

  return {
    ...provider,
    configured: Boolean(process.env[provider.envKey]),
    baseUrl: process.env[provider.baseUrlKey] || ""
  };
}

function estimateUsage(input) {
  const modelRates = {
    "gemini-2.5-flash-image": { credits: 4, price: 0.04, label: "fast image draft" },
    "gemini-3-pro-image-preview": { credits: 10, price: 0.12, label: "pro image composition" },
    "gpt-image-2": { credits: 12, price: 0.16, label: "premium image generation" },
    "seedream-4": { credits: 7, price: 0.08, label: "commerce poster generation" }
  };
  const sizeMultipliers = {
    "1:1": 1,
    "4:5": 1.15,
    "3:4": 1.1,
    "750:1800": 1.8
  };
  const model = input.model || "gemini-2.5-flash-image";
  const imageCount = Math.min(Math.max(Number(input.imageCount || 1), 1), 6);
  const imageSize = input.imageSize || "1:1";
  const generationMode = input.generationMode || "mock";
  const base = modelRates[model] || modelRates["gemini-2.5-flash-image"];
  const multiplier = sizeMultipliers[imageSize] || 1;
  const referenceSurcharge = [
    input.hasReferenceImage,
    input.hasBrandLogo,
    input.hasPaletteReference,
    input.hasClientBrief
  ].filter(Boolean).length * 0.08;
  const modeMultiplier = generationMode === "real" ? 1 : 0;
  const credits = Math.ceil(base.credits * multiplier * imageCount * (1 + referenceSurcharge));
  const estimatedUsd = Number((base.price * multiplier * imageCount * (1 + referenceSurcharge) * modeMultiplier).toFixed(2));

  return {
    model,
    modelLabel: base.label,
    imageCount,
    imageSize,
    generationMode,
    credits,
    estimatedUsd,
    isBillable: generationMode === "real",
    assumptions: [
      "Mock mode records credits for planning but does not call a paid provider.",
      "Real provider pricing is an estimate until exact vendor billing is connected.",
      "Reference images, logo, palette, and client briefs add review/context overhead."
    ]
  };
}

function createRealModePlaceholder(input) {
  const config = getProviderConfig(input.model);

  if (!config.configured) {
    const error = new Error(`真实 API 模式需要先在服务端配置 ${config.envKey}`);
    error.statusCode = 409;
    throw error;
  }

  const job = createMockImageJob(input);
  job.status = "queued-real-api";
  job.realApi = {
    providerConfigured: true,
    envKey: config.envKey,
    baseUrlConfigured: Boolean(config.baseUrl),
    note: "真实 Provider 已配置。当前 MVP 仍返回占位结果，下一步可替换为真实图像生成调用。"
  };
  return job;
}

function createTuneImageResult(input) {
  const image = input.image || {};
  const instruction = input.instruction || "";
  const version = Number(image.version || 1) + 1;

  return {
    ...image,
    version,
    tuneInstruction: instruction,
    title: `${String(image.title || "图片方案").replace(/ · v\d+$/, "")} · v${version}`,
    description: `${image.description || ""} 微调：${instruction}`,
    swatch: shiftHexColor(image.swatch || "#1f6f5b", version * 10),
    tunedAt: new Date().toISOString(),
    tuneMode: input.generationMode || "mock"
  };
}

function shiftHexColor(hex, amount) {
  const clean = String(hex || "#1f6f5b").replace("#", "");
  const number = Number.parseInt(clean, 16);
  if (Number.isNaN(number)) return "#1f6f5b";
  const r = Math.min(Math.max(((number >> 16) & 255) + amount, 0), 255);
  const g = Math.min(Math.max(((number >> 8) & 255) + amount, 0), 255);
  const b = Math.min(Math.max((number & 255) + amount, 0), 255);
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url.split("?")[0] === "/api/providers/status") {
    sendJson(res, 200, getProviderStatus());
    return;
  }

  if (req.method === "POST" && req.url.split("?")[0] === "/api/usage/estimate") {
    readJson(req)
      .then((input) => sendJson(res, 200, estimateUsage(input)))
      .catch((error) => sendJson(res, 400, { error: error.message }));
    return;
  }

  if (req.method === "POST" && req.url.split("?")[0] === "/api/images/generate") {
    readJson(req)
      .then((input) => {
        const job = input.generationMode === "real" ? createRealModePlaceholder(input) : createMockImageJob(input);
        job.usageEstimate = estimateUsage(input);
        sendJson(res, 200, job);
      })
      .catch((error) => sendJson(res, error.statusCode || 400, { error: error.message }));
    return;
  }

  if (req.method === "POST" && req.url.split("?")[0] === "/api/images/tune") {
    readJson(req)
      .then((input) => sendJson(res, 200, createTuneImageResult(input)))
      .catch((error) => sendJson(res, error.statusCode || 400, { error: error.message }));
    return;
  }

  if (req.method === "POST" && req.url.split("?")[0] === "/api/documents/parse") {
    readJson(req)
      .then((input) => sendJson(res, 200, createDocumentParseJob(input)))
      .catch((error) => sendJson(res, 400, { error: error.message }));
    return;
  }

  let route = decodeURIComponent(req.url.split("?")[0]);
  if (route === "/") route = "/index.html";

  const file = path.join(root, route);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream"
    });
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`http://127.0.0.1:${port}`);
});

module.exports = server;
