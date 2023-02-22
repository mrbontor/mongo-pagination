const client = require('./mongo');
const mongoPagination = require('../');

const Main = async () => {
    try {
        await client.ping();

        const mongoConfig = {
            client: client.getDb().db(),
            collection: 'user'
        };

        const fieldSearch = ['first_name', 'last_name', 'email', 'gender', 'countryId', 'status'];
        // const aggregation = [
        //     {
        //         collectionName: 'country',
        //         uniqueId: 'countryId'
        //     }
        // ];

        const pagination = await mongoPagination.buildPagination(mongoConfig, {}, fieldSearch);
        console.log(JSON.stringify(pagination));
        return pagination;
    } catch (error) {
        console.log(error.message);
        console.log(error.stack);
    }
};

Main();
