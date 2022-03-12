export const convertToISODate = (filters) => {
  const value = ['createdAt', 'poDate', 'shipBy']
  const op = ['$and', '$or']
  const subOperator = ['$lte', '$gte', '$gt', '$lt'];
  const parentOperatorKey = Object.keys(filters)[0];
  filters[parentOperatorKey] = filters[parentOperatorKey].map((filter, index) => {
    const key = Object.keys(filter)[0]
    if (value.includes(key)) {
      const subOperator = Object.keys(filter[key])[0];
      if (subOperator.includes(subOperator)) {
        return { [key]: { [subOperator]: new Date(filter[key][subOperator]) } }
      }
    } else {
      if (op.includes(key)) {
        filter[key] = filter[key].map((date, index) => {
          const dateKey = Object.keys(date)[0];
          if (value.includes(dateKey)) {
            const subOperatorKey = Object.keys(date[dateKey])[0];
            if (subOperator.includes(subOperatorKey)) {

              return { [dateKey]: { [subOperatorKey]: new Date(date[dateKey][subOperatorKey]) } }
            }
          }
        })
      }
    }
    return filter
  })
  return filters
}
