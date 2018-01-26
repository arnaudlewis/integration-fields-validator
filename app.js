const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');

const app = require('./config');
const PORT = app.get('port');

const Analyzer = require('./analyzer');

app.listen(PORT ,() => {
  console.log('listening on port ' + PORT);
});

app.get('/', (req, res) => {
	//https://prismic-integration.glitch.me/catalogue/v1/works
	res.render('index');
});

app.post('/validate', (req, res) => {
	const endpoint = req.body.endpoint;
	Analyzer(res, endpoint).then(() => {
		res.end();
	})
});

setInterval(function() {
	http.get("https://integration-fields.herokuapp.com/");
}, 300000); // every 5 minutes (300000)
