/* ================================================
   ArtisanConnect - Dashboard JavaScript
   Live DB integration: Providers CRUD + Approvals
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ========== ADMIN AUTH GUARD ==========
    const adminSession = JSON.parse(sessionStorage.getItem('artisan_admin') || 'null');
    if (!adminSession || !adminSession.loggedIn) {
        window.location.href = 'admin-login.html';
        return;
    }

    // ========== SIDEBAR NAVIGATION ==========
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
    const sections     = document.querySelectorAll('.dash-section');

    function switchSection(sectionId) {
        sections.forEach(s => s.classList.remove('active'));
        sidebarLinks.forEach(l => l.classList.remove('active'));
        document.getElementById('section-' + sectionId)?.classList.add('active');
        document.querySelector(`.sidebar-link[data-section="${sectionId}"]`)?.classList.add('active');
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    }

    sidebarLinks.forEach(link => link.addEventListener('click', e => {
        e.preventDefault(); switchSection(link.dataset.section);
    }));

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    });
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    });

    // ========== TOAST ==========
    function showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        const icon  = document.getElementById('toast-icon');
        const msgEl = document.getElementById('toast-msg');
        toast.className = 'toast show ' + type;
        msgEl.textContent = msg;
        icon.textContent = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    // ========== MODAL ==========
    let _modalResolve = null;
    function openModal(title, bodyHTML, confirmLabel = 'Save', confirmClass = 'btn-primary') {
        return new Promise(resolve => {
            _modalResolve = resolve;
            let modal = document.getElementById('dash-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'dash-modal';
                modal.innerHTML = `
                    <div class="modal-backdrop" id="modal-backdrop"></div>
                    <div class="modal-box" id="modal-box">
                        <div class="modal-header">
                            <h3 id="modal-title"></h3>
                            <button class="modal-close" id="modal-close"><span class="material-icons-round">close</span></button>
                        </div>
                        <div class="modal-body" id="modal-body"></div>
                        <div class="modal-footer">
                            <button class="btn-secondary" id="modal-cancel">Cancel</button>
                            <button class="btn-primary" id="modal-confirm"></button>
                        </div>
                    </div>`;
                document.body.appendChild(modal);

                const style = document.createElement('style');
                style.textContent = `
                    #dash-modal { position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center; }
                    .modal-backdrop { position:absolute;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px); }
                    .modal-box { position:relative;background:#fff;border-radius:20px;padding:32px;width:520px;max-width:94vw;max-height:85vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,0.15);animation:modalIn .25s cubic-bezier(.34,1.56,.64,1); }
                    @keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}
                    .modal-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:20px; }
                    .modal-header h3 { font-family:'Outfit',sans-serif;font-size:1.2rem;font-weight:700;color:#1a1a1a; }
                    .modal-close { background:none;border:none;cursor:pointer;color:#999;display:flex;padding:4px; }
                    .modal-close:hover { color:#e8772e; }
                    .modal-body { margin-bottom:24px; }
                    .modal-footer { display:flex;gap:12px;justify-content:flex-end; }
                    .modal-field { margin-bottom:16px; }
                    .modal-field label { display:block;font-size:.78rem;font-weight:600;color:#444;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em; }
                    .modal-field input,.modal-field select,.modal-field textarea { width:100%;padding:10px 14px;border:1.5px solid #e8e4df;border-radius:10px;font-size:.92rem;font-family:'Inter',sans-serif;color:#333;background:#faf8f5;transition:border-color .2s; outline:none; }
                    .modal-field input:focus,.modal-field select:focus,.modal-field textarea:focus { border-color:#e8772e;background:#fff;box-shadow:0 0 0 3px rgba(232,119,46,.12); }
                    .modal-row { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
                    .btn-secondary { padding:10px 20px;border-radius:10px;border:1.5px solid #e8e4df;background:#fff;color:#555;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s; }
                    .btn-secondary:hover { border-color:#999; }
                    .delete-confirm-text { text-align:center;padding:12px 0; }
                    .delete-confirm-text .material-icons-round { font-size:3rem;color:#e53935;display:block;margin-bottom:12px; }
                    .delete-confirm-text p { color:#555;font-size:.95rem; }
                    .delete-confirm-text strong { color:#1a1a1a; }
                `;
                document.head.appendChild(style);

                document.getElementById('modal-close').addEventListener('click', () => closeModal(null));
                document.getElementById('modal-cancel').addEventListener('click', () => closeModal(null));
                document.getElementById('modal-backdrop').addEventListener('click', () => closeModal(null));
            }

            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-body').innerHTML = bodyHTML;
            const confirmBtn = document.getElementById('modal-confirm');
            confirmBtn.textContent = confirmLabel;
            confirmBtn.className = confirmClass;
            confirmBtn.onclick = () => {
                if (_modalResolve) _modalResolve(true);
                _modalResolve = null;
                document.getElementById('dash-modal').style.display = 'none';
            };
            modal.style.display = 'flex';
        });
    }

    function closeModal(val) {
        if (_modalResolve) { _modalResolve(val); _modalResolve = null; }
        const modal = document.getElementById('dash-modal');
        if (modal) modal.style.display = 'none';
    }

    // ============================================================
    // CITIES SECTION — Live DB
    // ============================================================
    async function renderCities() {
        const tbody = document.getElementById('cities-tbody');
        if (!tbody) return;
        const cities = await ArtisanDB.getAllCities();
        
        if (cities.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#999;padding:32px">No cities found. Add some!</td></tr>`;
            return;
        }

        tbody.innerHTML = cities.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td><span class="status-dot ${c.is_active ? 'active' : 'inactive'}">${c.is_active ? 'Enabled' : 'Disabled'}</span></td>
                <td>
                    <div class="radio-group" style="display:flex; gap: 16px; align-items:center;">
                        <label style="cursor:pointer; font-weight:600; display:flex; align-items:center; gap:4px;">
                            <input type="radio" name="city_${c.id}" data-id="${c.id}" value="on" ${c.is_active ? 'checked' : ''} class="city-radio"> ON
                        </label>
                        <label style="cursor:pointer; font-weight:600; display:flex; align-items:center; gap:4px;">
                            <input type="radio" name="city_${c.id}" data-id="${c.id}" value="off" ${!c.is_active ? 'checked' : ''} class="city-radio"> OFF
                        </label>
                        <button class="action-btn danger" data-action="delete-city" data-id="${c.id}" aria-label="Delete" style="margin-left: 20px;"><span class="material-icons-round">delete</span></button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.city-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                handleCityToggle(e.target.dataset.id, e.target.value === 'on');
            });
        });

        tbody.querySelectorAll('[data-action="delete-city"]').forEach(btn => {
            btn.addEventListener('click', () => handleCityDelete(btn.dataset.id));
        });
    }

    async function handleCityToggle(id, newStatus) {
        const result = await ArtisanDB.toggleCityStatus(id, newStatus);
        if (!result.success) { 
            showToast(result.error || 'Failed to toggle status', 'error'); 
            await renderCities(); // revert UI if failed
            return; 
        }
        showToast(`City ${newStatus ? 'enabled' : 'disabled'}!`, newStatus ? 'success' : 'info');
        await renderCities();
    }

    async function handleCityDelete(id) {
        const cities = await ArtisanDB.getAllCities();
        const city = cities.find(c => String(c.id) === String(id));
        if (!city) return;

        await openModal(
            'Delete City',
            `<div class="delete-confirm-text">
                <span class="material-icons-round">warning</span>
                <p>Are you sure you want to delete <strong>${city.name}</strong>?</p>
             </div>`,
            'Delete', 'btn-danger'
        );
        const btn = document.getElementById('modal-confirm');
        if (btn) btn.style.cssText = 'background:#e53935;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif';
        
        await ArtisanDB.deleteCity(city.id);
        closeModal(null);
        showToast('City deleted!', 'error');
        await renderCities();
    }

    // Add City Button
    document.getElementById('add-city-btn')?.addEventListener('click', async () => {
        await openModal('Add New City', '<div class="modal-field"><label>City Name *</label><input id="cf-name" placeholder="e.g. Pune"></div>', 'Add City', 'btn-primary');
        const name = document.getElementById('cf-name')?.value.trim();
        if (!name) { showToast('City name is required', 'error'); return; }
        
        const result = await ArtisanDB.addCity(name);
        if (!result.success) {
            showToast(result.error || 'Failed to add city', 'error');
        } else {
            showToast('City added successfully!', 'success');
            await renderCities();
        }
    });

    (async () => {
        if(document.getElementById('section-cities')) {
            await renderCities();
        }
    })();

    // ============================================================
    // PROVIDERS SECTION — Live DB
    // ============================================================
    const imgOptions = ['images/living_room.png','images/kitchen.png','images/fireplace.png','images/modern.png','images/study.png','images/dining.png','images/bedroom.png','images/bathroom.png'];

    function providerFormHTML(p = {}) {
        const typeOpts = ['builder','interior-designer','painter','architect','electrician','plumber']
            .map(t => `<option value="${t}" ${(p.type||'') === t ? 'selected':''}>${t.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>`).join('');
        const imgOpts  = imgOptions.map(i => `<option value="${i}" ${(p.img||'') === i ? 'selected':''}>${i.replace('images/','').replace('.png','')}</option>`).join('');
        const statusOpts = ['active','pending','inactive'].map(s => `<option value="${s}" ${(p.status||'active') === s ? 'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('');
        const cityOpts = ['Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Sircilla', 'Jagtial', 'Hyderabad', 'Other']
            .map(c => `<option value="${c}" ${(p.city||'') === c ? 'selected':''}>${c}</option>`).join('');

        return `
            <div class="modal-field"><label>Full Name *</label><input id="pf-name" value="${p.name||''}" placeholder="e.g. Rajput & Sons Builders"></div>
            <div class="modal-row">
                <div class="modal-field"><label>Service Type *</label><select id="pf-type">${typeOpts}</select></div>
                <div class="modal-field"><label>Status</label><select id="pf-status">${statusOpts}</select></div>
            </div>
            <div class="modal-row">
                <div class="modal-field"><label>City *</label><select id="pf-city"><option value="">Select City</option>${cityOpts}</select></div>
                <div class="modal-field"><label>Experience</label><input id="pf-exp" value="${p.experience||''}" placeholder="e.g. 8 yrs experience"></div>
            </div>
            <div class="modal-row">
                <div class="modal-field"><label>Rating (0-5)</label><input id="pf-rating" type="number" min="0" max="5" step="0.1" value="${p.rating||4.5}"></div>
                <div class="modal-field"><label>Projects Done</label><input id="pf-projects" type="number" min="0" value="${p.projects||0}"></div>
            </div>
            <div class="modal-row">
                <div class="modal-field"><label>Email</label><input id="pf-email" value="${p.email||''}" placeholder="email@example.com"></div>
                <div class="modal-field"><label>Phone</label><input id="pf-phone" value="${p.phone||''}" placeholder="+91 98765 43210"></div>
            </div>
            <div class="modal-field"><label>Card Image</label><select id="pf-img">${imgOpts}</select></div>
            <div class="modal-field"><label>Bio / Description</label><textarea id="pf-bio" rows="2" placeholder="Short description...">${p.bio||''}</textarea></div>
        `;
    }

    function getProviderFormData() {
        return {
            name:       document.getElementById('pf-name')?.value.trim(),
            type:       document.getElementById('pf-type')?.value,
            status:     document.getElementById('pf-status')?.value,
            city:       document.getElementById('pf-city')?.value.trim(),
            experience: document.getElementById('pf-exp')?.value.trim(),
            rating:     parseFloat(document.getElementById('pf-rating')?.value) || 4.5,
            projects:   parseInt(document.getElementById('pf-projects')?.value) || 0,
            email:      document.getElementById('pf-email')?.value.trim(),
            phone:      document.getElementById('pf-phone')?.value.trim(),
            img:        document.getElementById('pf-img')?.value,
            bio:        document.getElementById('pf-bio')?.value.trim(),
        };
    }

    // ============================================================
    // USERS SECTION — Live DB
    // ============================================================
    async function renderUsers() {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;
        // Filter out professionals and system admins
        const users = (await ArtisanDB.getAllUsers()).filter(u => u.role === 'user' || u.role === 'homeowner');
        
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#999;padding:32px">No homeowners signed up yet</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(u => {
            const dateStr = u.created_at || u.createdAt;
            const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString() : '—';
            return `
                <tr>
                    <td>
                        <div class="provider-cell">
                            <div class="profile-avatar" style="width:36px;height:36px;font-size:14px;margin-right:12px;background:var(--clr-accent)">${u.name.charAt(0).toUpperCase()}</div>
                            <span style="font-weight:600;color:var(--clr-dark)">${u.name}</span>
                        </div>
                    </td>
                    <td>${u.email}</td>
                    <td>${u.phone || '—'}</td>
                    <td><span class="status-dot pending" style="background:#e0f2fe;color:#0369a1">${formattedDate}</span></td>
                    <td>
                        <button class="action-btn" data-action="view" data-id="${u.user_id || u.userId || u.id}" aria-label="View">
                            <span class="material-icons-round">visibility</span>
                        </button>
                        <button class="action-btn" data-action="edit" data-id="${u.user_id || u.userId || u.id}" aria-label="Edit">
                            <span class="material-icons-round">edit</span>
                        </button>
                        <button class="action-btn danger" data-action="delete" data-id="${u.user_id || u.userId || u.id}" aria-label="Delete">
                            <span class="material-icons-round">delete</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => handleUserAction(btn.dataset.action, btn.dataset.id));
        });
    }

    function userFormHTML(u = {}) {
        return `
            <div class="modal-field"><label>Full Name *</label><input id="uf-name" value="${u.name||''}" placeholder="e.g. John Doe"></div>
            <div class="modal-field"><label>Email *</label><input id="uf-email" value="${u.email||''}" placeholder="john@example.com"></div>
            <div class="modal-field"><label>Phone</label><input id="uf-phone" value="${u.phone||''}" placeholder="+91 98765 43210"></div>
            ${!u.user_id ? `<div class="modal-field"><label>Password (Temporary)</label><input id="uf-password" value="temp1234" placeholder="temp1234"></div>` : ''}
        `;
    }

    function getUserFormData() {
        return {
            name: document.getElementById('uf-name')?.value.trim(),
            email: document.getElementById('uf-email')?.value.trim(),
            phone: document.getElementById('uf-phone')?.value.trim(),
            password: document.getElementById('uf-password')?.value || 'temp1234'
        };
    }

    async function handleUserAction(action, id) {
        const users = await ArtisanDB.getAllUsers();
        // Compare loosely since user_id might be numeric or strings depending on local mock or older db versions
        const user = users.find(u => (u.user_id || u.userId || u.id) == id);
        if (!user) return;

        if (action === 'view') {
            await openModal(
                user.name,
                `<div style="display:grid;gap:10px">
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone || '—'}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                 </div>`,
                'Close', 'btn-primary'
            );
        }

        if (action === 'edit') {
            await openModal('Edit User', userFormHTML(user), 'Save Changes', 'btn-primary');
            const data = getUserFormData();
            if(!data.name || !data.email) { showToast('Name and Email are required', 'error'); return; }
            await ArtisanDB.updateUser(id, data);
            showToast('User modified successfully!', 'success');
            await renderUsers();
        }

        if (action === 'delete') {
            await openModal(
                'Delete User',
                `<div class="delete-confirm-text">
                    <span class="material-icons-round">warning</span>
                    <p>Are you sure you want to delete <strong>${user.name}</strong>?<br>This action cannot be undone.</p>
                 </div>`,
                'Delete', 'btn-danger'
            );
            
            // Re-style confirm button
            const btn = document.getElementById('modal-confirm');
            if (btn) btn.style.cssText = 'background:#e53935;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif';
            
            await ArtisanDB.deleteUser(id);
            closeModal(null);
            showToast('User deleted successfully!', 'error');
            await renderUsers();
        }
    }

    // Add User Button
    document.getElementById('add-user-btn')?.addEventListener('click', async () => {
        await openModal('Add New User (Homeowner)', userFormHTML(), 'Add User', 'btn-primary');
        const data = getUserFormData();
        if(!data.name || !data.email) { showToast('Name and Email are required', 'error'); return; }
        
        const result = await ArtisanDB.registerUser({
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            role: 'user'
        });

        if(result.success) {
            showToast('User created safely!', 'success');
            await renderUsers();
        } else {
            showToast(result.error, 'error');
        }
    });

    // Initialize on load (await to avoid empty-state flicker)
    (async () => {
        await renderUsers();
    })();

    async function renderProviders(filterType = 'all', searchQ = '') {
        const tbody = document.getElementById('providers-tbody');
        const allProviders = await ArtisanDB.getAllProviders();
        let all = allProviders;
        if (filterType !== 'all') all = all.filter(p => p.type === filterType);
        if (searchQ) all = all.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()));

        // Update stat
        document.getElementById('total-providers').textContent = allProviders.length;

        if (all.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#999;padding:32px">No providers found</td></tr>`;
            return;
        }

        tbody.innerHTML = all.map(p => `
            <tr>
                <td>
                    <div class="provider-cell">
                        <img src="${p.img}" alt="${p.name}" class="provider-thumb">
                        <div>
                            <div class="provider-cell-name">${p.name}</div>
                            <div class="provider-cell-sub">${p.experience || '—'}</div>
                        </div>
                    </div>
                </td>
                <td><span class="type-badge ${p.type}">${p.type.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}</span></td>
                <td>${p.city}</td>
                <td>
                    <div class="table-rating">
                        <span class="material-icons-round">star</span>
                        ${p.rating.toFixed(1)}
                    </div>
                </td>
                <td>${p.projects}</td>
                <td><span class="status-dot ${p.status}">${p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span></td>
                <td>
                    <button class="action-btn" data-action="view"   data-id="${p.id}" aria-label="View">  <span class="material-icons-round">visibility</span></button>
                    <button class="action-btn" data-action="edit"   data-id="${p.id}" aria-label="Edit">  <span class="material-icons-round">edit</span></button>
                    <button class="action-btn" data-action="toggle" data-id="${p.id}" aria-label="Toggle Status"><span class="material-icons-round">${p.status==='active'?'pause_circle':'play_circle'}</span></button>
                    <button class="action-btn danger" data-action="delete" data-id="${p.id}" aria-label="Delete"><span class="material-icons-round">delete</span></button>
                </td>
            </tr>
        `).join('');

        // Bind action buttons
        tbody.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => handleProviderAction(btn.dataset.action, btn.dataset.id));
        });
    }

    async function handleProviderAction(action, id) {
        const providers = await ArtisanDB.getAllProviders();
        const provider  = providers.find(p => String(p.id) === String(id));
        if (!provider) return;

        if (action === 'view') {
            await openModal(
                provider.name,
                `<div style="display:grid;gap:10px">
                    <p><strong>Type:</strong> ${provider.type}</p>
                    <p><strong>City:</strong> ${provider.city}</p>
                    <p><strong>Rating:</strong> ⭐ ${provider.rating}</p>
                    <p><strong>Projects:</strong> ${provider.projects}</p>
                    <p><strong>Status:</strong> ${provider.status}</p>
                    <p><strong>Email:</strong> ${provider.email||'—'}</p>
                    <p><strong>Phone:</strong> ${provider.phone||'—'}</p>
                    <p><strong>Bio:</strong> ${provider.bio||'—'}</p>
                 </div>`,
                'Close', 'btn-primary'
            );
        }

        if (action === 'edit') {
            await openModal('Edit Provider', providerFormHTML(provider), 'Save Changes', 'btn-primary');
            const data = getProviderFormData();
            if (!data.name || !data.city) { showToast('Name and City are required', 'error'); return; }
            const result = await ArtisanDB.updateProvider(provider.id, data);
            if (result?.success === false) { showToast(result.error || 'Update failed', 'error'); return; }
            showToast('Provider updated successfully!', 'success');
            await renderProviders(document.getElementById('provider-filter').value, document.getElementById('provider-search').value);
        }

        if (action === 'toggle') {
            const newStatus = provider.status === 'active' ? 'inactive' : 'active';
            const result = await ArtisanDB.updateProvider(provider.id, { status: newStatus });
            if (result?.success === false) { showToast(result.error || 'Status update failed', 'error'); return; }
            showToast(`Provider ${newStatus === 'active' ? 'activated' : 'deactivated'}!`, newStatus === 'active' ? 'success' : 'info');
            await renderProviders(document.getElementById('provider-filter').value, document.getElementById('provider-search').value);
        }

        if (action === 'delete') {
            await openModal(
                'Delete Provider',
                `<div class="delete-confirm-text">
                    <span class="material-icons-round">warning</span>
                    <p>Are you sure you want to delete <strong>${provider.name}</strong>?<br>This will also remove them from the homepage.</p>
                 </div>`,
                'Delete', 'btn-danger'
            );
            // Style delete button
            const btn = document.getElementById('modal-confirm');
            if (btn) btn.style.cssText = 'background:#e53935;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif';
            await ArtisanDB.deleteProvider(provider.id);
            closeModal(null);
            showToast('Provider deleted!', 'error');
            await renderProviders(document.getElementById('provider-filter').value, document.getElementById('provider-search').value);
        }
    }

    // Add Provider button
    document.getElementById('add-provider-btn')?.addEventListener('click', async () => {
        await openModal('Add New Provider', providerFormHTML(), 'Add Provider', 'btn-primary');
        const data = getProviderFormData();
        if (!data.name || !data.city) { showToast('Name and City are required', 'error'); return; }
        const result = await ArtisanDB.addProvider({ ...data, source: 'admin' });
        if (result?.success === false) { showToast(result.error || 'Add failed', 'error'); return; }
        showToast(`${data.name} added successfully!`, 'success');
        await renderProviders();
    });

    // Filter & search
    document.getElementById('provider-filter')?.addEventListener('change', e => {
        renderProviders(e.target.value, document.getElementById('provider-search').value);
    });
    document.getElementById('provider-search')?.addEventListener('input', e => {
        renderProviders(document.getElementById('provider-filter').value, e.target.value);
    });

    // Initialize providers on load (await to avoid empty-state flicker)
    (async () => {
        await renderProviders();
    })();

    // ============================================================
    // PENDING SIGNUPS — New professional registrations
    // ============================================================
    async function renderPendingSignups() {
        const pros = (await ArtisanDB.getAllProfessionals()).filter(p => (p.verification_status || '').toString().trim().toLowerCase() === 'pending');
        const badge = document.querySelector('#nav-providers .sidebar-badge') || (() => {
            const b = document.createElement('span');
            b.className = 'sidebar-badge';
            document.getElementById('nav-providers')?.appendChild(b);
            return b;
        })();

        // Pending count badge in sidebar
        if (pros.length > 0) {
            badge.textContent = pros.length;
            badge.style.display = '';
        } else {
            badge.style.display = 'none';
        }

        // Pending panel (insert above the table card in providers section)
        const existingPanel = document.getElementById('pending-signups-panel');
        if (existingPanel) existingPanel.remove();

        if (pros.length === 0) return;

        const panel = document.createElement('div');
        panel.id = 'pending-signups-panel';
        panel.style.cssText = 'margin-bottom:24px';
        panel.innerHTML = `
            <div class="table-card" style="border-left:4px solid #ff9800">
                <div class="table-header">
                    <h3 class="table-title" style="display:flex;align-items:center;gap:8px">
                        <span class="material-icons-round" style="color:#ff9800;font-size:1.2rem">pending</span>
                        Pending Professional Signups
                        <span style="background:#ff9800;color:#fff;padding:2px 10px;border-radius:20px;font-size:.75rem">${pros.length} new</span>
                    </h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Location</th><th>Profession</th><th>Signed Up</th><th>Actions</th></tr></thead>
                        <tbody id="pending-tbody">
                            ${pros.map(p => `
                                <tr>
                                    <td><strong>${p.name}</strong></td>
                                    <td>${p.email}</td>
                                    <td>${p.phone||'—'}</td>
                                    <td>${p.location||p.city||'—'}</td>
                                    <td>${p.service_type ? p.service_type.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase()) : 'Not set yet'}</td>
                                    <td>${p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'}</td>
                                    <td>
                                        <button class="action-btn approve-btn" data-uid="${p.user_id}" style="background:#e8f5e9;color:#2e7d32;border:1px solid #c8e6c9;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:.8rem" aria-label="Approve">
                                            <span class="material-icons-round" style="font-size:1rem;vertical-align:middle">check_circle</span> Approve
                                        </button>
                                        <button class="action-btn reject-btn"  data-uid="${p.user_id}" style="background:#fce4e4;color:#c62828;border:1px solid #f8bbb9;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:.8rem;margin-left:6px" aria-label="Reject">
                                            <span class="material-icons-round" style="font-size:1rem;vertical-align:middle">cancel</span> Reject
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;

        const sectionTop = document.querySelector('#section-providers .section-topbar');
        sectionTop?.insertAdjacentElement('afterend', panel);

        // Approve / Reject handlers
        panel.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const result = await ArtisanDB.approveProfessional(btn.dataset.uid);
                if (result?.success) {
                    showToast('Professional approved and listed on homepage!', 'success');
                    await renderPendingSignups();
                    await renderProviders();
                } else {
                    showToast(result?.error || 'Approval failed', 'error');
                }
            });
        });
        panel.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const result = await ArtisanDB.rejectProfessional(btn.dataset.uid);
                if (result?.success === false) { showToast(result.error || 'Reject failed', 'error'); return; }
                showToast('Professional signup rejected.', 'info');
                await renderPendingSignups();
                await renderProviders();
            });
        });
    }

    // Initialize pending signups on load (await to avoid empty-state flicker)
    (async () => {
        await renderPendingSignups();
    })();

    // ============================================================
    // PORTFOLIOS — from DB approved providers
    // ============================================================
    const portfolioGrid = document.getElementById('portfolio-grid');
    async function renderPortfolios() {
        const active = await ArtisanDB.getApprovedProviders();
        portfolioGrid.innerHTML = active.map(p => `
            <div class="portfolio-card">
                <div class="portfolio-card-img">
                    <img src="${p.img}" alt="${p.name}">
                    <div class="portfolio-card-overlay">
                        <span class="material-icons-round">star</span> ${p.rating.toFixed(1)}
                    </div>
                </div>
                <div class="portfolio-card-body">
                    <div class="portfolio-card-name">${p.name}</div>
                    <div class="portfolio-card-meta">
                        <span class="material-icons-round" style="font-size:0.85rem;color:var(--clr-accent)">location_on</span>
                        ${p.city} · ${p.type.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}
                    </div>
                    <div class="portfolio-card-tags">
                        <span class="portfolio-tag">${p.type.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}</span>
                        <span class="portfolio-tag">${p.city}</span>
                        ${p.experience ? `<span class="portfolio-tag">${p.experience}</span>` : ''}
                    </div>
                </div>
            </div>`).join('');
    }
    // Initialize portfolios on load (await to avoid empty-state flicker)
    (async () => {
        await renderPortfolios();
    })();

    // ============================================================
    // LEADS (static sample data)
    // ============================================================
    const leads = [
        { name: 'Ananya Krishnan', project: '3BHK Villa Construction', budget: '₹65 Lakhs', date: '2 hours ago', status: 'new', color: '#e8772e', phone: '+91 9876543210', city: 'Karimnagar' },
        { name: 'Vikram Singh', project: 'Commercial Office Interiors', budget: '₹28 Lakhs', date: '5 hours ago', status: 'new', color: '#4285F4', phone: '+91 8765432109', city: 'Hyderabad' },
        { name: 'Priya Sharma', project: 'Kitchen & Bathroom Renovation', budget: '₹8 Lakhs', date: 'Yesterday', status: 'contacted', color: '#5cb85c', phone: '+91 7654321098', city: 'Warangal' },
        { name: 'Rahul Patel', project: 'Full Home Painting - 2200 sqft', budget: '₹3.5 Lakhs', date: 'Yesterday', status: 'new', color: '#9c27b0', phone: '+91 6543210987', city: 'Sircilla' },
        { name: 'Deepa Nair', project: 'Heritage Home Restoration', budget: '₹42 Lakhs', date: '2 days ago', status: 'contacted', color: '#e8772e', phone: '+91 5432109876', city: 'Karimnagar' },
        { name: 'Suresh Goud', project: 'Duplex House Construction', budget: '₹85 Lakhs', date: '3 days ago', status: 'converted', color: '#4285F4', phone: '+91 4321098765', city: 'Hyderabad' },
    ];

    function renderLeads(filter = 'all') {
        const list     = document.getElementById('leads-list');
        const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
        list.innerHTML = filtered.map(l => {
            const initials = l.name.split(' ').map(n => n[0]).join('');
            return `<div class="lead-card">
                <div class="lead-avatar" style="background:${l.color}">${initials}</div>
                <div class="lead-info">
                    <div class="lead-name">${l.name}</div>
                    <div class="lead-project">${l.project}</div>
                </div>
                <div class="lead-meta">
                    <div class="lead-meta-item"><span class="material-icons-round">payments</span>${l.budget}</div>
                    <div class="lead-meta-item"><span class="material-icons-round">location_on</span>${l.city}</div>
                    <div class="lead-meta-item"><span class="material-icons-round">schedule</span>${l.date}</div>
                </div>
                <span class="lead-status ${l.status}">${l.status}</span>
                <div class="lead-actions">
                    <button class="action-btn" aria-label="Call"><span class="material-icons-round">call</span></button>
                    <button class="action-btn" aria-label="Message"><span class="material-icons-round">chat</span></button>
                </div>
            </div>`;
        }).join('');
    }

    renderLeads();
    document.querySelectorAll('.lead-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lead-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLeads(btn.dataset.status);
        });
    });

    // ============================================================
    // REVIEWS (static)
    // ============================================================
    const reviews = [
        { name: 'Arun Sharma',  provider: 'Rajput & Sons Builders', rating: 5, text: 'Exceptional work on our villa! Delivered on time.', date: '2 days ago', color: '#e8772e' },
        { name: 'Priya Reddy',  provider: 'Awadh Interiors',        rating: 5, text: 'Absolutely love our new living room design.', date: '4 days ago', color: '#5cb85c' },
        { name: 'Vikram Patel', provider: 'Indore Space Crafts',     rating: 4, text: 'Good quality kitchen renovation. Minor delays.', date: '1 week ago', color: '#4285F4' },
        { name: 'Sunita Devi',  provider: 'Elite Paints & Finishes', rating: 5, text: 'The texture work on our accent wall is stunning!', date: '1 week ago', color: '#9c27b0' },
    ];

    const reviewsList = document.getElementById('dash-reviews-list');
    reviews.forEach(r => {
        const initials = r.name.split(' ').map(n => n[0]).join('');
        const stars = Array(5).fill(0).map((_,i) => `<span class="material-icons-round">${i<r.rating?'star':'star_border'}</span>`).join('');
        const card = document.createElement('div');
        card.className = 'dash-review-card';
        card.innerHTML = `
            <div class="dash-review-avatar" style="background:${r.color}">${initials}</div>
            <div class="dash-review-body">
                <div class="dash-review-top"><span class="dash-review-name">${r.name}</span><span class="dash-review-date">${r.date}</span></div>
                <div class="dash-review-stars">${stars}</div>
                <p class="dash-review-text">"${r.text}"</p>
                <div class="dash-review-provider"><span class="material-icons-round">storefront</span>${r.provider}</div>
            </div>`;
        reviewsList.appendChild(card);
    });

    // ============================================================
    // ANALYTICS CHARTS (static visual data)
    // ============================================================
    function createSparkline(id, data, color) {
        const c = document.getElementById(id); if (!c) return;
        const max = Math.max(...data);
        const s   = document.createElement('div'); s.className = 'sparkline';
        data.forEach(v => {
            const b = document.createElement('div'); b.className = 'spark-bar';
            b.style.height = `${(v/max)*100}%`; b.style.background = color; b.style.opacity = 0.7+(v/max)*0.3;
            s.appendChild(b);
        });
        c.appendChild(s);
    }

    createSparkline('kpi-revenue-chart',    [30,45,38,52,48,65,58,72,68,80,75,88], '#e8772e');
    createSparkline('kpi-projects-chart',   [5,8,6,10,12,9,14,11,16,13,18,15],     '#5cb85c');
    createSparkline('kpi-conversion-chart', [20,25,28,24,30,32,28,35,31,38,33,34], '#4285F4');
    createSparkline('kpi-response-chart',   [6,5,4.5,5,4,3.5,4,3,3.5,2.8,3,2.4],  '#9c27b0');

    function roundRect(ctx,x,y,w,h,r){ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);}
    function drawLine(ctx,data,max,pl,pt,cH,gap,color,lw){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineJoin='round';data.forEach((v,i)=>{const x=pl+gap*i,y=pt+cH-(v/max)*cH;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.stroke();data.forEach((v,i)=>{const x=pl+gap*i,y=pt+cH-(v/max)*cH;ctx.beginPath();ctx.fillStyle=color;ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.fillStyle='#fff';ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();});}

    const revenueCtx = document.getElementById('revenue-chart')?.getContext('2d');
    if (revenueCtx) {
        const rD=[8.2,10.5,9.8,12.3,14.1,11.8,15.6,13.2,17.8,16.4,20.2,24.8],pD=[3.2,4.5,3.8,5.3,6.1,4.8,6.6,5.2,7.8,6.9,8.5,10.2],months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],maxR=Math.max(...rD)*1.15;
        const c=revenueCtx.canvas,dpr=window.devicePixelRatio||1,w=c.parentElement.clientWidth-48,h=260;
        c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';revenueCtx.scale(dpr,dpr);
        const pl=50,pb=30,pt=10,pr=20,cW=w-pl-pr,cH=h-pb-pt,bW=cW/months.length*0.55,gap=cW/months.length;
        revenueCtx.strokeStyle='#f0ece7';revenueCtx.lineWidth=1;
        for(let i=0;i<=5;i++){const y=pt+(cH/5)*i;revenueCtx.beginPath();revenueCtx.moveTo(pl,y);revenueCtx.lineTo(w-pr,y);revenueCtx.stroke();revenueCtx.fillStyle='#999';revenueCtx.font='11px Inter';revenueCtx.textAlign='right';revenueCtx.fillText(`₹${(maxR-(maxR/5)*i).toFixed(0)}L`,pl-8,y+4);}
        rD.forEach((v,i)=>{const x=pl+gap*i+(gap-bW)/2,bH=(v/maxR)*cH,y=pt+cH-bH,g=revenueCtx.createLinearGradient(x,y,x,y+bH);g.addColorStop(0,'#e8772e');g.addColorStop(1,'#f0a060');revenueCtx.fillStyle=g;revenueCtx.beginPath();roundRect(revenueCtx,x,y,bW,bH,4);revenueCtx.fill();revenueCtx.fillStyle='#999';revenueCtx.font='11px Inter';revenueCtx.textAlign='center';revenueCtx.fillText(months[i],x+bW/2,h-8);});
        revenueCtx.beginPath();revenueCtx.strokeStyle='#5cb85c';revenueCtx.lineWidth=2.5;revenueCtx.lineJoin='round';pD.forEach((v,i)=>{const x=pl+gap*i+gap/2,y=pt+cH-(v/maxR)*cH;i===0?revenueCtx.moveTo(x,y):revenueCtx.lineTo(x,y);});revenueCtx.stroke();
        pD.forEach((v,i)=>{const x=pl+gap*i+gap/2,y=pt+cH-(v/maxR)*cH;revenueCtx.beginPath();revenueCtx.fillStyle='#5cb85c';revenueCtx.arc(x,y,4,0,Math.PI*2);revenueCtx.fill();revenueCtx.beginPath();revenueCtx.fillStyle='#fff';revenueCtx.arc(x,y,2,0,Math.PI*2);revenueCtx.fill();});
    }

    const sourceCtx = document.getElementById('source-chart')?.getContext('2d');
    if (sourceCtx) {
        const sD=[{label:'Website',value:42,color:'#e8772e'},{label:'Referrals',value:28,color:'#5cb85c'},{label:'Social Media',value:18,color:'#4285F4'},{label:'Direct Call',value:12,color:'#9c27b0'}];
        const tot=sD.reduce((a,b)=>a+b.value,0),c=sourceCtx.canvas,dpr=window.devicePixelRatio||1,sz=200;
        c.width=sz*dpr;c.height=sz*dpr;c.style.width=sz+'px';c.style.height=sz+'px';sourceCtx.scale(dpr,dpr);
        const cx=sz/2,cy=sz/2,r=80,ir=52;let a=-Math.PI/2;
        sD.forEach(d=>{const sw=(d.value/tot)*Math.PI*2;sourceCtx.beginPath();sourceCtx.moveTo(cx,cy);sourceCtx.arc(cx,cy,r,a,a+sw);sourceCtx.closePath();sourceCtx.fillStyle=d.color;sourceCtx.fill();a+=sw;});
        sourceCtx.beginPath();sourceCtx.arc(cx,cy,ir,0,Math.PI*2);sourceCtx.fillStyle='#fff';sourceCtx.fill();
        sourceCtx.fillStyle='#1a1a1a';sourceCtx.font='bold 22px Outfit';sourceCtx.textAlign='center';sourceCtx.textBaseline='middle';sourceCtx.fillText(tot,cx,cy-6);sourceCtx.fillStyle='#999';sourceCtx.font='11px Inter';sourceCtx.fillText('Total',cx,cy+12);
        const legend=document.getElementById('source-legend');sD.forEach(d=>{legend.innerHTML+=`<div class="donut-legend-item"><span class="donut-legend-dot" style="background:${d.color}"></span>${d.label}<span class="donut-legend-val">${d.value}%</span></div>`;});
    }

    const leadsCtx = document.getElementById('leads-chart')?.getContext('2d');
    if (leadsCtx) {
        const lD=[18,24,20,28,32,26,35,30,38,34,42,45],cD=[5,8,7,10,12,9,14,11,15,13,17,20],months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],maxV=Math.max(...lD)*1.15;
        const c=leadsCtx.canvas,dpr=window.devicePixelRatio||1,w=c.parentElement.clientWidth-48,h=220;
        c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';leadsCtx.scale(dpr,dpr);
        const pl=40,pr=20,pt=10,pb=30,cW=w-pl-pr,cH=h-pt-pb,gap=cW/(months.length-1);
        leadsCtx.strokeStyle='#f0ece7';leadsCtx.lineWidth=1;for(let i=0;i<=4;i++){const y=pt+(cH/4)*i;leadsCtx.beginPath();leadsCtx.moveTo(pl,y);leadsCtx.lineTo(w-pr,y);leadsCtx.stroke();}
        drawLine(leadsCtx,lD,maxV,pl,pt,cH,gap,'#4285F4',2.5);drawLine(leadsCtx,cD,maxV,pl,pt,cH,gap,'#e8772e',2.5);
        months.forEach((m,i)=>{leadsCtx.fillStyle='#999';leadsCtx.font='11px Inter';leadsCtx.textAlign='center';leadsCtx.fillText(m,pl+gap*i,h-8);});
    }

    // ============================================================
    // TOP PROVIDERS TABLE in Analytics
    // ============================================================
    const topTbody = document.getElementById('top-providers-tbody');
    (async () => {
        const approved = await ArtisanDB.getApprovedProviders();
        approved.slice(0, 5).forEach((p, i) => {
        topTbody.innerHTML += `<tr>
            <td><strong style="color:var(--clr-accent);font-size:1rem">#${i+1}</strong></td>
            <td><span style="font-weight:600">${p.name}</span></td>
            <td><strong>₹${(Math.random()*4+1).toFixed(1)}L</strong></td>
            <td>${p.projects}</td>
            <td><div class="table-rating"><span class="material-icons-round">star</span>${p.rating.toFixed(1)}</div></td>
            <td><span class="growth-badge up">+${Math.floor(Math.random()*30+5)}%</span></td>
        </tr>`;
        });
    })();

    // ============================================================
    // NAVBAR SCROLL
    // ============================================================
    document.querySelector('.main-content')?.addEventListener('scroll', () => {
        document.getElementById('topbar').classList.toggle('scrolled',
            document.querySelector('.main-content').scrollTop > 20);
    });
});
