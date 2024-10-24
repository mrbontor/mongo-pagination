const Config = require('../configs/index.json');

const toLowerCaseString = (string) => string.toString().toLowerCase();

/**
 * Get type sorting query
 * @param {string} [type='1']
 * @returns {number}
 */
const getTypeSort = (type = '1') => {
    const newType = toLowerCaseString(type);
    return ['desc', '-1'].includes(newType) ? -1 : 1;
};

/**
 * Set sorting for query
 * @param {{ sortType?: string|number, sortBy?: string }} payload
 * @returns {{ [key: string]: number }}
 */
const setSorting = (payload) => {
    const sortType = payload?.sortType ? getTypeSort(payload.sortType) : 1;
    const sortBy = payload?.sortBy ? payload.sortBy : Config.default.sorting;
    return { [sortBy]: sortType };
};

/**
 * Filter data Boolean String
 * @param {Object} payload
 * @returns {Object|null}
 */
const handleFieldBoolean = (payload) => {
    if (!payload || !Object.keys(payload).length) return null;
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

    const resulst = Object.keys(query).length !== 0 ? query : {};
    return resulst;
};

/**
 * Set up fields to be searchable
 * @param {string} search - string to be found
 * @param {string[]} fieldToSearch - fields searchable
 * @returns {Object[]}
 */
const handleFieldSearch = (search, fieldToSearch) =>
    fieldToSearch.map((field) => ({ [field]: { $regex: search, $options: 'i' } }));

/**
 * Set up fields to be filtered
 * @param {Array<Array[[field, value, operator]]>} filters - [field, value, operator]
 * @returns {Object}
 */
const buildFilterQuery = (filters) => {
    const allowedOperators = Config.allowedOperators;
    const query = {};

    filters.forEach((filter) => {
        if (!Array.isArray(filter) || filter.length < 2 || filter.length > 3) {
            throw new Error(
                `Invalid filter format: ${JSON.stringify(filter)}. Expected format: [field, value, operator?].`
            );
        }

        const [field, value, operator = 'eq'] = filter;

        if (!allowedOperators.includes(operator)) {
            throw new Error(`Invalid operator: ${operator}. Allowed operators are ${allowedOperators.join(', ')}.`);
        }

        if (typeof field !== 'string' || field.trim() === '') {
            throw new Error(`Invalid field: ${field}. Field must be a non-empty string.`);
        }
        if (value === undefined) {
            throw new Error(`Invalid value for field ${field}: Value cannot be undefined.`);
        }

        const mongoOperator = `$${operator}`;
        query[field] = { [mongoOperator]: value };
    });

    return query;
};

/**
 * Generate Query pagination
 * @param {Object} payload - an Object for user filter
 * @param {string[]} fieldToSearch - filters fields that can be found
 * @param {Object} projection - filter output of query
 * @param {Array<{collectionName: string, uniqueId: string}>} aggregate - aggregation to other collection
 * @returns {Object[]}
 */
const buildQueryMongoPagination = (payload, fieldToSearch = [], projection = null, aggregate = []) => {
    let query = handleFieldBoolean(payload) || {};

    if (payload.search && fieldToSearch.length) {
        query.$or = handleFieldSearch(payload.search, fieldToSearch);
    }

    if (payload.filter?.length) {
        Object.assign(query, buildFilterQuery(payload.filter));
    }

    // Set up the initial baseQuery pipeline
    const baseQuery = [
        { $match: query },
        ...aggregate,
        { $sort: payload.sort || {} },
        { $skip: Math.max(0, (payload.page - 1) * payload.size) },
        { $limit: payload.size || 10 }
    ];

    if (projection) {
        baseQuery.push({ $project: projection });
    }
    return baseQuery;
};

// start helper for sub agregation

/**
 * handle payload projection of sub collection
 * @param {Object|| Array<string>} project
 * @returns {Object}
 */
const buildProjectionSubQuery = (project) => {
    if (!project) return null;
    let preProjection = {};
    if (Array.isArray(project)) {
        project.forEach((key) => (preProjection[key] = 1));
    } else if (typeof project === 'object') {
        preProjection = project;
    }
    const isHaveKeys = Object.keys(preProjection).length > 0;
    return isHaveKeys ? { $project: preProjection } : null;
};

/**
 * setup base query aggregation of sub collection
 * @param { collectionName: string, uniqueId: string, projection: Object|| Array<string> } - payload
 * @returns {Array<object>}
 */
const buildSubQueryAndProjection = ({ collectionName, uniqueId, projection }) => {
    const queryJoin = {
        $lookup: {
            from: collectionName,
            let: { [uniqueId]: { $toObjectId: `$${uniqueId}` } },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', `$$${uniqueId}`] } } }],
            as: uniqueId
        }
    };
    const { pipeline } = queryJoin.$lookup;
    const dataProjection = buildProjectionSubQuery(projection);
    if (dataProjection) {
        pipeline.push(dataProjection);
    }

    const finalLookup = [
        queryJoin,
        {
            $unwind: {
                path: `$${uniqueId}`,
                preserveNullAndEmptyArrays: true
            }
        }
    ];
    return finalLookup;
};

/**
 * setup query search for sub collection
 * @param {{uniqueId: string, subSearch: string, fieldToSearch: Array<string> }} - payload
 * @throws {Error}
 * @returns {Object}
 */
const buildSearchSubQuery = (uniqueId, subSearch, fieldToSearch) => {
    if (!subSearch || !Array.isArray(fieldToSearch) || fieldToSearch.length === 0) {
        return null;
    }

    const searchConditions = fieldToSearch.map((field) => ({
        [`${uniqueId}.${field}`]: { $regex: subSearch, $options: 'i' }
    }));

    return { $match: { $or: searchConditions } };
};

// end helper for sub agregation

module.exports = {
    ToLowerCaseString: toLowerCaseString,
    GetTypeSort: getTypeSort,
    SetTypeSort: getTypeSort,
    SetSorting: setSorting,
    HandleFieldSearch: handleFieldSearch,
    HandleFieldBoolean: handleFieldBoolean,
    BuildQueryMongoPagination: buildQueryMongoPagination,
    BuildProjectionSubQuery: buildProjectionSubQuery,
    BuildSubQueryAndProjection: buildSubQueryAndProjection,
    BuildSearchSubQuery: buildSearchSubQuery,
    BuildFilterQuery: buildFilterQuery
};
