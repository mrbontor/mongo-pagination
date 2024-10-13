const chai = require('chai');
const expect = chai.expect;

const { GenerateQueryAggregation } = require('../../libs/generateAgregation');

const queryAggregation = [
    {
        collectionName: 'country',
        uniqueId: 'countryId'
    }
];

describe('Generate Agregation', () => {
    describe('Generator Query Agregation', () => {
        it('Should return true with the following format', () => {
            let response = GenerateQueryAggregation(queryAggregation);

            expect(response).to.length(2);
            expect(response[0]).with.property('$lookup');
            expect(response[0]['$lookup']).with.property('from').equal('country');
            expect(response[0]['$lookup']).with.property('as').equal('countryId');
            expect(response[1]).with.property('$unwind');
        });
    });
    /**
     * This is may be happen, an error(TypeError), but this funtion won't be executed if the paramter empty
     */
    it('Should return error if there is no params aggregation query ', () => {
        try {
            GenerateQueryAggregation();
        } catch (error) {
            expect(error.message).to.equal(`Cannot read property 'map' of undefined`);
        }
    });

    it('Should return error if the params Object is not competible ', () => {
        try {
            GenerateQueryAggregation([
                {
                    uniqueId: 'countryId'
                }
            ]);
        } catch (error) {
            expect(error.message).to.equal(`Aggregation query must have properties 'collectionName' and 'uniqueId'`);
        }
    });

    it('Should return error if the params Object is not competible ', () => {
        try {
            GenerateQueryAggregation([
                {
                    collectionName: 'test'
                }
            ]);
        } catch (error) {
            expect(error.message).to.equal(`Aggregation query must have properties 'collectionName' and 'uniqueId'`);
        }
    });

    it('Should return error if the params subSearch is not string ', () => {
        try {
            queryAggregation[0].subSearch = 1;
            GenerateQueryAggregation(queryAggregation);
        } catch (error) {
            expect(error.message).to.equal(`subSearch must be a string`);
        }
    });

    it('Should return error if the params subSearch is not defined and fieldToSearch is defined', () => {
        try {
            queryAggregation[0].fieldToSearch = 1;
            GenerateQueryAggregation(queryAggregation);
        } catch (error) {
            expect(error.message).to.equal(`subSearch must be a string`);
        }
    });

    it('Should return error if the params subSearch is defined and defining fieldToSearch is not array string', () => {
        try {
            queryAggregation[0].subSearch = 'test';
            queryAggregation[0].fieldToSearch = 1;
            GenerateQueryAggregation(queryAggregation);
        } catch (error) {
            expect(error.message).to.equal(`fieldToSearch must be an array`);
        }
    });

    it('Should return query match when subSearch and fieldToSearch defined correctly', () => {
        const queryAggregationSuccess = [
            {
                collectionName: 'country',
                uniqueId: 'countryId',
                subSearch: 'test',
                fieldToSearch: ['test']
            }
        ];
        const response = GenerateQueryAggregation(queryAggregationSuccess);

        expect(response).to.length.least(1);
        expect(response[0]).with.property('$lookup');
        expect(response[0]['$lookup']).with.property('from').equal('country');
        expect(response[0]['$lookup']).with.property('as').equal('countryId');
        expect(response[1]).with.property('$unwind');
        expect(response[1]['$unwind']).with.property('path').equal('$countryId');
        expect(response[2]).with.property('$match');
        expect(response[2]['$match']).with.property('$or').to.length.least(1);
    });
});
