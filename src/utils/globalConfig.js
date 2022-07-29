let env = process.env.CUSTOM_ENV || 'test'
let subfix = env === 'test'? '_test': ''

export const tables = {
  recordsTable: `records${subfix}`,
  
}