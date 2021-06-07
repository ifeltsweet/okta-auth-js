import checkIsOnPage from '../check/checkIsOnPage';
import SelectAuthenticator from '../selectors/SelectAuthenticator';
import clickElement from './clickElement';
import selectOption from './selectOption';

export default async () => {
  await selectOption('value', 'phone', SelectAuthenticator.options);
  await clickElement('click', 'selector', SelectAuthenticator.submit);
  await checkIsOnPage('Enroll phone authenticator');
};
