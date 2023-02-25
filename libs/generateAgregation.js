const { ValidateAgregation } = require('./validation');

/**
 * Setup mongo Pipeline Agregation
 * @param {Object} query
 * @param {string} query.collectionName
 * @param {string} query.uniqueId
 * @returns
 */
const pipeline = (query) => {
    const { collectionName, uniqueId, projection } = query;

    /**
     * TODO
     * - custom on `pipeline` (join stage), it doesnt always have to do _query_ `$match` instead using `foreignField`
     */
    return [
        {
            $lookup: {
                from: collectionName,
                let: { [uniqueId]: { $toObjectId: `$${uniqueId}` } },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', `$$${uniqueId}`] } } }],
                as: `${uniqueId}`
            }
        },
        {
            $unwind: {
                path: `$${uniqueId}`,
                preserveNullAndEmptyArrays: true
            }
        }
    ];
};

/**
 * Generate mongo Pipeline Agregation
 * @param {Array<{collectionName: string, uniqueId:string}>} aggregation
 * @returns
 */
const generateQueryAgregation = (aggregation) => {
    ValidateAgregation(aggregation);

    const results = aggregation.map((query) => pipeline(query));
    return results.reduce((curr, prev) => curr.concat(prev), []);
};

module.exports = {
    GenerateQueryAgregation: generateQueryAgregation
};
