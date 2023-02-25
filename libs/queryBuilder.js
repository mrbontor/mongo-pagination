const Config = require('../configs');

const toLowerCaseString = (string) => {
    return string.toString().toLocaleLowerCase();
};

/**
 * Get type sorting query
 * @param {String} type
 */
const getTypeSort = (type) => {
    const newType = type ? toLowerCaseString(type) : '1';

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
 * Set sorting for query
 * @param {Object} payload
 * @param {number} payload.sortType
 * @param {string} payload.sortBy
 * @returns
 */
const setSorting = (payload) => {
    const sortType = payload?.sortType ? getTypeSort(payload.sortType) : 1;
    const sortBy = payload?.sortBy ? payload.sortBy : Config.default.sorting;

    return { [sortBy]: sortType };
};

/**
 * Filter data Boolean String
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

    const resulst = Object.keys(query).length !== 0 ? query : null;
    return resulst;
};

/**
 * Set up fields to be searchable
 * @param {String} search - string to be found
 * @param {Array<string>} fieldToSearch - fields seachable
 * @param {Object} projection - default fields for seachable if empty
 */
const handleFieldSearch = (search, fieldToSearch) => {
    const results = [];
    let querySearch = {};
    fieldToSearch.forEach((field) => {
        results.push({ [field]: { $regex: search, $options: 'i' } });
    });
    return results;
};

/**
 * Generate Query pagination
 * @param {Object} payload - an Object for user filter
 * @param {string} payload.sortBy - sort data by sortBy
 * @param {string|number} payload.sortType default 1 || ASC
 * @param {string} payload.search - text to be search
 *
 * @param {Array<{string: number}>} fieldToSearch - filters fields that can be found
 * @param {Object<number>} projection - filter output of query || if not setup, will be taken from collection
 * @param {Array<{collectionName: string, uniqueId:string}>} aggregate -- agregation to other collection
 * @returns
 */
const buildQueryMongoPagination = (payload, fieldToSearch, projection, aggregate) => {
    let query = {};

    const isStatusFieldExist = handleFieldBoolean(payload);
    if (isStatusFieldExist) query = isStatusFieldExist;

    const search = payload.search || null;
    if (search && fieldToSearch && fieldToSearch.length > 0) {
        const setFieldToSearch = handleFieldSearch(search, fieldToSearch);
        query.$or = setFieldToSearch;
    }

    let finalQuery = [
        { $match: query },
        { $sort: payload.sort },
        { $skip: (payload.page - 1) * payload.size },
        { $limit: payload.size },
        { $project: projection }
    ];
    if (aggregate.length > 0) {
        //need to put aggregation query exact below of the  `{ $match: query }`,
        finalQuery.splice(1, 0, ...aggregate);
    }

    return finalQuery;
};

module.exports = {
    ToLowerCaseString: toLowerCaseString,
    GetTypeSort: getTypeSort,
    SetSorting: setSorting,
    HandleFieldSearch: handleFieldSearch,
    HandleFieldBoolean: handleFieldBoolean,
    BuildQueryMongoPagination: buildQueryMongoPagination
};
