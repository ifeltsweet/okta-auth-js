const express = require('express');
const { 
  getAuthClient,
  handleTransaction,
  renderTemplate,
  renderPage,
} = require('../utils');

const router = express.Router();

// entry route
router.get('/recover-password', (req, res) => {
  req.setFlowStates({
    entry: '/recover-password',
    idxMethod: 'recoverPassword'
  });

  renderTemplate(req, res, 'recover-password', {
    action: '/recover-password'
  });
});

router.post('/recover-password', async (req, res, next) => {
  const { username } = req.body;
  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({ username });
  handleTransaction({ req, res, next, authClient, transaction });
});

// Handle reset password
router.get('/reset-password', (req, res) => {
  renderPage({
    req, res,
    render: () => renderTemplate(req, res, 'enroll-or-reset-password-authenticator', {
      title: 'Reset password',
      action: '/reset-password'
    })
  });
});

router.post('/reset-password', async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    // TODO: handle error in validation middleware
    next(new Error('Password not match'));
    return;
  }

  const authClient = getAuthClient(req);
  const transaction = await authClient.idx.recoverPassword({ password });
  handleTransaction({ req, res, next, authClient, transaction });
});

module.exports = router;
