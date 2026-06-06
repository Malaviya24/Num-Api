"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TerminalInput } from '@/components/ui/TerminalInput';
import { TerminalButton } from '@/components/ui/TerminalButton';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { AsciiProgressBar } from '@/components/ui/AsciiProgressBar';
import { fetchApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  
  // State for stats
  const [stats, setStats] = useState({ total_records: 0, completed_imports: 0 });
  const [tasks, setTasks] = useState<any[]>([]);
  
  // State for search
  const [searchMobile, setSearchMobile] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchStatus, setSearchStatus] = useState('');
  
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newClientName, setNewClientName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});

  const toggleKeyVisibility = (id: number) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  // State for files
  const [files, setFiles] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const statsRes = await fetchApi('/dashboard/stats');
      const statsData = await statsRes.json();
      setStats({ total_records: statsData.total_records || 0, completed_imports: statsData.total_uploaded_files || 0 });
      setTasks(statsData.recent_uploads || []);
      
      const keysRes = await fetchApi('/keys/');
      setApiKeys(await keysRes.json());
      
      const filesRes = await fetchApi('/files/');
      const filesData = await filesRes.json();
      setFiles(Array.isArray(filesData) ? filesData : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchStatus('SEARCHING...');
    setSearchResults([]);
    try {
      const res = await fetchApi(`/search?mobile_number=${searchMobile}`);
      const data = await res.json();
      setSearchResults(data.results);
      setSearchStatus(data.results.length === 0 ? 'NO RESULTS FOUND' : 'SEARCH COMPLETE');
    } catch (e) {
      setSearchStatus('[ERR] SEARCH FAILED');
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    try {
      await fetchApi('/keys/', {
        method: 'POST',
        body: JSON.stringify({ client_name: newClientName })
      });
      setNewClientName('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevokeKey = async (id: number) => {
    if (!confirm("REVOKE THIS KEY?")) return;
    try {
      await fetchApi(`/keys/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportFile = async (filename: string) => {
    try {
      await fetchApi(`/files/import/${filename}`, {
        method: 'POST'
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-primary pb-2 mb-4 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">SYSTEM ADMIN // DASHBOARD</h1>
          <div className="text-muted text-sm animate-pulse">CONNECTED TO CORE SERVER</div>
        </div>
        <TerminalButton onClick={handleLogout}>LOGOUT</TerminalButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* STATS PANE */}
        <TerminalWindow title="SYSTEM STATUS">
          <div className="space-y-2 p-2">
            <div>TOTAL RECORDS: <span className="font-bold">{stats.total_records?.toLocaleString() || 0}</span></div>
            <div className="text-muted">---</div>
            <div>IMPORTS COMPLETED: <span className="font-bold">{stats.completed_imports}</span></div>
            
            {tasks.length > 0 && (
              <div className="mt-4 border-t border-primary pt-2">
                <div className="font-bold mb-2">RECENT TASKS:</div>
                {tasks.map(t => (
                  <div key={t.id} className="text-sm border-b border-muted pb-2 mb-2">
                    <div>{t.filename} - [{t.status?.toUpperCase() || 'UNKNOWN'}]</div>
                    {t.status?.toLowerCase() === 'processing' && <AsciiProgressBar progress={t.progress || 0} length={20} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TerminalWindow>

        {/* SEARCH PANE */}
        <TerminalWindow title="QUERY INTERFACE">
          <div className="p-2 space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <TerminalInput 
                prompt="query>"
                placeholder="ENTER MOBILE..."
                value={searchMobile}
                onChange={e => setSearchMobile(e.target.value)}
                className="flex-1 border-b border-primary"
              />
              <TerminalButton type="submit">EXECUTE</TerminalButton>
            </form>
            
            {searchStatus && <div className="text-sm animate-blink text-secondary">{searchStatus}</div>}
            
            {searchResults.length > 0 && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-primary text-muted">
                      <th className="py-1 pr-2">MOBILE</th>
                      <th className="py-1 pr-2">NAME</th>
                      <th className="py-1">ADDRESS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((r, i) => (
                      <tr key={i} className="border-b border-muted hover:bg-primary hover:text-black">
                        <td className="py-1 pr-2">{r.mobile_number}</td>
                        <td className="py-1 pr-2">{r.name}</td>
                        <td className="py-1">{r.address || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TerminalWindow>

        {/* API KEYS PANE */}
        <TerminalWindow title="ACCESS TOKENS">
          <div className="p-2 space-y-4">
            <form onSubmit={handleGenerateKey} className="flex flex-col sm:flex-row gap-2">
              <TerminalInput 
                prompt="client:"
                placeholder="CLIENT NAME"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                className="flex-1 border-b border-primary"
              />
              <TerminalButton type="submit">GENERATE</TerminalButton>
            </form>
            
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-primary text-muted">
                    <th className="py-1 pr-2">CLIENT</th>
                    <th className="py-1 pr-2">KEY</th>
                    <th className="py-1 pr-2">USAGE</th>
                    <th className="py-1 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="border-b border-muted">
                      <td className="py-1 pr-2">{k.client_name}</td>
                      <td className="py-1 pr-2 text-secondary break-all">
                        {visibleKeys[k.id] ? k.key : '********************************'}
                        <button onClick={() => toggleKeyVisibility(k.id)} className="ml-2 text-primary hover:bg-primary hover:text-black px-1 rounded">
                          {visibleKeys[k.id] ? '[ HIDE ]' : '[ SHOW ]'}
                        </button>
                      </td>
                      <td className="py-1 pr-2">{k.usage_count}</td>
                      <td className="py-1 text-right">
                        {k.is_active ? (
                          <button onClick={() => handleRevokeKey(k.id)} className="text-error hover:underline hover:text-black hover:bg-error">[ REVOKE ]</button>
                        ) : (
                          <span className="text-muted">[ REVOKED ]</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {apiKeys.length === 0 && (
                    <tr><td colSpan={4} className="py-2 text-center text-muted">NO KEYS ALLOCATED</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TerminalWindow>

        {/* SERVER FILES PANE */}
        <TerminalWindow title="LOCAL STORAGE">
          <div className="p-2 space-y-2">
            <div className="text-muted mb-2">PATH: /uploads</div>
            <div className="space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-muted py-1 text-sm gap-1">
                  <span className="break-all">{f.filename} ({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button onClick={() => handleImportFile(f.filename)} className="text-primary hover:bg-primary hover:text-black self-start sm:self-auto">[ IMPORT ]</button>
                </div>
              ))}
              {files.length === 0 && (
                <div className="text-muted text-center py-2">NO FILES DETECTED</div>
              )}
            </div>
          </div>
        </TerminalWindow>

      </div>
    </div>
  );
}
