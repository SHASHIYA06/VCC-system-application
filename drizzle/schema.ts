import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  bigint,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const drawingDocuments = pgTable('drawing_documents', {
  id: text('id').primaryKey(),
  drawingNo: text('drawing_no'),
  title: text('title'),
  revision: text('revision'),
  sheetInfo: text('sheet_info'),
  sourceFile: text('source_file'),
  carType: text('car_type'),
  subsystem: text('subsystem'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  drawingNoIdx: index('idx_dd_drawing_no').on(t.drawingNo),
  sourceFileIdx: index('idx_dd_source_file').on(t.sourceFile),
}));

export const systems = pgTable('systems', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  description: text('description'),
}, (t) => ({
  nameUq: uniqueIndex('uq_systems_name').on(t.name),
}));

export const deviceTypes = pgTable('device_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category'),
  description: text('description'),
}, (t) => ({
  nameUq: uniqueIndex('uq_device_types_name').on(t.name),
}));

export const deviceInstances = pgTable('device_instances', {
  id: text('id').primaryKey(),
  systemId: text('system_id'),
  typeId: text('type_id'),
  documentId: text('document_id'),
  tag: text('tag'),
  name: text('name').notNull(),
  location: text('location'),
  carType: text('car_type'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  tagIdx: index('idx_di_tag').on(t.tag),
  nameIdx: index('idx_di_name').on(t.name),
  carIdx: index('idx_di_car_type').on(t.carType),
}));

export const connectors = pgTable('connectors', {
  id: text('id').primaryKey(),
  deviceId: text('device_id'),
  connectorCode: text('connector_code').notNull(),
  connectorType: text('connector_type'),
  gender: text('gender'),
  side: text('side'),
  remarks: text('remarks'),
  normCode: text('norm_code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uq: uniqueIndex('uq_connectors_device_norm').on(t.deviceId, t.normCode),
  codeIdx: index('idx_connectors_code').on(t.connectorCode),
  normIdx: index('idx_connectors_norm_code').on(t.normCode),
}));

export const connectorPins = pgTable('connector_pins', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  pinNo: text('pin_no').notNull(),
  signalName: text('signal_name'),
  wireNo: text('wire_no'),
  wireType: text('wire_type'),
  wireColor: text('wire_color'),
  endpointLabel: text('endpoint_label'),
  endpointPin: text('endpoint_pin'),
  endpointDir: text('endpoint_dir'),
  remarks: text('remarks'),
  normPinNo: text('norm_pin_no').notNull(),
  connectionKey: text('connection_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uq: uniqueIndex('uq_cp_connector_normpin').on(t.connectorId, t.normPinNo),
  wireIdx: index('idx_cp_wire_no').on(t.wireNo),
  connKeyIdx: index('idx_cp_connection_key').on(t.connectionKey),
}));

export const wires = pgTable('wires', {
  id: text('id').primaryKey(),
  wireNo: text('wire_no').notNull(),
  wireType: text('wire_type'),
  wireColor: text('wire_color'),
  cableSpec: text('cable_spec'),
  shielded: boolean('shielded'),
  voltageClass: text('voltage_class'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  wireNoUq: uniqueIndex('uq_wires_wire_no').on(t.wireNo),
}));

export const wireEndpoints = pgTable('wire_endpoints', {
  id: text('id').primaryKey(),
  wireId: text('wire_id').notNull(),
  deviceId: text('device_id'),
  connectorId: text('connector_id'),
  pinId: text('pin_id'),
  endpointRole: text('endpoint_role'),
  endpointLabel: text('endpoint_label'),
  endpointPin: text('endpoint_pin'),
  sourceFile: text('source_file'),
  sourcePage: integer('source_page'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  wireIdx: index('idx_we_wire_id').on(t.wireId),
  labelIdx: index('idx_we_endpoint_label').on(t.endpointLabel),
  sourceIdx: index('idx_we_source').on(t.sourceFile, t.sourcePage),
}));

export const drawingExtractionRaw = pgTable('drawing_extraction_raw', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  sourceFile: text('source_file'),
  sourcePage: integer('source_page'),
  drawingNo: text('drawing_no'),
  title: text('title'),
  equipment: text('equipment'),
  connectorCode: text('connector_code'),
  pinNo: text('pin_no'),
  wireNo: text('wire_no'),
  wireType: text('wire_type'),
  wireColor: text('wire_color'),
  endpointDirection: text('endpoint_direction'),
  endpointName: text('endpoint_name'),
  endpointPin: text('endpoint_pin'),
  remark: text('remark'),
  rawJson: jsonb('raw_json'),
  promotedAt: timestamp('promoted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  sourceIdx: index('idx_der_source').on(t.sourceFile, t.sourcePage),
  connPinIdx: index('idx_der_conn_pin').on(t.connectorCode, t.pinNo),
  wireIdx: index('idx_der_wire').on(t.wireNo),
}));

export const wireConnectionSeed = pgTable('wire_connection_seed', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  rawRowId: bigint('raw_row_id', { mode: 'number' }),
  sourceFile: text('source_file'),
  sourcePage: integer('source_page'),
  drawingNo: text('drawing_no'),
  sheetNo: text('sheet_no'),
  equipment: text('equipment'),
  connectorCode: text('connector_code').notNull(),
  pinNo: text('pin_no').notNull(),
  wireNo: text('wire_no'),
  wireType: text('wire_type'),
  endpointDirection: text('endpoint_direction'),
  endpointName: text('endpoint_name'),
  endpointPin: text('endpoint_pin'),
  remark: text('remark'),
  normConnectorCode: text('norm_connector_code').notNull(),
  normPinNo: text('norm_pin_no').notNull(),
  normWireNo: text('norm_wire_no'),
  connectionKey: text('connection_key').notNull().unique(),
  promotedAt: timestamp('promoted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  promotedIdx: index('idx_wcs_promoted_at').on(t.promotedAt),
  normConnPinIdx: index('idx_wcs_norm_conn_pin').on(t.normConnectorCode, t.normPinNo),
}));

export const wireConnections = pgTable('wire_connections', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  connectionKey: text('connection_key').notNull().unique(),
  connectorCode: text('connector_code').notNull(),
  pinNo: text('pin_no').notNull(),
  wireNo: text('wire_no'),
  wireType: text('wire_type'),
  endpointDirection: text('endpoint_direction'),
  endpointName: text('endpoint_name'),
  endpointPin: text('endpoint_pin'),
  equipment: text('equipment'),
  primarySourceFile: text('primary_source_file'),
  firstSourcePage: integer('first_source_page'),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  sourceCount: integer('source_count').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  connPinIdx: index('idx_wc_conn_pin').on(t.connectorCode, t.pinNo),
  wireIdx: index('idx_wc_wire_no').on(t.wireNo),
}));

export const validationIssues = pgTable('validation_issues', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
  severity: text('severity').notNull(),
  issueType: text('issue_type').notNull(),
  sourceTable: text('source_table'),
  sourceId: text('source_id'),
  message: text('message').notNull(),
  details: jsonb('details'),
  resolved: boolean('resolved').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  stateIdx: index('idx_vi_state').on(t.severity, t.resolved),
}));