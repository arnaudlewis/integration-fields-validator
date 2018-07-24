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
	Analyzer(res, endpoint)
	.then(() => res.end())
	.catch(() => res.end(`Invalid endpoint ${endpoint}`))
});
