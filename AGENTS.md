<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Church ERP Project Guidelines & Canonical Nomenclature

1. **Church Name**:
   - The canonical name of the church is strictly **«ቻግኒ ብርሃነ ገነት ቅድስት በዓታ ለማርያም»** (English: *Chagni Birhane Genet Kidist Ba'ata Lemariyam*).
   - **Spelling Rule**: Strictly use **«በዓታ»** (NEVER write "ቤዓታ" and NEVER write "ባዓታ").

2. **Sebeka Gubae (የሰበካ ጉባኤ) Contributions**:
   - Sebeka Gubae contributions are strictly **YEARLY / ዓመታዊ** (NEVER monthly).

3. **Backend & Docker Execution**:
   - Backend dependencies and runtime are isolated inside Docker (`docker-compose up` / `backend/Dockerfile`).
   - The host machine stays clean (never run `npm install --prefix backend` on the host).
