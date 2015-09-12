var eazyDB = require("../lib/eazydb");
var path = require("path");


describe("CRUD eazydb", function() {
  var eazyDBConnection;

  beforeEach(function() {
    eazyDBConnection = new eazyDB.EazyDBConnection(path.join(__dirname, "testdb"));
    eazyDBConnection.defineModel("User", {});
    eazyDBConnection.defineModel("App", {});
    eazyDBConnection.init();
  });

  afterEach(function() {
    eazyDBConnection.drop();
  });

  it("contains model 'User' and 'App'", function(){
    expect(eazyDBConnection.containsModel("User")).toEqual(true);
    expect(eazyDBConnection.containsModel("App")).toEqual(true);
    expect(eazyDBConnection.containsModel("Unknown")).toEqual(false);
  });

  it("create user", function() {
    var user = eazyDBConnection.create("User", {name:"Dominik"});
    var allUsers = eazyDBConnection.getAll("User", function(oModelData){
      return true;
    });
    expect(allUsers.length).toEqual(1);
  });

  it("create and find user", function(){
    var user = eazyDBConnection.create("User", {name:"Smith"});
    var smith = eazyDBConnection.get("User", function(oModelData){
      return oModelData.name === "Smith";
    });
    expect(smith.oData.name).toEqual("Smith");
  });

  it("create and update User", function(){
    var user = eazyDBConnection.create("User", {name:"Smith"});
    user.oData.name = "MrSmith";
    eazyDBConnection.update(user);
    var mrSmith = eazyDBConnection.get("User", function(oModelData){
     return oModelData.name === "MrSmith";
    });
    expect(mrSmith.oData.name).toEqual("MrSmith");
  });

  it("create and delete User", function(){
    var user = eazyDBConnection.create("User", {name:"Smith"});
    eazyDBConnection.delete(user);
    var allUsers = eazyDBConnection.getAll("User", function(oModelData){
      return true;
    });
    expect(allUsers.length).toEqual(0);
  });
});
