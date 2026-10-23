function emailChecker(mail: string): boolean {
  if (!mail.includes('@')) {
    return false;
  }

  if (mail.includes(' ')) {
    return false;
  }

  const parts = mail.split('@');

  if (parts[0].length == 0) {
    return false;
  }

  const domain = parts[1];

  if (!domain.includes('.') || domain.endsWith('.')) {
    return false;
  }

  return true;
}

function passwordChecker(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  if (!/[0-9]/.test(password)) {
    return false;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return false;
  }
  return true;
}

export { emailChecker, passwordChecker };
