let env = process.env.CUSTOM_ENV || 'test'
let isTest = env === 'test'
let subfix = isTest? '_test': ''

const table = {
  recordsTable: `records${subfix}`,
  savingTable: `saving${subfix}`,
  savingTableId: `${isTest? 'recFolhzu0j0V2ADk': 'reca22Hd66BFUBolR'}`,
  enumTable: `enumeration`
}

export default table