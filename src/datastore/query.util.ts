import { Query } from '@google-cloud/datastore'
import { DBQuery } from '@naturalcycles/db-lib'

export function dbQueryToDatastoreQuery (dbQuery: DBQuery, emptyQuery: Query): Query {
  let q = emptyQuery

  // filter
  q = dbQuery._filters.reduce((q, f) => q.filter(f.name, f.op, f.val), q)

  // limit
  q = q.limit(dbQuery._limitValue || 0)

  // order
  q = dbQuery._orders.reduce((q, ord) => q.order(ord.name, { descending: ord.descending }), q)

  // select
  if (dbQuery._selectedFieldNames) {
    q = q.select(dbQuery._selectedFieldNames)
  }

  return q
}
