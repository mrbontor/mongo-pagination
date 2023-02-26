# Nodejs & MongoDb (Native Driver) Pagination

## About

MongoDb Pagination is a library to handle pagination data using MongoDb

## Compatibility

this module supports and is tested against:

-   mongodb 3+ - lastest

## Features

-   server/client side rendering
-   multiple aggregation/join
-   multiple fields search value
-   multiple filter fields
-   pagination / response in datatable format
-   able to use any Methods `(POST,GET, etc)`,

## Documentation

This module is using `async` function and the _query_ is using query `aggregation()`

### Install

```sh
npm install mongodb-pagination
```

#### Arguments

```js
buildPagination: async (
    mongoConfig,
    payload,
    fieldToSearch,
    projection,
    aggregate) {

        ......
    }
```

#### _Description_

-   ##### mongoConfig

    Is an `Object` and it's `required`.

    `mongoConfig` must contains keys `client` and the main `collectionName`. This is used to declare
    `mongodb client connection` as injection.

    example:

    ```js
    const mongoConfig = {
        client: client.db('databaseName'),
        collection: 'user'
    };
    ```

-   ##### payload

    there are 5 availabe parameters for payload and those are optianal:

    -   `sortBy` as `string`, _default_ = `updatedAt`
    -   `sortType` as `number|string` || `asc|1|desc|-1`, default = `1`
    -   `search` as `string`, _default_ = `null`
    -   `page` as `number`, _default_ = `1`
    -   `size` as `number`, _default_ = `10`

    Noted that if there is no User's query, then set it to be `null`.

    If `payload === null`, then it will use default below

    ```
    payload : { sort: { updatedAt: 1 }, search: null, page: 1, size: 10 }
    ```

    The `payload.search` is used to search(`%s%`) within the fields of [fieldSearch](#fieldsearch).

    This module allows us to use POST,GET, etc. So it can be used depending on which one you are comfortable using.

    _Note: i suggest to use `GET` method for best practice._

    example input:

    ```js
    const payload = {
        sortBy: 'first_name',
        sortType: 'desc',
        search: 'my first_name',
        page: 2,
        size: 2
    };
    ```

-   ##### fieldSearch

    Is an `Array` and it's `optional`.

    `fieldSearch` is used to `search` on any string in `payload.search`

    _Because this module is used to handle data pagination and as datatable in the client's side, there must be an
    available field(s) that can be found_

    _There will be a shortage if `fieldsearch` is not `provided`_, which is this module will do `once` query with
    `find().limit(1)` first, then the query results will be set to be data default for [fieldSearch](#fieldsearch) and
    [projection](#projection)

    That is used to get all fields on the collection. Please consider to provide [fieldSearch](#fieldsearch) and
    [projection](#projection), it will also `increase` the `query performance` because we will only do `once` `query`.

    ex. meaning: I only want this fields `first_name`, `last_name`, `email` to be `searcable`, then i put them like in
    example below.

    example:

    ```js
    const fieldSearch = ['first_name', 'last_name', 'email'];
    ```

-   ##### projection

    Is an `Object` and it's `optional`.

    `projection` is used to `filter/hide` the output from parent `collection`.

    Please consider as i mention above to provide this `parameter`

         - if there is no filtering field(s), set it to be `null`.
         - if there are fields that need to be `hiddden`, then put them to be `readable`.

    ex. meaning: _assumes that there is password field and it shouldn't be in the output query_

    ```js
    const projection = { first_name: 1, last_name: 1, email: 1 };
    ```

-   #### aggregation

    Is an `Object` to do `join`/`relationship` of the `collections`.

    ex: meaning: _the collection user need to provide user's country and the user's city where in collection user have
    fields like_ :

    user collection

    ```json
    {
        "firstName": "mrbontor",
        "email": "mrbontor@gmail.com",
        "countryId": "63e3d2f3...", //ObjectID || string
        "cityId": "63e3d2f3..." //ObjectID || string
    }
    ```

    then:

    ```js
    const aggregation = [
        {
            collectionName: 'country',
            uniqueId: 'countryId'
        },
        {
            collectionName: 'city',
            uniqueId: 'cityId'
        }
    ];
    ```

    __**New Feature** in the `lastest version`.__
    now its able to filter/search data in sub collections.

    You only need to add new keys (`subSearch` and `fieldToSearch`) in paramater aggregation, the config will be like:


    ```js
    const aggregation = [
        {
            collectionName: 'country',
            uniqueId: 'countryId',
            subSearch: 'country name',
            fieldToSearch: ['name'] // field name country
        },
        {
            collectionName: 'city',
            uniqueId: 'cityId',
            subSearch: 'country name',
            fieldToSearch: ['name'] // field name city
        }
    ];
    ```

    __Note: even though the field `countryId` and `cityId` are not provided in the [projection](#projection), the filtering/search will be also works.__




### Usage

there is an example in folder [example](./example), please check [README](/example/README.md#usage) for more detail.

```js
const mongoPagination = require('mongodb-pagination');

//prepare configuration
const mongoConfig = {
    client: client.getDb().db(),
    collection: 'user'
};
//setup payload
const payload = { sortBy: 'first_name' };
//setup searchable fields
const fieldSearch = ['first_name', 'last_name', 'email', 'gender', 'countryId', 'status'];
//setup projection
const projection = { first_name: 1, last_name: 1, email: 1, gender: 1, countryId: 1, status: 1 };
//setup aggregation
const aggregation = [
    {
        collectionName: 'country',
        uniqueId: 'countryId'
    }
];

//execute
const pagination = await mongoPagination.buildPagination(mongoConfig, payload, fieldSearch, projection, aggregation);

return pagination;
```

#### example output with no data

```json
{
    "sort": { "first_name": "ASC" },
    "page": 1,
    "size": 10,
    "totalRecord": 0,
    "totalPage": 0,
    "data": [{...}]
}
```

#### example output without agregation collection

```json
{
    "sort": { "updatedAt": "ASC" },
    "page": 1,
    "size": 10,
    "totalRecord": 100,
    "totalPage": 10,
    "data": [
        {
            "_id": "63e3d2f35f96e524a35d7e97",
            "first_name": "Tobok",
            "last_name": "Sitaggang",
            "email": "mrbontor@gmail.eu",
            "gender": "Male",
            "createdAt": "2023-02-08T15:46:22.377Z",
            "updatedAt": "2023-02-08T15:46:22.377Z",
            "status": true,
            "countryId": { "_id": "63e3ab045f96e524a35d7cde", "name": "Indonesia" }
        },
        ...
    ]
}
```

#### example output with agregation

```json
{
    "sort": { "updatedAt": "ASC" },
    "page": 1,
    "size": 10,
    "totalRecord": 100,
    "totalPage": 10,
    "data": [
        {
            "_id": "63e3d2f35f96e524a35d7e97",
            "first_name": "Tobok",
            "last_name": "Sitaggang",
            "email": "mrbontor@gmail.eu",
            "gender": "Male",
            "createdAt": "2023-02-08T15:46:22.377Z",
            "updatedAt": "2023-02-08T15:46:22.377Z",
            "status": true,
            "countryId": {
                "_id":"63e3ab045f96e524a35d7cde","name":"Indonesia"
            },
            "name": "Indonesia"
        },
        ...
    ]
}
```

## TO DO

    - allow to use `projection` when join collection(s)
    - enable to filter using field instead

## Tests

Noted: i use `coverage: true` with the unit test, all have been `tested` and `passed`, even though the `coverage` shown
is no.

```sh
npm test
```

## Contributing

    1. Fork it!
    2. Create your feature branch: git checkout -b my-new-feature
    3. Commit your changes: git commit -am 'Add some feature'
    4. Push to the branch: git push origin my-new-feature
    5. Submit a pull request :D

Noted: i use [commitizen](https://github.com/commitizen/cz-cli) to handle commit message, and i'm very thankfull cause
it make it easir to handle the versioning.

## License

[MIT Licence](./LICENSE)

If my work helps you, please consider
[![buying me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png)](https://www.buymeacoffee.com/mrbontor)

---

[Back to top](#nodejs--mongodb-native-driver-pagination)
