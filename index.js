const { GraphQLError, Kind } = require('graphql')

/**
 * Creates a validator for the number of queries per request and root selectors per query.
 * @param {Number} maxCount - The maximum allowed query operations in a GraphQL document.
 * @param {Number} maxSelectionCount - The maximum allowed root operations in a single GraphQL query.
 * @param {Function} [callback] - Called each time validation runs. Receives an Object which is a map of the depths for each operation.
 * @returns {Function} The validator function for GraphQL validation phase.
 */
const queryCountLimit = (maxQueryCount, maxSelectionCount = null) => (
  validationContext
) => {
  const { definitions } = validationContext.getDocument()
  const queries = getQueriesAndMutations(definitions)

  if (Object.keys(queries).length > maxQueryCount) {
    throw new GraphQLError(
      `The request exceeds the maximum number of query: ${maxQueryCount}`
    )
  }

  for (const name in queries) {
    if (
      queries[name].selectionSet.selections.length >
      (maxSelectionCount || maxQueryCount)
    ) {
      throw new GraphQLError(
        `'${name} exceeds the maximum number of root selections: ${maxQueryCount}`
      )
    }
  }
  return validationContext
}

module.exports = queryCountLimit

// this will actually get both queries and mutations. we can basically treat those the same
function getQueriesAndMutations(definitions) {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      map[definition.name ? definition.name.value : ''] = definition
    }
    return map
  }, {})
}
