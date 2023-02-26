const { ValidateAgregation } = require('./validation');

/**
 * Setup mongo Pipeline Agregation
 * @param {Object} query
 * @param {string} query.collectionName
 * @param {string} query.uniqueId
 * @param {string} query.subSearch
 * @param {Array<string>} query.fieldToSearch
 * @returns
 */
const pipeline = (query) => {
    const { collectionName, uniqueId, subSearch, fieldToSearch } = query;

    const queryLookup = [
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
    if (subSearch && fieldToSearch && fieldToSearch.length > 0) {
        const newearch = fieldToSearch.map((el) => {
            const key = `${uniqueId}.${el}`;
            return {
                [key]: {
                    $regex: subSearch,
                    $options: 'i'
                }
            };
        });
        queryLookup.push({
            $match: {
                $or: newearch
            }
        });
    }

    return queryLookup;
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
