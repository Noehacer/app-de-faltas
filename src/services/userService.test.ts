import { userService } from './userService';

const mockSignUp = jest.fn();
const mockRpc = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
  createEphemeralClient: () => ({ auth: { signUp: (...args: unknown[]) => mockSignUp(...args) } }),
}));

const account = { full_name: 'Ana Ruiz', email: 'ana@escuela.com', password: 'secreto1', role: 'maestro' as const };

beforeEach(() => {
  mockSignUp.mockReset();
  mockRpc.mockReset();
});

describe('userService.createAccount', () => {
  it('registra la cuenta y luego crea el perfil con el rol elegido', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'u1', identities: [{}] } }, error: null });
    mockRpc.mockResolvedValue({ error: null });

    await userService.createAccount(account);

    expect(mockSignUp).toHaveBeenCalledWith({ email: 'ana@escuela.com', password: 'secreto1' });
    expect(mockRpc).toHaveBeenCalledWith('admin_register_profile', {
      p_user_id: 'u1',
      p_full_name: 'Ana Ruiz',
      p_role: 'maestro',
    });
  });

  it('falla si el correo ya estaba registrado y no crea el perfil', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'u1', identities: [] } }, error: null });

    await expect(userService.createAccount(account)).rejects.toThrow('Ese correo ya está registrado.');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('propaga el error de signUp', async () => {
    mockSignUp.mockResolvedValue({ data: { user: null }, error: new Error('Password too short') });

    await expect(userService.createAccount(account)).rejects.toThrow('Password too short');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('propaga el error si el perfil no se pudo registrar', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'u1', identities: [{}] } }, error: null });
    mockRpc.mockResolvedValue({ error: new Error('Solo un encargado puede crear cuentas') });

    await expect(userService.createAccount(account)).rejects.toThrow('Solo un encargado');
  });
});

describe('userService.setActive', () => {
  it('usa la función admin_set_active', async () => {
    mockRpc.mockResolvedValue({ error: null });
    await userService.setActive('u2', false);
    expect(mockRpc).toHaveBeenCalledWith('admin_set_active', { p_user_id: 'u2', p_active: false });
  });

  it('lanza el error si la base de datos lo rechaza', async () => {
    mockRpc.mockResolvedValue({ error: new Error('No puedes desactivar tu propia cuenta') });
    await expect(userService.setActive('yo', false)).rejects.toThrow('propia cuenta');
  });
});
