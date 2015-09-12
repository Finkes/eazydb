var fs = require("fs");
var uuid = require("node-uuid");
var path = require("path");

var createDirIfNotExistsSync = function (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
};

var fileExists = function(sPath){
  try{
    fs.statSync(sPath);
    return true;
  }
  catch(e){
    return false;
  }
};

var deleteFolderRecursive = function(sPath) {
  if( fs.existsSync(sPath) ) {
    fs.readdirSync(sPath).forEach(function(file,index){
      var curPath = path.join(sPath, file);
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(sPath);
  }
};

var EazyDBConnection = function(sPath){
  this.sPath = sPath;
  this.oModels = {};

  this.init = function(){
      createDirIfNotExistsSync(this.sPath);

      for(var key in this.oModels){
        var model = this.oModels[key];
        createDirIfNotExistsSync(path.join(this.sPath, key));
      }
  };

  this.drop = function(){
    deleteFolderRecursive(this.sPath);
  }

  this.containsModel = function(sModelName) {
      return (sModelName in this.oModels);
  }

  this.defineModel = function(sModelName, oDefinition){
      if(this.containsModel(sModelName)){
        throw {name:"ModelExistsException", message: "the model already exists"};
      }
      this.oModels[sModelName] = oDefinition;
  };

  this.create = function(sModelName, oData){
    if(!this.containsModel(sModelName)){
      throw {name:"ModelNotFoundException", message: "the model does not exist"};
    }
    oData["_id"] = uuid.v4();
    //TODO check fields and types
    fs.writeFileSync(path.join(this.sPath, sModelName, oData._id), JSON.stringify(oData));
    return new Model(sModelName, oData);
  };

  this.get = function(sModelName, fnFilter){
    var sModelPath = path.join(this.sPath, sModelName);
    var entries = fs.readdirSync(sModelPath);
    for(var i=0;i<entries.length;i++){
      var fileContent = fs.readFileSync(path.join(sModelPath, entries[i]), 'utf8');
      var oModelData = JSON.parse(fileContent);
      if(fnFilter(oModelData)){
        return new Model(sModelName, oModelData);
      }
    }
    throw {name:"NotFoundException", message: "no model found for given filter"};
  }

  this.getById = function(sModelName, sModelId){
    var sModelPath = path.join(this.sPath, sModelName, sModelId);
    if(fileExists(sModelPath)){
      var fileContent = fs.readFileSync(sModelPath, 'utf8');
      var oModelData = JSON.parse(fileContent);
      return new Model(sModelName, oModelData);
    }
    throw {name:"NotFoundException", message: "no model found for given filter"};
  }

  this.getAll = function(sModelName, fnFilter){
    var sModelPath = path.join(this.sPath, sModelName);
    var entries = fs.readdirSync(sModelPath);
    var results = [];
    for(var i=0;i<entries.length;i++){
      var fileContent = fs.readFileSync(path.join(sModelPath, entries[i]), 'utf8');
      var oModelData = JSON.parse(fileContent);
      if(fnFilter(oModelData)){
        results.push(new Model(sModelName, oModelData));
      }
    }
    return results;
  }

  this.update = function(oModel){
    var sFilePath = path.join(this.sPath, oModel.sModelName, oModel.oData._id);
    if(fileExists(sFilePath)){
      fs.writeFileSync(sFilePath, JSON.stringify(oModel.oData));
      return oModel;
    }
    return {name:"ModelNotFoundException", message: "The model you try to update does not exist"};
  }

  this.delete = function(oModel){
    var sFilePath = path.join(this.sPath, oModel.sModelName, oModel.oData._id);
    if(fileExists(sFilePath)){
      fs.unlinkSync(sFilePath);
    }
    return {name:"ModelNotFoundException", message: "The model you try to delete does not exist"};
  }
}

var Model = function(sModelName, oData){
  this.oData = oData;
  this.sModelName = sModelName;
};

exports.Model = Model;
exports.EazyDBConnection = EazyDBConnection;
