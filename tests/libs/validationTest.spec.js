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

        it('Should return true ', () => {
            queryAgregate[0].collectionName = 'test';
            let valid = Validation.ValidateAggregation();
            expect(valid).to.be.true;
        });

        it('Should return error if there is no params aggregation query ', () => {
            try {
                Validation.ValidateAggregation();
            } catch (error) {
                expect(error.message).to.equal(
                    `Aggregation query must have properties 'collectionName' and 'uniqueId'`
                );
            }
        });

        it('Should return error if the params Object of aggregation is not competible ', () => {
            try {
                Validation.ValidateAggregation(queryAgregate);
            } catch (error) {
                expect(error.message).to.equal(
                    `Aggregation query must have properties 'collectionName' and 'uniqueId'`
                );
            }
        });

        it('Should return error if the params Object of aggregation is not competible ', () => {
            try {
                Validation.ValidateAggregation([{ collectionName: 'test' } ]);
            } catch (error) {
                expect(error.message).to.equal(
                    `Aggregation query must have properties 'collectionName' and 'uniqueId'`
                );
            }
        });

        it('Should return error if one on more of key of aggregation are unknow', () => {
            try {
                Validation.ValidateAggregation([{ collectionName: 'test', uniqueId: 'test', aigo: 'bad' } ]);
            } catch (error) {
                expect(error.message).to.equal(
                    `Aggregation item at index 0 contains an invalid property: aigo`
                );
            }
        });

        it('Should return error if one on more of key of aggregation are unknow', () => {
            try {
                Validation.ValidateAggregation([{ collectionName: 'test', uniqueId: 'test', subSearch: 1 } ]);
            } catch (error) {
                expect(error.message).to.equal(`subSearch must be a string`);
            }
        });

        it('Should return error if one on more of key of aggregation are unknow', () => {
            try {
                Validation.ValidateAggregation([{ collectionName: 'test', uniqueId: 'test', subSearch: 'test', fieldToSearch: 'test' } ]);
            } catch (error) {
                expect(error.message).to.equal(`fieldToSearch must be an array`);
            }
        });
    });
});
