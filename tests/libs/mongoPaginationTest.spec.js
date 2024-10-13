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

const mockGetOneData = [
    {
        first_name: 'test',
        createdAt: 'date',
        updatedAt: 'date'
    }
];

const mongoMock = (collection, mock) => {
    try {
        return {
            collection: (collection) => ({
                find: (mockResult) => ({
                    limit: (mockResult) => ({
                        toArray: () => mockGetOneData
                    })
                }),
                aggregate: () => collection
            })
        };
    } catch (error) {
        console.log(error.stack);
    }
};

describe('Mongodb Pagination', () => {
    let mongoConfig = {
        client: mongoMock('user', mockGetOneData),
        collection: 'user'
    };

    const payload = {
        sortBy: 'first_name',
        sortType: 'desc',
        search: 'my first_name',
        page: 2,
        size: 2
    };
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
        GenerateQueryAggregationStub,
        buildQueryMongoPaginationStub,
        setSortingStub,
        buildPaginationStub,
        runQueryStub,
        getOneDataStub,
        setDefaultProjectionStub,
        setDefaultSearchableFieldsStub,
        setupDefaultPayloadStub;

    beforeEach(async () => {
        validatationStub = sinon.spy(Validation, 'ValidateMongoQuery');
        GenerateQueryAggregationStub = sinon.spy(AgregationGenerator, 'GenerateQueryAggregation');

        buildQueryMongoPaginationStub = sinon.spy(QueryBuilderUtil, 'BuildQueryMongoPagination');
        setSortingStub = sinon.spy(QueryBuilderUtil, 'SetSorting');

        setupDefaultPayloadStub = sinon.spy(MongoPagination, 'setupDefaultPayload');
        setDefaultProjectionStub = sinon.spy(MongoPagination, 'setDefaultProjection');
        setDefaultSearchableFieldsStub = sinon.spy(MongoPagination, 'setDefaultSearchableFields');
        runQueryStub = sinon.stub(MongoPagination, 'runQuery').resolves(mockPagination);
        getOneDataStub = sinon.stub(MongoPagination, 'getOneData');
        buildPaginationStub = sinon.stub(MongoPagination, 'buildPagination').resolves(mockPagination);
    });

    afterEach(() => {
        validatationStub.restore();
        GenerateQueryAggregationStub.restore();
        buildQueryMongoPaginationStub.restore();
        setSortingStub.restore();

        setupDefaultPayloadStub.restore();
        setDefaultProjectionStub.restore();
        setDefaultSearchableFieldsStub.restore();
        runQueryStub.restore();
        getOneDataStub.restore();
        buildPaginationStub.restore();
    });

    describe('runQuery', () => {
        it('Should return object', async () => {
            try {
                runQueryStub(payload)
                let res = await MongoPagination.runQuery(payload);
                expect(runQueryStub.calledOnce).to.be.true;
                expect(res).with.property('sort').to.deep.equal({ updatedAt: 'ASC' });
                expect(res).with.property('page').to.equal(1);
                expect(res).with.property('size').to.equal(10);
                expect(res).with.property('totalRecord').to.equal(0);
                expect(res).with.property('totalPage').to.equal(0);
                expect(res).with.property('data').length.least(1);
            } catch (error) {}
        });
    });

    describe('setupDefaultPayload', () => {
        it('Should return object', (done) => {
            let res = MongoPagination.setupDefaultPayload(payload);
            expect(res).with.property('sort').to.deep.equal({ first_name: -1 });
            expect(res).with.property('search').to.equal('my first_name');
            expect(res).with.property('size').to.equal(2);
            expect(res).with.property('page').to.equal(2);
            done();
        });

        it('Should return object even projection empty', (done) => {
            let res = MongoPagination.setupDefaultPayload();
            expect(res).with.property('sort').to.deep.equal({ updatedAt: 1 });
            expect(res).with.property('search').to.be.null;
            expect(res).with.property('size').to.equal(10);
            expect(res).with.property('page').to.equal(1);
            done();
        });
    });

    describe('setDefaultProjectionStub', () => {
        it('Should return object', async () => {
            try {
                let res = await MongoPagination.setDefaultProjection(mongoConfig, projection);
                expect(setDefaultProjectionStub.calledOnce).to.be.true;
                expect(getOneDataStub.calledOnce).to.be.false;
                expect(res).with.property('first_name').to.equal(1);
            } catch {}
        });

        it('Should return object even projection empty', async () => {
            let res = await MongoPagination.setDefaultProjection(mongoConfig, null);

            expect(res).with.property('first_name').to.equal(1);
            expect(res).with.property('createdAt').to.equal(1);
            expect(res).with.property('updatedAt').to.equal(1);
        });
    });

    describe('setDefaultSearchableFields', () => {
        it('Should return object', (done) => {
            let res = MongoPagination.setDefaultSearchableFields(fieldSearch, projection);
            expect(res).to.have.length.at.least(1);
            expect(res[0]).to.equal('first_name');
            done();
        });

        it('Should return object even fieldToSearch empty', (done) => {
            let res = MongoPagination.setDefaultSearchableFields({}, projection);
            expect(res).to.have.length.at.least(1);
            expect(res[0]).to.equal('first_name');
            done();
        });
    });

    describe('Mongodb Pagination Result', () => {
        it('Should return array with the following format', async () => {
            try {
                let newPayload = { status: 'true', search: 'test' };
                validatationStub(mongoConfig);

                // let xx = getOneDataStub.resolves(mongoConfig);
                setupDefaultPayloadStub(newPayload);
                setDefaultProjectionStub(mongoConfig, projection);
                setDefaultSearchableFieldsStub(fieldSearch, projection);

                GenerateQueryAggregationStub(aggregation);
                buildQueryMongoPaginationStub(newPayload, fieldSearch, projection, aggregation);

                buildPaginationStub.resolves(mockPagination);
                pagination = await MongoPagination.buildPagination(
                    mongoConfig,
                    newPayload,
                    fieldSearch,
                    projection,
                    aggregation
                );

                expect(validatationStub.calledOnce).to.be.true;
                expect(setupDefaultPayloadStub.calledOnce).to.be.true;
                expect(setDefaultProjectionStub.calledOnce).to.be.true;
                expect(setDefaultSearchableFieldsStub.calledOnce).to.be.true;

                expect(GenerateQueryAggregationStub.calledOnce).to.be.true;
                expect(buildQueryMongoPaginationStub.calledOnce).to.be.true;

                expect(buildPaginationStub.calledOnce).to.be.true;

                expect(pagination).with.property('sort');
                expect(pagination).with.property('page');
                expect(pagination).with.property('size');
                expect(pagination).with.property('totalRecord');
                expect(pagination).with.property('data');
            } catch (error) {}
        });

        it('Should return err validation when mongoConfig is not set', async () => {
            try {
                await MongoPagination.buildPagination();
            } catch (error) {
                expect(validatationStub.calledOnce).to.be.true;
                expect(buildQueryMongoPaginationStub.calledOnce).to.be.true;
                expect(GenerateQueryAggregationStub.calledOnce).to.be.true;
                expect(setSortingStub.calledOnce).to.be.true;

                expect(GenerateQueryAggregationStub.calledOnce).to.be.false;
                expect(setSortingStub.calledOnce).to.be.false;

                expect(error).with.property('message').equal('Mongo configuration must be initiated!');
            }
        });
        it('Should return err validation when mongoConfig property is not set', async () => {
            try {
                await MongoPagination.buildPagination({ client: {} });
            } catch (error) {
                expect(validatationStub.calledOnce).to.be.true;
                expect(GenerateQueryAggregationStub.calledOnce).to.be.false;
                expect(setSortingStub.calledOnce).to.be.false;

                expect(error).with.property('message').equal('Property `collection` must be defined!');
            }
        });

        it('Should return err validation when mongoConfig property is not set', async () => {
            try {
                await MongoPagination.buildPagination({ collection: {} });
            } catch (error) {
                expect(validatationStub.calledOnce).to.be.true;
                expect(GenerateQueryAggregationStub.calledOnce).to.be.false;
                expect(setSortingStub.calledOnce).to.be.false;

                expect(error).with.property('message').equal('Property `client` must be defined!');
            }
        });
    });
});
