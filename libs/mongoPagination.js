const Config = require('../configs');
const { ValidateMongoQuery } = require('./validation');
const { GenerateQueryAgregation } = require('./generateAgregation');
const { BuildQueryMongoPagination, SetSorting } = require('./queryBuilder');

/**
 * Running query without functionality ofPagination
 * @param {Object} mongo
 * @param {void} mongo.client = mongo connection
 * @param {string} mongo.collection = collection name
 * @param {Array<any>} queryAgregate
 * @returns
 */
const runQuery = async (mongo, query) => {
    try {
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
    } catch (error) {
        throw error;
    }
};

const getOneData = async (mongo) => {
    try {
        const { client, collection } = mongo;
        return (await client.collection(collection).find().limit(1).toArray()) || [];
    } catch (error) {
        throw error;
    }
};
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
 * @param {Array<string>} fieldToSearch
 * @param {Array<string>} fields
 * @returns
 */
const setDefaultSearchAbleFields = (fieldToSearch, fields) => {
    if (fieldToSearch && fieldToSearch.length > 0) return fieldToSearch;

    return Object.keys(fields);
};

/**
 * Set default payload
 * @param {Object} payload - an Object for user filter
 * @param {string} payload.sortBy - sort data by sortBy
 * @param {string|number} payload.sortType default 1 || ASC
 * @param {string} payload.search - text to be search
 * @returns
 */
const setupDefaultPayload = (payload) => {
    return {
        sort: SetSorting(payload),
        search: payload?.search || null,
        page: parseInt(payload?.page) || Config.default.page,
        size: parseInt(payload?.size) || Config.default.size
    };
};

/**
 * Build Mongodb Pagination
 * @param {Object} mongoConfig - mongodb configuration
 * @param {void} mongoConfig.client - mongodb client connection
 * @param {string} mongoConfig.collection - collection name for main collection
 * @param {Object} payload - an Object for user filter
 * @param {string} payload.sortBy - sort data by sortBy
 * @param {string|number} payload.sortType default 1 || ASC
 * @param {string} payload.search - text to be search
 * @param {Array<{string: number}>} fieldToSearch - filters fields that can be found
 * @param {Object} projection - filter output of query || if not setup, will be taken from collection
 * @param {string} projection.any any - filter output of query || if not setup, will be taken from collection
 * @param {number} projection.number  - filter output of query || if not setup, will be taken from collection
 * @param {Array<{collectionName: string, uniqueId:string}>} aggregate -- agregation to other collection
 * @returns
 */
const buildPagination = async (mongoConfig, payload, fieldToSearch = [], projection, aggregate = []) => {
    try {
        ValidateMongoQuery(mongoConfig);

        const newPayload = setupDefaultPayload(payload);
        const newProjection =
            projection && typeof projection !== 'undefined'
                ? projection
                : await setDefaultProjection(mongoConfig, projection);
        const newFieldToSearch = setDefaultSearchAbleFields(fieldToSearch, newProjection);

        const queryAgregate = GenerateQueryAgregation(aggregate);
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
    setDefaultSearchAbleFields,
    setupDefaultPayload,
    getOneData,
    buildPagination
};
