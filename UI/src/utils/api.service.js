import axios from 'axios';
import fileDownload from 'js-file-download';

let API = {};
let prodMode = (window.location.hostname !== "localhost"); //PRODUCTION CHECK
let getPathUrls = {};

API.auth = true;

API.SET_AUTH = (bool) => {
  API.auth = bool;
}

let token = null;
let ttl = 0;
let sInterval = null;

const updateTTL = () => {
  ttl = token.ttl - 10;

  sInterval = setInterval(() => {
    if (ttl > 0) {
      ttl--;
    } else {
      if (sInterval) clearInterval(sInterval);
    }
  }, 1000);
}

function getJwtTtl(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(window.atob(base64));
  const expirationTime = payload.exp;
  const currentTime = Math.floor(Date.now() / 1000);
  const ttl = expirationTime - currentTime;
  return ttl;
}

function extractJsonFromString(str) {
  let unbalancedBraces = 0;
  let startIndex = -1;
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] === '}') {
      unbalancedBraces++;
    } else if (str[i] === '{') {
      unbalancedBraces--;
      if (unbalancedBraces === 0) {
        startIndex = i;
        break;
      }
    }
  }
  if (startIndex !== -1) {
    const jsonStr = str.substring(startIndex, str.length);
    try {
      const jsonObj = JSON.parse(jsonStr);
      return jsonObj;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.log('String:', str);
      return null;
    }
  } else {
    console.log('No matching opening brace found.');
    console.log('String:', str);
    return null;
  }
}

function parseUrlPath(urlPath) {
  const url = new URL(urlPath, 'http://dummy.origin');
  const params = new URLSearchParams(url.search);
  const user_email = params.get('user_email');
  params.delete('user_email');
  const domain = params.get('domain');
  params.delete('domain');
  const path = url.pathname + (params.toString() ? `?${params.toString()}` : '');
  return {
    user_email,
    domain,
    path
  };
}

const getToken = (url, callback) => {
  if (window.location.pathname === "/supportbot") {
    if (url !== undefined) {
      getPathUrls = url;
    }
    if (!getPathUrls?.length) return;
  } else {
    if (!url?.length) return;
  }
  // if (!url?.length) return;

  if (ttl == 0) {
    let baseURL = prodMode ? 'https://' + window.location.hostname + '/.auth/me' : './sample_auth.json'
    const authAPI = axios.create({ baseURL: baseURL });
    authAPI.get()
      .then((res) => {
        let access_token = res.data[0].access_token;
        //let ttl = calculateTTL(res.data[0].expires_on);
        let ttl = getJwtTtl(access_token);
        let user_email = res.data[0].user_id
        token = { 'token': access_token, 'ttl': ttl, 'user_email': user_email };
        // console.log('TOKEN', token);
        updateTTL();
        if (callback) callback(token);
      }).catch((error) => {
        console.log('TOKEN NOT FOUND.');
      })
  } else {
    if (callback) callback(token);
  }
}

// const getHeaderConfig = (token) => {
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': token
//   }
// }


const getHeaderConfig = (token, isFormData = true) => {
  return {
    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    'Authorization': token
  };
};


API.GET = (baseURL, path, onSuccess, onError) => {
  //console.log('GET', path);
  const parsedPath = parseUrlPath(path);
  path = parsedPath.path;
  const user_email = parsedPath.user_email;
  const domain = parsedPath.domain;

  if (API.auth) {
    getToken(baseURL, (res) => {
      var headerConfig = getHeaderConfig(res.token);
      if (user_email) headerConfig['User-email'] = user_email;
      if (domain) headerConfig['Domain'] = domain;
      const getAPI = axios.create({ baseURL: baseURL });
      getAPI.get(path, {
        'headers': headerConfig
      }).then((res) => {
        if (onSuccess) onSuccess(res);
      }).catch((error) => {
        if (onError) onError(error);
      });
    });
  } else {
    const getAPI = axios.create({ baseURL: baseURL });

    getAPI.get(path).then((res) => {
      if (onSuccess) onSuccess(res);
    }).catch((error) => {
      if (onError) onError(error);
    });
  }
}

API.POST = (baseURL, path, body, onSuccess, onError) => {
  const parsedPath = parseUrlPath(path);
  path = parsedPath.path;
  const user_email = parsedPath.user_email;
  const domain = parsedPath.domain;

  const isFormData = body instanceof FormData;

  if (API.auth) {
    getToken(baseURL, (res) => {
      const headerConfig = {
        ...getHeaderConfig(res.token),
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
      };

      if (!isFormData) {
        if (!body.user_email) body.user_email = user_email;
        if (!body.domain) body.domain = domain;
      }

      const postAPI = axios.create({ baseURL: baseURL });
      postAPI.post(path, body, {
        headers: headerConfig
      }).then((res) => {
        if (onSuccess) onSuccess(res);
      }).catch((error) => {
        if (onError) onError(error);
      });
    });
  } else {
    const postAPI = axios.create({ baseURL: baseURL });
    postAPI.post(path, body).then((res) => {
      if (onSuccess) onSuccess(res);
    }).catch((error) => {
      if (onError) onError(error);
    });
  }
};


API.SDLCDOWNLOAD = (baseURL, path, formData, onSuccess, onError) => {
  if (API.auth) {
    getToken(baseURL, (res) => {
      const headerConfig = getHeaderConfig(res.token);
 
      if (headerConfig['User-email']) delete headerConfig['User-email'];
      if (headerConfig['Domain']) delete headerConfig['Domain'];
 
      const postAPI = axios.create({ baseURL });
      postAPI.post(path, formData, {
        headers: {
          ...headerConfig,
        },
        responseType: 'arraybuffer', // Important for binary data
      })
      .then((res) => {
        if (onSuccess) onSuccess(res);
      })
      .catch((error) => {
        if (onError) onError(error);
      });
    });
  } else {
 
    const postAPI = axios.create({ baseURL });
    postAPI.post(path, formData, {
      responseType: 'arraybuffer', // Important for binary data
    })
    .then((res) => {
      if (onSuccess) onSuccess(res);
    })
    .catch((error) => {
      if (onError) onError(error);
    });
  }
};

API.Stream = (baseURL, path, body, onChunk, onStreamEnd, onError) => {
  const parsedPath = parseUrlPath(path);
  path = parsedPath.path;
  const user_email = parsedPath.user_email;
  const domain = parsedPath.domain;
  let prev_chunk = ''


  let streaming_queue = '';
  let streaming_index = 0;

  let t_timeoffirsttoken;
  let length_of_first_token;
  let min_delay = 5;
  let max_delay = 150;
  let delay = (min_delay + max_delay) / 2;
  let delta_length;

  // Ensure the body includes necessary data
  if (!body.user_email) body.user_email = user_email;
  if (!body.domain) body.domain = domain;

  const handleStreamResponse = (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const read = ({ done, value }) => {
      let chunk = decoder.decode(value, { stream: true });

      if (!t_timeoffirsttoken && chunk.length > 0) {
        // get current time in millis
        t_timeoffirsttoken = new Date().getTime() - 3000;
        length_of_first_token = chunk.length
      }

      if (!done) {
        streaming_queue += prev_chunk
        prev_chunk = chunk;
        delta_length = Math.max(1, streaming_queue.length - length_of_first_token)
        delay = Math.max(min_delay, Math.min(max_delay, ((new Date().getTime() - t_timeoffirsttoken) / delta_length) + 50))
        // console.log('delay', delay)
      }
      else {
        // TODO - handle the last chunk JSON using extractJsonFromString
        let json_data = extractJsonFromString(streaming_queue + prev_chunk);
        onStreamEnd(json_data);
        streaming_queue = '';
        return;
      }

      // Process the chunk
      const interval = setInterval(() => {
        if (streaming_index < streaming_queue.length) {
          onChunk(streaming_queue[streaming_index]);
          streaming_index++;
        }
        if (streaming_index === streaming_queue.length) {
          clearInterval(interval);
        }
      }, delay)

      // Read the next chunk
      reader.read().then(read);
    };

    reader.read().then(read);
  };

  const isFormData = body instanceof FormData;

 if (API.auth) {
    getToken(baseURL, (res) => {
      const headers = {
        'Authorization': res.token,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      };

      fetch(baseURL + path, {
        method: 'POST',
        headers,
        body: isFormData ? body : JSON.stringify(body),
      })
        .then(handleStreamResponse)
        .catch(onError);
    });
  } else {
    const postAPI = axios.create({ baseURL: baseURL, responseType: 'stream' });
    postAPI.post(path, body).then(handleStreamResponse).catch(onError);
  }
}

API.DELETE = (baseURL, path, onSuccess, onError) => {
  const parsedPath = parseUrlPath(path);
  path = parsedPath.path;
  const user_email = parsedPath.user_email;
  const domain = parsedPath.domain;
  if (API.auth) {
    getToken(baseURL, (res) => {
      var headerConfig = getHeaderConfig(res.token);
      if (user_email) headerConfig['User-email'] = user_email;
      if (domain) headerConfig['Domain'] = domain;
      const getAPI = axios.create({ baseURL: baseURL });
      getAPI.delete(path, {
        'headers': headerConfig
      }).then((res) => {
        if (onSuccess) onSuccess(res);
      }).catch((error) => {
        if (onError) onError(error);
      });
    });
  } else {
    const getAPI = axios.create({ baseURL: baseURL });
    getAPI.delete(path).then((res) => {
      if (onSuccess) onSuccess(res);
    }).catch((error) => {
      if (onError) onError(error);
    });
  }
}

API.DELETE_HUBFILE = (baseURL, path, body, onSuccess, onError) => {
  const parsedPath = parseUrlPath(path);
  path = parsedPath.path;
  const user_email = parsedPath.user_email;
  const domain = parsedPath.domain;

  const isFormData = body instanceof FormData;

  if (API.auth) {
    getToken(baseURL, (res) => {
      const headerConfig = getHeaderConfig(res.token, isFormData);
      if (user_email) headerConfig['User-email'] = user_email;
      if (domain) headerConfig['Domain'] = domain;

      const getAPI = axios.create({ baseURL: baseURL });

      getAPI.delete(path, {
        headers: headerConfig,
        data: body || {},
      }).then((res) => {
        if (onSuccess) onSuccess(res);
      }).catch((error) => {
        if (onError) onError(error);
      });
    });
  } else {
    const getAPI = axios.create({ baseURL: baseURL });

    getAPI.delete(path, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      data: body || {},
    }).then((res) => {
      if (onSuccess) onSuccess(res);
    }).catch((error) => {
      if (onError) onError(error);
    });
  }
};



API.GET_AUTH = (authURL, onSuccess, onError) => {
  axios.get(authURL).then((res) => {
    if (onSuccess) onSuccess(res);
  }).catch((error) => {
    if (onError) onError(error);
  });
}

API.UPLOAD = (baseURL, path, body, onSuccess, onError) => {
  const parsedPath = parseUrlPath(path);
  path = parsedPath.path;
  const user_email = parsedPath.user_email;
  const domain = parsedPath.domain;

  if (API.auth) {
    getToken(baseURL, (res) => {
      var headerConfig = getHeaderConfig(res.token);

      if (user_email) headerConfig['User-email'] = user_email;
      if (domain) headerConfig['Domain'] = domain;
      headerConfig['Content-Type'] = "multipart/form-data";
      // const headerConfig = getHeaderConfig(res.token, true);

      const postAPI = axios.create({ baseURL: baseURL });
      postAPI.post(path, body ? body : {}, {
        'headers': headerConfig
      }).then((res) => {
        if (onSuccess) onSuccess(res);
      }).catch((error) => {
        if (onError) onError(error);
      });

    });
  } else {
    const postAPI = axios.create({ baseURL: baseURL });
    postAPI.post(path, body ? body : {}, {
      'headers': {
        "Content-Type": "multipart/form-data"
      }
    }).then((res) => {
      if (onSuccess) onSuccess(res);
    }).catch((error) => {
      if (onError) onError(error);
    });
  }
}


API.DOWNLOAD = (baseURL, path, filename, onSuccess, onError) => {
  //console.log('GET', path);
  const parsedPath = parseUrlPath(path);
  path = parsedPath.path;
  const user_email = parsedPath.user_email;
  const domain = parsedPath.domain;
  if (API.auth) {
    getToken(baseURL, (res) => {
      var headerConfig = getHeaderConfig(res.token);

      if (user_email) headerConfig['User-email'] = user_email;
      if (domain) headerConfig['Domain'] = domain;

      const getAPI = axios.create({ baseURL: baseURL });
      getAPI.get(path, {
        'headers': headerConfig,
        responseType: 'blob',
      }).then((res) => {
        if (onSuccess) {
          fileDownload(res.data, filename);
          onSuccess(res);
        }
      }).catch((error) => {
        if (onError) onError(error);
      });
    });
  } else {
    const getAPI = axios.create({ baseURL: baseURL });

    getAPI.get(path).then((res) => {
      if (onSuccess) onSuccess(res);
    }).catch((error) => {
      if (onError) onError(error);
    });
  }
}

API.GET_APPCONFIG = (baseURL, path, onSuccess, onError) => {
  //console.log('GET', path);
  const parsedPath = parseUrlPath(path);
  path = parsedPath.path;
  const user_email = parsedPath.user_email;

  getToken(baseURL, (res) => {
    var headerConfig = getHeaderConfig(res.token);

    if (user_email) headerConfig['User-email'] = user_email;

    const getAPI = axios.create({ baseURL: baseURL });
    getAPI.get(path, {
      'headers': headerConfig
    }).then((res) => {
      if (onSuccess) onSuccess(res);
    }).catch((error) => {
      if (onError) onError(error);
    });
  });
}

API.ChatSupportItsc = (baseURL, path, body, onSuccess, onError) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
   const isFormData = body instanceof FormData;
  getToken(baseURL, (token) => {
    const headers = {
      "Authorization": `Bearer ${token.token}`,
      // "Content-Type": "application/json",
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    };
    const baseUrlData = `${baseURL.replace(/\/$/, '')}/${cleanPath.replace(/^\//, '')}`;
    axios.post(baseUrlData, body, { headers })
      .then(response => {
        if (onSuccess) onSuccess(response);
      })
      .catch(error => {
        console.error('Full error:', error);
      });
  }, (tokenError) => {
    console.error('Token error:', tokenError);
    if (onError) onError(tokenError);
  });
};

export default API;