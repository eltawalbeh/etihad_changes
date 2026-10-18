import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Archive, ChevronLeft, History, RotateCcw } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

type PackageVersion = {
  package_id: string;
  version: number;
  action: string;
  created_at: string;
};

type AuditEntry = {
  id: string;
  version: number;
  action: string;
  changed_fields: string[];
  created_at: string;
};

export function AdminPackageHistory() {
  const { id } = useParams();
  const { adminFetch, currentUser } = useAdminAuth();
  const [versions, setVersions] = useState<PackageVersion[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadHistory() {
    if (!id || currentUser?.role !== 'superadmin') return;
    setLoading(true);
    setError('');
    try {
      const [versionsResponse, auditResponse] = await Promise.all([
        adminFetch(`/admin/packages/${id}/versions`),
        adminFetch(`/admin/packages/${id}/audit`),
      ]);
      if (!versionsResponse.ok || !auditResponse.ok) {
        setError('Package history is not available.');
        return;
      }
      const [versionsData, auditData] = await Promise.all([versionsResponse.json(), auditResponse.json()]);
      setVersions(versionsData.versions || []);
      setAudit(auditData.audit || []);
    } catch {
      setError('Package history could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadHistory(); }, [id, currentUser?.role]);

  async function restoreVersion(version: number) {
    if (!id) return;
    if (!confirm(`Restore version ${version}? The current package will be retained as a new version before restoration.`)) return;
    setMessage('');
    setError('');
    try {
      const response = await adminFetch(`/admin/packages/${id}/restore/${version}`, { method: 'POST' });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Package version could not be restored.');
        return;
      }
      setMessage(`Version ${version} restored as a new package version.`);
      await loadHistory();
    } catch {
      setError('Package version could not be restored.');
    }
  }

  if (currentUser?.role !== 'superadmin') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Version History is available to Super Admin only
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/packages" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><History size={19} /> Version History</h2>
            <p className="text-sm text-gray-500">Restore creates a new version. Existing records are never deleted</p>
          </div>
        </div>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-800">Saved versions</h3>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading package history...</p>
        ) : versions.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No lifecycle versions exist yet. The next package change creates the first version record</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {versions.map((version) => (
              <div key={`${version.package_id}-${version.version}`} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-gray-800">Version {version.version} <span className="text-gray-400 font-normal">· {version.action}</span></p>
                  <p className="mt-1 text-xs text-gray-500">{new Date(version.created_at).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => restoreVersion(version.version)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RotateCcw size={16} /> Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Archive size={17} /> Audit log</h3>
        </div>
        {loading ? null : audit.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500">No audit entries exist yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {audit.map((entry) => (
              <div key={entry.id} className="px-5 py-4">
                <p className="font-medium text-gray-800">Version {entry.version} · {entry.action}</p>
                <p className="mt-1 text-xs text-gray-500">Changed: {entry.changed_fields.length ? entry.changed_fields.join(', ') : 'initial package record'} · {new Date(entry.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
