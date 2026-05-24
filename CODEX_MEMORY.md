# Codex Collaboration Memory

## User Preferences

- The user prefers Chinese communication.
- The user wants the project to continue iteratively instead of restarting from scratch each session.
- The user values practical product implementation over abstract planning.
- The user wants the AI assistant to improve understanding through the project history and prior decisions.
- The user is building a real AI app, not just a static demo.

## Project

Project name: `ecom-ui-studio`

Purpose: Build an AI application for e-commerce product homepage UI optimization.

Core use case: Help merchants generate and optimize product main images and detail images for platforms such as Taobao/Tmall, JD, Pinduoduo, Amazon, Douyin Mall, and Xiaohongshu Mall.

Current local URL: `http://127.0.0.1:5173/`

GitHub repository: `git@github.com:886caigudong/ecom-ui-studio.git`

## Current MVP Capabilities

- Product information input.
- Target platform selection, including Douyin Mall and Xiaohongshu Mall.
- Brand assets:
  - Brand name.
  - Brand primary color.
  - Brand tone.
  - Brand Logo PNG upload.
  - Main color reference image upload with automatic dominant color extraction.
- Product reference image upload.
- Uploaded assets are mirrored to the local backend asset store:
  - `POST /api/assets`
  - `GET /api/assets`
  - `DELETE /api/assets/{assetId}`
  - Static access via `/assets/{filename}`
  - Files are stored under ignored `data/assets/`.
- UI visual direction:
  - Uses a premium palette inspired by the user's uploaded color card.
  - Core colors: Gucci green `#1F4433`, apricot orange `#FF8B31`, ivory white `#FFFBF0`, deep black `#050303`.
  - The interface should preserve this premium dark-green/orange/ivory direction unless the user changes it.
- Customer requirements document upload:
  - Text formats: txt, md, json, csv are read directly.
  - Image formats: png, jpg, jpeg are previewed and used as visual brief references.
  - PDF and DOCX are accepted and marked for future server-side parsing.
- Prompt generation for:
  - Product main image.
  - Detail long image.
  - Page copy.
- Pre-generation quality audit:
  - Input quality score.
  - Missing information suggestions.
  - Platform size fit.
- Platform compliance check:
  - Size fit.
  - Risky claims and prohibited words.
  - Logo/brand usage.
  - Text density.
  - Content-commerce fit for Xiaohongshu/Douyin.
  - Promotion expression risk.
- Mock image generation API:
  - `POST /api/images/generate`
  - Returns structured mock image jobs.
- Gallery results:
  - Visual preview SVG.
  - High-resolution PNG download.
  - Downloaded PNGs render at 2x resolution; detail images export as full-height high-resolution PNGs.
  - Gallery cards show delivery specs before download:
    - Export resolution.
    - Aspect ratio.
    - Platform fit status.
  - Brief text download.
- Post-generation self-check:
  - Typo check.
  - Risk word check.
  - Requirement fit check.
  - Platform fit check.
- Single-image tuning:
  - Each generated image has its own tuning input.
  - Tuning one image does not regenerate all images.
  - Frontend tuning now calls server endpoint `POST /api/images/tune`.
  - The server returns a new version for only the selected image and leaves the rest of the gallery unchanged.
- Task history:
  - Stored in browser localStorage with server-side JSON sync.
  - Server persistence uses ignored local file `data/jobs.json`.
  - Supports preview, refill, and clearing history.
  - API endpoints: `GET /api/jobs`, `POST /api/jobs`, `DELETE /api/jobs`.
- Export:
  - TXT delivery plan.
  - JSON task data.
  - Batch delivery download:
    - Downloads all high-resolution PNG outputs.
    - Downloads the TXT delivery plan.
    - Downloads the JSON task payload.
    - Downloads a machine-readable delivery manifest JSON.
- Cost and usage planning:
  - `POST /api/usage/estimate` estimates credits and approximate API cost by model, size, count, mode, and reference assets.
  - The workspace shows a live cost panel.
  - Generated jobs store `usageEstimate` and exports include usage information.

## Technical Decisions

- Current MVP is a dependency-free static app:
  - `index.html`
  - `styles.css`
  - `app.js`
  - `server.js`
- Local server uses Node.js built-in `http`.
- Real image generation is not connected yet.
- The app reserves model choices for:
  - `gemini-2.5-flash-image`
  - `gemini-3-pro-image-preview`
  - `gpt-image-2`
  - `seedream-4`
- Real model calls should be routed through a server-side endpoint, not the frontend.
- Suggested future endpoint:
  - `POST /api/images/generate`
  - `POST /api/images/tune`
  - `POST /api/documents/parse`

## Important Security Notes

- Do not expose API keys in frontend code.
- Keep `.ssh/`, `.env`, logs, and generated secrets out of Git.
- Current `.gitignore` already excludes `.ssh/`, logs, `node_modules/`, `dist/`, and env files.

## Git Status

- Git repository initialized locally.
- Remote origin is set to GitHub.
- Main branch has been pushed to:
  - `git@github.com:886caigudong/ecom-ui-studio.git`
- SSH authentication has been configured using a project-local key, which is ignored by Git.

## Next Recommended Steps

1. Add real document parsing for PDF and DOCX.
2. Add real image generation provider integration behind server-side API routes.
3. Add image tuning endpoint for single-image edits.
4. Add persistent backend storage instead of localStorage.
5. Add user accounts and project management.
6. Add cost tracking for image generation tasks.
7. Add upload storage for product references, logos, customer briefs, and generated images.

## How Future Codex Sessions Should Start

Before making changes, read this file first:

```text
D:\git\ecom-ui-studio\CODEX_MEMORY.md
```

Then check:

```text
D:\git\ecom-ui-studio
git status --short --branch
```

Assume the user wants to continue this exact product unless they explicitly change direction.

## Work Log - 2026-05-24

Conversation and environment:

- User greeted Codex in Chinese and asked to check API connection status.
- Checked local API environment variables and found OpenAI, DeepSeek, Anthropic-compatible, DashScope, Firecrawl, and OpenRouter keys in the current process environment.
- API connectivity tests failed for OpenAI and DeepSeek by direct requests and via the local proxy port that was discovered.
- Checked `cc switch` locally:
  - Found running process `E:\CC SWITCH\cc-switch.exe`.
  - Found local app data under `C:\Users\Admin（无密码）\AppData\Local\com.ccswitch.desktop`.
  - Found no clear local HTTP gateway exposed by `cc switch`.
  - Determined that `cc switch` was running but not clearly affecting the current terminal/API request chain.
- Confirmed local code-writing capability by creating, reading, and deleting a temporary file.

Planning and documentation:

- Produced a full 0-to-1 AI app landing plan.
- Converted the plan into a mind map.
- Generated downloadable files:
  - `D:\git\ai_app_mindmap.html`
  - `D:\git\ai_app_mindmap.png`
  - `D:\git\ai_app_mindmap.pdf`
- Verified the PDF header as `%PDF-1.4`.

Product development:

- Started building the e-commerce product homepage UI optimization app.
- Created `D:\git\ecom-ui-studio`.
- Implemented a dependency-free MVP using:
  - `index.html`
  - `styles.css`
  - `app.js`
  - `server.js`
- Started local app at `http://127.0.0.1:5173/`.
- Fixed local server persistence issues by hosting the server through a persistent Node REPL process.
- Added target platforms:
  - Douyin Mall.
  - Xiaohongshu Mall.
- Added mock generation endpoint:
  - `POST /api/images/generate`.
- Added support for:
  - Product information.
  - Brand name/color/tone.
  - Brand Logo PNG upload.
  - Product reference image upload.
  - Main color reference image upload and dominant color extraction.
  - Customer requirements document upload.
  - Customer document formats: txt, md, json, csv, png, jpg, jpeg, pdf, docx.
  - Text brief reading.
  - Image brief preview.
  - PDF/DOCX deferred server-side parsing status.
  - Prompt generation for main image, detail image, and page copy.
  - Pre-generation input quality scoring.
  - Platform compliance checks.
  - Mock visual gallery.
  - SVG preview and PNG download.
  - Post-generation self-check for typos, risky terms, platform fit, and requirement fit.
  - Single-image tuning, so one generated result can be adjusted without regenerating all images.
  - Task history using browser localStorage.
  - TXT and JSON export of the current generation plan.

GitHub integration:

- Initialized Git repository in `D:\git\ecom-ui-studio`.
- Created `.gitignore`.
- Created local commits:
  - `a0f88c8 Initial e-commerce AI studio MVP`
  - `6ecdb53 Ignore local SSH and logs`
  - `865a74c Add Codex collaboration memory`
- Generated a GitHub SSH key.
- User added the SSH key to GitHub.
- Verified SSH authentication with GitHub.
- User created GitHub repository manually because `gh` token was expired.
- Pushed repository to:
  - `git@github.com:886caigudong/ecom-ui-studio.git`
  - `https://github.com/886caigudong/ecom-ui-studio`

User memory request:

- User asked Codex to establish memory so future conversations do not restart from scratch.
- Created this `CODEX_MEMORY.md` file.
- Future Codex sessions should read this file before continuing work.

Current continuation intent:

- User asked to record today's conversation and work tasks, then continue completing the e-commerce product homepage UI app.
- Next product step chosen: add a detail-page module planner/arranger so generated detail images can follow a structured e-commerce page flow.
- Continued product improvement:
  - Added detail-page module planner so users can choose modules such as hero benefit, pain scene, selling point breakdown, parameters, comparison, usage steps, trust proof, and conversion close.
  - Added product homepage hero layout planner so users can configure hero composition, selling point badges, CTA style, promotion area, trust proof, and price anchor.
  - Main image prompt and homepage preview now respond to hero layout controls.
  - Added `POST /api/documents/parse` as the first server-side document parsing endpoint.
  - PDF/DOCX customer requirement uploads now call the parsing endpoint and inject the returned `extractedText` into the prompt context.
  - Current parser is a no-dependency MVP placeholder; future work should replace it with real PDF/DOCX extraction using `pdf-parse`, `mammoth`, OCR, or a hosted document parser.
  - Added `GET /api/providers/status` to centralize image model provider configuration status on the server.
  - Added a model provider status panel in the Models view so frontend can show whether Gemini/Nano Banana, OpenAI image, and Seedream providers are configured without exposing secrets.
  - Added generation mode switch:
    - `mock` mode keeps using local placeholder generation.
    - `real` mode sends `generationMode: "real"` to the server.
    - Server checks provider configuration and returns a clear setup error if the required API key is missing.
  - Added server-side single-image tuning endpoint:
    - `POST /api/images/tune`
    - Frontend sends the selected image, tuning instruction, generation mode, and prompt context.
    - Server returns a versioned image result for that one image only.
    - Verified local API request and local page access at `http://127.0.0.1:5173/`.
  - Added usage/cost estimation:
    - New endpoint `POST /api/usage/estimate`.
    - Added a live “生成成本预估” panel in the workspace.
    - Generation jobs now attach `usageEstimate`.
    - TXT/JSON exports include estimated credits and API cost.
    - Verified local endpoint and browser rendering.

Continuation:

  - Added backend task persistence:
    - New local JSON data store at `data/jobs.json`.
    - Added `data/` to `.gitignore` so user/customer task data is not pushed.
    - Added `GET /api/jobs`, `POST /api/jobs`, and `DELETE /api/jobs`.
    - Frontend now syncs generated jobs to the server while preserving localStorage fallback.
    - Verified API save/list/clear flow and browser history loading.
  - Added backend asset storage:
    - New local asset store at `data/assets/`.
    - Added `POST /api/assets` and `GET /api/assets`.
    - Added static local asset serving through `/assets/{filename}`.
    - Product reference images, brand logos, palette references, and customer brief files now sync to the backend while preserving browser previews.
    - Verified asset save/list/static-read flow and browser startup.
  - Added asset deletion:
    - New endpoint `DELETE /api/assets/{assetId}` removes both the stored file and asset index entry.
    - Asset library cards now include a delete button with browser confirmation.
    - Verified create/delete/list API flow and asset library rendering.
  - Improved image download clarity:
    - Gallery download button now says `下载高清 PNG`.
    - PNG export uses high-resolution SVG rendering before rasterization.
    - 1:1 images export at `2000x2000`.
    - 4:5 images export at `1800x2250`.
    - 3:4 images export at `1800x2400`.
    - Detail images export at `1500x3600`.
    - Verified browser download click and status output.
  - Added pre-download delivery guidance:
    - Gallery cards display `交付规格`, export pixels, aspect ratio, and platform fit.
    - If a user downloads a size that does not fit the target platform, the app asks for confirmation first.
    - Verified gallery rendering shows `2000x2000 · 1:1 · 平台适配`.
  - Added batch delivery download:
    - New `批量下载交付包` button in the gallery header.
    - Triggers all high-resolution PNG downloads plus TXT and JSON exports.
    - Implemented without third-party zip dependencies for the current static MVP.
  - Upgraded UI color system using the user's reference color card:
    - Deep black page background.
    - Gucci green `#1F4433` as primary brand color.
    - Apricot orange `#FF8B31` as CTA/accent color.
    - Ivory white `#FFFBF0` as panel/background color.
  - Added a frontend “素材库” view:
    - Navigation item `素材库`.
    - Reads backend assets from `GET /api/assets`.
    - Displays uploaded images/files with type, size, local URL, and created time.
    - Verified browser navigation to `assetsView`.

Latest continuation:

- Added delivery manifest:
  - Batch delivery now also downloads `�����嵥-manifest.json`.
  - Manifest records image filenames, export dimensions, aspect ratios, platform fit, recommended sizes, tuning instructions, usage estimate, self-check, and compliance checks.
  - Verified syntax and gallery UI entry.

Latest continuation - ZIP delivery package:

- Upgraded batch delivery to a real browser-generated ZIP package.
- `批量下载交付包` now creates one `.zip` instead of triggering many separate downloads.
- ZIP contents include high-resolution PNGs under `images/`, the TXT delivery plan, the full task JSON, and `交付清单-manifest.json`.
- Implemented ZIP generation in the frontend without adding third-party dependencies.
- Rewrote ZIP local header, central directory, and end-record creation with explicit field writes for easier maintenance.
- Verified `app.js` and `server.js` syntax with `node --check`.
- Verified the ZIP structure locally by generating a test package and extracting it with Windows `Expand-Archive`.
- Confirmed the local app loads at `http://127.0.0.1:5173/` without browser console errors.

Latest continuation - readable document parsing:

- Upgraded `/api/documents/parse` from a placeholder into a dependency-free readable parser.
- TXT, MD, JSON, and CSV uploads are decoded on the server and normalized.
- DOCX uploads now extract readable text from `word/*.xml` entries inside the Office ZIP package.
- PDF uploads now attempt basic text extraction from literal text operators and Flate-compressed streams.
- Parsed customer brief text is returned to the frontend and injected into prompt generation.
- Added checklist hints based on brief content such as logo/brand, color palette, negative requirements, Douyin, and Xiaohongshu.
- Updated frontend help text so PDF/DOCX are described as auto-parsed instead of only queued.
- Verified syntax with `node --check app.js` and `node --check server.js`.
- Verified `/api/documents/parse` with TXT and generated DOCX HTTP tests; DOCX Chinese text extraction works.
