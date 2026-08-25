import { AdminGuard } from '../admin.guard';
import { AuthService } from '../../services/auth.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: { isAdmin: jest.Mock };
  let router: { navigate: jest.Mock };

  beforeEach(() => {
    authService = { isAdmin: jest.fn() };
    router = { navigate: jest.fn() };
    guard = new AdminGuard(authService as unknown as AuthService, router as any);
  });

  it('allows activation when the user is an admin', () => {
    authService.isAdmin.mockReturnValue(true);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to /tickets and blocks activation when the user is not an admin', () => {
    authService.isAdmin.mockReturnValue(false);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/tickets']);
  });
});
