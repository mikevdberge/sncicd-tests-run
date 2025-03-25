import crypto from 'node:crypto'
import fetch from 'node-fetch';
import axios from 'axios';
import HttpsProxyAgent from 'https-proxy-agent';
import * as tunnel from 'tunnel';
import beautify from 'json-beautify';


const hmac = (text, password) => {
    const hmac = crypto.createHmac('sha256', password)
    hmac.update(text)
    const hmacDigest = hmac.digest('base64')
    return hmacDigest
}

// Generating the ServiceNow HMAC token
const body = '{"":""}'
const token = hmac(body, '2x35kgbzhc9a9zm0pknis79sd0oh9bvo6mnm')
const snToken = 'KEYID=MyHMACSecret,SIGNATURE='+token

axios.defaults.headers.get['x-sn-hmac-signature-256'] = snToken // for GET requests

// Target website URL
const targetUrl = 'https://ingcd.service-now.com/api/now/table/incident?sysparm_limit=1';

// https://janmolak.com/node-js-axios-behind-corporate-proxies-8b17a6f31f9d
// Proxy configuration
const proxyHost = 'localhost';
const proxyPort = 3128;

const agent = tunnel.httpsOverHttp({
    proxy: {
        host: proxyHost,
        port: proxyPort,
    },
});

const axiosClient = axios.create({
    baseURL: targetUrl,
    httpsAgent: agent,
    proxy: false,    
});

const res = await axiosClient.get(targetUrl,{
    data: body
    })
.then(function (response) {
    // handle success
    console.log('Status: ' + response.status);
    console.log('Body: ' + beautify(response.data,null,2,100 ));    
  })
  .catch(function (error) {
    // handle error
    console.log('Error: ' + error);
  })
  .finally(function () {
    // always executed
  });


// this proxy plain object includes both https.Agent and ProxyAgent
// implements for https proxy


//const proxyUrl = `http://${proxyHost}:${proxyPort}`;
//const proxyAgent = new HttpsProxyAgent(proxyUrl);

//const httpsAgent = new HttpsProxyAgent({host: "proxyhost", port: "proxyport", auth: "username:password"})

//use axios as you normally would, but specify httpsAgent in the config
//let axio = axios.create({proxyAgent});


// const headers = new Headers();
// headers.append("Accept", "application/json");
// headers.append("Accept-Encoding", "*");
// headers.append("x-sn-hmac-signature-256", snToken);
// headers.append("Content-Type","application/json");

// const method = "GET"

// const response = await fetch(targetUrl,{
//     method,
//     headers,
//     ...(method !== 'GET' && { body: JSON.stringify('{}') }),
//      /**
//       * Courtesy of:
//       * https://github.com/whatwg/fetch/issues/551
//       */
//     })
// const resp = await response.text();
// console.log(resp);


