/*global web3 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { KJUR } from 'jsrsasign';

// import validate from 'react-joi-validation';

import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

window.onmessage = function(e) {

    if(e.ports.length > 0) {

        try {
            let client = authorizeClient(e.data, e.origin);
            validateSchema(e.data);
            let result = handle(e.data);
            e.ports[0].postMessage({'result': result});
        }
        catch (err) {
          e.ports[0].postMessage({'error': err});
        }
    } else {
        console.log(e);
    }
};

function authorizeClient(data, origin) {

  if (data.hasOwnProperty('apiKey') && data['apiKey'] === 'ABCDEFG' && origin === "http://local.userfeeds.io"){
    return {
      'appId': 0,
    }
  }

  throw 'Authorization Error';
}

function validateSchema(data) {
  if (!(data instanceof Object)) {
    throw 'Data Schema Validation Failed';
  }

  //replace with schema validation
  if (!data.hasOwnProperty('method')) {
    throw 'missing \`method\`';
  }

  if (!data.hasOwnProperty('args')) {
    throw 'missing \`args\`';
  }

  if (!(data.args instanceof Array)) {
    throw 'args should be an Array';
  }

}

function handle(data) {

  switch (data.method){
    case 'signMsg':
      return signMsg(...data.args);
    case 'getPublicKey':
      return getPublicKey(...data.args);
    default:
      throw 'No such method like \'' + data.method +'\'';
  }
}

function signMsg(msg) {
  let {publicKey, privateKey} = getKeys();

  // generate Signature object
  let sig = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
  // set private key for sign
  sig.initSign({'ecprvhex': privateKey, 'eccurvename': "secp256r1"});
  // update data
  sig.updateString(msg);
  // calculate signature
  let signature = sig.sign();

  signature = {
    type: "SHA256withECDSA.secp256r1",
    creator: publicKey,
    signatureValue: signature
  };

  return signature;
}

function getPublicKey() {
  let {publicKey, privateKey} = getKeys();
  return publicKey;
}

function getKeys () {
  // return (dispatch) => {
    let publicKey = localStorage.getItem("public");
    let privateKey = localStorage.getItem("private");
    let shhIdentity = localStorage.getItem("shh");

    if (!(publicKey && privateKey)) {
      var ec = new KJUR.crypto.ECDSA({"curve": "secp256r1"});
      var keypair = ec.generateKeyPairHex();

      localStorage.setItem("public", keypair.ecpubhex);
      localStorage.setItem("private", keypair.ecprvhex);
    }

    // //TODO: refactor
    // if (typeof web3 !== 'undefined') {
    //   if (!shhIdentity) {
    //     web3.shh.newIdentity((err, result) => {
    //       localStorage.setItem("shh", result);
    //     });
    //   } else {
    //     web3.shh.hasIdentity(shhIdentity, (err, valid) => {
    //       if (err) {
    //         throw Error(err);
    //       }
    //       if (!valid) {
    //         web3.shh.newIdentity((err, result) => {
    //           localStorage.setItem("shh", result);
    //         });
    //       }
    //     });
    //   }
    // }

    return {publicKey, privateKey};
}
