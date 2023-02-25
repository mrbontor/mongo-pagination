const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const QueryBuilderUtil = require('../../libs/queryBuilder');

const mockQueryPagination1 = [
    { $match: { $or: [{ first_name: { $options: 'i', $regex: 'test' } }], status: { $in: ['true'] } } },
    { collectionName: 'country', uniqueId: 'countryId' },
    { $sort: { updatedAt: 1 } },
    { $skip: 0 },
    { $limit: 10 },
    { $project: { first_name: 1 } }
];

const mockQueryPagination2 = [
    { $match: { $or: [{ first_name: { $options: 'i', $regex: 'test' } }], status: { $in: [true] } } },
    { collectionName: 'country', uniqueId: 'countryId' },
    { $sort: { updatedAt: 1 } },
    { $skip: 0 },
    { $limit: 10 },
    { $project: { first_name: 1 } }
];

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

    let getTypeSortStub, setSortingStub, fieldsSearchStub, handleFieldBooleanStub, toLowerCaseStringStub;

    beforeEach(async () => {
        toLowerCaseStringStub = sinon.spy(QueryBuilderUtil, 'ToLowerCaseString');
        getTypeSortStub = sinon.spy(QueryBuilderUtil, 'GetTypeSort');
        setSortingStub = sinon.spy(QueryBuilderUtil, 'SetSorting');
        fieldsSearchStub = sinon.spy(QueryBuilderUtil, 'HandleFieldSearch');
        handleFieldBooleanStub = sinon.spy(QueryBuilderUtil, 'HandleFieldBoolean');
    });

    afterEach(() => {
        toLowerCaseStringStub.restore();
        getTypeSortStub.restore();
        setSortingStub.restore();
        fieldsSearchStub.restore();
        handleFieldBooleanStub.restore();
    });

    describe('ToLowerCaseStringStub', () => {
        it('Should return lower case letter', (done) => {
            expect(QueryBuilderUtil.ToLowerCaseString('XXX')).to.equal('xxx');
            done();
        });
        it('Should return string with param number ', (done) => {
            expect(QueryBuilderUtil.ToLowerCaseString(1)).to.equal('1');
            done();
        });
        it('Should return string with param number string', (done) => {
            expect(QueryBuilderUtil.ToLowerCaseString('1')).to.equal('1');
            done();
        });
    });

    describe('GetTypeSort', () => {
        it('Should return -1', (done) => {
            toLowerCaseStringStub('-1');
            let res = QueryBuilderUtil.GetTypeSort('-1');

            expect(toLowerCaseStringStub.calledOnce).to.be.true;
            expect(res).to.equal(-1);
            done();
        });
        it('Should return 1', (done) => {
            toLowerCaseStringStub('1');
            let res = QueryBuilderUtil.GetTypeSort('1');

            expect(toLowerCaseStringStub.calledOnce).to.be.true;
            expect(res).to.equal(1);
            done();
        });
        it('Should return -1', (done) => {
            toLowerCaseStringStub('desc');
            let res = QueryBuilderUtil.GetTypeSort('desc');

            expect(toLowerCaseStringStub.calledOnce).to.be.true;
            expect(res).to.equal(-1);
            done();
        });
        it('Should return 1', (done) => {
            toLowerCaseStringStub('asc');
            let res = QueryBuilderUtil.GetTypeSort('asc');

            expect(toLowerCaseStringStub.calledOnce).to.be.true;
            expect(res).to.equal(1);
            done();
        });
        it('Should return 1 as default', (done) => {
            toLowerCaseStringStub('xxx');
            let res = QueryBuilderUtil.GetTypeSort('xxx');

            expect(toLowerCaseStringStub.calledOnce).to.be.true;
            expect(res).to.equal(1);
            done();
        });
        it('Should return 1 even param is Captial lettter', (done) => {
            toLowerCaseStringStub('XXX');
            let res = QueryBuilderUtil.GetTypeSort('XXX');

            expect(toLowerCaseStringStub.calledOnce).to.be.true;
            expect(res).to.equal(1);
            done();
        });

        it('Should return 1 even param is Captial lettter', (done) => {
            let res = QueryBuilderUtil.GetTypeSort();

            expect(toLowerCaseStringStub.calledOnce).to.be.false;
            expect(res).to.equal(1);
            done();
        });
    });

    describe('SetSorting', () => {
        let sorter = { sortType: 'desc', sortBy: 'name' };
        it('Should return an obejct sort following the parameter', (done) => {
            const setSorting = QueryBuilderUtil.SetSorting(sorter);
            getTypeSortStub(sorter);

            expect(getTypeSortStub.calledOnce).to.be.true;
            expect(setSorting).to.have.property('name').to.equal(-1);
            done();
        });

        it('Should return default obejct sort By updatedAt ASC without parameter', (done) => {
            const setSorting = QueryBuilderUtil.SetSorting();

            expect(setSorting).to.have.property('updatedAt').to.equal(1);
            expect(getTypeSortStub.calledOnce).to.be.false;
            done();
        });
    });

    describe('fieldsSearch', () => {
        let searchAble = ['name'];
        it('Should return query Mongo seearh `like` in array format', (done) => {
            const search = QueryBuilderUtil.HandleFieldSearch(payload, searchAble, projection);
            expect(search).to.have.length.at.least(1);
            expect(search[0]).to.have.property('name');
            done();
        });

        it('Should return array', (done) => {
            const search = QueryBuilderUtil.HandleFieldSearch(payload, []);
            expect(search).to.have.length(0);
            done();
        });

        /**
         * There might be an error(TypeError), but this funtion won't be executed if the paramter empty
         */
    });

    describe('handleFieldBoolean', () => {
        it('Should return an array when value param search is string', (done) => {
            const boolValue = QueryBuilderUtil.HandleFieldBoolean({ status: 'true, false' });

            expect(boolValue).to.have.property('status');
            expect(boolValue.status).to.have.property('$in');
            expect(boolValue.status['$in']).to.have.length.at.least(1);
            done();
        });

        it('Should return an array when param value param search is object/boolean', (done) => {
            const boolValue = QueryBuilderUtil.HandleFieldBoolean({ status: true });

            expect(boolValue).to.have.property('status');
            expect(boolValue.status).to.have.property('$in');
            expect(boolValue.status['$in']).to.have.length.at.least(1);
            done();
        });

        it('Should return null if no param suplied', (done) => {
            const boolValue = QueryBuilderUtil.HandleFieldBoolean();
            expect(boolValue).to.be.null;
            done();
        });

        it('Should return null if param is empty onject', (done) => {
            const boolValue = QueryBuilderUtil.HandleFieldBoolean({});
            expect(boolValue).to.be.null;
            done();
        });
    });

    describe('buildQueryQueryBuilderUtil', () => {
        it('Should be success and return array', (done) => {
            let newPayload = { status: 'true', search: 'test' };
            setSortingStub(newPayload);
            handleFieldBooleanStub(newPayload);
            fieldsSearchStub(newPayload.search, fieldSearch);

            const query = QueryBuilderUtil.BuildQueryMongoPagination(newPayload, fieldSearch, projection, aggregation);

            expect(setSortingStub.calledOnce).to.be.true;
            expect(handleFieldBooleanStub.calledOnce).to.be.true;
            expect(fieldsSearchStub.calledOnce).to.be.true;

            expect(query).to.have.length.at.least(4);
            expect(query).to.deep.include(mockQueryPagination1[0]);
            done();
        });

        it('Should be success and return array even if payload contains status boolean', (done) => {
            let newPayload = { status: true, search: 'test' };
            setSortingStub(newPayload);
            handleFieldBooleanStub(newPayload);
            fieldsSearchStub(newPayload.search, fieldSearch);

            const query = QueryBuilderUtil.BuildQueryMongoPagination(newPayload, fieldSearch, projection, aggregation);

            expect(setSortingStub.calledOnce).to.be.true;
            expect(handleFieldBooleanStub.calledOnce).to.be.true;
            expect(fieldsSearchStub.calledOnce).to.be.true;

            expect(query).to.have.length.at.least(4);
            expect(query).to.deep.include(mockQueryPagination2[0]);
            done();
        });

        it('Should be success and return an array without param filtering => $match', (done) => {
            let newPayload = { search: 'test' };

            setSortingStub(newPayload);
            handleFieldBooleanStub(newPayload);
            fieldsSearchStub(newPayload.search, fieldSearch);

            const query = QueryBuilderUtil.BuildQueryMongoPagination(
                { newPayload },
                fieldSearch,
                projection,
                aggregation
            );

            expect(setSortingStub.calledOnce).to.be.true;
            expect(handleFieldBooleanStub.calledOnce).to.be.true;
            expect(fieldsSearchStub.calledOnce).to.be.true;

            expect(query).to.have.length.at.least(4);
            expect(query).to.deep.include(
                { $match: {} },
                { collectionName: 'country', uniqueId: 'countryId' },
                { $sort: { updatedAt: 1 } },
                { $skip: 0 },
                { $limit: 10 },
                { $project: { first_name: 1 } }
            );
            done();
        });

        it('Should be success and return an array without param aggregation', (done) => {
            let newPayload = { search: 'test' };

            setSortingStub(newPayload);
            handleFieldBooleanStub(newPayload);
            fieldsSearchStub(newPayload.search, fieldSearch);

            const query = QueryBuilderUtil.BuildQueryMongoPagination({ newPayload }, fieldSearch, projection, []);

            expect(setSortingStub.calledOnce).to.be.true;
            expect(handleFieldBooleanStub.calledOnce).to.be.true;
            expect(fieldsSearchStub.calledOnce).to.be.true;

            expect(query).to.have.length.at.least(4);
            expect(query).to.deep.include(
                { $match: {} },
                { $sort: { updatedAt: 1 } },
                { $skip: 0 },
                { $limit: 10 },
                { $project: { first_name: 1 } }
            );
            done();
        });

        it('Should be success and return an array without param aggregation and projection', (done) => {
            let newPayload = { search: 'test' };

            setSortingStub(newPayload);
            handleFieldBooleanStub(newPayload);
            fieldsSearchStub(newPayload.search, fieldSearch);

            const query = QueryBuilderUtil.BuildQueryMongoPagination({ newPayload }, fieldSearch, {}, []);

            expect(setSortingStub.calledOnce).to.be.true;
            expect(handleFieldBooleanStub.calledOnce).to.be.true;
            expect(fieldsSearchStub.calledOnce).to.be.true;

            expect(query).to.have.length.at.least(4);
            expect(query).to.deep.include({ $match: {} }, { $sort: { updatedAt: 1 } }, { $skip: 0 }, { $limit: 10 });
            done();
        });

        it('Should be success and return an array with projection suplied and without aggregation', (done) => {
            let newPayload = { search: 'test' };

            setSortingStub(newPayload);
            handleFieldBooleanStub(newPayload);
            fieldsSearchStub(newPayload.search, fieldSearch);

            const query = QueryBuilderUtil.BuildQueryMongoPagination({ newPayload }, fieldSearch, projection, []);

            expect(setSortingStub.calledOnce).to.be.true;
            expect(handleFieldBooleanStub.calledOnce).to.be.true;
            expect(fieldsSearchStub.calledOnce).to.be.true;

            expect(query).to.have.length.at.least(4);
            expect(query).to.deep.include(
                { $match: {} },
                { $sort: { updatedAt: 1 } },
                { $skip: 0 },
                { $limit: 10 },
                { $project: { first_name: 1 } }
            );
            done();
        });

        /**
         * There might be an error(TypeError), but this funtion won't be executed if the paramter empty
         */
        it('Should thrown error', (done) => {
            try {
                QueryBuilderUtil.BuildQueryMongoPagination({}, [], null, aggregation);
                throw new Error('im error');
            } catch (error) {
                expect(handleFieldBooleanStub.calledOnce).to.be.false;
                expect(setSortingStub.calledOnce).to.be.false;
                expect(fieldsSearchStub.calledOnce).to.be.false;

                expect(error.message).to.equal('im error');
                done();
            }
        });
    });
});
