import setInputField from '../setInputField';
import EnrollPhoneAuthenticator from '../../selectors/EnrollPhoneAuthenticator';
import ActionContext from './context';

export default async function(this: ActionContext) {
  await setInputField('set', this.a18nProfile.phoneNumber, EnrollPhoneAuthenticator.phone);
}
