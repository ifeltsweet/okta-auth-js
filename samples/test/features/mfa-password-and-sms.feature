Feature: Multi-Factor Authentication with Password and SMS

  Background:
	  Given a SPA, WEB APP or MOBILE Policy that defines MFA with Password and SMS as required
	    And an Authenticator Enrollment Policy that has PHONE as optional and EMAIL as required for the Everyone Group
	    And a User named "Mary" created that HAS NOT yet enrolled in the SMS factor

  Scenario: Mary enters a wrong verification code on verify
    Given Mary has enrolled in the SMS factor
      And Mary navigates to the Basic Login View
      And she has inserted her username
      And she has inserted her password
      And her password is correct
    When she clicks Login
    Then she is presented with an option to select SMS to verify
    When She selects SMS from the list of methods
    Then the screen changes to receive an input for a code
    When She inputs the incorrect code from the SMS
    Then the sample show as error message "Invalid code. Try again." on the SMS Challenge page
      And she sees a field to re-enter another code
  