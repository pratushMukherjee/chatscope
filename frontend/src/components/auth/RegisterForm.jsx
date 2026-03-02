import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser, loginUser, getMe } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { validateEmail, getPasswordStrength } from '../../utils/validators';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const strength = getPasswordStrength(password);

  const validate = () => {
    const errs = {};
    if (!validateEmail(email)) errs.email = 'Valid email required';
    if (username.length < 3) errs.username = 'At least 3 characters';
    if (password.length < 8) errs.password = 'At least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await registerUser(email, username, password);
      const tokens = await loginUser(email, password);
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({ state: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token } })
      );
      const user = await getMe();
      login(user, tokens.access_token, tokens.refresh_token);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        label="Username"
        type="text"
        placeholder="Choose a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
      />
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        {password && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                  style={{ width: strength.width }}
                />
              </div>
              <span className="text-xs text-gray-500">{strength.label}</span>
            </div>
          </div>
        )}
      </div>
      <Button type="submit" loading={loading} className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
