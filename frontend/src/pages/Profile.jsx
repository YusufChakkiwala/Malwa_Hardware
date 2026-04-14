import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/uploadService';
import { useUserAuth } from '../context/UserAuthContext';

function Profile() {
  const navigate = useNavigate();
  const { currentUser, profile, loading, saveProfile, logoutUser, deleteAccount } = useUserAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phoneNumber: '',
    address: '',
    city: '',
    avatarUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      displayName: profile.displayName || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || '',
      city: profile.city || '',
      avatarUrl: profile.avatarUrl || currentUser?.photoURL || ''
    });
  }, [profile, currentUser]);

  const namePreview = useMemo(() => {
    const name = String(form.displayName || '').trim();
    if (name) return name;
    return `${String(form.firstName || '').trim()} ${String(form.lastName || '').trim()}`.trim() || 'User';
  }, [form.displayName, form.firstName, form.lastName]);

  const onAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage('');
    setError('');
    try {
      const avatarUrl = await uploadImage(file);
      setForm((prev) => ({ ...prev, avatarUrl }));
      setMessage('Avatar uploaded successfully.');
    } catch (uploadError) {
      setError(uploadError?.message || 'Unable to upload avatar.');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await saveProfile(form);
      setMessage('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await logoutUser();
    navigate('/auth', { replace: true });
  };

  const onDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account?');
    if (!confirmed) return;

    setSaving(true);
    setMessage('');
    setError('');
    try {
      await deleteAccount();
      navigate('/auth', { replace: true });
    } catch (deleteError) {
      if (deleteError?.code === 'auth/requires-recent-login') {
        setError('Please logout, login again, and then retry account deletion for security.');
      } else {
        setError(deleteError?.message || 'Unable to delete account.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading profile...</p>;
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="surface-panel mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl text-slate-900">Profile Settings</h1>
      <p className="mt-2 text-sm text-slate-600">Manage your account details, avatar, and security options.</p>

      <form className="mt-5 space-y-4" onSubmit={onSave}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <img
            src={
              form.avatarUrl ||
              currentUser?.photoURL ||
              'https://ui-avatars.com/api/?background=1f2937&color=f8fafc&name=' + encodeURIComponent(namePreview)
            }
            alt={namePreview}
            className="h-24 w-24 rounded-full border border-slate-200 object-cover shadow-industrial"
          />
          <div>
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{namePreview}</span>
            </p>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <label className="btn-secondary mt-3 inline-block cursor-pointer text-xs">
              {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onAvatarChange}
                disabled={uploadingAvatar}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={form.firstName}
            onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            placeholder="First Name"
          />
          <input
            required
            value={form.lastName}
            onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            placeholder="Last Name"
          />
        </div>

        <input
          value={form.displayName}
          onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
          placeholder="Display Name"
        />
        <input
          value={form.phoneNumber}
          onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
          placeholder="Phone Number"
        />
        <textarea
          rows={3}
          value={form.address}
          onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          placeholder="Address"
        />
        <input
          value={form.city}
          onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
          placeholder="City"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || uploadingAvatar}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="btn-secondary"
          >
            Logout
          </button>
          <button
            type="button"
            onClick={onDeleteAccount}
            className="btn-danger"
          >
            Delete Account
          </button>
          <Link to="/" className="text-sm text-ember hover:underline">
            Back to Home
          </Link>
        </div>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </section>
  );
}

export default Profile;
