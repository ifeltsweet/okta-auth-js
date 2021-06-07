import { A18nProfile } from './a18nClient';
import { Client, User } from '@okta/okta-sdk-nodejs';
import { getConfig } from '../../util';

export default async function(user: User, a18nProfile: A18nProfile): Promise<boolean> {
  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  const smsFactor = {
    factorType: 'sms',
    provider: 'OKTA',
    profile: {
      phoneNumber: a18nProfile.phoneNumber
    }
  };

  const res = await oktaClient.enrollFactor(user.id, smsFactor, {
    activate: true
  });
  
  return (res.status == 'ACTIVE');
}
