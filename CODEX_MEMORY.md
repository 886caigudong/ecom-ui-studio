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
  - PNG download.
  - Brief text download.
- Post-generation self-check:
  - Typo check.
  - Risk word check.
  - Requirement fit check.
  - Platform fit check.
- Single-image tuning:
  - Each generated image has its own tuning input.
  - Tuning one image does not regenerate all images.
- Task history:
  - Stored in browser localStorage.
  - Supports preview, refill, and clearing history.
- Export:
  - TXT delivery plan.
  - JSON task data.

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
