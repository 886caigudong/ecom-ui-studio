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

http.createServer((req, res) => {
  if (req.method === "POST" && req.url.split("?")[0] === "/api/images/generate") {
    readJson(req)
      .then((input) => sendJson(res, 200, createMockImageJob(input)))
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
}).listen(port, "127.0.0.1", () => {
  console.log(`http://127.0.0.1:${port}`);
});
