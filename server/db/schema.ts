import { mysqlTable, varchar, int, decimal, timestamp, text, boolean, index, date } from 'drizzle-orm/mysql-core'

export const ROOM_STATUS = ['ready', 'occupied', 'maintenance'] as const
export type RoomStatus = typeof ROOM_STATUS[number]

export const ASSET_STATUS = ['ready', 'in_use', 'rented', 'maintenance'] as const
export type AssetStatus = typeof ASSET_STATUS[number]

export const ASSET_CONDITION = ['good', 'fair', 'broken'] as const
export type AssetCondition = typeof ASSET_CONDITION[number]

export const USER_ROLES = ['admin'] as const
export type UserRole = typeof USER_ROLES[number]

export const PENALTY_TYPES = ['hourly', 'daily', 'fixed'] as const
export type PenaltyType = typeof PENALTY_TYPES[number]

export const PRODUCT_CATEGORIES = ['food', 'drink', 'service', 'other'] as const
export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

export const TRANSACTION_TYPES = ['MAIN', 'RENTAL'] as const
export type TransactionType = typeof TRANSACTION_TYPES[number]

export const TRANSACTION_STATUS = ['active', 'waiting_return', 'completed', 'cancelled'] as const
export type TransactionStatus = typeof TRANSACTION_STATUS[number]

export const PAYMENT_METHODS = ['cash', 'transfer', 'qris'] as const
export type PaymentMethod = typeof PAYMENT_METHODS[number]

export const DISCOUNT_TYPES = ['none', 'nominal', 'percent'] as const
export type DiscountType = typeof DISCOUNT_TYPES[number]

export const ITEM_TYPES = ['MAIN', 'RENTAL', 'PRODUCT', 'SERVICE', 'PENALTY'] as const
export type ItemType = typeof ITEM_TYPES[number]

export const STOCK_MOVEMENT_TYPES = ['IN', 'OUT', 'CORRECTION'] as const
export type StockMovementType = typeof STOCK_MOVEMENT_TYPES[number]

export const ASSET_TYPES = ['playstation', 'television', 'controller'] as const
export type AssetType = typeof ASSET_TYPES[number]

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
})

export const rooms = mysqlTable('rooms', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  playRateId: int('play_rate_id'),
  status: varchar('status', { length: 20 }).notNull().default('ready'),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
})

export const playstations = mysqlTable('playstations', {
  id: int('id').autoincrement().primaryKey(),
  roomId: int('room_id'),
  assetCode: varchar('asset_code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  series: varchar('series', { length: 50 }),
  brand: varchar('brand', { length: 50 }),
  serialNumber: varchar('serial_number', { length: 100 }),
  purchaseDate: date('purchase_date', { mode: 'string' }),
  condition: varchar('condition', { length: 20 }).notNull().default('good'),
  status: varchar('status', { length: 20 }).notNull().default('ready'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
})

export const televisions = mysqlTable('televisions', {
  id: int('id').autoincrement().primaryKey(),
  roomId: int('room_id'),
  assetCode: varchar('asset_code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  size: varchar('size', { length: 20 }),
  serialNumber: varchar('serial_number', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull().default('ready'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
})

export const controllers = mysqlTable('controllers', {
  id: int('id').autoincrement().primaryKey(),
  roomId: int('room_id'),
  assetCode: varchar('asset_code', { length: 50 }).notNull().unique(),
  controllerNumber: varchar('controller_number', { length: 50 }).notNull(),
  condition: varchar('condition', { length: 20 }).notNull().default('good'),
  status: varchar('status', { length: 20 }).notNull().default('ready'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
})

export const customers = mysqlTable('customers', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  identityNumber: varchar('identity_number', { length: 30 }),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
})

export const playRates = mysqlTable('play_rates', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  hourlyRate: decimal('hourly_rate', { precision: 12, scale: 0 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
})

export const rentalPackages = mysqlTable('rental_packages', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  durationDays: decimal('duration_days', { precision: 6, scale: 1 }).notNull().default('1'),
  price: decimal('price', { precision: 12, scale: 0 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
})

export const penaltyRates = mysqlTable('penalty_rates', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().default('hourly'),
  amount: decimal('amount', { precision: 12, scale: 0 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
})

export const products = mysqlTable('products', {
  id: int('id').autoincrement().primaryKey(),
  productCode: varchar('product_code', { length: 50 }).notNull().unique(),
  category: varchar('category', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 12, scale: 0 }).notNull().default('0'),
  stock: int('stock').notNull().default(0),
  minimumStock: int('minimum_stock').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
})

export const stockMovements = mysqlTable('stock_movements', {
  id: int('id').autoincrement().primaryKey(),
  productId: int('product_id').notNull(),
  movementType: varchar('movement_type', { length: 20 }).notNull(),
  qty: int('qty').notNull(),
  stockAfter: int('stock_after').notNull(),
  reference: varchar('reference', { length: 100 }),
  notes: text('notes'),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
}, (table) => [
  index('stock_movements_product_idx').on(table.productId),
])

export const transactions = mysqlTable('transactions', {
  id: int('id').autoincrement().primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 30 }).notNull().unique(),
  transactionType: varchar('transaction_type', { length: 10 }).notNull(),
  customerId: int('customer_id'),
  roomId: int('room_id'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  startedAt: timestamp('started_at', { mode: 'date', fsp: 0 }),
  endedAt: timestamp('ended_at', { mode: 'date', fsp: 0 }),
  durationMinutes: int('duration_minutes'),
  subtotal: decimal('subtotal', { precision: 14, scale: 0 }).notNull().default('0'),
  discountType: varchar('discount_type', { length: 10 }).notNull().default('none'),
  discountValue: decimal('discount_value', { precision: 12, scale: 0 }).notNull().default('0'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 0 }).notNull().default('0'),
  grandTotal: decimal('grand_total', { precision: 14, scale: 0 }).notNull().default('0'),
  paymentMethod: varchar('payment_method', { length: 10 }),
  amountPaid: decimal('amount_paid', { precision: 14, scale: 0 }).notNull().default('0'),
  changeAmount: decimal('change_amount', { precision: 14, scale: 0 }).notNull().default('0'),
  notes: text('notes'),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', fsp: 0 }).notNull().defaultNow().onUpdateNow(),
}, (table) => [
  index('transactions_type_status_idx').on(table.transactionType, table.status),
  index('transactions_created_idx').on(table.createdAt),
])

export const transactionDetails = mysqlTable('transaction_details', {
  id: int('id').autoincrement().primaryKey(),
  transactionId: int('transaction_id').notNull(),
  itemType: varchar('item_type', { length: 10 }).notNull(),
  referenceId: int('reference_id'),
  itemName: varchar('item_name', { length: 150 }).notNull(),
  qty: decimal('qty', { precision: 10, scale: 2 }).notNull().default('0'),
  unit: varchar('unit', { length: 20 }),
  unitPrice: decimal('unit_price', { precision: 14, scale: 0 }).notNull().default('0'),
  subtotal: decimal('subtotal', { precision: 14, scale: 0 }).notNull().default('0'),
  notes: text('notes'),
}, (table) => [
  index('transaction_details_txn_idx').on(table.transactionId),
])

export const rentals = mysqlTable('rentals', {
  id: int('id').autoincrement().primaryKey(),
  transactionId: int('transaction_id').notNull(),
  playstationId: int('playstation_id').notNull(),
  controllerId: varchar('controller_id', { length: 255 }),
  packageId: int('package_id'),
  rentalDate: timestamp('rental_date', { mode: 'date', fsp: 0 }).notNull(),
  dueDate: timestamp('due_date', { mode: 'date', fsp: 0 }).notNull(),
  returnDate: timestamp('return_date', { mode: 'date', fsp: 0 }),
  lateHours: decimal('late_hours', { precision: 10, scale: 2 }),
  penaltyAmount: decimal('penalty_amount', { precision: 14, scale: 0 }).notNull().default('0'),
}, (table) => [
  index('rentals_txn_idx').on(table.transactionId),
])

export const assetLogs = mysqlTable('asset_logs', {
  id: int('id').autoincrement().primaryKey(),
  assetType: varchar('asset_type', { length: 20 }).notNull(),
  assetId: int('asset_id').notNull(),
  activity: varchar('activity', { length: 50 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date', fsp: 0 }).notNull().defaultNow(),
}, (table) => [
  index('asset_logs_asset_idx').on(table.assetType, table.assetId),
])

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Room = typeof rooms.$inferSelect
export type NewRoom = typeof rooms.$inferInsert
export type Playstation = typeof playstations.$inferSelect
export type NewPlaystation = typeof playstations.$inferInsert
export type Television = typeof televisions.$inferSelect
export type NewTelevision = typeof televisions.$inferInsert
export type Controller = typeof controllers.$inferSelect
export type NewController = typeof controllers.$inferInsert
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type PlayRate = typeof playRates.$inferSelect
export type NewPlayRate = typeof playRates.$inferInsert
export type RentalPackage = typeof rentalPackages.$inferSelect
export type NewRentalPackage = typeof rentalPackages.$inferInsert
export type PenaltyRate = typeof penaltyRates.$inferSelect
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type StockMovement = typeof stockMovements.$inferSelect
export type NewStockMovement = typeof stockMovements.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type TransactionDetail = typeof transactionDetails.$inferSelect
export type NewTransactionDetail = typeof transactionDetails.$inferInsert
export type Rental = typeof rentals.$inferSelect
export type NewRental = typeof rentals.$inferInsert
export type AssetLog = typeof assetLogs.$inferSelect
export type NewAssetLog = typeof assetLogs.$inferInsert
