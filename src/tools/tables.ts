/**
 * Table Tools
 *
 * MCP tools for table operations (insert, modify rows/columns, merge cells, styling).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { GoogleDocsClient } from '../client.js';
import type { TableCellStyle, TableRowStyle, TableColumnProperties } from '../types/entities.js';
import { formatError, formatSuccess } from '../utils/formatters.js';

/**
 * Register table tools
 */
export function registerTableTools(server: McpServer, client: GoogleDocsClient): void {
  // ===========================================================================
  // Insert Table
  // ===========================================================================
  server.tool(
    'googledocs_insert_table',
    `Insert a table at a specific position in the document.

Args:
  - documentId: The document ID
  - rows: Number of rows
  - columns: Number of columns
  - index: Position to insert the table

Returns:
  Confirmation of the table insertion.`,
    {
      documentId: z.string().describe('The document ID'),
      rows: z.number().int().min(1).describe('Number of rows'),
      columns: z.number().int().min(1).describe('Number of columns'),
      index: z.number().int().min(1).describe('Position to insert the table'),
    },
    async ({ documentId, rows, columns, index }) => {
      try {
        const result = await client.insertTable(documentId, rows, columns, index);
        return formatSuccess(`Table (${rows}x${columns}) inserted at index ${index}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Insert Table Row
  // ===========================================================================
  server.tool(
    'googledocs_insert_table_row',
    `Insert a row into an existing table.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table in the document
  - rowIndex: The row to reference for insertion
  - columnIndex: The column to reference for the cell location
  - insertBelow: If true, insert below the referenced row; if false, insert above

Returns:
  Confirmation of the row insertion.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndex: z.number().int().min(0).describe('Row index (0-based)'),
      columnIndex: z.number().int().min(0).default(0).describe('Column index (0-based)'),
      insertBelow: z.boolean().default(true).describe('Insert below the row'),
    },
    async ({ documentId, tableStartIndex, rowIndex, columnIndex, insertBelow }) => {
      try {
        const result = await client.insertTableRow(documentId, tableStartIndex, rowIndex, columnIndex, insertBelow);
        return formatSuccess(`Row inserted ${insertBelow ? 'below' : 'above'} row ${rowIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Insert Table Column
  // ===========================================================================
  server.tool(
    'googledocs_insert_table_column',
    `Insert a column into an existing table.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table in the document
  - rowIndex: The row to reference for the cell location
  - columnIndex: The column to reference for insertion
  - insertRight: If true, insert to the right; if false, insert to the left

Returns:
  Confirmation of the column insertion.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndex: z.number().int().min(0).default(0).describe('Row index (0-based)'),
      columnIndex: z.number().int().min(0).describe('Column index (0-based)'),
      insertRight: z.boolean().default(true).describe('Insert to the right'),
    },
    async ({ documentId, tableStartIndex, rowIndex, columnIndex, insertRight }) => {
      try {
        const result = await client.insertTableColumn(documentId, tableStartIndex, rowIndex, columnIndex, insertRight);
        return formatSuccess(`Column inserted ${insertRight ? 'right of' : 'left of'} column ${columnIndex}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Table Row
  // ===========================================================================
  server.tool(
    'googledocs_delete_table_row',
    `Delete a row from a table.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table in the document
  - rowIndex: The row to delete (0-based)
  - columnIndex: The column to reference for the cell location

Returns:
  Confirmation of the row deletion.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndex: z.number().int().min(0).describe('Row index to delete (0-based)'),
      columnIndex: z.number().int().min(0).default(0).describe('Column index (0-based)'),
    },
    async ({ documentId, tableStartIndex, rowIndex, columnIndex }) => {
      try {
        const result = await client.deleteTableRow(documentId, tableStartIndex, rowIndex, columnIndex);
        return formatSuccess(`Row ${rowIndex} deleted`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Table Column
  // ===========================================================================
  server.tool(
    'googledocs_delete_table_column',
    `Delete a column from a table.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table in the document
  - rowIndex: The row to reference for the cell location
  - columnIndex: The column to delete (0-based)

Returns:
  Confirmation of the column deletion.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndex: z.number().int().min(0).default(0).describe('Row index (0-based)'),
      columnIndex: z.number().int().min(0).describe('Column index to delete (0-based)'),
    },
    async ({ documentId, tableStartIndex, rowIndex, columnIndex }) => {
      try {
        const result = await client.deleteTableColumn(documentId, tableStartIndex, rowIndex, columnIndex);
        return formatSuccess(`Column ${columnIndex} deleted`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Merge Table Cells
  // ===========================================================================
  server.tool(
    'googledocs_merge_table_cells',
    `Merge cells in a table.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table in the document
  - rowIndex: Starting row index (0-based)
  - columnIndex: Starting column index (0-based)
  - rowSpan: Number of rows to merge
  - columnSpan: Number of columns to merge

Returns:
  Confirmation of the cell merge.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndex: z.number().int().min(0).describe('Starting row index (0-based)'),
      columnIndex: z.number().int().min(0).describe('Starting column index (0-based)'),
      rowSpan: z.number().int().min(1).describe('Number of rows to merge'),
      columnSpan: z.number().int().min(1).describe('Number of columns to merge'),
    },
    async ({ documentId, tableStartIndex, rowIndex, columnIndex, rowSpan, columnSpan }) => {
      try {
        const result = await client.mergeTableCells(documentId, tableStartIndex, rowIndex, columnIndex, rowSpan, columnSpan);
        return formatSuccess(`Merged ${rowSpan}x${columnSpan} cells starting at (${rowIndex}, ${columnIndex})`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Unmerge Table Cells
  // ===========================================================================
  server.tool(
    'googledocs_unmerge_table_cells',
    `Unmerge previously merged cells in a table.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table in the document
  - rowIndex: Starting row index of the merged cell (0-based)
  - columnIndex: Starting column index of the merged cell (0-based)
  - rowSpan: Number of rows in the merged cell
  - columnSpan: Number of columns in the merged cell

Returns:
  Confirmation of the cell unmerge.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndex: z.number().int().min(0).describe('Row index of merged cell (0-based)'),
      columnIndex: z.number().int().min(0).describe('Column index of merged cell (0-based)'),
      rowSpan: z.number().int().min(1).describe('Row span of merged cell'),
      columnSpan: z.number().int().min(1).describe('Column span of merged cell'),
    },
    async ({ documentId, tableStartIndex, rowIndex, columnIndex, rowSpan, columnSpan }) => {
      try {
        const result = await client.unmergeTableCells(documentId, tableStartIndex, rowIndex, columnIndex, rowSpan, columnSpan);
        return formatSuccess(`Unmerged cells at (${rowIndex}, ${columnIndex})`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Table Cell Style
  // ===========================================================================
  server.tool(
    'googledocs_update_table_cell_style',
    `Update the style of table cells.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table
  - rowIndex: Starting row index (0-based)
  - columnIndex: Starting column index (0-based)
  - rowSpan: Number of rows to style
  - columnSpan: Number of columns to style
  - tableCellStyle: TableCellStyle object
  - fields: Comma-separated list of fields to update

TableCellStyle Properties:
  - backgroundColor: { color: { rgbColor: { red, green, blue } } }
  - borderLeft/borderRight/borderTop/borderBottom: { color, width, dashStyle }
  - paddingLeft/paddingRight/paddingTop/paddingBottom: { magnitude, unit }
  - contentAlignment: "TOP" | "MIDDLE" | "BOTTOM"

Returns:
  Confirmation of the style update.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndex: z.number().int().min(0).describe('Starting row index (0-based)'),
      columnIndex: z.number().int().min(0).describe('Starting column index (0-based)'),
      rowSpan: z.number().int().min(1).default(1).describe('Number of rows'),
      columnSpan: z.number().int().min(1).default(1).describe('Number of columns'),
      tableCellStyle: z.record(z.string(), z.unknown()).describe('TableCellStyle object'),
      fields: z.string().describe('Comma-separated fields to update'),
    },
    async ({ documentId, tableStartIndex, rowIndex, columnIndex, rowSpan, columnSpan, tableCellStyle, fields }) => {
      try {
        const result = await client.updateTableCellStyle(
          documentId, tableStartIndex, rowIndex, columnIndex, rowSpan, columnSpan,
          tableCellStyle as TableCellStyle, fields
        );
        return formatSuccess('Table cell style updated', result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Table Row Style
  // ===========================================================================
  server.tool(
    'googledocs_update_table_row_style',
    `Update the style of table rows.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table
  - rowIndices: Array of row indices to update (0-based)
  - tableRowStyle: TableRowStyle object
  - fields: Comma-separated list of fields to update

TableRowStyle Properties:
  - minRowHeight: { magnitude, unit }
  - tableHeader: boolean (marks row as header, repeats on page breaks)
  - preventOverflow: boolean

Returns:
  Confirmation of the style update.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndices: z.array(z.number().int().min(0)).describe('Row indices to update (0-based)'),
      tableRowStyle: z.record(z.string(), z.unknown()).describe('TableRowStyle object'),
      fields: z.string().describe('Comma-separated fields to update'),
    },
    async ({ documentId, tableStartIndex, rowIndices, tableRowStyle, fields }) => {
      try {
        const result = await client.updateTableRowStyle(
          documentId, tableStartIndex, rowIndices, tableRowStyle as TableRowStyle, fields
        );
        return formatSuccess(`Table row style updated for rows: ${rowIndices.join(', ')}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Table Column Properties
  // ===========================================================================
  server.tool(
    'googledocs_update_table_column_properties',
    `Update properties of table columns.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table
  - columnIndices: Array of column indices to update (0-based)
  - tableColumnProperties: TableColumnProperties object
  - fields: Comma-separated list of fields to update

TableColumnProperties:
  - widthType: "EVENLY_DISTRIBUTED" | "FIXED_WIDTH"
  - width: { magnitude, unit }

Returns:
  Confirmation of the properties update.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      columnIndices: z.array(z.number().int().min(0)).describe('Column indices to update (0-based)'),
      tableColumnProperties: z.record(z.string(), z.unknown()).describe('TableColumnProperties object'),
      fields: z.string().describe('Comma-separated fields to update'),
    },
    async ({ documentId, tableStartIndex, columnIndices, tableColumnProperties, fields }) => {
      try {
        const result = await client.updateTableColumnProperties(
          documentId, tableStartIndex, columnIndices, tableColumnProperties as TableColumnProperties, fields
        );
        return formatSuccess(`Table column properties updated for columns: ${columnIndices.join(', ')}`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Pin Table Header Rows
  // ===========================================================================
  server.tool(
    'googledocs_pin_table_header_rows',
    `Pin rows at the top of a table to repeat on each page.

Args:
  - documentId: The document ID
  - tableStartIndex: The start index of the table
  - pinnedHeaderRowsCount: Number of rows to pin (0 to unpin all)

Returns:
  Confirmation of the pin operation.`,
    {
      documentId: z.string().describe('The document ID'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      pinnedHeaderRowsCount: z.number().int().min(0).describe('Number of header rows to pin'),
    },
    async ({ documentId, tableStartIndex, pinnedHeaderRowsCount }) => {
      try {
        const result = await client.pinTableHeaderRows(documentId, tableStartIndex, pinnedHeaderRowsCount);
        return formatSuccess(`Pinned ${pinnedHeaderRowsCount} header row(s)`, result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
