'use strict';

let config = require('config');
let sqlFactory = require('./SqlOperations.js');
let mongoFactory = require('./MongoFactory.js');

class BackendFactory {
    constructor() {
        if(config.BackendFactory === 'RELATIONAL')
        {
            return new sqlFactory.SqlFactory();
        }
        else
        {
            return new mongoFactory.MongoFactory();
        }

    };
}

new sqlFactory().GetPackages('ss', 'ff');

module.exports.BackendFactory = BackendFactory;