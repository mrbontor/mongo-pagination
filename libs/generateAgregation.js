const { ValidateAgregation } = require('./validation');
/**
 *
 * @param {Object} Query
 * @param {Object} Query.collectionName
 * @param {Object} Query.uniqueId
 * @param {Array} Query.projection
 * @returns
 */
const pipeline = (Query) => {
    const { collectionName, uniqueId, projection } = Query;

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
 * @
 * @param {Array} aggregation
 * @returns
 */
const generatePipeline = (aggregation) => {
    ValidateAgregation(aggregation);

    const results = aggregation.map((query) => pipeline(query));
    return results.reduce((curr, prev) => curr.concat(prev), []);
};

module.exports = {
    /**
     *
     * @param {Array} aggregation
     * @returns
     */
    QueryAgregation: (aggregation) => {
        return generatePipeline(aggregation);
    }
};
