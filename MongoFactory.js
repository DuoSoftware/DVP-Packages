'use strict';
let logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
let Resource = require('dvp-mongomodels/model/Resource');
let VPackage = require('dvp-mongomodels/model/Package');
let PackageUnit = require('dvp-mongomodels/model/PackageUnit');
let Codec = require('dvp-mongomodels/model/Codec').Codec;
let EventEmitter = require('events').EventEmitter;
let Console = require('dvp-mongomodels/model/Console');
let messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
let deepcopy = require('deepcopy');

class MongoFactory{

    ValidateResources(resources){
        let e = new EventEmitter();
        process.nextTick(function () {
            if (resources && Array.isArray(resources) && resources.length >0) {
                let count = 0;
                for (let i in resources) {
                    let _resource = resources[i];
                    Resource.findOne({resourceName: _resource.resourceName}, function(err, resource) {
                        count++;
                        if (err) {
                            console.log(err);
                        }else{
                            e.emit('validateResource',resource);
                        }
                        if(count == resources.length){
                            e.emit('endValidateResources');
                        }
                    });
                }
            }else {
                e.emit('endValidateResources');
            }
        });

        return (e);
    }

    ValidateConsoles(consoles){
        let e = new EventEmitter();
        process.nextTick(function () {
            if (Array.isArray(consoles)) {
                let count = 0;
                for (let i in consoles) {
                    let console = consoles[i];
                    Console.findOne({consoleName: console}, function(err, console) {
                        count++;
                        if (err) {
                            console.log(err);
                        }else{
                            e.emit('validateConsole',console);
                        }
                        if(count == consoles.length){
                            e.emit('endValidateConsoles');
                        }
                    });
                }
            }else {
                e.emit('endValidateConsoles');
            }
        });

        return (e);
    }



//---------------------------------Package---------------------------------------------------------------

    GetPackages(req, res){
        logger.debug("DVP-UserService.GetPackages Internal method ");

        let jsonString;
        VPackage.find({}, function(err, vPackages) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Packages Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Get Packages Successful", true, vPackages);
            }
            res.end(jsonString);
        });
    }


    GetPackage(req, res){
        logger.debug("DVP-UserService.GetPackage Internal method ");
        let jsonString;
        VPackage.findOne({packageName: req.params.packageName}, function(err, vPackage) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Package Failed", false, undefined);
            }else{
                jsonString = messageFormatter.FormatMessage(err, "Get Package Successful", true, vPackage);
            }
            res.end(jsonString);
        });
    }

    DeletePackage(req,res){
        logger.debug("DVP-UserService.DeletePackage Internal method ");

        let jsonString;
        VPackage.findOne({packageName: req.params.packageName}, function (err, vPackage) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Get Package Failed", false, undefined);
                res.end(jsonString);
            } else {
                if (vPackage) {
                    vPackage.remove(function (err) {
                        if (err) {
                            jsonString = messageFormatter.FormatMessage(err, "Delete Package Failed", false, undefined);
                        } else {
                            jsonString = messageFormatter.FormatMessage(undefined, "Package successfully deleted", true, undefined);
                        }
                        res.end(jsonString);
                    });
                } else {
                    jsonString = messageFormatter.FormatMessage(undefined, "Delete Package Failed, package object is null", false, undefined);
                    res.end(jsonString);
                }
            }
        });
    }

    CreatePackage(req, res){
        logger.debug("DVP-UserService.CreateResource Internal method ");
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
            let vr = ValidateResources(req.body.resources);
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

        });
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

module.exports.MongoFactory = MongoFactory;