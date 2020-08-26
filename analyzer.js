const request = require('request');
const R = require('ramda');
const e = require('express');

const NB_ITEMS_PER_PAGE = 50;
const CONTENT_TYPE = "application/json";

const pageModel = {
	results: 'object',
	results_size: 'number'
}

const itemModel = {
	id: 'string',
	title: 'string',
	description: 'string',
	image_url: 'string',
	last_update: 'number',
}

function isOk(obj) {
	return R.isEmpty(obj);
}

function validateItem(pageIndex, itemIndex, item) {
	return R.toPairs(itemModel).reduce((acc, [key, type]) => {
		if(!item[key]) return R.merge(acc, { [key]: `Missing ${key} in item ${itemIndex} in page ${pageIndex}` });
    else if(item[key] && !(typeof item[key] === type)) return R.merge(acc, { [key]: `Invalid type for ${key} in item ${itemIndex} in page ${pageIndex}. Found Type: ${typeof item[key]} || Expected type: ${type}` });
    else return acc;
	}, {});
}

function validatePage(pageIndex, json) {
	const res = R.toPairs(pageModel).reduce((acc, [key, type]) => {
		if(!json[key]) return R.merge(acc, { [key]: `Missing ${key} in page ${pageIndex}` });
    else if(key === 'results_size') {
			if(!(typeof json[key] === type)) {
				return R.merge(acc, { [key]: `Invalid type for ${key} in page ${pageIndex}. Found Type: ${typeof json[key]} || Expected type: ${type}` });
			} else return acc;
		} else if(key === 'results') {
      if(json[key].length > 50) return R.merge(acc, { [key]: `Invalid format for 'results'. You cannot have moe than ${NB_ITEMS_PER_PAGE} items per page.`})
      else {
        const errorStack = json[key].map((item, index) => validateItem(pageIndex, index, item)).filter(error => !R.isEmpty(error));
        if(!isOk(errorStack)) return R.merge(acc, { [key]: errorStack});
        else return acc;
      }
		} else {
			return acc;
		}
	}, {});
	if(R.isEmpty(res)) return null;
  return res;
}

module.exports = function analyze(res, baseUrl) {
  return new Promise((resolve) => {
    queryPage(baseUrl, 1, resolve, res);
  })
}

const REPORT_INITIAL = {
	total_unique_products: 0,
	total_pages: 0
};

function jsonWrite(res, json) {
  res.write(JSON.stringify(json));
  res.write('\n\n');
}

function queryPage(baseUrl, pageIndex = 1, resolve, res, report = REPORT_INITIAL){
	const url = baseUrl + '?page=' + pageIndex

	request(url, function(error, response){
		if(error) resolve(report);
		else {
			try {
				const contentType = response.headers['content-type'];
				if(contentType.includes(CONTENT_TYPE)) {

					const body = JSON.parse(response.body);
					const errors = validatePage(pageIndex, body);
					const updatedReport = updateReport(report, body)
					
					if(errors) {
						res.write(`[page-${pageIndex}] Errors\n`)
						jsonWrite(res, errors);
					} else {
						res.write(`[page-${pageIndex}] valid\n`)
						res.write('IDs:')
						jsonWrite(res, body.results.map(i => i.id))
					}
					if(pageIndex * NB_ITEMS_PER_PAGE < body.results_size) {
						queryPage(baseUrl, pageIndex + 1, resolve, res, updatedReport);
					} else {
						resolve(updatedReport);
					}
				} else {
					jsonWrite(res, `Expected content type ${CONTENT_TYPE} but received ${contentType}`)
					resolve(report);
				}
			} catch(e) {
        console.log(e);
				jsonWrite(res, `Invalid JSON in page ${pageIndex}: ${e}`);
				resolve(report);
			}
		}
	})
}

function updateReport(currentReport, pageBody) {
	const distinctKeys = new Set(Object.keys(pageBody.results))
	return {
		...currentReport,
		total_pages: currentReport.total_pages + 1,
		total_unique_products: currentReport.total_unique_products + distinctKeys.size
	}
}
