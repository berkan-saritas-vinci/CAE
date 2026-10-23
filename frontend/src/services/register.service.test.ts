import { beforeEach, describe, expect, test, vi } from 'vitest';
import { RegisterError, registerUser } from './register.service';

describe('register.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  test('registerUser sends the right request and returns the created user', async () => {
    const createdUser = { id: 1, mail: 'test@mail.com' };

    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: true,
      json: async () => createdUser,
    });

    const payload = {
      picture: '/img.png',
      mail: 'test@mail.com',
      password: 'secret',
      tag: 'tester',
      speciality: 'Backend',
      role: 'USER',
    };

    const result = await registerUser(payload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auths/register-and-get',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    expect(result).toEqual(createdUser);
  });

  test('registerUser throws RegisterError with backend JSON message', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'MAIL_ALREADY_USED' }),
    });

    await expect(
      registerUser({
        picture: '/img.png',
        mail: 'test@mail.com',
        password: 'secret',
        tag: 'tester',
        speciality: 'Backend',
        role: 'USER',
      }),
    ).rejects.toMatchObject({
      name: 'RegisterError',
      message: 'MAIL_ALREADY_USED',
      status: 400,
    });
  });

  test('registerUser uses default message when JSON has no message field', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({}),
      text: async () => 'should not be used',
    });

    await expect(
      registerUser({
        picture: '/img.png',
        mail: 'test@mail.com',
        password: 'secret',
        tag: 'tester',
        speciality: 'Backend',
        role: 'USER',
      }),
    ).rejects.toMatchObject({
      message: "Erreur lors de l'inscription",
      status: 422,
    });
  });

  test('registerUser falls back to text body when JSON parsing fails', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => {
        throw new Error('invalid json');
      },
      text: async () => 'Erreur brute',
    });

    await expect(
      registerUser({
        picture: '/img.png',
        mail: 'test@mail.com',
        password: 'secret',
        tag: 'tester',
        speciality: 'Backend',
        role: 'USER',
      }),
    ).rejects.toBeInstanceOf(RegisterError);
  });

  test('registerUser uses default message when backend sends no content', async () => {
    (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('invalid json');
      },
      text: async () => '',
    });

    await expect(
      registerUser({
        picture: '/img.png',
        mail: 'test@mail.com',
        password: 'secret',
        tag: 'tester',
        speciality: 'Backend',
        role: 'USER',
      }),
    ).rejects.toThrow("Erreur lors de l'inscription");
  });
});
