import ChallengeAuthenticator from '../../selectors/ChallengeAuthenticator';
import a18nClient from '../../management-api/a18nClient';
import setInputField from '../setInputField';
import ActionContext from './context';

export default async function (this: ActionContext) {
  const code = await a18nClient.getEmailCode(this.a18nProfile.profileId);
  await setInputField('set', code as string, ChallengeAuthenticator.code);
}
