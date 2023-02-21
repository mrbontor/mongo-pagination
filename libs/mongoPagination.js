const Config = require('../configs');
const { ValidateMongoQuery } = require('./validation');
const { QueryAgregation } = require('./generateAgregation');
/**
 *
 * @param {String} type
 */
const getTypeSort = (type) => {
    switch (type) {
        case '-1':
        case 'desc':
            return -1;
        case '1':
        case 'asc':
            return 1;

        default:
            return 1;
    }
};

/**
 *
 * @param {Object} payload
 */
const setSorting = (payload) => {
    const sortType = getTypeSort(payload.sortType);
    const sortBy = payload.sortBy || Config.default.sorting;

    let sorter = {};
    sorter[sortBy] = sortType;
    return sorter;
};

/**
 *
 * @param {Object} payload
 */
const getSorting = (payload) => {
    const sortType = getTypeSort(payload.sortType);
    const sortBy = payload.sortBy || Config.default.sorting;

    let sorter = {};
    sorter[sortBy] = sortType == 1 ? Config.ascending : Config.descending;
    return sorter;
};

/**
 *
 * @param {String} search
 * @param {Array} fields
 * @augments search
 * @example fields = ["username", "email"]
 */
const fieldsSearch = (search, fields = []) => {
    const results = [];
    if (fields.length > 0) {
        let querySearch = {};
        fields.forEach((field) => {
            querySearch[field] = { $regex: search, $options: 'i' };
            results.push(querySearch);
        });
    }
    return results;
};

/**
 * Filter data with Boolean String
 * @param {Object} payload
 * @example status = "true, false"
 */
const handleFieldBoolean = (payload) => {
    const keywords = Config.booleanFields;

    let query = {};

    keywords.forEach((field) => {
        if (payload[field]) {
            if (typeof payload[field] == 'object') {
                query[field] = { $in: payload[field] };
            } else {
                const booleanFields = payload[field].toString().replace(/\s/g, '').split(',');

                if (booleanFields.length > 0) {
                    const stats = booleanFields.map((status) => JSON.parse(JSON.stringify(status)));
                    query[field] = { $in: stats };
                }
            }
        }
    });

    return query;
};

/**
 *
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

    return await client.collection(collection).aggregate(queryAgregate).toArray();
};

/**
 *
 * @param {Object} payload
 * @param {Array} fieldToSearch
 * @param {Object} projection
 * @param {Array} aggregate
 */
const buildQueryMongoPagination = (payload = {}, fieldToSearch = [], projection, aggregate = []) => {
    try {
        if (fieldToSearch.length === 0) {
            throw new Error('Field to search is required!');
        }
        const search = payload.search || null;
        const pageSize = parseInt(payload.size) || Config.default.size;
        const pageNumber = parseInt(payload.page) || Config.default.page;

        const sortBy = setSorting(payload);
        let query = {};

        const isStatusFieldExist = handleFieldBoolean(payload);
        if (isStatusFieldExist) query = isStatusFieldExist;

        if (search && fieldToSearch.length > 0) {
            query.$or = fieldsSearch(search, fieldToSearch);
        }

        let finalQuery = [
            { $match: query },
            { $sort: sortBy },
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize }
        ];
        if (aggregate.length > 0) {
            //need to put aggregation query exact below of the  `{ $match: query }`,
            finalQuery.splice(1, 0, ...aggregate);
        }

        if (projection) {
            finalQuery.push({ $project: projection });
        }

        return finalQuery;
    } catch (error) {
        throw error;
    }
};
module.exports = {
    /**
     *
     * @param {Object} payload
     * @param {Array} fieldToSearch
     * @param {Object} projection
     * @param {Array} aggregate
     */
    buildPagination: async (mongoConfig, payload = {}, fieldToSearch = [], projection = null, aggregate = []) => {
        try {
            ValidateMongoQuery(mongoConfig);

            const queryAgregate = QueryAgregation(aggregate);
            const queryMongo = buildQueryMongoPagination(payload, fieldToSearch, projection, queryAgregate);

            const results = await runQuery(mongoConfig, queryMongo);

            const pageSize = parseInt(payload.size) || Config.default.size;
            const pageNumber = parseInt(payload.page) || Config.default.page;

            return {
                sort: getSorting(payload),
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
