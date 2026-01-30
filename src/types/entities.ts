/**
 * Google Docs Entity Types
 *
 * Type definitions for Google Docs API entities and request types.
 */

// =============================================================================
// Document Types
// =============================================================================

/**
 * Google Docs Document resource
 */
export interface Document {
  /** Unique document identifier */
  documentId: string;
  /** Document title */
  title: string;
  /** Document body content */
  body?: Body;
  /** Revision ID for the document */
  revisionId?: string;
  /** Document headers keyed by header ID */
  headers?: Record<string, Header>;
  /** Document footers keyed by footer ID */
  footers?: Record<string, Footer>;
  /** Document footnotes keyed by footnote ID */
  footnotes?: Record<string, Footnote>;
  /** Document-wide styling */
  documentStyle?: DocumentStyle;
  /** Named styles for paragraphs and text */
  namedStyles?: NamedStyles;
  /** Lists in the document keyed by list ID */
  lists?: Record<string, List>;
  /** Named ranges in the document keyed by name */
  namedRanges?: Record<string, NamedRange>;
  /** Inline objects (images, etc.) keyed by object ID */
  inlineObjects?: Record<string, InlineObject>;
  /** Positioned objects keyed by object ID */
  positionedObjects?: Record<string, PositionedObject>;
  /** Suggestions view mode */
  suggestionsViewMode?: SuggestionsViewMode;
  /** Document tabs */
  tabs?: Tab[];
}

export type SuggestionsViewMode =
  | 'DEFAULT_FOR_CURRENT_ACCESS'
  | 'SUGGESTIONS_INLINE'
  | 'PREVIEW_SUGGESTIONS_ACCEPTED'
  | 'PREVIEW_WITHOUT_SUGGESTIONS';

// =============================================================================
// Body Content Types
// =============================================================================

export interface Body {
  content: StructuralElement[];
}

export interface StructuralElement {
  startIndex?: number;
  endIndex?: number;
  paragraph?: Paragraph;
  sectionBreak?: SectionBreak;
  table?: Table;
  tableOfContents?: TableOfContents;
}

export interface Paragraph {
  elements: ParagraphElement[];
  paragraphStyle?: ParagraphStyle;
  bullet?: Bullet;
}

export interface ParagraphElement {
  startIndex?: number;
  endIndex?: number;
  textRun?: TextRun;
  inlineObjectElement?: InlineObjectElement;
  pageBreak?: PageBreak;
  horizontalRule?: HorizontalRule;
  footnoteReference?: FootnoteReference;
  person?: Person;
}

export interface TextRun {
  content: string;
  textStyle?: TextStyle;
}

export interface InlineObjectElement {
  inlineObjectId: string;
  textStyle?: TextStyle;
}

export interface PageBreak {
  textStyle?: TextStyle;
}

export interface HorizontalRule {
  textStyle?: TextStyle;
}

export interface FootnoteReference {
  footnoteId: string;
  footnoteNumber?: string;
  textStyle?: TextStyle;
}

export interface Person {
  personId: string;
  personProperties?: PersonProperties;
  textStyle?: TextStyle;
}

export interface PersonProperties {
  name?: string;
  email?: string;
}

// =============================================================================
// Style Types
// =============================================================================

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  smallCaps?: boolean;
  backgroundColor?: OptionalColor;
  foregroundColor?: OptionalColor;
  fontSize?: Dimension;
  weightedFontFamily?: WeightedFontFamily;
  baselineOffset?: BaselineOffset;
  link?: Link;
}

export interface ParagraphStyle {
  headingId?: string;
  namedStyleType?: NamedStyleType;
  alignment?: Alignment;
  lineSpacing?: number;
  direction?: ContentDirection;
  spacingMode?: SpacingMode;
  spaceAbove?: Dimension;
  spaceBelow?: Dimension;
  borderBetween?: ParagraphBorder;
  borderTop?: ParagraphBorder;
  borderBottom?: ParagraphBorder;
  borderLeft?: ParagraphBorder;
  borderRight?: ParagraphBorder;
  indentFirstLine?: Dimension;
  indentStart?: Dimension;
  indentEnd?: Dimension;
  tabStops?: TabStop[];
  keepLinesTogether?: boolean;
  keepWithNext?: boolean;
  avoidWidowAndOrphan?: boolean;
  shading?: Shading;
  pageBreakBefore?: boolean;
}

export interface DocumentStyle {
  background?: Background;
  defaultHeaderId?: string;
  defaultFooterId?: string;
  evenPageHeaderId?: string;
  evenPageFooterId?: string;
  firstPageHeaderId?: string;
  firstPageFooterId?: string;
  useFirstPageHeaderFooter?: boolean;
  useEvenPageHeaderFooter?: boolean;
  pageNumberStart?: number;
  marginTop?: Dimension;
  marginBottom?: Dimension;
  marginRight?: Dimension;
  marginLeft?: Dimension;
  pageSize?: Size;
  marginHeader?: Dimension;
  marginFooter?: Dimension;
  useCustomHeaderFooterMargins?: boolean;
  flipPageOrientation?: boolean;
}

export type NamedStyleType =
  | 'NAMED_STYLE_TYPE_UNSPECIFIED'
  | 'NORMAL_TEXT'
  | 'TITLE'
  | 'SUBTITLE'
  | 'HEADING_1'
  | 'HEADING_2'
  | 'HEADING_3'
  | 'HEADING_4'
  | 'HEADING_5'
  | 'HEADING_6';

export type Alignment = 'ALIGNMENT_UNSPECIFIED' | 'START' | 'CENTER' | 'END' | 'JUSTIFIED';

export type ContentDirection = 'CONTENT_DIRECTION_UNSPECIFIED' | 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT';

export type SpacingMode = 'SPACING_MODE_UNSPECIFIED' | 'NEVER_COLLAPSE' | 'COLLAPSE_LISTS';

export type BaselineOffset = 'BASELINE_OFFSET_UNSPECIFIED' | 'NONE' | 'SUPERSCRIPT' | 'SUBSCRIPT';

// =============================================================================
// Table Types
// =============================================================================

export interface Table {
  rows: number;
  columns: number;
  tableRows: TableRow[];
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
  tableStyle?: TableStyle;
}

export interface TableRow {
  startIndex?: number;
  endIndex?: number;
  tableCells: TableCell[];
  tableRowStyle?: TableRowStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

export interface TableCell {
  startIndex?: number;
  endIndex?: number;
  content: StructuralElement[];
  tableCellStyle?: TableCellStyle;
  suggestedInsertionIds?: string[];
  suggestedDeletionIds?: string[];
}

export interface TableStyle {
  tableColumnProperties?: TableColumnProperties[];
}

export interface TableRowStyle {
  minRowHeight?: Dimension;
  tableHeader?: boolean;
  preventOverflow?: boolean;
}

export interface TableCellStyle {
  rowSpan?: number;
  columnSpan?: number;
  backgroundColor?: OptionalColor;
  borderLeft?: TableCellBorder;
  borderRight?: TableCellBorder;
  borderTop?: TableCellBorder;
  borderBottom?: TableCellBorder;
  paddingLeft?: Dimension;
  paddingRight?: Dimension;
  paddingTop?: Dimension;
  paddingBottom?: Dimension;
  contentAlignment?: ContentAlignment;
}

export interface TableColumnProperties {
  widthType?: WidthType;
  width?: Dimension;
}

export interface TableCellBorder {
  color?: OptionalColor;
  width?: Dimension;
  dashStyle?: DashStyle;
}

export type ContentAlignment =
  | 'CONTENT_ALIGNMENT_UNSPECIFIED'
  | 'CONTENT_ALIGNMENT_UNSUPPORTED'
  | 'TOP'
  | 'MIDDLE'
  | 'BOTTOM';

export type WidthType = 'WIDTH_TYPE_UNSPECIFIED' | 'EVENLY_DISTRIBUTED' | 'FIXED_WIDTH';

export type DashStyle =
  | 'DASH_STYLE_UNSPECIFIED'
  | 'SOLID'
  | 'DOT'
  | 'DASH'
  | 'DASH_DOT'
  | 'LONG_DASH'
  | 'LONG_DASH_DOT';

// =============================================================================
// Header/Footer/Footnote Types
// =============================================================================

export interface Header {
  headerId: string;
  content: StructuralElement[];
}

export interface Footer {
  footerId: string;
  content: StructuralElement[];
}

export interface Footnote {
  footnoteId: string;
  content: StructuralElement[];
}

// =============================================================================
// Section Types
// =============================================================================

export interface SectionBreak {
  sectionStyle?: SectionStyle;
}

export interface SectionStyle {
  columnProperties?: SectionColumnProperties[];
  columnSeparatorStyle?: ColumnSeparatorStyle;
  contentDirection?: ContentDirection;
  marginTop?: Dimension;
  marginBottom?: Dimension;
  marginRight?: Dimension;
  marginLeft?: Dimension;
  marginHeader?: Dimension;
  marginFooter?: Dimension;
  sectionType?: SectionType;
  defaultHeaderId?: string;
  defaultFooterId?: string;
  firstPageHeaderId?: string;
  firstPageFooterId?: string;
  evenPageHeaderId?: string;
  evenPageFooterId?: string;
  useFirstPageHeaderFooter?: boolean;
  pageNumberStart?: number;
  flipPageOrientation?: boolean;
}

export interface SectionColumnProperties {
  width?: Dimension;
  paddingEnd?: Dimension;
}

export type ColumnSeparatorStyle =
  | 'COLUMN_SEPARATOR_STYLE_UNSPECIFIED'
  | 'NONE'
  | 'BETWEEN_EACH_COLUMN';

export type SectionType =
  | 'SECTION_TYPE_UNSPECIFIED'
  | 'CONTINUOUS'
  | 'NEXT_PAGE';

// =============================================================================
// List/Bullet Types
// =============================================================================

export interface List {
  listProperties: ListProperties;
  suggestedListPropertiesChanges?: Record<string, unknown>;
  suggestedInsertionId?: string;
  suggestedDeletionIds?: string[];
}

export interface ListProperties {
  nestingLevels: NestingLevel[];
}

export interface NestingLevel {
  bulletAlignment?: BulletAlignment;
  glyphType?: GlyphType;
  glyphFormat?: string;
  indentFirstLine?: Dimension;
  indentStart?: Dimension;
  textStyle?: TextStyle;
  startNumber?: number;
}

export interface Bullet {
  listId: string;
  nestingLevel?: number;
  textStyle?: TextStyle;
}

export type BulletAlignment = 'BULLET_ALIGNMENT_UNSPECIFIED' | 'START' | 'CENTER' | 'END';

export type GlyphType =
  | 'GLYPH_TYPE_UNSPECIFIED'
  | 'NONE'
  | 'DECIMAL'
  | 'ZERO_DECIMAL'
  | 'UPPER_ALPHA'
  | 'ALPHA'
  | 'UPPER_ROMAN'
  | 'ROMAN';

// =============================================================================
// Named Range Types
// =============================================================================

export interface NamedRange {
  namedRangeId: string;
  name: string;
  ranges: Range[];
}

export interface Range {
  segmentId?: string;
  startIndex?: number;
  endIndex?: number;
  tabId?: string;
}

// =============================================================================
// Object Types
// =============================================================================

export interface InlineObject {
  objectId: string;
  inlineObjectProperties?: InlineObjectProperties;
  suggestedInsertionId?: string;
  suggestedDeletionIds?: string[];
}

export interface InlineObjectProperties {
  embeddedObject?: EmbeddedObject;
}

export interface PositionedObject {
  objectId: string;
  positionedObjectProperties?: PositionedObjectProperties;
  suggestedInsertionId?: string;
  suggestedDeletionIds?: string[];
}

export interface PositionedObjectProperties {
  positioning?: PositionedObjectPositioning;
  embeddedObject?: EmbeddedObject;
}

export interface PositionedObjectPositioning {
  layout?: PositionedObjectLayout;
  leftOffset?: Dimension;
  topOffset?: Dimension;
}

export type PositionedObjectLayout =
  | 'POSITIONED_OBJECT_LAYOUT_UNSPECIFIED'
  | 'WRAP_TEXT'
  | 'BREAK_LEFT'
  | 'BREAK_RIGHT'
  | 'BREAK_LEFT_RIGHT'
  | 'IN_FRONT_OF_TEXT'
  | 'BEHIND_TEXT';

export interface EmbeddedObject {
  embeddedObjectBorder?: EmbeddedObjectBorder;
  size?: Size;
  title?: string;
  description?: string;
  imageProperties?: ImageProperties;
  embeddedDrawingProperties?: EmbeddedDrawingProperties;
  linkedContentReference?: LinkedContentReference;
  marginTop?: Dimension;
  marginBottom?: Dimension;
  marginRight?: Dimension;
  marginLeft?: Dimension;
}

export interface EmbeddedObjectBorder {
  color?: OptionalColor;
  width?: Dimension;
  dashStyle?: DashStyle;
  propertyState?: PropertyState;
}

export interface ImageProperties {
  contentUri?: string;
  sourceUri?: string;
  brightness?: number;
  contrast?: number;
  transparency?: number;
  cropProperties?: CropProperties;
  angle?: number;
}

export interface CropProperties {
  offsetLeft?: number;
  offsetRight?: number;
  offsetTop?: number;
  offsetBottom?: number;
  angle?: number;
}

export interface EmbeddedDrawingProperties {
  // Drawing properties
}

export interface LinkedContentReference {
  sheetsChartReference?: SheetsChartReference;
}

export interface SheetsChartReference {
  spreadsheetId: string;
  chartId: number;
}

export type PropertyState = 'RENDERED' | 'NOT_RENDERED';

// =============================================================================
// Tab Types
// =============================================================================

export interface Tab {
  tabProperties?: TabProperties;
  documentTab?: DocumentTab;
  childTabs?: Tab[];
}

export interface TabProperties {
  tabId?: string;
  title?: string;
  index?: number;
  nestingLevel?: number;
}

export interface DocumentTab {
  body?: Body;
  headers?: Record<string, Header>;
  footers?: Record<string, Footer>;
  footnotes?: Record<string, Footnote>;
  documentStyle?: DocumentStyle;
  namedStyles?: NamedStyles;
  lists?: Record<string, List>;
  namedRanges?: Record<string, NamedRange>;
  inlineObjects?: Record<string, InlineObject>;
  positionedObjects?: Record<string, PositionedObject>;
}

// =============================================================================
// Named Styles Types
// =============================================================================

export interface NamedStyles {
  styles: NamedStyle[];
}

export interface NamedStyle {
  namedStyleType: NamedStyleType;
  textStyle?: TextStyle;
  paragraphStyle?: ParagraphStyle;
}

// =============================================================================
// TOC Types
// =============================================================================

export interface TableOfContents {
  content: StructuralElement[];
}

// =============================================================================
// Common Types
// =============================================================================

export interface Dimension {
  magnitude: number;
  unit: Unit;
}

export type Unit = 'UNIT_UNSPECIFIED' | 'PT';

export interface Size {
  width?: Dimension;
  height?: Dimension;
}

export interface OptionalColor {
  color?: Color;
}

export interface Color {
  rgbColor?: RgbColor;
}

export interface RgbColor {
  red?: number;
  green?: number;
  blue?: number;
}

export interface WeightedFontFamily {
  fontFamily: string;
  weight?: number;
}

export interface Link {
  url?: string;
  bookmarkId?: string;
  headingId?: string;
  tabId?: string;
}

export interface Background {
  color?: OptionalColor;
}

export interface Shading {
  backgroundColor?: OptionalColor;
}

export interface ParagraphBorder {
  color?: OptionalColor;
  width?: Dimension;
  padding?: Dimension;
  dashStyle?: DashStyle;
}

export interface TabStop {
  offset?: Dimension;
  alignment?: TabStopAlignment;
}

export type TabStopAlignment = 'TAB_STOP_ALIGNMENT_UNSPECIFIED' | 'START' | 'CENTER' | 'END';

// =============================================================================
// Request Types for batchUpdate
// =============================================================================

export interface BatchUpdateRequest {
  requests: Request[];
  writeControl?: WriteControl;
}

export interface WriteControl {
  requiredRevisionId?: string;
  targetRevisionId?: string;
}

export interface Request {
  replaceAllText?: ReplaceAllTextRequest;
  insertText?: InsertTextRequest;
  updateTextStyle?: UpdateTextStyleRequest;
  createParagraphBullets?: CreateParagraphBulletsRequest;
  deleteParagraphBullets?: DeleteParagraphBulletsRequest;
  createNamedRange?: CreateNamedRangeRequest;
  deleteNamedRange?: DeleteNamedRangeRequest;
  updateParagraphStyle?: UpdateParagraphStyleRequest;
  deleteContentRange?: DeleteContentRangeRequest;
  insertInlineImage?: InsertInlineImageRequest;
  insertTable?: InsertTableRequest;
  insertTableRow?: InsertTableRowRequest;
  insertTableColumn?: InsertTableColumnRequest;
  deleteTableRow?: DeleteTableRowRequest;
  deleteTableColumn?: DeleteTableColumnRequest;
  insertPageBreak?: InsertPageBreakRequest;
  deletePositionedObject?: DeletePositionedObjectRequest;
  updateTableColumnProperties?: UpdateTableColumnPropertiesRequest;
  updateTableCellStyle?: UpdateTableCellStyleRequest;
  updateTableRowStyle?: UpdateTableRowStyleRequest;
  replaceImage?: ReplaceImageRequest;
  updateDocumentStyle?: UpdateDocumentStyleRequest;
  mergeTableCells?: MergeTableCellsRequest;
  unmergeTableCells?: UnmergeTableCellsRequest;
  createHeader?: CreateHeaderRequest;
  createFooter?: CreateFooterRequest;
  createFootnote?: CreateFootnoteRequest;
  replaceNamedRangeContent?: ReplaceNamedRangeContentRequest;
  updateSectionStyle?: UpdateSectionStyleRequest;
  insertSectionBreak?: InsertSectionBreakRequest;
  deleteHeader?: DeleteHeaderRequest;
  deleteFooter?: DeleteFooterRequest;
  pinTableHeaderRows?: PinTableHeaderRowsRequest;
}

// =============================================================================
// Individual Request Types
// =============================================================================

export interface ReplaceAllTextRequest {
  containsText: SubstringMatchCriteria;
  replaceText: string;
  tabsCriteria?: TabsCriteria;
}

export interface SubstringMatchCriteria {
  text: string;
  matchCase?: boolean;
}

export interface TabsCriteria {
  tabIds?: string[];
}

export interface InsertTextRequest {
  text: string;
  location: Location;
  endOfSegmentLocation?: EndOfSegmentLocation;
}

export interface Location {
  segmentId?: string;
  index: number;
  tabId?: string;
}

export interface EndOfSegmentLocation {
  segmentId?: string;
  tabId?: string;
}

export interface UpdateTextStyleRequest {
  range: Range;
  textStyle: TextStyle;
  fields: string;
}

export interface CreateParagraphBulletsRequest {
  range: Range;
  bulletPreset?: BulletGlyphPreset;
}

export type BulletGlyphPreset =
  | 'BULLET_GLYPH_PRESET_UNSPECIFIED'
  | 'BULLET_DISC_CIRCLE_SQUARE'
  | 'BULLET_DIAMONDX_ARROW3D_SQUARE'
  | 'BULLET_CHECKBOX'
  | 'BULLET_ARROW_DIAMOND_DISC'
  | 'BULLET_STAR_CIRCLE_SQUARE'
  | 'BULLET_ARROW3D_CIRCLE_SQUARE'
  | 'BULLET_LEFTTRIANGLE_DIAMOND_DISC'
  | 'NUMBERED_DECIMAL_ALPHA_ROMAN'
  | 'NUMBERED_DECIMAL_ALPHA_ROMAN_PARENS'
  | 'NUMBERED_DECIMAL_NESTED'
  | 'NUMBERED_UPPERALPHA_ALPHA_ROMAN'
  | 'NUMBERED_UPPERROMAN_UPPERALPHA_DECIMAL'
  | 'NUMBERED_ZERODECIMAL_ALPHA_ROMAN';

export interface DeleteParagraphBulletsRequest {
  range: Range;
}

export interface CreateNamedRangeRequest {
  name: string;
  range: Range;
}

export interface DeleteNamedRangeRequest {
  namedRangeId?: string;
  name?: string;
  tabsCriteria?: TabsCriteria;
}

export interface UpdateParagraphStyleRequest {
  range: Range;
  paragraphStyle: ParagraphStyle;
  fields: string;
}

export interface DeleteContentRangeRequest {
  range: Range;
}

export interface InsertInlineImageRequest {
  uri: string;
  location: Location;
  endOfSegmentLocation?: EndOfSegmentLocation;
  objectSize?: Size;
}

export interface InsertTableRequest {
  rows: number;
  columns: number;
  location: Location;
  endOfSegmentLocation?: EndOfSegmentLocation;
}

export interface InsertTableRowRequest {
  tableCellLocation: TableCellLocation;
  insertBelow: boolean;
}

export interface TableCellLocation {
  tableStartLocation: Location;
  rowIndex: number;
  columnIndex: number;
}

export interface InsertTableColumnRequest {
  tableCellLocation: TableCellLocation;
  insertRight: boolean;
}

export interface DeleteTableRowRequest {
  tableCellLocation: TableCellLocation;
}

export interface DeleteTableColumnRequest {
  tableCellLocation: TableCellLocation;
}

export interface InsertPageBreakRequest {
  location: Location;
  endOfSegmentLocation?: EndOfSegmentLocation;
}

export interface DeletePositionedObjectRequest {
  objectId: string;
  tabId?: string;
}

export interface UpdateTableColumnPropertiesRequest {
  tableStartLocation: Location;
  columnIndices: number[];
  tableColumnProperties: TableColumnProperties;
  fields: string;
}

export interface UpdateTableCellStyleRequest {
  tableRange?: TableRange;
  tableCellStyle: TableCellStyle;
  fields: string;
}

export interface TableRange {
  tableCellLocation: TableCellLocation;
  rowSpan: number;
  columnSpan: number;
}

export interface UpdateTableRowStyleRequest {
  tableStartLocation: Location;
  rowIndices: number[];
  tableRowStyle: TableRowStyle;
  fields: string;
}

export interface ReplaceImageRequest {
  imageObjectId: string;
  uri: string;
  imageReplaceMethod?: ImageReplaceMethod;
  tabId?: string;
}

export type ImageReplaceMethod = 'IMAGE_REPLACE_METHOD_UNSPECIFIED' | 'CENTER_CROP';

export interface UpdateDocumentStyleRequest {
  documentStyle: DocumentStyle;
  fields: string;
  tabId?: string;
}

export interface MergeTableCellsRequest {
  tableRange: TableRange;
}

export interface UnmergeTableCellsRequest {
  tableRange: TableRange;
}

export interface CreateHeaderRequest {
  type: HeaderFooterType;
  sectionBreakLocation?: Location;
}

export type HeaderFooterType =
  | 'HEADER_FOOTER_TYPE_UNSPECIFIED'
  | 'DEFAULT';

export interface CreateFooterRequest {
  type: HeaderFooterType;
  sectionBreakLocation?: Location;
}

export interface CreateFootnoteRequest {
  location: Location;
  endOfSegmentLocation?: EndOfSegmentLocation;
}

export interface ReplaceNamedRangeContentRequest {
  namedRangeId?: string;
  namedRangeName?: string;
  text?: string;
  tabsCriteria?: TabsCriteria;
}

export interface UpdateSectionStyleRequest {
  range: Range;
  sectionStyle: SectionStyle;
  fields: string;
}

export interface InsertSectionBreakRequest {
  location: Location;
  endOfSegmentLocation?: EndOfSegmentLocation;
  sectionType: SectionType;
}

export interface DeleteHeaderRequest {
  headerId: string;
  tabId?: string;
}

export interface DeleteFooterRequest {
  footerId: string;
  tabId?: string;
}

export interface PinTableHeaderRowsRequest {
  tableStartLocation: Location;
  pinnedHeaderRowsCount: number;
}

// =============================================================================
// Response Types
// =============================================================================

export interface BatchUpdateResponse {
  documentId: string;
  replies: Reply[];
  writeControl?: WriteControl;
}

export interface Reply {
  replaceAllText?: ReplaceAllTextResponse;
  createNamedRange?: CreateNamedRangeResponse;
  insertInlineImage?: InsertInlineImageResponse;
  insertInlineSheetsChart?: InsertInlineSheetsChartResponse;
  createHeader?: CreateHeaderResponse;
  createFooter?: CreateFooterResponse;
  createFootnote?: CreateFootnoteResponse;
}

export interface ReplaceAllTextResponse {
  occurrencesChanged: number;
}

export interface CreateNamedRangeResponse {
  namedRangeId: string;
}

export interface InsertInlineImageResponse {
  objectId: string;
}

export interface InsertInlineSheetsChartResponse {
  objectId: string;
}

export interface CreateHeaderResponse {
  headerId: string;
}

export interface CreateFooterResponse {
  footerId: string;
}

export interface CreateFootnoteResponse {
  footnoteId: string;
}
