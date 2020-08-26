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

function jsonWrite(res, json) {
  res.write(JSON.stringify(json));
  res.write('\n\n');
}

app.post('/validate', (req, res) => {
	const endpoint = req.body.endpoint;
	Analyzer(res, endpoint)
	.then((report) => {
		console.log(report)
		jsonWrite(res, report)
		res.end()
	})
	.catch((e) => {
		console.log(e)
		res.end(`Invalid endpoint ${endpoint}`)
	})
});
