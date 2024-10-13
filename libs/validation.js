const Config = require('../configs/index.json');
const validation = {
    /**
     * @param {string} ObjectId
     * @returns {boolean}
     */
    ObjectId: (ObjectId) => /^[0-9a-fA-F]{24}$/.test(ObjectId),

    /**
     * @param {{ client?: any, collection?: string }} mongo
     * @throws {Error}
     * @returns {true}
     */
    ValidateMongoQuery: (mongo) => {
        if (!mongo) throw new Error('Mongo configuration must be initiated!');
        const { client, collection } = mongo;
        if (!client) throw new Error('Property `client` must be defined!');
        if (!collection) throw new Error('Property `collection` must be defined!');
        return true;
    },

    /**
     * Validate payload aggregation
     * @param {Array<Object>} array
     * @throws {Error}
     * @returns {true}
     */
    ValidateAggregation: (array = []) => {
        const aggregationKeys = Config.subCollectionProperties;
        const requiredKeys = Config.subCollectionRequiredProperties;

        array.forEach((item, index) => {
            requiredKeys.forEach((key) => {
                if (!item.hasOwnProperty(key)) {
                    throw new Error(`Aggregation query must have properties 'collectionName' and 'uniqueId'`);
                }
            });
            Object.keys(item).forEach((key) => {
                if (!aggregationKeys.includes(key)) {
                    throw new Error(`Aggregation item at index ${index} contains an invalid property: ${key}`);
                }
            });
            if (item.hasOwnProperty('subSearch') && typeof item.subSearch !== 'string') {
                throw new Error(`subSearch must be a string`);
            }

            if (item.hasOwnProperty('fieldToSearch') && !Array.isArray(item.fieldToSearch)) {
                throw new Error(`fieldToSearch must be an array`);
            }
        });

        return true;
    }
};

module.exports = validation;
