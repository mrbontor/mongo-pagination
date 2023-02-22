const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const MongoPagination = require('../../libs/mongoPagination');
const AgregationGenerator = require('../../libs/generateAgregation');
const Validation = require('../../libs/validation');
const QueryBuilderUtil = require('../../libs/queryBuilder');

const mockPagination = {
    sort: { updatedAt: 'ASC' },
    page: 1,
    size: 10,
    totalRecord: 0,
    totalPage: 0,
    data: [{ test: 1 }]
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

    const payload = {};
    const projection = { first_name: 1 };

    let fieldSearch = ['first_name'];
    let aggregation = [
        {
            collectionName: 'country',
            uniqueId: 'countryId'
        }
    ];

    let pagination,
        validatationStub,
        agregationGeneratorStub,
        buildQueryMongoPaginationStub,
        getSortingStub,
        buildPaginationStub;

    beforeEach(async () => {
        validatationStub = sinon.spy(Validation, 'ValidateMongoQuery');
        agregationGeneratorStub = sinon.spy(AgregationGenerator, 'QueryAgregation');
        buildQueryMongoPaginationStub = sinon.spy(QueryBuilderUtil, 'BuildQueryMongoPagination');
        getSortingStub = sinon.spy(QueryBuilderUtil, 'GetSorting');
        buildPaginationStub = sinon.stub(MongoPagination, 'buildPagination').resolves(mockPagination);
    });

    afterEach(() => {
        validatationStub.restore();
        agregationGeneratorStub.restore();
        buildQueryMongoPaginationStub.restore();
        getSortingStub.restore();
        buildPaginationStub.restore();
    });

    describe('Mongodb Pagination Result', () => {
        it('Should return array with the following format', async () => {
            try {
                let newPayload = { status: 'true', search: 'test' };

                validatationStub(mongoConfig);
                buildQueryMongoPaginationStub(newPayload, fieldSearch, projection, aggregation);
                agregationGeneratorStub(aggregation);
                getSortingStub(newPayload);

                pagination = await MongoPagination.buildPagination(
                    mongoConfig,
                    newPayload,
                    fieldSearch,
                    projection,
                    aggregation
                );

                expect(buildPaginationStub.calledOnce).to.be.true;
                expect(validatationStub.calledOnce).to.be.true;
                expect(buildQueryMongoPaginationStub.calledOnce).to.be.true;
                expect(agregationGeneratorStub.calledOnce).to.be.true;
                expect(getSortingStub.calledOnce).to.be.true;

                expect(pagination).to.have.property('sort');
                expect(pagination).to.have.property('page');
                expect(pagination).to.have.property('size');
                expect(pagination).to.have.property('totalRecord');
                expect(pagination).to.have.property('data');
            } catch (error) {}
        });

        it('Should return err validation when mongoConfig is not set', async () => {
            try {
                await MongoPagination.buildPagination();
            } catch (error) {
                expect(validatationStub.calledOnce).to.be.true;
                expect(agregationGeneratorStub.calledOnce).to.be.false;
                expect(getSortingStub.calledOnce).to.be.false;

                expect(error).to.have.property('message').equal('Mongo configuration must be initiated!');
            }
        });
        it('Should return err validation when mongoConfig property is not set', async () => {
            try {
                await MongoPagination.buildPagination({ client: {} });
            } catch (error) {
                expect(validatationStub.calledOnce).to.be.true;
                expect(agregationGeneratorStub.calledOnce).to.be.false;
                expect(getSortingStub.calledOnce).to.be.false;

                expect(error).to.have.property('message').equal('Property `collection` must be defined!');
            }
        });

        it('Should return err validation when mongoConfig property is not set', async () => {
            try {
                await MongoPagination.buildPagination({ collection: {} });
            } catch (error) {
                expect(validatationStub.calledOnce).to.be.true;
                expect(agregationGeneratorStub.calledOnce).to.be.false;
                expect(getSortingStub.calledOnce).to.be.false;

                expect(error).to.have.property('message').equal('Property `client` must be defined!');
            }
        });
    });
});
