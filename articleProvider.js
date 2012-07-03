var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;


ArticleProvider = function(host, port) {

  //this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}));
  //this.db.open(function(){});
  //console.log(this.db);
  var self = this;
  require('mongodb').connect(host, function(err, conn){
    self.db = conn;
      /* Simple object to insert: ip address and date */
    
});
};





ArticleProvider.prototype.getCollection= function(callback) {
  var self = this;
  
  self.db.collection('articles', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
    
  });

};

ArticleProvider.prototype.findAll = function(callback) {
  console.log("enter 1");
    this.getCollection(function(error, article_collection) {
      console.log("enter 2");
      if( error ) {
        //callback(error);
        console.log("error in findall"+error);
      }
      else {
        console.log("enter 3");
        article_collection.find().toArray(function(error, results) {
          console.log("enter 4");
          if( error ) {
            console.log("error in 34");
          }
          else {
            console.log("ok till 37")
            callback(null, results)
          }
        });
      }
    });
};


ArticleProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

ArticleProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        if( typeof(articles.length)=="undefined")
          articles = [articles];

        for( var i =0;i< articles.length;i++ ) {
          article = articles[i];
          article.created_at = new Date();
          if( article.comments === undefined ) article.comments = [];
          for(var j =0;j< article.comments.length; j++) {
            article.comments[j].created_at = new Date();
          }
        }

        article_collection.insert(articles, function() {
          callback(null, articles);
        });
      }
    });
};
ArticleProvider.prototype.sortByDate = function(callback){
  this.findAll(function(error,result){
    if(error) callback(error)
    else{
      result.sort(function(a,b){
        return b.created_at - a.created_at;
        });
        callback(null,result);
      
    }
  });
}
ArticleProvider.prototype.removeById=function(articleId,callback){
  this.getCollection(function(error,col){
    if(error) callback(error)
    else{
      col.remove({_id:col.db.bson_serializer.ObjectID.createFromHexString(articleId)},function(err,result){
        console.log(result);
        callback(err,result);
      });
    }
  });
}
ArticleProvider.prototype.removeAll=function(callback){
  this.getCollection(function(error,collection){
    if(error) callback(error)
    else{
      collection.remove();
      callback(null);
    }
  })
}
ArticleProvider.prototype.addCommentToArticle = function(articleId,comment,callback){
  this.getCollection(function(error,collection){
    if(error) callback(error)
    else{
      collection.update(
      {
        _id: collection.db.bson_serializer.ObjectID.createFromHexString(articleId)
      },
      {
        "$push": {comments:comment}
      },
      function(error,article){
        if(error) callback(error);
        else callback(null,article)
      });
    }
  });
};

exports.ArticleProvider = ArticleProvider;