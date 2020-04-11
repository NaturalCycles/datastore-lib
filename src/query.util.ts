import { Query } from '@google-cloud/datastore'
import { DBQuery } from '@naturalcycles/db-lib'

const FNAME_MAP: Record<string, string | undefined> = {
  id: '__key__',
}

export function dbQueryToDatastoreQuery(dbQuery: Readonly<DBQuery>, emptyQuery: Query): Query {
  let q = emptyQuery

  // filter
  q = dbQuery._filters.reduce((q, f) => q.filter(f.name, f.op as any, f.val), q)

  // limit
  q = q.limit(dbQuery._limitValue || 0)

  // order
  q = dbQuery._orders.reduce((q, ord) => q.order(ord.name, { descending: ord.descending }), q)

  // select
  if (dbQuery._selectedFieldNames) {
    const fields = dbQuery._selectedFieldNames.map(f => FNAME_MAP[f] || f)

    // Datastore requires you to specify at least one column, so if empty array is passed - it'll include __key__ at least
    if (!fields.length) {
      fields.push('__key__')
    }

    q = q.select(fields)
  }

  // cursor
  if (dbQuery._startCursor) {
    q = q.start(dbQuery._startCursor)
  }

  if (dbQuery._endCursor) {
    q = q.end(dbQuery._endCursor)
  }

  return q
}
