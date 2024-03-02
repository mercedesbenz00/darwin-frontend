/**
 * form-validator functions
 */
import isEmpty from 'validator/lib/isEmpty'

export const validatePassword = (password: string): string[] => {
  const issues = []

  if (isEmpty(password)) {
    issues.push('Please type in a password')
  }

  if (!/[a-z]/.test(password)) {
    issues.push('At least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('At least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    issues.push('At least one digit')
  }

  if (password.length < 8) {
    issues.push('At least 8 characters')
  }

  return issues
}

export const validateBusinessDomain = (domain: string): string[] => {
  const issues = []

  const businessDomainCheck = /^(?!@(gmail|google|yahoo|outlook|hotmail|msn|qq)\..+)(@.+\..+)$/
  const domainCheck = /^(@.+\..+)$/
  if (!domainCheck.test(domain)) {
    issues.push('Please input correct domain format')
  } else if (!businessDomainCheck.test(domain)) {
    issues.push('Please input business domain')
  }

  return issues
}
