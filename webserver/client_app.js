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

module.exports.getMyProperties = () => {
  fetch(`${serverURL}api/v1/users/properties`, {
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

module.exports.createProperty = (
  title, numberOfBeds, address, geoLocation, description, typeId, countryId
) => {
  const payload = {
    title, numberOfBeds, address, geoLocation, description, typeId, countryId
  };

  fetch(`${serverURL}api/v1/properties`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) { throw data.error; }

    console.log('Property created!');
  })
  .catch(error => {
    console.error(error);
  });
}