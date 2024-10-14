const Config = require('../configs/index.json');
const { ValidateMongoQuery } = require('./validation');
const { GenerateQueryAggregation } = require('./generateAgregation');
const { BuildQueryMongoPagination, SetSorting } = require('./queryBuilder');

/**
 * Running query without functionality of Pagination
 * @param {{ client: any, collection: string }} mongo
 * @param {Array<any>} query
 * @returns {Promise<any>}
 */
const runQuery = async ({ client, collection }, query) => {
    try {
        const queryAggregate = [
            {
                $facet: {
                    data: query,
                    count: [{ $group: { _id: 1, totalRecord: { $sum: 1 } } }]
                }
            }
        ];
        const result = await client.collection(collection).aggregate(queryAggregate).toArray();
        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Get one data from collection
 * @param {{ client: any, collection: string }} mongo
 * @returns {Promise<Array>}
 */
const getOneData = async ({ client, collection }) => await client.collection(collection).find().limit(1).toArray();

/**
 * Set fields projection
 * @param {void} mongo
 * @param {Object} projection
 * @returns
 */
const setDefaultProjection = async (mongo, projection) => {
    if (projection) return projection;

    const getData = await getOneData(mongo);
    if (getData.length > 0) {
        let newProjection = {};
        for (const key in getData[0]) {
            newProjection[key] = 1;
        }
        return newProjection;
    }
};

/**
 * Set fields searchable
 * @param {string[]} [fieldToSearch]
 * @param {Object} fields
 * @returns {string[]}
 */
const setDefaultSearchableFields = (fieldToSearch, fields) =>
    fieldToSearch?.length ? fieldToSearch : Object.keys(fields);

/**
 * Set default payload
 * @param {Object} payload
 * @returns {Object}
 */
const setupDefaultPayload = (payload) => ({
    sort: SetSorting(payload),
    search: payload?.search || null,
    filter: payload?.filter || [],
    page: parseInt(payload?.page) || Config.default.page,
    size: parseInt(payload?.size) || Config.default.size
});

/**
 * Build MongoDB Pagination
 * @param {Object} mongoConfig - MongoDB configuration
 * @param {Object} payload - User filter object
 * @param {string[]} [fieldToSearch=[]] - Searchable fields
 * @param {Object} [projection] - Output filter
 * @param {Array<{collectionName: string, uniqueId: string}>} [aggregate=[]] - Aggregation to other sub collections
 * @returns {Promise<Object>}
 */
const buildPagination = async (mongoConfig, payload, fieldToSearch = [], projection, aggregate = []) => {
    try {
        ValidateMongoQuery(mongoConfig);

        const newPayload = setupDefaultPayload(payload);
        const newProjection =
            projection && typeof projection !== 'undefined'
                ? projection
                : await setDefaultProjection(mongoConfig, projection);
        const newFieldToSearch = setDefaultSearchableFields(fieldToSearch, newProjection);

        const queryAgregate = GenerateQueryAggregation(aggregate);
        const queryMongo = BuildQueryMongoPagination(newPayload, newFieldToSearch, newProjection, queryAgregate);
        const results = await runQuery(mongoConfig, queryMongo);

        delete newPayload.search;
        return {
            ...newPayload,
            totalRecord: results[0].data.length > 0 ? results[0].count[0].totalRecord : 0,
            totalPage: results[0].count.length > 0 ? Math.ceil(results[0].count[0].totalRecord / newPayload.size) : 0,
            data: results[0].data
        };
    } catch (error) {
        return error.message || `Something went wrong, please check your configuration`;
    }
};

module.exports = {
    runQuery,
    setDefaultProjection,
    setDefaultSearchableFields,
    setupDefaultPayload,
    getOneData,
    buildPagination
};
