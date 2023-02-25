const chai = require('chai');
const expect = chai.expect;

const { GenerateQueryAgregation } = require('../../libs/generateAgregation');

describe('Generate Agregation', () => {
    describe('Generator Query Agregation', () => {
        let queryAgregate = [
            {
                collectionName: 'country',
                uniqueId: 'countryId'
            }
        ];

        it('Should return true with the following format', () => {
            let response = GenerateQueryAgregation(queryAgregate);

            expect(response).to.length(2);
            expect(response[0]).to.have.property('$lookup');
            expect(response[0]['$lookup']).to.have.property('from').equal('country');
            expect(response[0]['$lookup']).to.have.property('as').equal('countryId');
            expect(response[1]).to.have.property('$unwind');
        });
    });
    /**
     * This is may be happen, an error(TypeError), but this funtion won't be executed if the paramter empty
     */
    it('Should return error if there is no params aggregation query ', () => {
        try {
            GenerateQueryAgregation();
        } catch (error) {
            expect(error.message).to.equal(`Cannot read property 'map' of undefined`);
        }
    });

    it('Should return error if the params Object is not competible ', () => {
        try {
            GenerateQueryAgregation([
                {
                    uniqueId: 'countryId'
                }
            ]);
        } catch (error) {
            expect(error.message).to.equal('Agregation query must have property `collectionName` and `uniqueId`');
        }
    });

    it('Should return error if the params Object is not competible ', () => {
        try {
            GenerateQueryAgregation([
                {
                    collectionName: 'test'
                }
            ]);
        } catch (error) {
            expect(error.message).to.equal('Agregation query must have property `collectionName` and `uniqueId`');
        }
    });
});
