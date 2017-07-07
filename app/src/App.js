import React from 'react';
import { KJUR, KEYUTIL } from 'jsrsasign';
import * as serialize from 'canonical-json';

class Auth {

  constructor () {

    let publicKey = localStorage.getItem("public");
    let privateKey = localStorage.getItem("private");

    if (!(publicKey && privateKey)) {
      let curve = "secp256k1";
      let keypair = KEYUTIL.generateKeypair("EC", curve);
      
      publicKey = keypair.pubKeyObj.pubKeyHex;
      privateKey = keypair.prvKeyObj.prvKeyHex;

      localStorage.setItem("public", publicKey);
      localStorage.setItem("private", privateKey);
    }

    console.log("Your privateKey is " + privateKey);
  }

  onMessage (e) {
    console.info("New message", e.data, e.origin);

    if (e.origin === window.origin) {
      return;
    }

    let response;

    try {    
      response = this.handleRequest(e.data);
    } catch (err) {
      response = {'error': err};
    }

    console.info(response);

    e.source.postMessage(response, e.origin);
  };


  handleRequest (data) {
    console.info(data);

    this.validateRequest(data);

    switch (data.method){
      case 'signClaim':
        return this.signClaim(...data.args);
      case 'getIdentity':
        return this.getIdentity(...data.args);
      default:
        throw 'No such method like \'' + data.method +'\'';
    }
  }

  signClaim (claim) {
    let msg = serialize(claim);
    let publicKey = localStorage.getItem("public");
    let privateKey = localStorage.getItem("private");

    let sig = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
    
    // Sign claim
    let message = serialize(claim);
    
    sig.init(KEYUTIL.getKeyFromPlainPrivatePKCS8Hex(privateKey));
    sig.updateString(message);
    let signature = sig.sign();
    
    signature = {
      type: "ecdsa.secp256r1",
      creator: publicKey,
      signatureValue: signature
    };

    return signature;
  }

  getIdentity () {
    return localStorage.getItem("public");
  }

  validateRequest(data) {
    console.info("Validate", data);

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
}

class App extends React.Component {

  constructor () {
    super();
    this.auth = new Auth();
    window.onmessage = this.auth.onMessage.bind(this.auth);
  }

  render() {
    return (
      <div>Hello to Auth Service</div>
    );
  }
};

export default App;

