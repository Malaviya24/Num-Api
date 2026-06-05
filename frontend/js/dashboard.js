const API_URL = '/api';
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'index.html';
}

const headers = {
    'Authorization': `Bearer ${token}`
};

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

async function fetchStats() {
    try {
        const res = await fetch(`${API_URL}/dashboard/stats`, { headers });
        if (res.status === 401) { localStorage.removeItem('token'); window.location.href = 'index.html'; }
        if (res.ok) {
            const data = await res.json();
            document.getElementById('statTotalRecords').innerText = data.total_records.toLocaleString();
            document.getElementById('statTotalFiles').innerText = data.total_uploaded_files.toLocaleString();
        }
    } catch (e) { console.error(e); }
}

async function fetchServerFiles() {
    try {
        const res = await fetch(`${API_URL}/files/`, { headers });
        if (res.ok) {
            const files = await res.json();
            const tbody = document.getElementById('filesBody');
            tbody.innerHTML = '';
            if(files.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">No files found in /uploads directory.</td></tr>';
                return;
            }
            files.forEach(f => {
                const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
                const date = new Date(f.last_modified).toLocaleString();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${f.filename}</td>
                    <td>${sizeMB} MB</td>
                    <td>${date}</td>
                    <td><button class="btn-action" onclick="triggerImport('${f.filename}')">Import</button></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) { console.error(e); }
}

async function fetchImports() {
    try {
        const res = await fetch(`${API_URL}/files/imports`, { headers });
        if (res.ok) {
            const imports = await res.json();
            const tbody = document.getElementById('importsBody');
            tbody.innerHTML = '';
            imports.forEach(i => {
                const date = new Date(i.created_at).toLocaleString();
                const badgeClass = i.status.toLowerCase();
                const progress = i.total_rows > 0 ? Math.round((i.processed_rows / i.total_rows) * 100) : (i.processed_rows > 0 ? i.processed_rows + " rows" : "0%");
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${i.filename}</td>
                    <td><span class="badge ${badgeClass}">${i.status}</span></td>
                    <td>${i.status === 'COMPLETED' ? '100%' : progress}</td>
                    <td>${date}</td>
                    <td style="color:var(--error-color)">${i.error_message || ''}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) { console.error(e); }
}

window.triggerImport = async function(filename) {
    if(!confirm(`Trigger background import for ${filename}?`)) return;
    try {
        const res = await fetch(`${API_URL}/files/import/${filename}`, {
            method: 'POST',
            headers
        });
        const data = await res.json();
        alert(data.message);
        fetchImports();
    } catch (e) { console.error(e); }
};

document.getElementById('refreshFilesBtn').addEventListener('click', fetchServerFiles);
document.getElementById('refreshImportsBtn').addEventListener('click', fetchImports);

document.getElementById('searchBtn').addEventListener('click', async () => {
    const mobile = document.getElementById('searchInput').value.trim();
    if (!mobile) return;
    
    const startTime = performance.now();
    try {
        const res = await fetch(`${API_URL}/search/?mobile=${mobile}`, { headers });
        if (res.ok) {
            const data = await res.json();
            const endTime = performance.now();
            const timeTaken = ((endTime - startTime) / 1000).toFixed(3);
            
            document.getElementById('searchTime').innerText = `Found ${data.count} result(s) in ${timeTaken} seconds.`;
            
            const tbody = document.getElementById('resultsBody');
            tbody.innerHTML = '';
            if (data.data && data.data.length > 0) {
                data.data.forEach(c => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${c.full_name || '-'}</td>
                        <td>${c.mobile_number}</td>
                        <td>${c.email || '-'}</td>
                        <td>${c.city || '-'}</td>
                        <td>${c.state || '-'}</td>
                        <td>${c.company || '-'}</td>
                        <td><span style="font-size:0.8rem;color:var(--text-muted)">${c.source_file || '-'}</span></td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="7">No records found.</td></tr>';
            }
        }
    } catch (e) { console.error(e); }
});

window.revokeApiKey = async function(keyId) {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
        const res = await fetch(`${API_URL}/keys/${keyId}`, {
            method: 'DELETE',
            headers
        });
        if (res.ok) {
            fetchApiKeys();
        }
    } catch (e) { console.error(e); }
};

async function fetchApiKeys() {
    try {
        const res = await fetch(`${API_URL}/keys/`, { headers });
        if (res.ok) {
            const keys = await res.json();
            const tbody = document.getElementById('apiKeysBody');
            tbody.innerHTML = '';
            if (keys.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No API keys found.</td></tr>';
                return;
            }
            keys.forEach(k => {
                const date = new Date(k.created_at).toLocaleString();
                const statusBadge = k.is_active ? '<span class="badge completed">Active</span>' : '<span class="badge failed">Revoked</span>';
                const actionBtn = k.is_active ? `<button class="btn-action" style="background:var(--error-color)" onclick="revokeApiKey(${k.id})">Revoke</button>` : '-';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${k.client_name}</td>
                    <td style="font-family:monospace; color:var(--primary-color)">${k.key}</td>
                    <td>${statusBadge}</td>
                    <td>${k.usage_count.toLocaleString()}</td>
                    <td>${date}</td>
                    <td>${actionBtn}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) { console.error(e); }
}

document.getElementById('generateKeyBtn').addEventListener('click', async () => {
    const clientName = document.getElementById('newClientName').value.trim();
    if (!clientName) {
        alert("Please enter a client name");
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/keys/`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ client_name: clientName })
        });
        
        if (res.ok) {
            document.getElementById('newClientName').value = '';
            fetchApiKeys();
        } else {
            alert("Error generating key");
        }
    } catch (e) { console.error(e); }
});

// Init
fetchStats();
fetchServerFiles();
fetchImports();
fetchApiKeys();

// Auto refresh stats and imports every 10 seconds
setInterval(() => {
    fetchStats();
    fetchImports();
    fetchApiKeys();
}, 10000);
