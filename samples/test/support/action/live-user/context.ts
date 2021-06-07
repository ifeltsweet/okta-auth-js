import { User } from '@okta/okta-sdk-nodejs';
import {A18nProfile} from '../../management-api/a18nClient';

export default interface ActionContext {
  a18nProfile: A18nProfile;
  user: User;
};
