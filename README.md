# Doc Tool Kit

**Doc Tool Kit** is a full-stack document editor and converter built with Next.js, React, TypeScript, Tailwind CSS, Prisma, PDF.js, pdf-lib, Fabric.js, and Tesseract.js. It provides a login-free toolkit for everyday document work: merge files, split pages, compress PDFs, convert formats, annotate, search, and run OCR from one polished workspace.

Doc Tool Kit is designed as a practical Sejda/iLovePDF-style product with a local-first workflow and custom branding. The core tools are usable without signup.

## ⚠️ Project Status

**Current Status: Development Phase - Known Issues Present**

This project is currently under active development with several known issues that need to be addressed before production use:

### Critical Issues
- `DATABASE_URL` must be configured (PostgreSQL for production/Vercel)
- Database migrations need to be run against your PostgreSQL instance
- Build configuration currently skips TypeScript/ESLint checks during production builds
- Authentication system exists but is not functional

### Resolved Recently
- Vercel build now runs `prisma generate` automatically
- Database provider switched from SQLite to PostgreSQL for serverless deployment
- Serverless file storage uses `/tmp` on Vercel via `src/lib/storage-paths.ts`
- Storage workspace folders are tracked in git with `.gitkeep` placeholders

### Known Limitations
- Some features are incomplete (Protect PDF, Redact PDF, Search)
- OCR currently supports English only
- No drag-and-drop file upload
- Annotations are not persisted to database
- Limited customization options
- No automated testing coverage

See the full issue analysis in the project documentation for details.

## Live Demo

Vercel: https://doc-tool-kit.vercel.app

## Screenshots

Add refreshed Doc Tool Kit screenshots here after running the app locally or deploying to Vercel.

Suggested captures:

- Landing page with Doc Tool Kit branding
- Dashboard upload and document operations
- Merge, split, compress, convert, OCR, search, and annotate tools
- Mobile responsive layout

## Features

### Currently Working
- Login-free access to document tools
- PDF editor with text, drawing, and annotation workflows
- Merge PDFs with ordered batch selection
- Split PDFs by range or repeated page chunks
- Compress PDFs with low, medium, and high options
- Convert PDF pages to images and images to PDF
- OCR extraction for PDFs and images (English only)
- Watermark PDFs with custom text
- Rotate PDF pages by 90, 180, or 270 degrees
- Inspect PDF metadata, page count, and file size
- Extract PDF pages as PNG or JPEG images
- Reorder or remove pages before export
- Local storage for uploads, exports, thumbnails, OCR, and autosave data
- Responsive UI with a custom Doc Tool Kit palette

### Partially Implemented
- Search across uploaded document text (UI exists, functionality incomplete)
- Annotate with highlights and notes (basic implementation)
- Page numbers (basic implementation)
- Autosave and undo/redo support (backend exists, UI incomplete)

### Planned Features
- Password protection for PDFs
- Redaction tools for sensitive information
- Multi-language OCR support
- Advanced annotation tools
- Batch processing capabilities
- Form filling and signature support

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| UI | React 18, Tailwind CSS, Radix UI components |
| PDF rendering | PDF.js |
| PDF manipulation | pdf-lib |
| Canvas editing | Fabric.js |
| OCR | Tesseract.js |
| State | Zustand |
| Database | Prisma + PostgreSQL |
| Validation | Zod |
| Forms | React Hook Form |
| Notifications | Sonner |
| Icons | Lucide React |
| Themes | next-themes |

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- PostgreSQL database (local Docker, Neon, Supabase, or Vercel Postgres)

### Initial Setup

1. **Clone the repository**
```bash
git clone https://github.com/AshishCherian15/Doc-Tool-Kit.git
cd Doc-Tool-Kit
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` and configure your settings:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/doc_tool_kit?schema=public"
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE=52428800
```

4. **Initialize the database**
```bash
npm run db:generate
npm run db:migrate
```

5. **Start the development server**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Add `DATABASE_URL` in Vercel project settings (PostgreSQL connection string).
3. Deploy — the build runs `scripts/vercel-build.mjs`, which executes:
   - `prisma generate`
   - `prisma migrate deploy` (when `DATABASE_URL` is set)
   - `next build`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:migrate
npm run db:generate
```

## Project Structure

```text
Doc-Tool-Kit/
├── public/                     Static assets (icons, images)
├── prisma/
│   ├── schema.prisma           Database models
│   └── migrations/             PostgreSQL migrations
├── scripts/
│   └── vercel-build.mjs        Vercel build pipeline (Prisma + Next.js)
├── src/
│   ├── app/
│   │   ├── api/                REST API routes
│   │   │   ├── annotations/    Annotation CRUD
│   │   │   ├── autosave/       Session and PDF autosave
│   │   │   ├── documents/      Document listing and deletion
│   │   │   ├── files/          PDF file streaming
│   │   │   └── upload/         PDF upload handler
│   │   ├── dashboard/          Document workspace
│   │   ├── edit/               PDF editor
│   │   ├── merge/              Merge PDF tool
│   │   ├── split/              Split PDF tool
│   │   └── ...                 Other PDF tool pages
│   ├── components/
│   │   ├── branding/           Logo and brand UI
│   │   ├── editor/             Canvas and PDF editing controls
│   │   ├── layout/             Theme provider and shell
│   │   └── ui/                 Shared UI primitives
│   ├── hooks/                  Autosave and command history hooks
│   ├── lib/
│   │   ├── prisma.ts           Prisma client singleton
│   │   ├── storage-paths.ts    Local and Vercel storage paths
│   │   └── utils.ts            Shared utilities
│   ├── services/
│   │   ├── pdfService.ts       PDF processing helpers
│   │   └── storageService.ts   File storage helpers
│   ├── store/                  Zustand document editor stores
│   ├── types/                  Shared TypeScript models
│   └── middleware.ts           Route middleware
├── storage/
│   ├── uploads/                Uploaded PDF files
│   ├── edited/                 Edited PDF exports
│   ├── exports/                Generated exports
│   ├── thumbnails/             Document thumbnails
│   ├── autosave/               Annotation session data
│   └── ocr/                    OCR output cache
├── .env.example                Environment variable template
├── next.config.js              Next.js configuration
├── package.json                Dependencies and scripts
├── tailwind.config.js          Tailwind CSS theme
├── tsconfig.json               TypeScript configuration
└── vercel.json                 Vercel deployment settings
```

## Roadmap

### Immediate Priorities
- Configure PostgreSQL `DATABASE_URL` for production deployments
- Implement proper error handling and validation
- Complete incomplete features (Protect PDF, Redact PDF, Search)
- Add drag-and-drop file upload support
- Fix authentication system or remove auth UI

### Short-term Goals
- Add comprehensive testing coverage
- Improve accessibility (ARIA labels, keyboard navigation)
- Implement annotation persistence
- Add undo/redo UI controls
- Security hardening (input validation, file type checking)

### Long-term Goals
- Add password protection with PDF encryption
- Add batch processing queues for heavier conversion jobs
- Add version history for uploaded documents
- Add tooltips, keyboard shortcuts, and accessibility improvements
- Multi-language OCR support
- Advanced annotation tools
- Form filling and signature support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Known Issues

This project has several known issues that need to be addressed. See the "Project Status" section above for critical issues and limitations.

## License

MIT. This project includes code derived from an MIT-licensed project, so the original copyright notice is preserved in `LICENSE` as required.

## Author

Built by Ashish.
