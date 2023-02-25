const validation = {
    /**
     *
     * @param {ObjectId} ObjectId
     * @returns String
     */
    ObjectId: (ObjectId) => {
        const regex = /^[0-9a-fA-F]{24}$/;

        return regex.test(ObjectId);
    },

    /**
     *
     * @param {Object} mongo
     * @param {void} mongo.client = mongo connection
     * @param {string} mongo.collection = collection name
     */
    ValidateMongoQuery: (mongo) => {
        if (typeof mongo === 'undefined') throw new Error('Mongo configuration must be initiated!');
        if (typeof mongo.client === 'undefined') throw new Error('Property `client` must be defined!');
        if (typeof mongo.collection === 'undefined') throw new Error('Property `collection` must be defined!');

        return true;
    },

    /**
     * Validate payload aggregation
     * @param {Array<{collectionName: string, uniqueId:string}>} array
     * @returns
     */
    ValidateAgregation: (array) => {
        if (typeof array !== 'undefined' && array.length > 0) {
            const isValidKeys = array.every((item) => item.collectionName && item.uniqueId);
            if (!isValidKeys) {
                throw new Error('Agregation query must have property `collectionName` and `uniqueId`');
            }
            return true;
            // const isObjectId = array.every((item) => validation.ObjectId(item.uniqueId));
            // if (!isObjectId) {
            //     throw new Error('Unique Id should be in format ObjectId');
            // }
        }
        return true;
    }
};

module.exports = validation;
