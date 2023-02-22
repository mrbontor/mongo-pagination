const Config = require('../configs');

/**
 *
 * @param {String} type
 */
const getTypeSort = (type) => {
    const newType = type ? type.toString().toLocaleLowerCase() : '1';

    switch (newType) {
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
 * @object payload.sortType
 * @object payload.sortBy
 * @returns
 */
const setSorting = (payload) => {
    const sortType = payload && payload.sortType ? getTypeSort(payload.sortType) : 1;
    const sortBy = payload && payload.sortBy ? payload.sortBy : Config.default.sorting;

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
    if (!payload) return null;
    const keywords = Config.booleanFields;

    let query = {};

    keywords.forEach((field) => {
        if (payload[field]) {
            if (typeof payload[field] !== 'string') {
                query[field] = { $in: [payload[field]] };
            } else {
                const booleanFields = payload[field].toString().replace(/\s/g, '').split(',');
                const stats = booleanFields.map((status) => JSON.parse(JSON.stringify(status)));
                query[field] = { $in: stats };
            }
        }
    });

    return Object.keys(query).length !== 0 ? query : null;
};

/**
 *
 * @param {Object} payload
 * @param {Array} fieldToSearch
 * @param {Object} projection
 * @param {Array} aggregate
 */
const buildQueryMongoPagination = (payload = {}, fieldToSearch = [], projection, aggregate = []) => {
    if (fieldToSearch.length === 0) {
        process.exitCode = 1;
        throw new Error('Field to search is required, at least 1!');
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

    if (projection) finalQuery.push({ $project: projection });

    return finalQuery;
};

module.exports = {
    GetTypeSort: getTypeSort,
    SetSorting: setSorting,
    GetSorting: getSorting,
    FieldsSearch: fieldsSearch,
    HandleFieldBoolean: handleFieldBoolean,
    BuildQueryMongoPagination: buildQueryMongoPagination
};
