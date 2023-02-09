const chai = require('chai');
const expect = chai.expect;

const AgregationGenerator = require('../../libs/generateAgregation');

describe('Generate Agregation', () => {
    describe('Generator Query Agregation', () => {
        let queryAgregate = [
            {
                collectionName: 'country',
                uniqueId: 'countryId'
            }
        ];

        it('Should return true with the following format', () => {
            let response = AgregationGenerator.QueryAgregation(queryAgregate);

            expect(response).to.length(2);
            expect(response[0]).to.have.property('$lookup');
            expect(response[0]['$lookup']).to.have.property('from').equal('country');
            expect(response[0]['$lookup']).to.have.property('as').equal('countryId');
            expect(response[1]).to.have.property('$unwind');
        });
    });

    it('Should return error if there is no params aggregation query ', () => {
        try {
            AgregationGenerator.QueryAgregation();
        } catch (error) {
            expect(error.message).to.equal('Agregation query is not initiated!');
        }
    });

    it('Should return error if the params Object is not competible ', () => {
        try {
            AgregationGenerator.QueryAgregation([
                {
                    uniqueId: 'countryId'
                }
            ]);
        } catch (error) {
            expect(error.message).to.equal('Agregation query must have property `collectionName` and `uniqueId`');
        }
    });
});
