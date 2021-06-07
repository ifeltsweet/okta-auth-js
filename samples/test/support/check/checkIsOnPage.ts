import PasswordRecover from '../selectors/PasswordRecover';
import SelectAuthenticator from '../selectors/SelectAuthenticator';
import ChallengeAuthenticator from '../selectors/ChallengeAuthenticator';
import waitForDisplayed from '../wait/waitForDisplayed';
import PasswordReset from '../selectors/PasswordReset';
import EnrollPhoneAuthenticator from '../selectors/EnrollPhoneAuthenticator';

/**
 * Check if browser has navigated to expected page
 * @param  {String}   pageName       Expected page title
 */
/* eslint-disable complexity, max-statements */
export default async (pageName?: string) => {

  let selector;
  let pageTitle;
  switch (pageName) {
    case 'Self Service Password Reset View': {
      selector = PasswordRecover.pageTitle;
      pageTitle = 'Recover password';
      break;
    }
    case 'Select authenticator': {
      selector = SelectAuthenticator.pageTitle;
      pageTitle = 'Select authenticator';
      break;
    }
    case 'Enter Code': {
      selector = ChallengeAuthenticator.pageTitle;
      pageTitle = 'Challenge email authenticator';
      break;
    }
    case 'Enroll phone authenticator': {
      selector = EnrollPhoneAuthenticator.pageTitle;
      pageTitle = 'Enroll phone authenticator';
      break;
    }
    case 'Reset Password': {
      selector = PasswordReset.pageTitle;
      pageTitle = 'Reset password';
      break;
    }
    case 'Root Page':
    case 'Root View': {
      selector = '#claim-email_verified';
      pageTitle = 'true';
      break;
    }

    default: {
        throw new Error(`Unknown form "${pageTitle}"`);
    }
  }

  await waitForDisplayed(selector);
  const currentPageTitle = await (await $(selector)).getText();
  expect(currentPageTitle).toEqual(pageTitle);
};
