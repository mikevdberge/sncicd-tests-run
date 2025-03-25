import crypto from 'node:crypto'
import axios from 'axios';
import * as tunnel from 'tunnel';
import beautify from 'json-beautify';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));
const instance = argv['i']
const secret = argv['s']
const keyId = argv['k']
const testsuitsysid = argv['t']

// Create HMAC token
const hmac = (text, secret) => {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(text)
    const hmacDigest = hmac.digest('base64')
    return hmacDigest
}

// Generating the ServiceNow HMAC header value for GET requests
const body = '{"":""}'
const token = hmac(body, secret)
const snToken = 'KEYID='+keyId+',SIGNATURE='+token

const snHeader = {'x-sn-hmac-signature-256': snToken}
console.log('Token: '+ snToken)

// Target website URL
const targetUrl = 'https://'+instance+'/api/sn_cicd/testsuite/run?test_suite_sys_id='+testsuitsysid;
const targetUrl2 = 'https://'+instance+'/api/now/table/incident?sysparm_limit=1';
console.log('Target URL: '+targetUrl);

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
    headers: snHeader,
    proxy: false,    
});


let res = await axiosClient.post(targetUrl,{
    "":""
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

res = await axiosClient.get(targetUrl2,{
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
