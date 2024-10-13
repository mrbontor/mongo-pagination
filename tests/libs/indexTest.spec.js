const chai = require('chai');
const expect = chai.expect;

const MP = require('../../libs/');

describe('Mongodb Pagination', () => {
    it('Should return true', () => {
       expect(MP).with.property('buildPagination');
    });
});
