var express = require('express');
var ArticleProvider = require('./articleProvider').ArticleProvider;


var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
// Configuration

var sessionStore = new express.session.MemoryStore
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    
  
app.use(express.cookieParser());
app.use(express.session({store:sessionStore,secret:'secret'}));
app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});
app.register('.html',require('jade'));
var articleProvider = new ArticleProvider('mongodb://olenhad:admin@ds033897.mongolab.com:33897/heroku_app5598044', 27017);
// Routes


exports.ArticleProvider = ArticleProvider;
app.get('/', function(req, res){
  console.log("request for / recieved");
    articleProvider.sortByDate( function(error,docs){
        console.log("entering findall");
        
        res.render('index.jade', { 
            locals: {
                title: 'Blog',
                articles:docs
            }
        });
        
        console.log(docs);
      
    });
});
app.get('/aboutMe',function(req,res){
  res.render("about_me.jade", {
    locals:{
      title:"About Me"
    }
  });
})
var sess = {};
app.get('/sessionTest', function(req, res){
    if(req.session.views!=undefined)
      req.session.views++;
    else
      req.session.views=1;
    
      res.setHeader('Content-Type', 'text/html');
      res.write('<p>views: ' + req.session.views + '</p>');
        res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
        res.end();

      
    
     console.log(JSON.stringify(req.session));
    
    //req.session.views = req.session.views ? req.session.views + 1 : 1;
    //res.send('You have visited this page ' + req.session.visitCount + ' times');
    
});
app.get('/blog/new', function(req, res) {
    res.render('blog_new.jade', { locals: {
        title: 'New Post'
    }
    });
});
app.get('/sudo',function(req,res){
  res.render('sudo.jade',{
    locals:{
      title:'Login'
    }
  });
});
app.get('/blog/newSimple',function(req,res){
  res.redirect('/tinymce/examples/simple.html')
});
app.get('/blog/newFull',function(req,res){
  res.redirect('/tinymce/examples/full.html')
})
app.post('/sudo',function(req,res){
  if(req.param('key')=="admin"){

    req.session.sudo = true;
  }
  res.redirect('/');
})
app.get('/blog/:id/remove',function(req,res){
  if(req.session.sudo==true){


  articleProvider.removeById(req.params.id,function(err,result){
    res.redirect('/');
  });
}
else{
  res.redirect('/');
}
});
app.post('/blog/new', function(req, res){
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/blog/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('blog_show.jade',
        { locals: {
            title: article.title,
            article:article
        }
        });
    });
});

app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});
app.get('/chat',function(req,res){
  res.render('chat.jade',{
    locals:{
      title: 'Chat!'
    }
  });
});

//sockets
var nicknames = {};

io.sockets.on('connection',function(socket){
   socket.on('client message',function(msg){
    socket.broadcast.emit('client message',socket.nickname,msg);
   });
   socket.on('nickname',function(nick, nameCheck){
    if(nicknames[nick]){
      nameCheck(false);
    } else{
      nameCheck(true);
      nicknames[nick] = socket.nickname = nick;
      socket.broadcast.emit("announcement",nick+' joined the room');
      io.sockets.emit('nicknames',nicknames);
    }
   });
   
   socket.on('disconnect',function(){
    if(!socket.nickname) return;
    delete nicknames[socket.nickname];
    socket.broadcast.emit('announcement', socket.nickname+ 'disconnected');
    socket.broadcast.emit('nicknames',nicknames);
   });

});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);