var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host,port){
	this.db = new Db('node-mongo-blog',new Server(host,port,{auto_reconnect: true}.{}));
	this.db.open(function(){});
};
ArticleProvider.prototype.getCollection = function(callback){
	this.db.collection('articles',function(error,article_collection){
		if(error) callback(error);
		else callback(null,article_collection);
	})
}
ArticleProvider.prototype.findAll = function(callback){
	this.getCollection(function(error,article_collection){
		if(error) callback(error)
		else {
			article_collection.find().toArray(function(error,results){
				if(error) callback(error)
				else callback(null,results)
			});
		}
	});
};