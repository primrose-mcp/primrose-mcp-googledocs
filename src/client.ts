/**
 * Google Docs API Client
 *
 * This file handles all HTTP communication with the Google Docs API.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different OAuth tokens.
 */

import type {
  BatchUpdateRequest,
  BatchUpdateResponse,
  Document,
  Request,
  TextStyle,
  ParagraphStyle,
  TableCellStyle,
  TableRowStyle,
  TableColumnProperties,
  DocumentStyle,
  SectionStyle,
  BulletGlyphPreset,
  SectionType,
  HeaderFooterType,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, GoogleDocsApiError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = 'https://docs.googleapis.com/v1';

// =============================================================================
// Google Docs Client Interface
// =============================================================================

export interface GoogleDocsClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Documents
  createDocument(title: string): Promise<Document>;
  getDocument(documentId: string): Promise<Document>;
  batchUpdate(documentId: string, requests: Request[]): Promise<BatchUpdateResponse>;

  // Text Operations
  insertText(documentId: string, text: string, index: number): Promise<BatchUpdateResponse>;
  deleteContent(documentId: string, startIndex: number, endIndex: number): Promise<BatchUpdateResponse>;
  replaceAllText(documentId: string, findText: string, replaceText: string, matchCase?: boolean): Promise<BatchUpdateResponse>;
  appendText(documentId: string, text: string): Promise<BatchUpdateResponse>;

  // Text Styling
  updateTextStyle(documentId: string, startIndex: number, endIndex: number, textStyle: TextStyle, fields: string): Promise<BatchUpdateResponse>;
  updateParagraphStyle(documentId: string, startIndex: number, endIndex: number, paragraphStyle: ParagraphStyle, fields: string): Promise<BatchUpdateResponse>;

  // Lists/Bullets
  createParagraphBullets(documentId: string, startIndex: number, endIndex: number, bulletPreset?: BulletGlyphPreset): Promise<BatchUpdateResponse>;
  deleteParagraphBullets(documentId: string, startIndex: number, endIndex: number): Promise<BatchUpdateResponse>;

  // Named Ranges
  createNamedRange(documentId: string, name: string, startIndex: number, endIndex: number): Promise<BatchUpdateResponse>;
  deleteNamedRange(documentId: string, namedRangeId?: string, name?: string): Promise<BatchUpdateResponse>;
  replaceNamedRangeContent(documentId: string, text: string, namedRangeId?: string, namedRangeName?: string): Promise<BatchUpdateResponse>;

  // Tables
  insertTable(documentId: string, rows: number, columns: number, index: number): Promise<BatchUpdateResponse>;
  insertTableRow(documentId: string, tableStartIndex: number, rowIndex: number, columnIndex: number, insertBelow: boolean): Promise<BatchUpdateResponse>;
  insertTableColumn(documentId: string, tableStartIndex: number, rowIndex: number, columnIndex: number, insertRight: boolean): Promise<BatchUpdateResponse>;
  deleteTableRow(documentId: string, tableStartIndex: number, rowIndex: number, columnIndex: number): Promise<BatchUpdateResponse>;
  deleteTableColumn(documentId: string, tableStartIndex: number, rowIndex: number, columnIndex: number): Promise<BatchUpdateResponse>;
  mergeTableCells(documentId: string, tableStartIndex: number, rowIndex: number, columnIndex: number, rowSpan: number, columnSpan: number): Promise<BatchUpdateResponse>;
  unmergeTableCells(documentId: string, tableStartIndex: number, rowIndex: number, columnIndex: number, rowSpan: number, columnSpan: number): Promise<BatchUpdateResponse>;
  updateTableCellStyle(documentId: string, tableStartIndex: number, rowIndex: number, columnIndex: number, rowSpan: number, columnSpan: number, tableCellStyle: TableCellStyle, fields: string): Promise<BatchUpdateResponse>;
  updateTableRowStyle(documentId: string, tableStartIndex: number, rowIndices: number[], tableRowStyle: TableRowStyle, fields: string): Promise<BatchUpdateResponse>;
  updateTableColumnProperties(documentId: string, tableStartIndex: number, columnIndices: number[], tableColumnProperties: TableColumnProperties, fields: string): Promise<BatchUpdateResponse>;
  pinTableHeaderRows(documentId: string, tableStartIndex: number, pinnedHeaderRowsCount: number): Promise<BatchUpdateResponse>;

  // Images
  insertInlineImage(documentId: string, uri: string, index: number, width?: number, height?: number): Promise<BatchUpdateResponse>;
  replaceImage(documentId: string, imageObjectId: string, uri: string): Promise<BatchUpdateResponse>;
  deletePositionedObject(documentId: string, objectId: string): Promise<BatchUpdateResponse>;

  // Page Breaks and Section Breaks
  insertPageBreak(documentId: string, index: number): Promise<BatchUpdateResponse>;
  insertSectionBreak(documentId: string, index: number, sectionType: SectionType): Promise<BatchUpdateResponse>;

  // Headers and Footers
  createHeader(documentId: string, type: HeaderFooterType, sectionBreakIndex?: number): Promise<BatchUpdateResponse>;
  createFooter(documentId: string, type: HeaderFooterType, sectionBreakIndex?: number): Promise<BatchUpdateResponse>;
  deleteHeader(documentId: string, headerId: string): Promise<BatchUpdateResponse>;
  deleteFooter(documentId: string, footerId: string): Promise<BatchUpdateResponse>;

  // Footnotes
  createFootnote(documentId: string, index: number): Promise<BatchUpdateResponse>;

  // Document Style
  updateDocumentStyle(documentId: string, documentStyle: DocumentStyle, fields: string): Promise<BatchUpdateResponse>;
  updateSectionStyle(documentId: string, startIndex: number, endIndex: number, sectionStyle: SectionStyle, fields: string): Promise<BatchUpdateResponse>;
}

// =============================================================================
// Google Docs Client Implementation
// =============================================================================

class GoogleDocsClientImpl implements GoogleDocsClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials.accessToken) {
      throw new AuthenticationError(
        'No access token provided. Include X-Google-Access-Token header.'
      );
    }

    return {
      Authorization: `Bearer ${this.credentials.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your OAuth access token.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      let message = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.error?.message || errorJson.message || message;
      } catch {
        // Use default message
      }
      throw new GoogleDocsApiError(message, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      // Test by creating and immediately getting a test document info
      // We'll just verify the auth by making a simple API call
      // The best way is to try to create a document (which requires write access)
      // or get an existing document if we have an ID

      // Since we don't have a document ID, let's create a test document
      const testDoc = await this.createDocument('MCP Connection Test');
      return {
        connected: true,
        message: `Successfully connected to Google Docs API. Test document created with ID: ${testDoc.documentId}`
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Documents
  // ===========================================================================

  async createDocument(title: string): Promise<Document> {
    return this.request<Document>('/documents', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async getDocument(documentId: string): Promise<Document> {
    return this.request<Document>(`/documents/${encodeURIComponent(documentId)}`);
  }

  async batchUpdate(documentId: string, requests: Request[]): Promise<BatchUpdateResponse> {
    const body: BatchUpdateRequest = { requests };
    return this.request<BatchUpdateResponse>(
      `/documents/${encodeURIComponent(documentId)}:batchUpdate`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  // ===========================================================================
  // Text Operations
  // ===========================================================================

  async insertText(documentId: string, text: string, index: number): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        insertText: {
          text,
          location: { index },
        },
      },
    ]);
  }

  async deleteContent(documentId: string, startIndex: number, endIndex: number): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        deleteContentRange: {
          range: { startIndex, endIndex },
        },
      },
    ]);
  }

  async replaceAllText(
    documentId: string,
    findText: string,
    replaceText: string,
    matchCase = false
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        replaceAllText: {
          containsText: { text: findText, matchCase },
          replaceText,
        },
      },
    ]);
  }

  async appendText(documentId: string, text: string): Promise<BatchUpdateResponse> {
    // First get the document to find the end index
    const doc = await this.getDocument(documentId);
    const endIndex = doc.body?.content?.slice(-1)[0]?.endIndex || 1;
    // Insert at the end (before the final newline)
    return this.insertText(documentId, text, Math.max(1, endIndex - 1));
  }

  // ===========================================================================
  // Text Styling
  // ===========================================================================

  async updateTextStyle(
    documentId: string,
    startIndex: number,
    endIndex: number,
    textStyle: TextStyle,
    fields: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        updateTextStyle: {
          range: { startIndex, endIndex },
          textStyle,
          fields,
        },
      },
    ]);
  }

  async updateParagraphStyle(
    documentId: string,
    startIndex: number,
    endIndex: number,
    paragraphStyle: ParagraphStyle,
    fields: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        updateParagraphStyle: {
          range: { startIndex, endIndex },
          paragraphStyle,
          fields,
        },
      },
    ]);
  }

  // ===========================================================================
  // Lists/Bullets
  // ===========================================================================

  async createParagraphBullets(
    documentId: string,
    startIndex: number,
    endIndex: number,
    bulletPreset?: BulletGlyphPreset
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        createParagraphBullets: {
          range: { startIndex, endIndex },
          bulletPreset,
        },
      },
    ]);
  }

  async deleteParagraphBullets(
    documentId: string,
    startIndex: number,
    endIndex: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        deleteParagraphBullets: {
          range: { startIndex, endIndex },
        },
      },
    ]);
  }

  // ===========================================================================
  // Named Ranges
  // ===========================================================================

  async createNamedRange(
    documentId: string,
    name: string,
    startIndex: number,
    endIndex: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        createNamedRange: {
          name,
          range: { startIndex, endIndex },
        },
      },
    ]);
  }

  async deleteNamedRange(
    documentId: string,
    namedRangeId?: string,
    name?: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        deleteNamedRange: {
          namedRangeId,
          name,
        },
      },
    ]);
  }

  async replaceNamedRangeContent(
    documentId: string,
    text: string,
    namedRangeId?: string,
    namedRangeName?: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        replaceNamedRangeContent: {
          namedRangeId,
          namedRangeName,
          text,
        },
      },
    ]);
  }

  // ===========================================================================
  // Tables
  // ===========================================================================

  async insertTable(
    documentId: string,
    rows: number,
    columns: number,
    index: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        insertTable: {
          rows,
          columns,
          location: { index },
        },
      },
    ]);
  }

  async insertTableRow(
    documentId: string,
    tableStartIndex: number,
    rowIndex: number,
    columnIndex: number,
    insertBelow: boolean
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        insertTableRow: {
          tableCellLocation: {
            tableStartLocation: { index: tableStartIndex },
            rowIndex,
            columnIndex,
          },
          insertBelow,
        },
      },
    ]);
  }

  async insertTableColumn(
    documentId: string,
    tableStartIndex: number,
    rowIndex: number,
    columnIndex: number,
    insertRight: boolean
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        insertTableColumn: {
          tableCellLocation: {
            tableStartLocation: { index: tableStartIndex },
            rowIndex,
            columnIndex,
          },
          insertRight,
        },
      },
    ]);
  }

  async deleteTableRow(
    documentId: string,
    tableStartIndex: number,
    rowIndex: number,
    columnIndex: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        deleteTableRow: {
          tableCellLocation: {
            tableStartLocation: { index: tableStartIndex },
            rowIndex,
            columnIndex,
          },
        },
      },
    ]);
  }

  async deleteTableColumn(
    documentId: string,
    tableStartIndex: number,
    rowIndex: number,
    columnIndex: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        deleteTableColumn: {
          tableCellLocation: {
            tableStartLocation: { index: tableStartIndex },
            rowIndex,
            columnIndex,
          },
        },
      },
    ]);
  }

  async mergeTableCells(
    documentId: string,
    tableStartIndex: number,
    rowIndex: number,
    columnIndex: number,
    rowSpan: number,
    columnSpan: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        mergeTableCells: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { index: tableStartIndex },
              rowIndex,
              columnIndex,
            },
            rowSpan,
            columnSpan,
          },
        },
      },
    ]);
  }

  async unmergeTableCells(
    documentId: string,
    tableStartIndex: number,
    rowIndex: number,
    columnIndex: number,
    rowSpan: number,
    columnSpan: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        unmergeTableCells: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { index: tableStartIndex },
              rowIndex,
              columnIndex,
            },
            rowSpan,
            columnSpan,
          },
        },
      },
    ]);
  }

  async updateTableCellStyle(
    documentId: string,
    tableStartIndex: number,
    rowIndex: number,
    columnIndex: number,
    rowSpan: number,
    columnSpan: number,
    tableCellStyle: TableCellStyle,
    fields: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        updateTableCellStyle: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { index: tableStartIndex },
              rowIndex,
              columnIndex,
            },
            rowSpan,
            columnSpan,
          },
          tableCellStyle,
          fields,
        },
      },
    ]);
  }

  async updateTableRowStyle(
    documentId: string,
    tableStartIndex: number,
    rowIndices: number[],
    tableRowStyle: TableRowStyle,
    fields: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        updateTableRowStyle: {
          tableStartLocation: { index: tableStartIndex },
          rowIndices,
          tableRowStyle,
          fields,
        },
      },
    ]);
  }

  async updateTableColumnProperties(
    documentId: string,
    tableStartIndex: number,
    columnIndices: number[],
    tableColumnProperties: TableColumnProperties,
    fields: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        updateTableColumnProperties: {
          tableStartLocation: { index: tableStartIndex },
          columnIndices,
          tableColumnProperties,
          fields,
        },
      },
    ]);
  }

  async pinTableHeaderRows(
    documentId: string,
    tableStartIndex: number,
    pinnedHeaderRowsCount: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        pinTableHeaderRows: {
          tableStartLocation: { index: tableStartIndex },
          pinnedHeaderRowsCount,
        },
      },
    ]);
  }

  // ===========================================================================
  // Images
  // ===========================================================================

  async insertInlineImage(
    documentId: string,
    uri: string,
    index: number,
    width?: number,
    height?: number
  ): Promise<BatchUpdateResponse> {
    const objectSize = width && height ? {
      width: { magnitude: width, unit: 'PT' as const },
      height: { magnitude: height, unit: 'PT' as const },
    } : undefined;

    return this.batchUpdate(documentId, [
      {
        insertInlineImage: {
          uri,
          location: { index },
          objectSize,
        },
      },
    ]);
  }

  async replaceImage(
    documentId: string,
    imageObjectId: string,
    uri: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        replaceImage: {
          imageObjectId,
          uri,
        },
      },
    ]);
  }

  async deletePositionedObject(
    documentId: string,
    objectId: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        deletePositionedObject: {
          objectId,
        },
      },
    ]);
  }

  // ===========================================================================
  // Page Breaks and Section Breaks
  // ===========================================================================

  async insertPageBreak(documentId: string, index: number): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        insertPageBreak: {
          location: { index },
        },
      },
    ]);
  }

  async insertSectionBreak(
    documentId: string,
    index: number,
    sectionType: SectionType
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        insertSectionBreak: {
          location: { index },
          sectionType,
        },
      },
    ]);
  }

  // ===========================================================================
  // Headers and Footers
  // ===========================================================================

  async createHeader(
    documentId: string,
    type: HeaderFooterType,
    sectionBreakIndex?: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        createHeader: {
          type,
          sectionBreakLocation: sectionBreakIndex ? { index: sectionBreakIndex } : undefined,
        },
      },
    ]);
  }

  async createFooter(
    documentId: string,
    type: HeaderFooterType,
    sectionBreakIndex?: number
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        createFooter: {
          type,
          sectionBreakLocation: sectionBreakIndex ? { index: sectionBreakIndex } : undefined,
        },
      },
    ]);
  }

  async deleteHeader(documentId: string, headerId: string): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        deleteHeader: {
          headerId,
        },
      },
    ]);
  }

  async deleteFooter(documentId: string, footerId: string): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        deleteFooter: {
          footerId,
        },
      },
    ]);
  }

  // ===========================================================================
  // Footnotes
  // ===========================================================================

  async createFootnote(documentId: string, index: number): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        createFootnote: {
          location: { index },
        },
      },
    ]);
  }

  // ===========================================================================
  // Document Style
  // ===========================================================================

  async updateDocumentStyle(
    documentId: string,
    documentStyle: DocumentStyle,
    fields: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        updateDocumentStyle: {
          documentStyle,
          fields,
        },
      },
    ]);
  }

  async updateSectionStyle(
    documentId: string,
    startIndex: number,
    endIndex: number,
    sectionStyle: SectionStyle,
    fields: string
  ): Promise<BatchUpdateResponse> {
    return this.batchUpdate(documentId, [
      {
        updateSectionStyle: {
          range: { startIndex, endIndex },
          sectionStyle,
          fields,
        },
      },
    ]);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Google Docs client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createGoogleDocsClient(credentials: TenantCredentials): GoogleDocsClient {
  return new GoogleDocsClientImpl(credentials);
}
