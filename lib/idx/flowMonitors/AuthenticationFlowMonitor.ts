import { FlowMonitor } from './FlowMonitor';

export class AuthenticationFlowMonitor extends FlowMonitor {
  isRemediatorCandidate(remediator, remediations?, values?) {
    const prevRemediatorName = this.previousRemediator?.getName();
    const remediatorName = remediator.getName();
    
    if (remediatorName === 'select-authenticator-authenticate' 
      && ['select-authenticator-authenticate'].includes(prevRemediatorName)) {
      return false;
    }

    if (remediatorName === 'select-authenticator-authenticate' 
      && remediations.some(({ name }) => name === 'challenge-authenticator')) {
      return false;
    }

    if (remediatorName === 'select-authenticator-enroll' 
      && [
          'select-authenticator-enroll', 
          'authenticator-enrollment-data'
        ].includes(prevRemediatorName)) {
      return false;
    }

    return super.isRemediatorCandidate(remediator, remediations, values);
  }
}
