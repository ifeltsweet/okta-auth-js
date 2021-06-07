import createUser from '../../management-api/createUser';
import ActionContext from './context';
import { User } from '@okta/okta-sdk-nodejs';
import {A18nProfile} from '../../management-api/a18nClient';

export default async function (this: ActionContext, firstName: string, assignToGroups?: string[]): Promise<void> {
   const [user, a18nProfile] = await createUser(firstName, assignToGroups);
   this.user = user as User;
   this.a18nProfile = a18nProfile as A18nProfile;
}