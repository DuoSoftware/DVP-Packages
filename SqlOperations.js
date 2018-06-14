'use strict';

let logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
let dbModel = require('dvp-dbmodels');
let Resource = require('dvp-mongomodels/model/Resource');
let VPackage = require('dvp-mongomodels/model/Package');
let PackageUnit = require('dvp-mongomodels/model/PackageUnit');
let Codec = require('dvp-mongomodels/model/Codec').Codec;
let EventEmitter = require('events').EventEmitter;
let Console = require('dvp-mongomodels/model/Console');
let messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
let deepcopy = require('deepcopy');


let asyncCollectResources = function(resourceName, callback)
{
    return new Promise((resolve, reject) => {
        dbModel.ResourceScopes.findAll({resource: resourceName}, function(err, resource)
        {
            //Manipulate Data
            resolve(resource);
        });

    });


};

class SqlFactory {

    ValidateResources(resources)
    {
        return new Promise((resolve, reject) => {
            if (resources && Array.isArray(resources) && resources.length >0)
            {
                let arr = [];
                for (let i in resources) {
                    arr.push(asyncCollectResources.bind(this, resources[i]));
                }
                Promise.all(arr).then(function(results)
                {
                    resolve(results);

                }).catch(function(err)
                {
                    reject(err);
                })

            }
            else
            {
                reject(new Error('Empty Array Passed'));
            }
        });
    }

    async ValidateConsoles(consoles)
    {
        if(consoles && consoles.length > 0)
        {
            let query =
                {
                    where: {$or:[]}
                };

            for(let console of consoles)
            {
                let tempObj = {
                    name: console
                };
                query.where.$or.push(tempObj);
            }

            dbModel.Console.findAll(query).then(consoles =>
            {
                if(consoles && consoles.length > 0)
                {
                    //OK
                    return consoles.map(c=>{
                        return c.name;
                    })
                }
                else
                {
                    return null;
                }

            }).catch(err =>
            {
                return null;
            })


        }
        else
        {
            return null;
        }
    }



//---------------------------------Package---------------------------------------------------------------

    //DONE
    GetPackages(req, res){
        logger.debug("DVP-UserService.GetPackages Internal method ");

        let jsonString;
        let query =
            {
                attributes: [['name', 'packageName'],['name', 'packageType'],['navigation_type','navigationType'],['setup_fee','setupFee'],'price',['billing_type','billingType']],
                include: [
                    {
                        model: dbModel.Console,
                        as: 'Consoles'
                    },
                    {
                        model: dbModel.UserRoles,
                        as: 'UserRoles'
                    },
                    {
                        model: dbModel.ResTaskInfo,
                        as: 'Tasks'
                    }
                ]
            };
        dbModel.Package.findAll(query).then(function(vPackages)
        {
            vPackages = JSON.parse(JSON.stringify(vPackages));
            if(vPackages)
            {
                for(let pkg of vPackages)
                {
                    let tempConsoleArr = [];
                    let tempVeeryTaskArr = [];
                    let tempUsrRoles = [];
                    if(pkg.Consoles)
                    {
                        tempConsoleArr = pkg.Consoles.map(console => {
                            return console.name;
                        });
                    }

                    delete pkg.Consoles;
                    pkg.consoles = tempConsoleArr;

                    if(pkg.Tasks)
                    {
                        tempVeeryTaskArr = pkg.Tasks.map(task => {
                            return task.TaskType;
                        });
                    }

                    delete pkg.Tasks;
                    pkg.veeryTask = tempVeeryTaskArr;

                    if(pkg.UserRoles)
                    {
                        tempUsrRoles = pkg.UserRoles.map(role => {

                            let tempObj = {
                                accessType: role.name,
                                accessLimit: 0
                            };

                            if(role.PackageUserRoleCreateLimit && role.PackageUserRoleCreateLimit && role.PackageUserRoleCreateLimit.access_limit)
                            {
                                tempObj.accessLimit = role.PackageUserRoleCreateLimit.access_limit;
                            }

                            return tempObj;
                        });
                    }

                    delete pkg.UserRoles;
                    pkg.consoleAccessLimit = tempUsrRoles;
                }

            }

            jsonString = messageFormatter.FormatMessage(null, "Get Packages Successful", true, vPackages);
            res.end(jsonString);

        }).catch(function(err)
        {
            jsonString = messageFormatter.FormatMessage(err, "Get Packages Failed", false, undefined);
            res.end(jsonString);

        });
    }

    //DONE
    GetPackage(req, res){
        logger.debug("DVP-UserService.GetPackage Internal method ");

        let jsonString;
        let query =
            {
                where: {name: req.params.packageName},
                attributes: [['name', 'packageName'],['name', 'packageType'],['navigation_type','navigationType'],['setup_fee','setupFee'],'price',['billing_type','billingType']],
                include: [
                    {
                        model: dbModel.Console,
                        as: 'Consoles'
                    },
                    {
                        model: dbModel.UserRoles,
                        as: 'UserRoles'
                    },
                    {
                        model: dbModel.ResTaskInfo,
                        as: 'Tasks'
                    }
                ]
            };
        dbModel.Package.find(query).then(function(VPackage)
        {
            VPackage = JSON.parse(JSON.stringify(VPackage));
            if(VPackage)
            {
                let tempConsoleArr = [];
                let tempVeeryTaskArr = [];
                let tempUsrRoles = [];
                if(VPackage.Consoles)
                {
                    tempConsoleArr = VPackage.Consoles.map(console => {
                        return console.name;
                    });
                }

                delete VPackage.Consoles;
                VPackage.consoles = tempConsoleArr;

                if(VPackage.Tasks)
                {
                    tempVeeryTaskArr = VPackage.Tasks.map(task => {
                        return task.TaskType;
                    });
                }

                delete VPackage.Tasks;
                VPackage.veeryTask = tempVeeryTaskArr;

                if(VPackage.UserRoles)
                {
                    tempUsrRoles = VPackage.UserRoles.map(role => {

                        let tempObj = {
                            accessType: role.name,
                            accessLimit: 0
                        };

                        if(role.PackageUserRoleCreateLimit && role.PackageUserRoleCreateLimit && role.PackageUserRoleCreateLimit.access_limit)
                        {
                            tempObj.accessLimit = role.PackageUserRoleCreateLimit.access_limit;
                        }

                        return tempObj;
                    });
                }

                delete VPackage.UserRoles;
                VPackage.consoleAccessLimit = tempUsrRoles;

            }

            jsonString = messageFormatter.FormatMessage(null, "Get Packages Successful", true, VPackage);
            res.end(jsonString);

        }).catch(function(err)
        {
            jsonString = messageFormatter.FormatMessage(err, "Get Packages Failed", false, undefined);
            res.end(jsonString);

        });

    }

    //DONE
    DeletePackage(req,res){
        logger.debug("DVP-UserService.DeletePackage Internal method ");
        let jsonString;
        let query =
            {
                where: {name: req.params.packageName}
            };

        dbModel.Package.destroy(query).then(function(result)
        {
            jsonString = messageFormatter.FormatMessage(undefined, "Package successfully deleted", true, undefined);
            res.end(jsonString);

        }).catch(function(err)
        {
            jsonString = messageFormatter.FormatMessage(err, "Delete Package Failed", false, undefined);
            res.end(jsonString);
        });
    }

    async CreatePackage(req, res)
    {
        logger.debug("DVP-UserService.CreateResource Internal method ");

        let jsonString = '';

        //NEED TO VALIDATE EVERYTHING FIRST BEFORE SAVING

        //VALIDATE CONSOLES

        let consoles  = await this.ValidateConsoles(req.body.consoles);

        if(consoles && consoles.length > 0)
        {
            let pkg = dbModel.Package.build({
                name: req.body.packageName,
                navigation_type: req.body.navigationType,
                price: req.body.price,
                setup_fee: req.body.setupFee,
                billing_type: req.body.billingType,
                description: req.body.description
            });

            pkg
                .save()
                .then(function (savePackageResult)
                {
                    console.log('dsdsa');


                }).catch(function(err)
            {
                logger.error('[DVP-RuleService.AddOutboundRule] PGSQL Insert outbound call rule with all attributes query failed', err);
                callback(err, -1, false);
            })


            /*//VALIDATE RESOURCES
            ValidateResources(req.body.resources).then(resList =>
            {
                //ALL VALIDATIONS OK




            }).catch(err => {
                //STOP OPERATION
                jsonString = messageFormatter.FormatMessage(new Error('Resource validation failed'), "Resource validation failed", false, undefined);
                res.end(jsonString);
            })*/
        }
        else
        {
            //STOP OPERATION
            jsonString = messageFormatter.FormatMessage(new Error('Console validation failed'), "Console validation failed", false, undefined);
            res.end(jsonString);
        }









        /*logger.debug("DVP-UserService.CreateResource Internal method ");
        let jsonString;

        let vPackage = VPackage({
            packageName: req.body.packageName,
            packageType: req.body.packageType,
            navigationType: req.body.navigationType,
            description: req.body.description,
            consoleAccessLimit: req.body.consoleAccessLimit,
            veeryTask: req.body.veeryTask,
            billingType: req.body.billingType,
            price: req.body.price,
            setupFee: req.body.setupFee,
            spaceLimit: req.body.spaceLimit,
            created_at: Date.now(),
            updated_at: Date.now()

        });

        let vc  = ValidateConsoles(req.body.consoles);
        vc.on('validateConsole', function(console){
            vPackage.consoles.push(console.consoleName);
        });
        vc.on('endValidateConsoles', function(){
            ValidateResources(req.body.resources).then(resources => {

                vPackage.resources = resources;

                vPackage.save(function (err, vPackage) {
                    if (err) {
                        jsonString = messageFormatter.FormatMessage(err, "Package save failed", false, undefined);
                    } else {
                        jsonString = messageFormatter.FormatMessage(undefined, "Package saved successfully", true, vPackage);
                    }
                    res.end(jsonString);
                });
            });
            vr.on('validateResource', function(oriResource){
                for(let i in req.body.resources){
                    let bResource = req.body.resources[i];
                    if(bResource.resourceName == oriResource.resourceName){
                        vPackage.resources.push(bResource);
                        break;
                    }
                }
            });
            vr.on('endValidateResources', function(){
                vPackage.save(function (err, vPackage) {
                    if (err) {
                        jsonString = messageFormatter.FormatMessage(err, "Package save failed", false, undefined);
                    } else {
                        jsonString = messageFormatter.FormatMessage(undefined, "Package saved successfully", true, vPackage);
                    }
                    res.end(jsonString);
                });
            });

        });*/
    }

    UpdatePackage(req, res){
        logger.debug("DVP-UserService.UpdatePackage Internal method ");

        let jsonString;

        req.body.updated_at = Date.now();
        VPackage.findOneAndUpdate({packageName: req.params.packageName}, req.body, function(err, vPackage) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Update Package Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Update Package Successful", true, vPackage);
            }
            res.end(jsonString);
        });
    }



//-----------------------------------Package Units--------------------------------------------------------


    CreatePackageUnit(req, res){
        logger.debug("DVP-UserService.CreatePackageUnit Internal method ");
        let jsonString;

        let unit = PackageUnit({
            unitName: req.body.unitName,
            unitType: req.body.unitType,
            description: req.body.description,
            unitData: {},
            billingType: req.body.billingType,
            setupFee: req.body.setupFee,
            unitprice: req.body.unitprice,
            created_at: Date.now(),
            updated_at: Date.now()

        });

        switch (req.body.unitType){
            case 'accessLimit':
                unit.unitData.consoleAccessLimit = req.body.unitData.consoleAccessLimit;
                unit.unitData.resources = [];

                let cp1 = deepcopy(req.body.unitData.resources);
                let vr = ValidateResources(cp1);
                vr.on('validateResource', function(oriResource){
                    for(let i in req.body.unitData.resources){
                        let bResource = req.body.unitData.resources[i];
                        if(bResource.resourceName == oriResource.resourceName){
                            unit.unitData.resources.push(bResource);
                            break;
                        }
                    }
                });
                vr.on('endValidateResources', function(){
                    unit.save(function (err, packageUnit) {
                        if (err) {
                            jsonString = messageFormatter.FormatMessage(err, "Package Unit save failed", false, undefined);
                        } else {
                            jsonString = messageFormatter.FormatMessage(undefined, "Package Unit saved successfully", true, packageUnit);
                        }
                        res.end(jsonString);
                    });
                });
                break;

            default :
                unit.unitData = req.body.unitData;

                unit.save(function (err, packageUnit) {
                    if (err) {
                        jsonString = messageFormatter.FormatMessage(err, "Package Unit save failed", false, undefined);
                    } else {
                        jsonString = messageFormatter.FormatMessage(undefined, "Package Unit saved successfully", true, packageUnit);
                    }
                    res.end(jsonString);
                });
        }

    }

    UpdatePackageUnit(req, res){
        logger.debug("DVP-UserService.UpdatePackageUnit Internal method ");

        let jsonString;

        req.body.updated_at = Date.now();
        PackageUnit.findOneAndUpdate({unitName: req.params.unitName}, req.body, function(err, packageUnit) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Update Package Unit Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Update Package Unit Successful", true, packageUnit);
            }
            res.end(jsonString);
        });
    }

    DeletePackageUnit(req,res){
        logger.debug("DVP-UserService.DeletePackageUnit Internal method ");

        let jsonString;
        PackageUnit.findOne({unitName: req.params.unitName}, function (err, packageUnit) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Package Unit Failed", false, undefined);
                res.end(jsonString);
            } else {
                if (packageUnit) {
                    packageUnit.remove(function (err) {
                        if (err) {
                            jsonString = messageFormatter.FormatMessage(err, "Delete Package Unit Failed", false, undefined);
                        } else {
                            jsonString = messageFormatter.FormatMessage(undefined, "Package Unit successfully deleted", true, undefined);
                        }
                        res.end(jsonString);
                    });
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "Delete Package Failed, Package Unit object is null", false, undefined);
                    res.end(jsonString);
                }
            }
        });
    }

    GetPackageUnit(req, res){
        logger.debug("DVP-UserService.GetPackageUnit Internal method ");
        let jsonString;
        PackageUnit.findOne({unitName: req.params.unitName}, function(err, packageUnit) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Package Unit Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Get Package Unit Successful", true, packageUnit);
            }
            res.end(jsonString);
        });
    }

    GetPackageUnits(req, res){
        logger.debug("DVP-UserService.GetPackageUnits Internal method ");

        let jsonString;
        PackageUnit.find({}, function(err, packageUnits) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Packages Units Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Get Packages Units Successful", true, packageUnits);
            }
            res.end(jsonString);
        });
    }



//--------------------------------Codec---------------------------------------------------------------------

    CreateCodec(req, res){
        logger.debug("DVP-UserService.CreateCodec Internal method ");
        let jsonString;

        let codec = Codec({
            codec: req.body.codec,
            type: req.body.type,
            description: req.body.description,
            active: req.body.active
        });

        codec.save(function (err, codecObj) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Codec save failed", false, undefined);
            } else {
                jsonString = messageFormatter.FormatMessage(undefined, "Codec saved successfully", true, codecObj);
            }
            res.end(jsonString);
        });
    }

    UpdateCodec(req, res){
        logger.debug("DVP-UserService.UpdateCodec Internal method ");

        let jsonString;

        req.body.codec = req.params.codec;
        Codec.findOneAndUpdate({codec: req.params.codec}, req.body, function(err, codecObj) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Update Codec Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Update Codec Successful", true, codecObj);
            }
            res.end(jsonString);
        });
    }

    DeleteCodec(req,res){
        logger.debug("DVP-UserService.DeleteCodec Internal method ");

        let jsonString;
        Codec.findOne({codec: req.params.codec}, function (err, codecObj) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Codec Failed", false, undefined);
                res.end(jsonString);
            } else {
                if (codecObj) {
                    codecObj.remove(function (err) {
                        if (err) {
                            jsonString = messageFormatter.FormatMessage(err, "Delete Codec Failed", false, undefined);
                        } else {
                            jsonString = messageFormatter.FormatMessage(undefined, "Codec successfully deleted", true, undefined);
                        }
                        res.end(jsonString);
                    });
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "Delete Codec, Codec object is null", false, undefined);
                    res.end(jsonString);
                }
            }
        });
    }

    GetAllCodec(req, res){
        logger.debug("DVP-UserService.GetAllCodec Internal method ");
        let jsonString;
        Codec.find({}, function(err, codecObj) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get All Codec Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Get All Codec Successful", true, codecObj);
            }
            res.end(jsonString);
        });
    }

    GetAllActiveCodec(req, res){
        logger.debug("DVP-UserService.GetAllActiveCodec Internal method ");
        let jsonString;
        Codec.find({active: true}, function(err, codecObj) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Codec Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Get Codec Successful", true, codecObj);
            }
            res.end(jsonString);
        });
    }

    GetCodecByType(req, res){
        logger.debug("DVP-UserService.GetCodecByType Internal method ");

        let jsonString;
        PackageUnit.find({type: req.params.type, active: true}, function(err, codecObj) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Codec By Type Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Get Codec By Type Successful", true, codecObj);
            }
            res.end(jsonString);
        });
    }

}

module.exports.SqlFactory = SqlFactory;