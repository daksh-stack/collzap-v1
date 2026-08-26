import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Shield, LogOut, Trash2, Smartphone, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useUserStore } from '../../store/useUserStore';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, fetchSettings, updateSettings, logoutEverywhere, deleteAccount, loading } = useUserStore();
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    fetchSettings().catch(console.error);
  }, []);

  const handleToggle = async (key, value) => {
    try {
      await updateSettings({ [key]: value });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutEverywhere();
      toast.success('Logged out of all devices');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  if (loading && !settings) {
    return <div className="text-center py-20 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account preferences and security.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {/* Notifications */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-gray-400 mr-3" />
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="flex items-center justify-between ml-8 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-500">Receive alerts for new matches and messages.</p>
            </div>
            <button
              onClick={() => handleToggle('notificationsEnabled', !settings?.notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${settings?.notificationsEnabled ? 'bg-brand-600' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-gray-400 mr-3" />
            <h2 className="text-lg font-bold text-gray-900">Privacy</h2>
          </div>
          <div className="flex items-center justify-between ml-8 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Profile Visibility</p>
              <p className="text-sm text-gray-500">Allow others in your matches to view your full profile.</p>
            </div>
            <button
              onClick={() => handleToggle('profileVisible', !settings?.profileVisible)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${settings?.profileVisible ? 'bg-brand-600' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.profileVisible ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Security & Account */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
            <h2 className="text-lg font-bold text-gray-900">Account Security</h2>
          </div>
          
          <div className="ml-8 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">Log out of all devices</p>
                <p className="text-sm text-gray-500">End all active sessions on other devices.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLogoutModalOpen(true)}>
                <LogOut className="w-4 h-4 mr-2" /> Logout All
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and all data.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDeleteModalOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="p-6 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Info className="w-4 h-4 mr-2" />
            CollZap App Version 1.0.0
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} title="Logout All Devices">
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to sign out of all active sessions across all devices? You will need to log in again.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setLogoutModalOpen(false)}>Cancel</Button>
          <Button onClick={handleLogoutAll} loading={loading}>Log out</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg text-sm border border-red-200">
            <strong>Warning:</strong> This action is irreversible. All your matches, messages, and profile data will be permanently deleted.
          </div>
          <p className="text-sm text-gray-700 font-medium">Please type <strong>DELETE</strong> to confirm:</p>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteAccount} 
              loading={loading}
              disabled={deleteConfirm !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}