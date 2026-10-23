type RegisterPayload = {
  picture: string;
  mail: string;
  password: string;
  tag: string;
  speciality: string;
  role: string;
};

export class RegisterError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'RegisterError';
    this.status = status;
  }
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await fetch('/api/auths/register-and-get', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    let message = "Erreur lors de l'inscription";

    try {
      const errorBody = await response.json();
      if (errorBody?.message) {
        message = errorBody.message;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new RegisterError(message, response.status);
  }

  return response.json();
};
