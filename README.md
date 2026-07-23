# Doc Tool Kit

**Doc Tool Kit** is a full-stack document editor and converter built with Next.js, React, TypeScript, Tailwind CSS, Prisma, PDF.js, pdf-lib, Fabric.js, and Tesseract.js. It provides a login-free toolkit for everyday document work: merge files, split pages, compress PDFs, convert formats, annotate, search, and run OCR from one polished workspace.

Doc Tool Kit is designed as a practical Sejda/iLovePDF-style product with a local-first workflow and custom branding. The core tools are usable without signup.

## ⚠️ Project Status

**Current Status: Development Phase - Known Issues Present**

This project is currently under active development with several known issues that need to be addressed before production use:

### Critical Issues
- Missing `.env` file configuration (DATABASE_URL and other environment variables)
- Database migrations need to be run
- Storage directories need to be created
- Build configuration masking TypeScript/ESLint errors
- Authentication system exists but is not functional
- Storage service incompatible with serverless deployment

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
| Database | Prisma + SQLite |
| Validation | Zod |
| Forms | React Hook Form |
| Notifications | Sonner |
| Icons | Lucide React |
| Themes | next-themes |

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

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
DATABASE_URL="file:./dev.db"
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE=52428800
```

4. **Initialize the database**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Create storage directories**
```bash
mkdir -p storage/uploads storage/edited storage/exports storage/thumbnails storage/autosave storage/ocr
```

6. **Start the development server**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build for Production
```bash
npm run build
npm run start
```

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
src/
  app/                    Next.js routes and API endpoints
  components/branding/    Doc Tool Kit logo and brand UI
  components/editor/      Canvas and PDF editing controls
  components/layout/      Theme provider
  components/ui/          Shared UI primitives
  hooks/                  Autosave and command history hooks
  lib/                    Prisma and utility helpers
  services/               PDF and storage services
  store/                  Zustand document editor stores
  types/                  Shared TypeScript models
prisma/                   Database schema and migrations
storage/                  Local file workspace
public/                   Icons and public assets
```

## Roadmap

### Immediate Priorities
- Fix critical configuration issues (.env, database, storage)
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
