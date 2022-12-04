const DEFAULT_SIZE = 10;
const DEFAULT_PAGE = 1;

/**
 *
 * @param {string} type
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
 * @param {object} payload
 */
const setSorting = (payload) => {
    const sortType = getTypeSort(payload.sortType);
    const sortBy = payload.sortBy || 'updatedAt';

    let sorter = {};
    sorter[sortBy] = sortType;
    return sorter;
};

/**
 *
 * @param {object} payload
 */
const getSorting = (payload) => {
    const sortType = getTypeSort(payload.sortType);
    const sortBy = payload.sortBy || 'updatedAt';

    let sorter = {};
    sorter[sortBy] = sortType == 1 ? 'ASC' : 'DESC';
    return sorter;
};

/**
 *
 * @param {string} search
 * @param {Array} fields
 */
const fieldsSearch = (search, fields = []) => {
    let results = [];
    if (fields.length > 0) {
        fields.forEach((field) => {
            let querySearch = {};
            querySearch[field] = { $regex: search, $options: 'i' };
            results.push(querySearch);
        });
    }
    return results;
};

/**
 *
 * @param {object} payload
 */
const handleFieldStatus = (payload) => {
    const keywords = ['status', 'isActive'];

    let query = {};

    keywords.forEach((field) => {
        if (payload[field]) {
            if (typeof payload[field] == 'object') {
                query[field] = { $in: payload[field] };
            } else {
                const statuses = payload[field].toString().replace(/\s/g, '').split(',');

                if (statuses.length > 0) {
                    console.log('statuses', statuses);
                    const stats = statuses.map((status) => JSON.parse(JSON.stringify(status)));
                    query[field] = { $in: stats };
                }
            }
        } else {
            return false;
        }
    });

    return query;
};

/**
 *
 */
module.exports = {
    /**
     *
     * @param {object} payload
     * @param {array} fieldToSearch
     * @param {object} projection
     * @param {array} aggregate
     */
    buildQueryMongoPagination: (payload = {}, fieldToSearch = [], projection, aggregate = []) => {
        if (fieldToSearch.length === 0) {
            throw new Error('Field to search is required!');
        }
        const search = payload.search || null;
        const pageSize = parseInt(payload.size) || DEFAULT_SIZE;
        const pageNumber = parseInt(payload.page) || DEFAULT_PAGE;

        const sortBy = setSorting(payload);
        let query = {};

        const isStatusExist = handleFieldStatus(payload);
        if (isStatusExist) query = isStatusExist;

        if (search && fieldToSearch.length > 0) {
            query.$or = fieldsSearch(search, fieldToSearch);
        }

        let finalQuery = [
            { $match: query },
            { $sort: sortBy },
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize },
        ];
        if (aggregate.length > 0) {
            finalQuery.splice(1, 0, ...aggregate);
        }

        if (projection) {
            finalQuery.push({ $project: projection });
        }

        return finalQuery;
    },

    /**
     *
     * @param {object} payload
     * @param {array} results
     */
    buildResponsePagination: (payload, results) => {
        const pageSize = parseInt(payload.size) || DEFAULT_SIZE;
        const pageNumber = parseInt(payload.page) || DEFAULT_PAGE;

        return {
            sort: getSorting(payload),
            page: pageNumber,
            size: pageSize,
            totalRecord: results[0].data.length > 0 ? results[0].count[0].totalRecord : 0,
            totalPage: results[0].count.length > 0 ? Math.ceil(results[0].count[0].totalRecord / pageSize) : 0,
            data: results[0].data,
        };
    },
};
