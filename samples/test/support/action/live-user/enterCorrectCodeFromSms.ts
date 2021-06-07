import ChallengeAuthenticator from '../../selectors/ChallengeAuthenticator';
import a18nClient from '../../management-api/a18nClient';
import setInputField from '../setInputField';

export default async function () {
  const code = await a18nClient.getSmsCode(this.a18nProfile.profileId);
  await setInputField('set', code, ChallengeAuthenticator.code);
}
