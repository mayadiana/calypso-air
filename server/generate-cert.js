const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

async function executaGenerare() {
  console.log('=== Pornire Generare Securizată ===');
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const options = { days: 365 };

  // Strategia 1: Tratăm rezultatul ca Promise / Async (Așa cum indică tabloul gol [])
  try {
    let pems = selfsigned.generate(attrs, options);
    
    // Dacă este Promise, așteptăm după el cu await
    if (pems && typeof pems.then === 'function') {
      console.log('Librăria a returnat un Promise. Se așteaptă rezolvarea asincronă...');
      pems = await pems;
    }

    if (pems && (pems.private || pems.cert || pems.privateKey)) {
      salveazaFisiere(pems, 'Promise / Async');
      return;
    }
  } catch (eroarePromise) {
    console.log('Metoda Promise a eșuat, încercăm metoda clasică cu Callback...');
  }

  // Strategia 2: Tratăm ca metodă tradițională cu Callback
  try {
    selfsigned.generate(attrs, options, function (err, pems) {
      if (err) {
        console.error('Eroare în execuția Callback:', err);
        return;
      }
      if (pems && (pems.private || pems.cert || pems.privateKey)) {
        salveazaFisiere(pems, 'Callback pur');
      } else {
        console.error('Eroare critică: Nicio metodă nu a putut extrage cheile din pachet.');
      }
    });
  } catch (eroareCallback) {
    console.error('Toate strategiile de citire a pachetului au eșuat:', eroareCallback.message);
  }
}

function salveazaFisiere(pems, metodaFolosita) {
  // Extragere flexibilă în funcție de denumirile interne ale versiunii
  const privateKey = pems.private || pems.privateKey || pems.key;
  const cert = pems.cert || pems.certificate;

  if (!privateKey || !cert) {
    console.error('Structura internă a cheilor este incompletă:', Object.keys(pems));
    return;
  }

  fs.writeFileSync(path.join(__dirname, 'key.pem'), privateKey);
  fs.writeFileSync(path.join(__dirname, 'cert.pem'), cert);
  
  console.log(`✅ [SUCCES] Certificatele au fost generate structural corect prin metoda: ${metodaFolosita}!`);
  process.exit(0);
}

executaGenerare();