import setInputField from '../setInputField';
import EnrollPhoneAuthenticator from '../../selectors/EnrollPhoneAuthenticator';

export default async function() {
  await setInputField('set', this.a18nProfile.phoneNumber, EnrollPhoneAuthenticator.phone);
}
