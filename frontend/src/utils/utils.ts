// src/utils.ts

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: 'errors.auth.invalid_email',
}

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: 'errors.auth.invalid_name',
}

export const passwordRules = (isRequired = true) => {
  const rules: { [key: string]: { value?: number; message: string } | string } =
    {
      minLength: {
        value: 8,
        message: 'errors.auth.password_length',
      },
    }

  if (isRequired) {
    rules.required = 'errors.auth.password_required'
  }

  return rules
}

export const confirmPasswordRules = (
  getValues: () => { password?: string; new_password?: string },
  isRequired = true
) => {
  const rules: {
    validate: (value: string) => true | string
    required?: string
  } = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password
      return value === password ? true : 'errors.auth.password_mismatch'
    },
  }

  if (isRequired) {
    rules.required = 'errors.auth.password_required'
  }

  return rules
}
