// src/components/admin/ActivityLogs.jsx
import { Activity, User, Search, Eye, CheckCircle, XCircle, Shield, Sparkles } from 'lucide-react';
import { timeAgo } from '../../utils/helpers';

const activityIcons = {
  login: User,
  logout: User,
  register: User,
  user_registered: User,
  missing_person_created: Search,
  sighting_created: Eye,
  match_created: Sparkles,
  match_verified: CheckCircle,
  match_rejected: XCircle,
  user_verified: Shield,
  role_changed: Shield,
};

const activityColors = {
  login: 'text-blue-600 bg-blue-50',
  logout: 'text-gray-600 bg-gray-50',
  register: 'text-green-600 bg-green-50',
  user_registered: 'text-green-600 bg-green-50',
  missing_person_created: 'text-maroon-800 bg-maroon-50',
  sighting_created: 'text-blue-600 bg-blue-50',
  match_created: 'text-purple-600 bg-purple-50',
  match_verified: 'text-green-600 bg-green-50',
  match_rejected: 'text-red-600 bg-red-50',
  user_verified: 'text-green-600 bg-green-50',
  role_changed: 'text-yellow-600 bg-yellow-50',
};

export default function ActivityLogs({ logs, compact = false }) {
  const displayedLogs = compact ? logs?.slice(0, 5) : logs;

  if (!displayedLogs || displayedLogs.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-gray-500 text-center py-4">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {displayedLogs.map((log, index) => {
          const Icon = activityIcons[log.type] || Activity;
          const colorClass = activityColors[log.type] || 'text-gray-600 bg-gray-50';
          const actor = log.userName || log.user?.name || log.user?.firstName;
          const timestamp = log.timestamp || log.createdAt;

          return (
            <div key={log._id || `${log.type}-${index}`} className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm text-gray-700">
                  {log.description ? (
                    log.description
                  ) : (
                    <>
                      <span className="font-medium">{actor || 'System'}</span>{' '}
                      {log.message || log.action || log.type?.replace(/_/g, ' ')}
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}