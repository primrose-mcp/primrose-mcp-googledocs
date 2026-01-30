# Google Docs MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/googledocs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for Google Docs, enabling AI assistants to create, read, and edit documents with rich formatting, tables, and images.

## Features

- **Documents** - Document creation and management
- **Content** - Text content manipulation
- **Formatting** - Rich text formatting
- **Tables** - Table creation and editing
- **Images** - Image insertion and management
- **Lists** - List creation and formatting
- **Named Ranges** - Named range management
- **Headers/Footers** - Header and footer management

## Quick Start

The recommended way to use this MCP server is through the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const primrose = new PrimroseMCP({
  service: 'googledocs',
  headers: {
    'X-Google-Access-Token': 'your-oauth-access-token'
  }
});
```

## Manual Installation

If you prefer to run the MCP server directly:

```bash
# Clone the repository
git clone https://github.com/primrose-ai/primrose-mcp-googledocs.git
cd primrose-mcp-googledocs

# Install dependencies
npm install

# Run locally
npm run dev
```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Google-Access-Token` | OAuth access token for Google Docs API |

**Required OAuth Scopes:**
- `https://www.googleapis.com/auth/documents` (full access)
- `https://www.googleapis.com/auth/documents.readonly` (read-only)

## Available Tools

### Document Tools
- Create new documents
- Get document content
- Get document metadata
- Batch update documents

### Content Tools
- Insert text
- Delete content
- Replace text
- Insert page breaks
- Insert section breaks

### Formatting Tools
- Apply text styles (bold, italic, underline)
- Set paragraph styles
- Apply named styles
- Set text color and background

### Table Tools
- Insert tables
- Insert/delete rows and columns
- Merge cells
- Set table properties
- Update cell content

### Image Tools
- Insert inline images
- Insert positioned images
- Update image properties
- Replace images

### List Tools
- Create bulleted lists
- Create numbered lists
- Update list properties
- Change list nesting

### Named Range Tools
- Create named ranges
- Delete named ranges
- Get named range content

### Header/Footer Tools
- Create headers and footers
- Update header/footer content
- Delete headers and footers
- Set different first page header

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [Google Docs API Reference](https://developers.google.com/docs/api/reference/rest)
- [Model Context Protocol](https://modelcontextprotocol.io)

## License

MIT
