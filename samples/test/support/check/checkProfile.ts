import checkEqualsText from './checkEqualsText';
import waitForDisplayed from '../wait/waitForDisplayed';
import UserHome from '../selectors/UserHome';
import ActionContext from '../action/live-user/context';

export default async function(this: ActionContext) {
  // verify profile info
  const isLiveProfile = !!this.user;
  const email = isLiveProfile && this.user.profile.email || (process.env.USERNAME as string);
  await waitForDisplayed(UserHome.email, false);
  await checkEqualsText('element', UserHome.email, false, email);
}