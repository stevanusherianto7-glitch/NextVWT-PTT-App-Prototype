import { useState } from 'react';
import { useChannelRole } from './useChannelRole';
import { useChannelSettings } from './useChannelSettings';
import { ChannelMemberList } from './ChannelMemberList';
import { ChannelSettingsPanel } from './ChannelSettingsPanel';
import { ModerationLogPanel } from './ModerationLogPanel';
import { canPerformAction, type ChannelRole } from './permissions';
import { X, Shield, Radio, Lock, Loader2 } from 'lucide-react';
import './moderation.css';

interface ChannelManagePanelProps {
  roomId: string;
  userId: string;
  initialChannelName?: string;
  onClose: () => void;
}

type TabType = 'info' | 'members' | 'settings' | 'logs';

export function ChannelManagePanel({
  roomId,
  userId,
  initialChannelName = 'Channel',
  onClose,
}: ChannelManagePanelProps) {
  const { role, status, loading: roleLoading } = useChannelRole(roomId, userId);
  const { settings, loading: settingsLoading } = useChannelSettings(roomId, initialChannelName);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Check if role is loaded and authorized to view panel
  const isAuthorized = canPerformAction(role, 'VIEW_ADMIN_PANEL');
  const isOperatorOnly = role === 'operator';

  if (roleLoading || settingsLoading) {
    return (
      <div className="moderation-overlay">
        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="text-sm font-semibold">Mengamankan koneksi panel...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="moderation-overlay">
        <div className="moderation-container flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto">
          <div className="h-16 w-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Akses Ditolak</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman ini hanya dapat diakses oleh operator, penanggung jawab channel (PJC), admin,
            atau N.O.C. Status Anda saat ini adalah{' '}
            <span className="text-slate-200 font-bold">{role.toUpperCase()}</span>.
          </p>
          <button type="button" onClick={onClose} className="moderation-btn-destructive w-full py-2">
            Kembali ke Radio
          </button>
        </div>
      </div>
    );
  }

  // Define tab navigation buttons based on role permissions
  const tabs: { id: TabType; label: string }[] = [{ id: 'info', label: 'INFO' }];

  // Operator only gets Info and cannot access settings/members/logs
  if (!isOperatorOnly) {
    tabs.push(
      { id: 'members', label: 'ANGGOTA' },
      { id: 'settings', label: 'SETELAN' },
      { id: 'logs', label: 'LOG' }
    );
  }

  const getRoleLabel = (roleName: ChannelRole) => {
    switch (roleName) {
      case 'noc':
        return 'N.O.C';
      case 'sys_admin':
        return 'System Admin';
      case 'pjc':
        return 'PJC (Penanggung Jawab)';
      case 'operator':
        return 'Operator Otomatis';
      case 'guest':
        return 'Tamu biasa';
      default:
        return roleName;
    }
  };

  return (
    <div className="moderation-overlay">
      <div className="moderation-container">
        {/* Header bar */}
        <div className="moderation-header">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h2>Kelola Channel</h2>
          </div>
          <button type="button"
            onClick={onClose}
            title="Tutup"
            aria-label="Tutup"
            className="moderation-close-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="moderation-tabs">
          {tabs.map((tab) => (
            <button type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`moderation-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div className="moderation-content">
          {activeTab === 'info' && (
            <div className="flex flex-col gap-3">
              {/* Channel General Information */}
              <div className="moderation-glass-card flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Radio className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Detail Room / Saluran</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 font-semibold">Nama Channel:</span>
                    <span className="text-white font-medium">{settings?.channel_name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 font-semibold">Nomor Channel:</span>
                    <span className="text-white font-medium">
                      {roomId.split('-').pop()?.padStart(3, '0') || '001'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-slate-500 font-semibold">Deskripsi:</span>
                    <span className="text-slate-300 leading-normal">
                      {settings?.channel_description || 'Tidak ada deskripsi untuk channel ini.'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 font-semibold">Mode Channel:</span>
                    <span className="text-emerald-400 font-medium capitalize">
                      {settings?.channel_mode}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 font-semibold">Warna Aksen Tema:</span>
                    <span className="text-pink-400 font-medium capitalize">
                      {settings?.theme_key.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status information of the actor */}
              <div className="moderation-glass-card flex flex-col gap-2 border-slate-700/30">
                <span className="text-xs font-bold text-white">Otorisasi Anda di Room Ini</span>
                <div className="flex justify-between items-center text-xs mt-1">
                  <div className="flex flex-col">
                    <span className="text-slate-500">Jabatan:</span>
                    <span className={`role-badge ${role} mt-0.5 self-start`}>
                      {getRoleLabel(role)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-500">Status Mod:</span>
                    <span className={`status-badge ${status} mt-0.5`}>{status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && !isOperatorOnly && (
            <ChannelMemberList roomId={roomId} actorRole={role} actorId={userId} />
          )}

          {activeTab === 'settings' && !isOperatorOnly && (
            <ChannelSettingsPanel roomId={roomId} actorRole={role} />
          )}

          {activeTab === 'logs' && !isOperatorOnly && <ModerationLogPanel roomId={roomId} />}
        </div>
      </div>
    </div>
  );
}
