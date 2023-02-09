const chai = require('chai');
const expect = chai.expect;
// const chaiaspromise = require('chai-as-promised');
// chai.use(chaiaspromise);

const sinon = require('sinon');

const MongoPagination = require('../../libs/mongoPagination');
const AgregationGenerator = require('../../libs/generateAgregation');
const Validation = require('../../libs/validation');

const mockPagination = {
    sort: { updatedAt: 'ASC' },
    page: 1,
    size: 10,
    totalRecord: 0,
    totalPage: 0,
    data: []
};

describe('Mongodb Pagination', () => {
    let mongoConfig = {
        client: (client) => (
            con,
            (db) => {
                db(true);
            }
        ),
        collection: 'user'
    };

    let fieldSearch = ['first_name', 'last_name', 'email', 'gender', 'countryId', 'status'];
    let aggregation = [
        {
            collectionName: 'country',
            uniqueId: 'countryId'
        }
    ];

    let validatationStub, agregationGeneratorStub, mongoPagination, pagination;

    beforeEach(async () => {
        mongoPagination = sinon.stub(MongoPagination, 'buildPagination');
        validatationStub = sinon.stub(Validation, 'ValidateMongoQuery');
        agregationGeneratorStub = sinon.stub(AgregationGenerator, 'QueryAgregation');
    });

    afterEach(() => {
        mongoPagination.restore();
        validatationStub.restore();
        agregationGeneratorStub.restore();
    });

    describe('Mongodb Pagination Result', () => {
        it('Should return true with the following format', async () => {
            mongoPagination.returns(mockPagination);
            validatationStub.returns(true);
            agregationGeneratorStub.returns(true);

            pagination = await MongoPagination.buildPagination(mongoConfig, {}, fieldSearch, null, aggregation);

            expect(pagination).to.have.property('sort');
            expect(pagination).to.have.property('page');
            expect(pagination).to.have.property('size');
            expect(pagination).to.have.property('totalRecord');
            expect(pagination).to.have.property('data');
        });
    });
});
