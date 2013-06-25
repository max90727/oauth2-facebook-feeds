/*
 * Get user feeds from facebook using oauth2
 * 
 * 
 */
var express = require('express');
var sys = require('sys');
var app = express();
var oauth = require('oauth');
var https = require('https');
var CLIENT_ID = CLIENT_ID;
var CLIENT_SECRET = CLIENT_SECRET;
var REDIRECT_URL = REDIRECT_URL;
var news;
/*
 * app configuration 
 */
app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions : true,
		showStack : true
	}));
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.session({
		secret : CLIENT_SECRET
	}));
});
/*
 * oauth2 configuration
 */
function consumer() {
	return new oauth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'https://graph.facebook.com',
			'/oauth/authorize', '/oauth/access_token');
}
/*
 * get authorize code
 * 
 * parameter scope can be found in https://developers.facebook.com/tools
 */
app.get('/connect',function(req, res) {
	res.redirect(consumer().getAuthorizeUrl({
		scope:'user_photos,user_birthday,user_online_presence,read_stream',
		response_type : 'code',
		redirect_uri : REDIRECT_URL
	}));
});
app.get('/sessions/callback', function(req, res) {
	sys.puts('code: '+req.query.code);
	consumer().getOAuthAccessToken(
			req.query.code,
			{	
				grant_type : 'client_credentials',
				redirect_uri : REDIRECT_URL
			},function(err, access_token, refresh_token) {
				if (err) {
					res.end('error: ' + JSON.stringify(err));
				} else {
					console.log('access_token: '+access_token);
					var useUrl='https://graph.facebook.com/me/feed?access_token='+access_token;
					console.log('URL: '+useUrl);
					https.get(useUrl,function(res){
						var data='';
						  res.on('data', function(d) {
							data+=d;
						  });
						  res.on('end', function(){
							  var news = JSON.parse(data);
							  console.log(news);
							});
						}).on('error', function(e) {
						  console.error(e);
						});
				}});
});
var server = app.listen(8888);
console.log('Express server started on port %s', server.address().port);