const Config = require('../configs');
const { ValidateMongoQuery } = require('./validation');
const { QueryAgregation } = require('./generateAgregation');
const { BuildQueryMongoPagination, GetSorting } = require('./queryBuilder');

/**
 * Running query without functionality ofPagination
 * @param {Object} mongo
 * @Object mongo.client = mongo connection
 * @Object mongo.collection = collection name
 * @param {Array} queryAgregate
 * @returns
 */
const runQuery = async (mongo, query) => {
    const { client, collection } = mongo;

    const queryAgregate = [
        {
            $facet: {
                data: query,
                count: [
                    {
                        $group: {
                            _id: 1,
                            totalRecord: { $sum: 1 }
                        }
                    }
                ]
            }
        }
    ];

    const result = await client.collection(collection).aggregate(queryAgregate).toArray();
    return result;
};

module.exports = {
    /**
     *
     * @param {Object} payload
     * @param {Array} fieldToSearch
     * @param {Object} projection
     * @param {Array} aggregate
     * @returns
     */
    buildPagination: async (mongoConfig, payload = {}, fieldToSearch = [], projection = null, aggregate = []) => {
        try {
            ValidateMongoQuery(mongoConfig);

            const queryAgregate = QueryAgregation(aggregate);
            const queryMongo = BuildQueryMongoPagination(payload, fieldToSearch, projection, queryAgregate);
            const pageSize = parseInt(payload.size) || Config.default.size;
            const pageNumber = parseInt(payload.page) || Config.default.page;

            const results = await runQuery(mongoConfig, queryMongo);

            return {
                sort: GetSorting(payload),
                page: pageNumber,
                size: pageSize,
                totalRecord: results[0].data.length > 0 ? results[0].count[0].totalRecord : 0,
                totalPage: results[0].count.length > 0 ? Math.ceil(results[0].count[0].totalRecord / pageSize) : 0,
                data: results[0].data
            };
        } catch (error) {
            throw error;
        }
    }
};
