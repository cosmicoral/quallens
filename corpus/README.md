# Qualisapio RAG corpus (scaffold)

Curated knowledge base for mid-term RAG: **30 methodologies**, **40 social-science
theories**, and **30 journal profiles** (public guidelines — not full papers).

This folder is **offline content + tooling only**. Nothing here is imported by the
Next.js app yet, so it does not affect the current frontend demo.

## Layout

```
corpus/
  manifest.json          # canonical checklist (100 entries)
  _templates/            # copy templates (not ingested)
  methodology/           # method tradition guides
  theory/                # theory operationalization guides
  journals/              # journal fit & author-guideline profiles
```

## Authoring workflow

1. Pick an entry in `manifest.json` (`status: planned` → `stub` → `draft` → `ready`).
2. Create or edit the markdown file at the path listed in the manifest.
3. Use frontmatter fields from `_templates/*.md`.
4. Fill body sections; prefer **curated synthesis** over pasted publisher PDFs.
5. For journals: cite official aims & scope / author-guideline URLs with access date.

## Commands

```bash
# Validate manifest + existing markdown frontmatter
npm run corpus:validate

# Create stub markdown files for all planned entries (from templates)
npm run corpus:init-stubs

# Placeholder for future chunk + embed pipeline (no-op today)
npm run corpus:ingest
```

## Journal profiles

Each journal entry is a **profile document**, not a full SSCI paper. Sources should be
publicly available publisher pages only.

## Future (not implemented)

- Chunking + embeddings → Postgres pgvector or external vector store
- Retrieval hooks in `src/lib/agents/*` behind a feature flag
- User-owned private libraries (separate from this global corpus)
