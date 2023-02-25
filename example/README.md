# Mongodb Pagination example

I assume you already have server mongodb, you just need to replace the connection url to yours.

example

```js
const mongoUrl = 'mongodb+srv://yourUsername:uourPpassword@test/pagination?retryWrites=true&w=majority';
```

Note: _remember to change `mongodb+srv` if your connection was developed in `local machine`_

## Usage

```js
const Main = async () => {
    try {

        //connect to Mongo Server
        await client.ping();

        //configure connection injection using main collection
        const mongoConfig = {
            client: client.getDb().db(), //mongo client
            collection: 'user' // user collection
        };

        //payload is user filter to the pagination
        const payload = {
            search = 'from `fieldSearch`', // or set it to {} and/or null
            sortType: "ASC", // 1 | 0 | 'DESC'
            page: 1, //default
            size: 10, //default
        }

        const fieldSearch = ['first_name', 'last_name', 'email', 'gender', 'countryId', 'status']; //required

        //collection aggregation/join
        const aggregation = [
            {
                collectionName: 'country', //country collection
                uniqueId: 'countryId' //uniqueId
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
    }
}

Main()
```
