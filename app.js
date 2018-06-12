'use strict';

let restify = require('restify');
let config = require('config');
let mongoose = require('mongoose');
let util = require('util');
let BackendFactory = require('./BackendFactory.js').BackendFactory;

const hostIp = config.Host.vdomain;
const hostPort = config.Host.port;
const hostVersion = config.Host.version;

const server = restify.createServer({
    name: 'DVP-Packages'
});

server.use(restify.CORS());
server.use(restify.fullResponse());
server.pre(restify.pre.userAgentConnection());

restify.CORS.ALLOW_HEADERS.push('authorization');

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


let mongoip=config.Mongo.ip;
const mongoport=config.Mongo.port;
const mongodb=config.Mongo.dbname;
const mongouser=config.Mongo.user;
const mongopass = config.Mongo.password;
const mongoreplicaset= config.Mongo.replicaset;

let connectionstring = '';
mongoip = mongoip.split(',');

if(util.isArray(mongoip)){
    if(mongoip.length > 1){
        mongoip.forEach(function(item){
            connectionstring += util.format('%s:%d,',item,mongoport)
        });

        connectionstring = connectionstring.substring(0, connectionstring.length - 1);
        connectionstring = util.format('mongodb://%s:%s@%s/%s',mongouser,mongopass,connectionstring,mongodb);

        if(mongoreplicaset){
            connectionstring = util.format('%s?replicaSet=%s',connectionstring,mongoreplicaset) ;
        }
    }
    else
    {
        connectionstring = util.format('mongodb://%s:%s@%s:%d/%s',mongouser,mongopass,mongoip[0],mongoport,mongodb);
    }
}else{

    connectionstring = util.format('mongodb://%s:%s@%s:%d/%s',mongouser,mongopass,mongoip,mongoport,mongodb);
}

console.log(connectionstring);
mongoose.connect(connectionstring,{server:{auto_reconnect:true}});


mongoose.connection.on('error', function (err) {
    console.error( new Error(err));
    mongoose.disconnect();

});

mongoose.connection.on('opening', function() {
    console.log("reconnecting... %d", mongoose.connection.readyState);
});


mongoose.connection.on('disconnected', function() {
    console.error( new Error('Could not connect to database'));
    mongoose.connect(connectionstring,{server:{auto_reconnect:true}});
});

mongoose.connection.once('open', function() {
    console.log("Connected to db");

});


mongoose.connection.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});



process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

//API METHODS GO HERE

app.get('/DVP/API/:version/Organisation/Name/:tenant/:company', jwt({secret: secret.Secret}),authorization({resource:"myUserProfile", action:"read"}), organisationService.GetOrganisationName);
app.get('/DVP/API/:version/Organisations', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"read"}), organisationService.GetOrganisations);
app.get('/DVP/API/:version/Organisations/:page/:size', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"read"}), organisationService.GetOrganisationsWithPaging);
app.get('/DVP/API/:version/Organisation', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"read"}), organisationService.GetOrganisation);
app.delete('/DVP/API/:version/Organisation', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"delete"}), organisationService.DeleteOrganisation);
app.put('/DVP/API/:version/Organisation/Activate/:state', jwt({secret: secret.Secret}),authorization({resource:"organisationManage", action:"write"}), organisationService.ActivateOrganisation);

app.get('/DVP/API/:version/Organization/:company/exists', organisationService.IsOrganizationExists);

//app.post('/DVP/API/:version/Organisation/Owner', organisationService.CreateOwner);
app.put('/DVP/API/:version/Organisation', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"write"}), organisationService.UpdateOrganisation);
app.put('/DVP/API/:version/Organisation/Package/:packageName', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"write"}), organisationService.AssignPackageToOrganisation);
app.delete('/DVP/API/:version/Organisation/Package/:packageName', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"write"}), organisationService.RemovePackageFromOrganisation);
app.get('/DVP/API/:version/MyOrganization/mypackages', jwt({secret: secret.Secret}),authorization({resource:"package", action:"read"}), organisationService.GetOrganisationPackages);
app.get('/DVP/API/:version/Organisation/billingInformation', jwt({secret: secret.Secret}),authorization({resource:"package", action:"read"}), organisationService.GetBillingDetails);

app.put('/DVP/API/:version/Organisation/Package/:packageName/Unit/:unitName/:topUpCount', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"write"}), organisationService.AssignPackageUnitToOrganisation);

app.get('/DVP/API/:version/Organisation/SpaceLimit/:spaceType', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"read"}), organisationService.GetSpaceLimit);
app.get('/DVP/API/:version/Organisation/SpaceLimits/:spaceType', jwt({secret: secret.Secret}),authorization({resource:"organisation", action:"read"}), organisationService.GetSpaceLimitForTenant);

app.get('/DVP/API/:version/Resources', jwt({secret: secret.Secret}),authorization({resource:"resource", action:"read"}), resourceService.GetResources);
app.get('/DVP/API/:version/Resource/:resourceName', jwt({secret: secret.Secret}),authorization({resource:"resource", action:"read"}), resourceService.GetResource);
app.delete('/DVP/API/:version/Resource/:resourceName', jwt({secret: secret.Secret}),authorization({resource:"resource", action:"delete"}), resourceService.DeleteResource);
app.post('/DVP/API/:version/Resource', jwt({secret: secret.Secret}),authorization({resource:"resource", action:"write"}), resourceService.CreateResource);
app.put('/DVP/API/:version/Resource/:resourceName', jwt({secret: secret.Secret}),authorization({resource:"resource", action:"write"}), resourceService.UpdateResource);

app.get('/DVP/API/:version/Packages', jwt({secret: secret.Secret}),authorization({resource:"package", action:"read"}), packageService.GetPackages);
app.get('/DVP/API/:version/Package/:packageName', jwt({secret: secret.Secret}),authorization({resource:"package", action:"read"}), packageService.GetPackage);
app.delete('/DVP/API/:version/Package/:packageName', jwt({secret: secret.Secret}),authorization({resource:"package", action:"delete"}), packageService.DeletePackage);
app.post('/DVP/API/:version/Package', jwt({secret: secret.Secret}),authorization({resource:"package", action:"write"}), packageService.CreatePackage);
app.put('/DVP/API/:version/Package/:packageName', jwt({secret: secret.Secret}),authorization({resource:"package", action:"write"}), packageService.UpdatePackage);

app.get('/DVP/API/:version/PackageUnits', jwt({secret: secret.Secret}),authorization({resource:"package", action:"read"}), packageService.GetPackageUnits);
app.get('/DVP/API/:version/PackageUnit/:unitName', jwt({secret: secret.Secret}),authorization({resource:"package", action:"read"}), packageService.GetPackageUnit);
app.delete('/DVP/API/:version/PackageUnit/:unitName', jwt({secret: secret.Secret}),authorization({resource:"package", action:"delete"}), packageService.DeletePackageUnit);
app.post('/DVP/API/:version/PackageUnit', jwt({secret: secret.Secret}),authorization({resource:"package", action:"write"}), packageService.CreatePackageUnit);
app.put('/DVP/API/:version/PackageUnit/:unitName', jwt({secret: secret.Secret}),authorization({resource:"package", action:"write"}), packageService.UpdatePackageUnit);



app.get('/DVP/API/:version/Consoles', jwt({secret: secret.Secret}),authorization({resource:"console", action:"read"}), navigationService.GetAllConsoles);
app.get('/DVP/API/:version/Consoles/:roleType', jwt({secret: secret.Secret}),authorization({resource:"console", action:"read"}), navigationService.GetAllConsolesByUserRole);
app.get('/DVP/API/:version/Console/:consoleName', jwt({secret: secret.Secret}),authorization({resource:"console", action:"read"}), navigationService.GetConsole);
app.delete('/DVP/API/:version/Console/:consoleName', jwt({secret: secret.Secret}),authorization({resource:"console", action:"delete"}), navigationService.DeleteConsole);
app.post('/DVP/API/:version/Console', jwt({secret: secret.Secret}),authorization({resource:"console", action:"write"}), navigationService.CreateConsole);
app.put('/DVP/API/:version/Console/:consoleName', jwt({secret: secret.Secret}),authorization({resource:"console", action:"write"}), navigationService.UpdateConsole);
app.put('/DVP/API/:version/Console/:consoleName/Navigation', jwt({secret: secret.Secret}),authorization({resource:"console", action:"write"}), navigationService.AddNavigationToConsole);
app.delete('/DVP/API/:version/Console/:consoleName/Navigation/:navigationName', jwt({secret: secret.Secret}),authorization({resource:"console", action:"write"}), navigationService.RemoveNavigationFromConsole);

app.post('/DVP/API/:version/Tenant',jwt({secret: secret.Secret}), authorization({resource:"userGroup", action:"write"}), tenantService.CreateTenant);
app.get('/DVP/API/:version/Tenants',jwt({secret: secret.Secret}), authorization({resource:"userGroup", action:"read"}), tenantService.GetAllTenants);
app.get('/DVP/API/:version/Tenant/:id',jwt({secret: secret.Secret}), authorization({resource:"userGroup", action:"read"}), tenantService.GetTenant);
app.get('/DVP/API/:version/CompanyDomain/:companyname',jwt({secret: secret.Secret}), authorization({resource:"userGroup", action:"read"}), tenantService.GetCompanyDomain);


app.post('/DVP/API/:version/Codec',jwt({secret: secret.Secret}), authorization({resource:"codec", action:"write"}), packageService.CreateCodec);
app.put('/DVP/API/:version/Codec/:codec',jwt({secret: secret.Secret}), authorization({resource:"codec", action:"write"}), packageService.UpdateCodec);
app.delete('/DVP/API/:version/Codec/:codec',jwt({secret: secret.Secret}), authorization({resource:"codec", action:"delete"}), packageService.DeleteCodec);
app.get('/DVP/API/:version/Codec/All',jwt({secret: secret.Secret}), authorization({resource:"codec", action:"read"}), packageService.GetAllCodec);
app.get('/DVP/API/:version/Codec/Active',jwt({secret: secret.Secret}), authorization({resource:"codec", action:"read"}), packageService.GetAllActiveCodec);
app.get('/DVP/API/:version/Codec/Active/:type',jwt({secret: secret.Secret}), authorization({resource:"codec", action:"read"}), packageService.GetCodecByType);

app.get('/DVP/API/:version/Tenant/Company/BasicInfo', jwt({secret: secret.Secret}), authorization({resource:"tenant", action:"read"}), tenantService.GetBasicCompanyDetailsByTenant);
app.get('/DVP/API/:version/Tenant/Company/:company', jwt({secret: secret.Secret}), authorization({resource:"tenant", action:"read"}), organisationService.GetOrganisation);

app.put('/DVP/API/:version/Organisation/:company', jwt({secret: secret.Secret}),authorization({resource:"tenant", action:"write"}), organisationService.UpdateOrganisation);
app.put('/DVP/API/:version/Organisation/:company/Package/:packageName', jwt({secret: secret.Secret}),authorization({resource:"tenant", action:"write"}), organisationService.AssignPackageToOrganisation);
app.put('/DVP/API/:version/Organisation/:company/Package/:packageName/Unit/:unitName/:topUpCount', jwt({secret: secret.Secret}),authorization({resource:"tenant", action:"write"}), organisationService.AssignPackageUnitToOrganisation);
app.put('/DVP/API/:version/Organisation/:company/Activate/:state', jwt({secret: secret.Secret}),authorization({resource:"tenant", action:"write"}), organisationService.ActivateOrganisation);

server.listen(hostPort, hostIp, function () {
    console.log('%s listening at %s', server.name, server.url);
});


