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

let req = {
    params: {
        packageName: 'JELLYFISH'
    }
};
//new mongoFactory.MongoFactory().GetPackage(req, 'ff');
new sqlFactory.SqlFactory().DeletePackage(req, 'ff');

module.exports.BackendFactory = BackendFactory;