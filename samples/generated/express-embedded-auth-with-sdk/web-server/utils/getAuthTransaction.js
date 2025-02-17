const AuthTransaction = require('@okta/okta-auth-js').AuthTransaction;
const getAuthClient = require('./getAuthClient');

module.exports = function getAuthTransaction(req) {
  const authClient = getAuthClient(req);
  const meta = authClient.transactionManager.load();
  if (meta) {
    console.log(`getAuthTransaction: using existing transaction: ${req.transactionId}`);
    return Promise.resolve(new AuthTransaction(authClient, meta));
  }

  console.log(`getAuthTransaction: starting new transaction: ${req.transactionId}`);
  return authClient.idx.startAuthTransaction({ state: req.transactionId });
};
