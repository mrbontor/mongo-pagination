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
     * @Object mongo.client = mongo connection
     * @Object mongo.collection = collection name
     */
    ValidateMongoQuery: (mongo) => {
        if (typeof mongo === undefined) throw new Error('Mongo must be defined!');
        if (typeof mongo.client === undefined) throw new Error('Mongo Client must be defined!');
        if (typeof mongo.collection === undefined) throw new Error('Collection Name must be defined');
    },

    /**
     *
     * @param {Array} array - an array object with key `client` and `collection`
     * @field client = mongo connection
     * @field collection = collection name
     * @field projection
     */
    ValidateAgregation: (array) => {
        if (array.length > 0) {
            const isValidKeys = array.every((item) => item.collectionName && item.uniqueId);
            if (!isValidKeys) {
                throw new Error('Agregation query must have property `collectionName and uniqueId');
            }

            // const isObjectId = array.every((item) => validation.ObjectId(item.uniqueId));
            // if (!isObjectId) {
            //     throw new Error('Unique Id should be in format ObjectId');
            // }
        }
    }
};

module.exports = validation;