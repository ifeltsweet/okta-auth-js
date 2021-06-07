
import deleteUser from '../../management-api/deleteUser';
import ActionContext from './context';

export default async function(this: ActionContext): Promise<void> {
  await deleteUser(this.user, this.a18nProfile);
}
