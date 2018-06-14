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
    body:{
        packageName: 'PUFFER_FISH',
        navigation_type: 'PF',
        price: 1000,
        setup_fee: 300,
        billing_type: 'recurring',
        description: 'puffer fish',
        consoles: ['AGENT_CONSOLE', 'SUPERVISOR_CONSOLE']
    }
};
//new mongoFactory.MongoFactory().GetPackage(req, 'ff');
new sqlFactory.SqlFactory().CreatePackage(req, 'ff');

module.exports.BackendFactory = BackendFactory;