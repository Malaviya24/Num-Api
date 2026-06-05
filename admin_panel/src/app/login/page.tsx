"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TerminalInput } from '@/components/ui/TerminalInput';
import { TerminalButton } from '@/components/ui/TerminalButton';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { fetchApi } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await fetchApi('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        window.location.href = '/dashboard';
      } else {
        const err = await res.json();
        const errMsg = typeof err.detail === 'string' ? err.detail : (Array.isArray(err.detail) ? err.detail[0]?.msg : 'AUTHENTICATION FAILED');
        setError(errMsg || 'AUTHENTICATION FAILED');
      }
    } catch (err: any) {
      setError(err.message || 'CONNECTION ERROR');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <TerminalWindow title="AUTH SECURE LOGIN" className="w-full max-w-md">
        <form onSubmit={handleLogin} className="space-y-4 p-4">
          <div className="text-center mb-6">
            <div className="text-xl font-bold">SYSTEM ADMIN</div>
            <div className="text-muted text-sm">RESTRICTED ACCESS</div>
          </div>
          
          <TerminalInput 
            prompt="username:" 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <TerminalInput 
            prompt="password:" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-error mt-4 font-bold animate-blink">
              [ERR] {error}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <TerminalButton type="submit">AUTHENTICATE</TerminalButton>
          </div>
        </form>
      </TerminalWindow>
    </div>
  );
}
