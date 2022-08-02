let env = process.env.CUSTOM_ENV || 'test'
let isTest = env === 'test'
let subfix = isTest? '_test': ''

export const tables = {
  recordsTable: `records${subfix}`,
  savingTable: `saving${subfix}`,
  savingTableId: `${isTest? 'recFolhzu0j0V2ADk': 'reca22Hd66BFUBolR'}`,
  enumTable: `enumeration`
}