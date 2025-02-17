module.exports = function getFormActionPath(req, path) {
  if (!path) {
    return '';
  }
  
  const { transactionId } = req;

  const url = new URL(path, 'relative:///');
  url.searchParams.set('state', transactionId);
  
  return `${url.pathname}${url.search}${url.hash}`;
};
