'use strict';
const fetch = require('node-fetch');

const serverURL = 'http://localhost:8000/';

module.exports.getAllProperties = () => {
  fetch(`${serverURL}api/v1/properties`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) { throw data.error; }

    console.log(data.properties);
  })
  .catch(error => {
    console.error(error);
  });
}