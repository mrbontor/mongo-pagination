const chai = require('chai');
const expect = chai.expect;

const Validation = require('../../libs/validation');

describe('Validation', () => {
    describe('Validate ObjectId', () => {
        it('Should return true', () => {
            const id = Validation.ObjectId('63df5fb20a6799aeaf22f724');
            expect(id).to.be.true;
        });

        it('Should return false', () => {
            const id = Validation.ObjectId('1');
            expect(id).to.be.false;
        });
    });

    describe('Validate MongoQuery', () => {
        let mongoConfig = {
            client: 'test',
            collection: 'test-juga'
        };

        it('Should return true', () => {
            let valid = Validation.ValidateMongoQuery(mongoConfig);
            expect(valid).to.be.true;
        });

        it('Should return error when no params Object', () => {
            try {
                Validation.ValidateMongoQuery();
            } catch (error) {
                expect(error.message).to.equal('Mongo configuration must be initiated!');
            }
        });

        it('Should return error when no property client', () => {
            try {
                delete mongoConfig.client;
                Validation.ValidateMongoQuery(mongoConfig);
            } catch (error) {
                expect(error.message).to.equal('Property `client` must be defined!');
            }
        });

        it('Should return error when no property collection', () => {
            try {
                mongoConfig.client = test;
                delete mongoConfig.collection;
                Validation.ValidateMongoQuery(mongoConfig);
            } catch (error) {
                expect(error.message).to.equal('Property `collection` must be defined!');
            }
        });
    });

    describe('Validate QueryAgregation', () => {
        let queryAgregate = [
            {
                uniqueId: 'countryId'
            }
        ];

        it('Should return error if there is no params aggregation query ', () => {
            try {
                Validation.ValidateAgregation();
            } catch (error) {
                expect(error.message).to.equal('Agregation query is not initiated!');
            }
        });

        it('Should return error if the params Object is not competible ', () => {
            try {
                Validation.ValidateAgregation(queryAgregate);
            } catch (error) {
                expect(error.message).to.equal('Agregation query must have property `collectionName` and `uniqueId`');
            }
        });
    });
});
