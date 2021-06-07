import checkEqualsText from './checkEqualsText';
import waitForDisplayed from '../wait/waitForDisplayed';
import UserHome from '../selectors/UserHome';

export default async function() {
  // verify profile info
  const isLiveProfile = !!this.user;
  const email: string = isLiveProfile && this.user.profile.email || process.env.USERNAME;
  await waitForDisplayed(UserHome.email, false);
  await checkEqualsText('element', UserHome.email, false, email);
}