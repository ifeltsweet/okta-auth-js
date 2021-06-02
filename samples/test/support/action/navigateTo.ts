import waitForDisplayed from '../wait/waitForDisplayed';
import LoginForm from '../selectors/LoginForm';
import { OktaSignInV1, OktaSignInOIE } from  '../selectors';
import Home from '../selectors/Home';
import startApp from './startApp';
const OktaSignIn = process.env.ORG_OIE_ENABLED ? OktaSignInOIE : OktaSignInV1;

export default async (
  userName: string,
  formName: string
) => {
  let url = '/';
  let queryParams;
  let selector;
  switch (formName) {
    case 'the Basic Login View':
    case 'Login with Username and Password': {
        url = '/login';
        selector = LoginForm.password;
        queryParams = { flow: 'form' };
        break;
    }

    case 'Login with Social IDP': {
      url = '/login';
      selector = OktaSignIn.signinWithGoogleBtn;
      queryParams = { flow: 'widget' };
      break;
    }

    case 'the Root View': {
      url = '/';
      selector = Home.serverConfig;
      queryParams = { flow: 'form' };
      break;
    }

    default: {
        throw new Error(`Unknown form "${formName}"`);
    }
  }

  await startApp(url, queryParams);
  await waitForDisplayed(selector, false);
};
