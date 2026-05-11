import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";

export const systems = pgTable('systems', {
  id: varchar('id', { length: 255 }).primaryKey(),
  code: varchar('code', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const equipment = pgTable('equipment', {
  id: varchar('id', { length: 255 }).primaryKey(),
  equipment_code: varchar('equipment_code', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 255 }),
  system_code: varchar('system_code', { length: 255 }).references(() => systems.code),
  car_type: varchar('car_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const drawings = pgTable('drawings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  drawing_no: varchar('drawing_no', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  system_code: varchar('system_code', { length: 255 }).references(() => systems.code),
  current_revision: varchar('current_revision', { length: 50 }),
  status: varchar('status', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const connectors = pgTable('connectors', {
  id: varchar('id', { length: 255 }).primaryKey(),
  connector_code: varchar('connector_code', { length: 255 }).notNull().unique(),
  equipment_code: varchar('equipment_code', { length: 255 }).references(() => equipment.equipment_code),
  type: varchar('type', { length: 100 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const wires = pgTable('wires', {
  id: varchar('id', { length: 255 }).primaryKey(),
  wire_no: varchar('wire_no', { length: 255 }).notNull().unique(),
  signal_name: varchar('signal_name', { length: 255 }),
  description: text('description'),
  type: varchar('type', { length: 100 }),
  color: varchar('color', { length: 50 }),
  cross_section_mm2: integer('cross_section_mm2'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pins = pgTable('pins', {
  id: varchar('id', { length: 255 }).primaryKey(),
  pin_number: varchar('pin_number', { length: 50 }).notNull(),
  connector_code: varchar('connector_code', { length: 255 }).references(() => connectors.connector_code),
  equipment_code: varchar('equipment_code', { length: 255 }).references(() => equipment.equipment_code),
  signal_name: varchar('signal_name', { length: 255 }),
  description: text('description'),
  wire_no: varchar('wire_no', { length: 255 }).references(() => wires.wire_no),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
