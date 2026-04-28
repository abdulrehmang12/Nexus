import React, { useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const {
    user,
    updateProfile,
    changePassword,
    requestTwoFactorOtp,
    verifyTwoFactorOtp,
  } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    preferences: (user?.preferences || []).join(', '),
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const roleFields = useMemo(() => {
    if (user?.role === 'entrepreneur') {
      return (
        <p className="text-sm text-gray-500">
          Startup-specific profile fields can be edited through the backend-backed profile form in your dashboard.
        </p>
      );
    }

    return (
      <p className="text-sm text-gray-500">
        Investment focus and portfolio details are stored in your live profile and can be updated through the role forms.
      </p>
    );
  }, [user?.role]);

  if (!user) {
    return null;
  }

  const handleProfileSave = async () => {
    await updateProfile({
      name: profileForm.name,
      bio: profileForm.bio,
      location: profileForm.location,
      preferences: profileForm.preferences.split(',').map((entry) => entry.trim()).filter(Boolean),
    });
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleRequestOtp = async () => {
    const otp = await requestTwoFactorOtp();
    setGeneratedOtp(otp);
  };

  const handleVerifyOtp = async () => {
    await verifyTwoFactorOtp(otpCode);
    setOtpCode('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your live account, security, and mock 2FA flow.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="Full name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} fullWidth />
              <Input label="Location" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} fullWidth />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <Input
                label="Preferences"
                value={profileForm.preferences}
                onChange={(e) => setProfileForm({ ...profileForm, preferences: e.target.value })}
                fullWidth
                helperText="Comma-separated keywords"
              />
              {roleFields}
              <div className="flex justify-end">
                <Button onClick={handleProfileSave}>Save Changes</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input label="Current password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} fullWidth />
              <Input label="New password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} fullWidth />
              <Input label="Confirm new password" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} fullWidth error={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : undefined} />
              <div className="flex justify-end">
                <Button onClick={handlePasswordSave}>Update Password</Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Security</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Two-factor authentication</span>
              <Badge variant={user.twoFactorEnabled ? 'success' : 'error'}>
                {user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
              </Badge>
            </div>
            <Button variant="outline" fullWidth onClick={handleRequestOtp}>
              Generate Mock OTP
            </Button>
            {generatedOtp && (
              <div className="rounded-md bg-primary-50 p-3">
                <p className="text-sm text-primary-800">Generated OTP</p>
                <p className="mt-1 font-mono text-lg text-primary-900">{generatedOtp}</p>
              </div>
            )}
            <Input label="Verify OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} fullWidth />
            <Button fullWidth onClick={handleVerifyOtp}>
              Enable 2FA
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
