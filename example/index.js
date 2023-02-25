const client = require('./mongo');
const mongoPagination = require('../');

const Main = async () => {
    try {
        let x = await client.ping();
        const mongoConfig = {
            client: client.getDb().db(),
            collection: 'user'
        };
        const payload = { sortBy: 'first_name' };

        const fieldSearch = ['first_name', 'last_name', 'email', 'gender', 'countryId', 'status'];
        const projection = { first_name: 1, last_name: 1 };
        const aggregation = [
            {
                collectionName: 'country',
                uniqueId: 'countryId'
            }
        ];

        const pagination = await mongoPagination.buildPagination(
            mongoConfig,
            payload,
            fieldSearch,
            projection,
            aggregation
        );
        console.log(JSON.stringify(pagination));
        return pagination;
    } catch (error) {
        console.log(error.message);
        console.log(error.stack);
    }
};

Main();
