# Nodejs & MongoDb (Native Driver) Pagination

## About

MongoDb Pagination is a library to handle pagination data

## Compatibility

this module supports and is tested against:

-   mongodb 3+ - lastest

## Features

-   server side rendering
-   multiple aggregation/join
-   multiple fields search value
-   multiple filter fields
-   pagination / response in datatable format

## Documentation

This module is using `async` function and the _query_ is using query `aggregation()`

### Install

```sh
npm install mongodb-pagination
```

### Install

```sh
npm install mongodb-pagination
```

### Arguments

```js
buildPagination: async (
    mongoConfig,
    payload = {},
    fieldToSearch = [],
    projection = null,
    aggregate = []){

        ......
    }
```

**_Description_**

-   **mongoConfig**

    Is an `Object` and it's required.

    `mongoConfig` must contains keys `client` and the main `collectionName`. This is used to declare
    `mongodb client connection` as injection.

    example:

    ```js
    const mongoConfig = {
        client: client.db('databaseName'),
        collection: 'user'
    };
    ```

-   **payload**

    Is an `Object` and it's `optional`.

    Noted that if there is no User's query, then set it to be `null` or `{}` or `undefined`.

    The `payload` will check the fields inside [fieldSearch](#__fieldSearch__) using key `search`

    This module allows us to use POST,GET, etc. So it can be used depending on which one you are comfortable using.

    _Note: i suggest to use `GET` method for best practice._

    example:

    ```js
    const payload = {
        search: 'my first_name'
    };
    ```

-   **fieldSearch**

    Is an `Array` and it's `required`.
    
    _Since this module is used to handle pagination and datatable in client side, all of the fields should be searchable_

    Use `fieldSearch` to make any field in the collection searchable. Means, when the `fieldSearch` is filled, then it will be searchable.

    ex: you want to make fields `first_name`, `last_name`, `email` to be searcable, then put them like in example below.

    example:

    ```js
    const fieldSearch = ['first_name', 'last_name', 'email'];
    ```

-   **projection**

    Is an `Object` to filter the output from parent `collection`.

         - if there is no filtering field(s), set it to be `null`.
         - if there are fields that need to be `hiddden`, then put them to be `readable`.

    example with readable filter: _assumes that there is password field_

    ```js
    const fieldSearch = { first_name: 1, last_name: 1, email: 1 };
    ```

-   **aggregation**

    Is an `Object` to do `join`/`relationship` of the `collections`.

    example with join collection:

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

### Usage

there is an example in folder [example](./example), please check [README](/example/README.md#usage) for more detail.

```js
const mongoPagination  = require(./)

//prepare configuration
const mongoConfig = {
    client: client.getDb().db(),
    collection: 'user'
};
const payload = {} // search
const projection = null
const fieldSearch = ['first_name', 'last_name', 'email', 'gender', 'countryId', 'status'];
const aggregation = [
    {
        collectionName: 'country',
        uniqueId: 'countryId'
    }
];

//run query
const pagination = await mongoPagination.buildPagination(mongoConfig, payload, fieldSearch, projection, aggregation);

return pagination
```

#### example output with no data

```json
{
    "sort": { "updatedAt": "ASC" },
    "page": 1,
    "size": 10,
    "totalRecord": 0,
    "totalPage": 0,
    "data": []
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
            "first_name": "Yasmin",
            "last_name": "Catherall",
            "email": "ycatherall8@europa.eu",
            "gender": "Genderfluid",
            "createdAt": "2023-02-08T15:46:22.377Z",
            "updatedAt": "2023-02-08T15:46:22.377Z",
            "status": false,
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
            "first_name": "Yasmin",
            "last_name": "Catherall",
            "email": "ycatherall8@europa.eu",
            "gender": "Genderfluid",
            "createdAt": "2023-02-08T15:46:22.377Z",
            "updatedAt": "2023-02-08T15:46:22.377Z",
            "status": false,
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

```sh
npm test

```

## Contributing

    1. Fork it!
    2. Create your feature branch: git checkout -b my-new-feature
    3. Commit your changes: git commit -am 'Add some feature'
    4. Push to the branch: git push origin my-new-feature
    5. Submit a pull request :D

Noted: i use [commitizen](https://github.com/commitizen/cz-cli) to handle commit message, and i'm very thankfull cause it make it easir to handle the versioning.

## License

[MIT Licence](./LICENSE)

If my work helps you, please consider [![buying me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png)](https://www.buymeacoffee.com/mrbontor)

---
[Back to top](#nodejs--mongodb-native-driver-pagination)
