# MongoDb Pagination

## About

MongoDb Pagination is a library to handle pagination data

## Compatibility

this module supports and is tested against:
- mongodb 3+ - lastest


## Features

- multiple aggregation/join
- multiple fields search value
- multiple filter fields
- pagination

## Documentation

The function using `async` function

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

___Description___

this module needs 5 `Object` params:
- `mongoConfig`, is an `Object` that must contains keys `client` and main `collectionName`. this is used to declare mongodb client connection as injection
- `payload`, is an `Object` to do operation such as `search` and `filter`
- `fieldSearch`, is an `Array` contains fields to allowed using `filter` and/or `search`
- `projection`, is an `Object` to filter ouput from main collection
- `aggregation`, is Array Object to `JOIN` collection by using foreign key with `ObjectId`

__mongoConfig__

 is an `Object` that must contains keys `client` and main `collectionName`. this is used to declare mongodb client connection as injection
 
 example: 
 ```js
    const mongoConfig = {
        client: client.db('databaseName'),
        collection: 'user'
    };
 ```
__payload__
 
 this module allows to use POST,GET, etc. so it can be used depending on which one you are comfortable using
 Payload is an `Object` and its `optional` but have to set `null` or `{}` if there is no User's query.
 payload will look for fields inside `fieldSearch` using param `search`
 
 example: 
 ```js
    const payload = {
        search: 'my first_name'
    }
 ```

__fieldSearch__
 
 use this to contain any field to would be able to search in an Array.

 example: 
 ```js
    const fieldSearch = ['first_name', 'last_name', 'email', 'countryId']
 ```

 __projection__
 
 this is an `Object` to filter the output from parent `collection`. 
 - if no filter, set it to `null`
 - if there are fields that need to be hiddden, use this 

 example with filter: 
 ```js
    const fieldSearch = {first_name: 1, last_name: 1, email: 1, countryId: 1}
 ```

  __aggregation__
 
 this is an `Object` to join `collections`.

 example with filter: 
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

there is an example with `live database` in folder [example](./example`)

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

#### example output without agregation

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
- allow to use `projection` when join collection

## Tests
coming in... [example](./example`)

## Contributing

1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request :D


## License

[MIT Licence](./LICENSE)


---
[Back to top](#MongoDbPagination)