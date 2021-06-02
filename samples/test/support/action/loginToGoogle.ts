import GoogleSignIn from  '../selectors/GoogleSignIn';
import Home from  '../selectors/Home';
import { getConfig } from '../../util/configUtils';
import waitForDisplayed from '../wait/waitForDisplayed';
import setInputField from './setInputField';
import clickElement from './clickElement';

export default async (
  options: Record<string, string> = {}
) => {
  const config = getConfig();
  const googleUsername = options.googleUsername || config.googleUsername;
  if (!googleUsername) {
    throw new Error('GOOGLE_USERNAME was not set');
  }
  const googlePassword = options.googlePassword || config.googlePassword;
  if (!googlePassword) {
    throw new Error('GOOGLE_PASSWORD was not set');
  }

  // enter login
  await waitForDisplayed(GoogleSignIn.identifier);
  await waitForDisplayed(GoogleSignIn.identifierNext);
  await setInputField('set', googleUsername, GoogleSignIn.identifier);
  await clickElement('click', 'selector', GoogleSignIn.identifierNext);

  // enter password
  await waitForDisplayed(GoogleSignIn.password);
  await waitForDisplayed(GoogleSignIn.passwordNext);
  await setInputField('set', googlePassword, GoogleSignIn.password);
  await clickElement('click', 'selector', GoogleSignIn.passwordNext);

  // wait for redirect
  await waitForDisplayed(Home.serverConfig, false);
};

