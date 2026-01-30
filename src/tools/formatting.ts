/**
 * Formatting Tools
 *
 * MCP tools for text and paragraph styling operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GoogleDocsClient } from '../client.js';
import type { TextStyle, ParagraphStyle, NamedStyleType, Alignment } from '../types/entities.js';
import { formatError, formatSuccess } from '../utils/formatters.js';

/**
 * Register formatting tools
 */
export function registerFormattingTools(server: McpServer, client: GoogleDocsClient): void {
  // ===========================================================================
  // Format Text (Simple)
  // ===========================================================================
  server.tool(
    'googledocs_format_text',
    `Apply basic formatting to a text range.

This is a simplified formatting tool for common text styles like bold, italic, underline.
For more advanced styling, use googledocs_update_text_style.

Args:
  - documentId: The document ID
  - startIndex: Start of the text range
  - endIndex: End of the text range
  - bold: Whether to make text bold
  - italic: Whether to make text italic
  - underline: Whether to underline text
  - strikethrough: Whether to strikethrough text
  - fontSize: Font size in points (e.g., 12)
  - fontFamily: Font family name (e.g., "Arial", "Times New Roman")

Returns:
  Confirmation of the formatting operation.`,
    {
      documentId: z.string().describe('The document ID'),
      startIndex: z.number().int().min(1).describe('Start index'),
      endIndex: z.number().int().min(1).describe('End index'),
      bold: z.boolean().optional().describe('Make text bold'),
      italic: z.boolean().optional().describe('Make text italic'),
      underline: z.boolean().optional().describe('Underline text'),
      strikethrough: z.boolean().optional().describe('Strikethrough text'),
      fontSize: z.number().positive().optional().describe('Font size in points'),
      fontFamily: z.string().optional().describe('Font family name'),
    },
    async ({ documentId, startIndex, endIndex, bold, italic, underline, strikethrough, fontSize, fontFamily }) => {
      try {
        const textStyle: TextStyle = {};
        const fields: string[] = [];

        if (bold !== undefined) {
          textStyle.bold = bold;
          fields.push('bold');
        }
        if (italic !== undefined) {
          textStyle.italic = italic;
          fields.push('italic');
        }
        if (underline !== undefined) {
          textStyle.underline = underline;
          fields.push('underline');
        }
        if (strikethrough !== undefined) {
          textStyle.strikethrough = strikethrough;
          fields.push('strikethrough');
        }
        if (fontSize !== undefined) {
          textStyle.fontSize = { magnitude: fontSize, unit: 'PT' };
          fields.push('fontSize');
        }
        if (fontFamily !== undefined) {
          textStyle.weightedFontFamily = { fontFamily };
          fields.push('weightedFontFamily');
        }

        if (fields.length === 0) {
          return formatSuccess('No formatting changes specified', {});
        }

        const result = await client.updateTextStyle(documentId, startIndex, endIndex, textStyle, fields.join(','));
        return formatSuccess(`Text formatted from ${startIndex} to ${endIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Text Style (Advanced)
  // ===========================================================================
  server.tool(
    'googledocs_update_text_style',
    `Apply advanced text styling to a range.

This tool provides full control over text styling including colors, links, and baseline offset.

Args:
  - documentId: The document ID
  - startIndex: Start of the text range
  - endIndex: End of the text range
  - textStyle: TextStyle object with styling properties
  - fields: Comma-separated list of fields to update (e.g., "bold,italic,foregroundColor")

TextStyle Properties:
  - bold, italic, underline, strikethrough, smallCaps (boolean)
  - fontSize: { magnitude: number, unit: "PT" }
  - weightedFontFamily: { fontFamily: string, weight?: number }
  - foregroundColor: { color: { rgbColor: { red, green, blue } } } (0-1 values)
  - backgroundColor: { color: { rgbColor: { red, green, blue } } }
  - baselineOffset: "NONE" | "SUPERSCRIPT" | "SUBSCRIPT"
  - link: { url: string } or { bookmarkId: string } or { headingId: string }

Returns:
  Confirmation of the styling operation.`,
    {
      documentId: z.string().describe('The document ID'),
      startIndex: z.number().int().min(1).describe('Start index'),
      endIndex: z.number().int().min(1).describe('End index'),
      textStyle: z.record(z.string(), z.unknown()).describe('TextStyle object'),
      fields: z.string().describe('Comma-separated fields to update'),
    },
    async ({ documentId, startIndex, endIndex, textStyle, fields }) => {
      try {
        const result = await client.updateTextStyle(documentId, startIndex, endIndex, textStyle as TextStyle, fields);
        return formatSuccess(`Text style updated from ${startIndex} to ${endIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Format Paragraph (Simple)
  // ===========================================================================
  server.tool(
    'googledocs_format_paragraph',
    `Apply basic paragraph formatting to a range.

This is a simplified tool for common paragraph styles. For advanced styling, use googledocs_update_paragraph_style.

Args:
  - documentId: The document ID
  - startIndex: Start of the paragraph range
  - endIndex: End of the paragraph range
  - alignment: Text alignment (START, CENTER, END, JUSTIFIED)
  - headingType: Heading style (NORMAL_TEXT, TITLE, SUBTITLE, HEADING_1 through HEADING_6)
  - lineSpacing: Line spacing (100 = single, 200 = double)
  - spaceAbove: Space above paragraph in points
  - spaceBelow: Space below paragraph in points

Returns:
  Confirmation of the paragraph formatting.`,
    {
      documentId: z.string().describe('The document ID'),
      startIndex: z.number().int().min(1).describe('Start index'),
      endIndex: z.number().int().min(1).describe('End index'),
      alignment: z.enum(['START', 'CENTER', 'END', 'JUSTIFIED']).optional().describe('Text alignment'),
      headingType: z.enum(['NORMAL_TEXT', 'TITLE', 'SUBTITLE', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'HEADING_4', 'HEADING_5', 'HEADING_6']).optional().describe('Heading style'),
      lineSpacing: z.number().positive().optional().describe('Line spacing percentage (100 = single)'),
      spaceAbove: z.number().min(0).optional().describe('Space above in points'),
      spaceBelow: z.number().min(0).optional().describe('Space below in points'),
    },
    async ({ documentId, startIndex, endIndex, alignment, headingType, lineSpacing, spaceAbove, spaceBelow }) => {
      try {
        const paragraphStyle: ParagraphStyle = {};
        const fields: string[] = [];

        if (alignment) {
          paragraphStyle.alignment = alignment as Alignment;
          fields.push('alignment');
        }
        if (headingType) {
          paragraphStyle.namedStyleType = headingType as NamedStyleType;
          fields.push('namedStyleType');
        }
        if (lineSpacing !== undefined) {
          paragraphStyle.lineSpacing = lineSpacing;
          fields.push('lineSpacing');
        }
        if (spaceAbove !== undefined) {
          paragraphStyle.spaceAbove = { magnitude: spaceAbove, unit: 'PT' };
          fields.push('spaceAbove');
        }
        if (spaceBelow !== undefined) {
          paragraphStyle.spaceBelow = { magnitude: spaceBelow, unit: 'PT' };
          fields.push('spaceBelow');
        }

        if (fields.length === 0) {
          return formatSuccess('No paragraph formatting changes specified', {});
        }

        const result = await client.updateParagraphStyle(documentId, startIndex, endIndex, paragraphStyle, fields.join(','));
        return formatSuccess(`Paragraph formatted from ${startIndex} to ${endIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Paragraph Style (Advanced)
  // ===========================================================================
  server.tool(
    'googledocs_update_paragraph_style',
    `Apply advanced paragraph styling to a range.

This tool provides full control over paragraph styling including borders, indentation, and tab stops.

Args:
  - documentId: The document ID
  - startIndex: Start of the paragraph range
  - endIndex: End of the paragraph range
  - paragraphStyle: ParagraphStyle object with styling properties
  - fields: Comma-separated list of fields to update

ParagraphStyle Properties:
  - namedStyleType: "NORMAL_TEXT" | "TITLE" | "SUBTITLE" | "HEADING_1" through "HEADING_6"
  - alignment: "START" | "CENTER" | "END" | "JUSTIFIED"
  - lineSpacing: number (100 = single spacing)
  - direction: "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT"
  - spacingMode: "NEVER_COLLAPSE" | "COLLAPSE_LISTS"
  - spaceAbove/spaceBelow: { magnitude: number, unit: "PT" }
  - indentFirstLine/indentStart/indentEnd: { magnitude: number, unit: "PT" }
  - borderTop/borderBottom/borderLeft/borderRight/borderBetween: border objects
  - shading: { backgroundColor: { color: { rgbColor: {...} } } }
  - keepLinesTogether, keepWithNext, avoidWidowAndOrphan, pageBreakBefore: boolean

Returns:
  Confirmation of the paragraph styling.`,
    {
      documentId: z.string().describe('The document ID'),
      startIndex: z.number().int().min(1).describe('Start index'),
      endIndex: z.number().int().min(1).describe('End index'),
      paragraphStyle: z.record(z.string(), z.unknown()).describe('ParagraphStyle object'),
      fields: z.string().describe('Comma-separated fields to update'),
    },
    async ({ documentId, startIndex, endIndex, paragraphStyle, fields }) => {
      try {
        const result = await client.updateParagraphStyle(documentId, startIndex, endIndex, paragraphStyle as ParagraphStyle, fields);
        return formatSuccess(`Paragraph style updated from ${startIndex} to ${endIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Document Style
  // ===========================================================================
  server.tool(
    'googledocs_update_document_style',
    `Update document-wide styling properties.

Args:
  - documentId: The document ID
  - documentStyle: DocumentStyle object
  - fields: Comma-separated list of fields to update

DocumentStyle Properties:
  - background: { color: { rgbColor: {...} } }
  - pageSize: { width: { magnitude, unit }, height: { magnitude, unit } }
  - marginTop/marginBottom/marginLeft/marginRight: { magnitude: number, unit: "PT" }
  - marginHeader/marginFooter: { magnitude: number, unit: "PT" }
  - pageNumberStart: number
  - useFirstPageHeaderFooter, useEvenPageHeaderFooter: boolean
  - flipPageOrientation: boolean

Returns:
  Confirmation of the document style update.`,
    {
      documentId: z.string().describe('The document ID'),
      documentStyle: z.record(z.string(), z.unknown()).describe('DocumentStyle object'),
      fields: z.string().describe('Comma-separated fields to update'),
    },
    async ({ documentId, documentStyle, fields }) => {
      try {
        const result = await client.updateDocumentStyle(documentId, documentStyle, fields);
        return formatSuccess('Document style updated', result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Section Style
  // ===========================================================================
  server.tool(
    'googledocs_update_section_style',
    `Update section styling properties for a range.

Args:
  - documentId: The document ID
  - startIndex: Start of the section range
  - endIndex: End of the section range
  - sectionStyle: SectionStyle object
  - fields: Comma-separated list of fields to update

SectionStyle Properties:
  - columnProperties: array of { width, paddingEnd }
  - columnSeparatorStyle: "NONE" | "BETWEEN_EACH_COLUMN"
  - contentDirection: "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT"
  - marginTop/marginBottom/marginLeft/marginRight: dimension objects
  - sectionType: "CONTINUOUS" | "NEXT_PAGE"
  - defaultHeaderId, defaultFooterId, firstPageHeaderId, etc.
  - useFirstPageHeaderFooter: boolean
  - pageNumberStart: number

Returns:
  Confirmation of the section style update.`,
    {
      documentId: z.string().describe('The document ID'),
      startIndex: z.number().int().min(1).describe('Start index'),
      endIndex: z.number().int().min(1).describe('End index'),
      sectionStyle: z.record(z.string(), z.unknown()).describe('SectionStyle object'),
      fields: z.string().describe('Comma-separated fields to update'),
    },
    async ({ documentId, startIndex, endIndex, sectionStyle, fields }) => {
      try {
        const result = await client.updateSectionStyle(documentId, startIndex, endIndex, sectionStyle, fields);
        return formatSuccess(`Section style updated from ${startIndex} to ${endIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
