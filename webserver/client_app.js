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

module.exports.createUser = (email, password, name) => {
  const payload = {
    email, password, name
  };

  fetch(`${serverURL}api/v1/users`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) { throw data.error; }

    console.log('User created!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.activateUser = (email, token) => {
  const payload = {
    email, token
  };

  fetch(`${serverURL}api/v1/users/activate`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) { throw data.error; }

    console.log('User account activated!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.lostPassword = (email) => {
  const payload = {
    email
  };

  fetch(`${serverURL}api/v1/users/lostPw`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) { throw data.error; }

    console.log('User account lost password started!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.resetPassword = (email, token, password) => {
  const payload = {
    email, token, password
  };

  fetch(`${serverURL}api/v1/users/pwReset`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) { throw data.error; }

    console.log('User account password reseted!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.login = (email, password) => {
  const payload = {
    email, password
  };

  fetch(`${serverURL}api/v1/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) { throw data.error; }

    console.log('logged in!');
  })
  .catch(error => {
    console.error(error);
  });
}