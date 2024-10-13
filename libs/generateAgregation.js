const { ValidateAggregation } = require('./validation');
const { BuildSubQueryAndProjection, BuildSearchSubQuery } = require('./queryBuilder');

/**
 * Setup mongo Pipeline Agregation
 * @param {Object} query
 * @param {string} query.collectionName
 * @param {string} query.uniqueId
 * @param {string} query.subSearch
 * @param {Array<string>} query.fieldToSearch
 * @returns
 */
const pipeline = ({ collectionName, uniqueId, subSearch, fieldToSearch, projection = {} }) => {
    const baseQuery = BuildSubQueryAndProjection({ collectionName, uniqueId, projection });

    if (subSearch && fieldToSearch?.length) {
        const querySubSearch = BuildSearchSubQuery(uniqueId, subSearch, fieldToSearch);
        baseQuery.push(querySubSearch);
    }
    return baseQuery;
};

/**
 * Generate mongo Pipeline Aggregation
 * @param {Array<{collectionName: string, uniqueId: string}>} aggregation
 * @returns {Array<Object>}
 */
const generateQueryAggregation = (aggregation) => {
    ValidateAggregation(aggregation);
    if (aggregation?.length) {
        return aggregation.flatMap(pipeline);
    }
};

module.exports = {
    GenerateQueryAggregation: generateQueryAggregation
};
