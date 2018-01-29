const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const request = require('request');

const app = require('./config');
const PORT = app.get('port');

const Analyzer = require('./analyzer');

app.listen(PORT ,() => {
  console.log('listening on port ' + PORT);
});

app.get('/', (req, res) => {
	res.render('index');
});

app.post('/validate', (req, res) => {
	const endpoint = req.body.endpoint;
	Analyzer(res, endpoint).then(() => {
		res.end();
	})
});

setInterval(function() {
	request("https://integration-fields.herokuapp.com/", function(error, response) {});
}, 300000); // every 5 minutes (300000)
