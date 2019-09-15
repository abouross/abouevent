<?php


namespace App\Http\Admin\Controllers\Auth;


use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\VarDumper\VarDumper;

class LoginController extends Controller
{
    use ThrottlesLogins;

    private $admin = null;

    public function login(Request $request)
    {
        $this->validateLogin($request);

        if (method_exists($this, 'hasTooManyLoginAttempts') &&
            $this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);

            return $this->sendLockoutResponse($request);
        }

        if ($this->attemptLogin($request)) {
            $this->clearLoginAttempts($request);

            $token = Str::random(60);

            $this->admin->forceFill([
                'api_token' => hash('sha256', $token),
            ])->save();

            return ['token' => $token];
        }

        $this->incrementLoginAttempts($request);

        throw ValidationException::withMessages([
            $this->username() => [trans('auth.failed')],
        ]);
    }

    /**
     * @param Request $request
     */
    protected function validateLogin(Request $request)
    {
        $request->validate([
            $this->username() => 'required|string',
            'password' => 'required|string',
        ]);
    }

    /**
     * @return string
     */
    public function username()
    {
        return 'email';
    }

    /**
     * @param Request $request
     * @return bool
     */
    protected function attemptLogin(Request $request)
    {
        $this->admin = Admin::where($this->username(), $request->get($this->username()))->first();
        if ($this->admin) {
            return password_verify($request->get('password'), $this->admin->password);
        }
        return false;
    }

    /**
     * @param Request $request
     * @return array
     */
    protected function credentials(Request $request)
    {
        return $request->only($this->username(), 'password');
    }

}
