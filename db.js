/* =====================================================
   ArtisanConnect — Database Engine (Supabase Cloud)
   Implements the provided relational schema using Supabase.
   All functions are now async.
   ===================================================== */

const ArtisanDB = (() => {

    const SUPABASE_URL = 'https://lmybttsgswgzzdpqwsta.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxteWJ0dHNnc3dnenpkcHF3c3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQzMDksImV4cCI6MjA5MTUwMDMwOX0.7kfW511jMBYqN50zZ9DOcQZ-tNmAiuGRgcqRvtZNsq8';
    
    // Initialize Supabase Client
    if (typeof supabase === 'undefined') {
        console.error("Supabase client is not loaded. Please ensure the CDN script is included.");
    }
    const client = typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    const KEYS = {
        SESSION: 'ac_session'
    };

    // ── Internal Helpers ──────────────────────────────
    function _hash(pw) { return btoa(encodeURIComponent(pw + '::ac_salt')); }
    function _writeSession(data) { localStorage.setItem(KEYS.SESSION, JSON.stringify(data)); }
    function _readSession() { try { return JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null'); } catch { return null; } }
    function _normStr(v) { return (v ?? '').toString().trim().toLowerCase(); }
    function _normServiceType(v) {
        const s = _normStr(v);
        if (!s) return '';
        // Handle both "interior designer" and "interior-designer"
        return s.replace(/\s+/g, '-');
    }

    // =========================================================
    // 1. User Routes / Functions
    // =========================================================
    async function registerUser({ name, email, phone, password, role = 'user', writeSession = true }) {
        // UNIQUE constraints check
        const { data: existingUser } = await client.from('users').select('user_id').eq('email', email.toLowerCase()).maybeSingle();
        
        if (existingUser) {
            return { success: false, error: 'Email already exists.' };
        }

        const newUser = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            password_hash: _hash(password),
            role: role
        };

        const { data, error } = await client.from('users').insert([newUser]).select().single();
        
        if (error) return { success: false, error: error.message };

        // Auto login handling handled by caller usually for user, but we'll set session
        const { password_hash: _, ...safeUser } = data;
        if (writeSession) {
            _writeSession({ ...safeUser, loggedIn: true, sessionStart: new Date().toISOString() });
        }

        return { success: true, user_id: data.user_id };
    }

    async function loginUser(email, password) {
        const { data: user, error } = await client.from('users').select('*').eq('email', email.trim().toLowerCase()).maybeSingle();
        
        if (error || !user) return { success: false, error: 'User not found.' };
        if (_hash(password) !== user.password_hash) return { success: false, error: 'Invalid password.' };
        
        const { password_hash: _, ...safeUser } = user;
        _writeSession({ ...safeUser, loggedIn: true, sessionStart: new Date().toISOString() });
        return { success: true, user: safeUser };
    }

    // =========================================================
    // 2. Professional & Location Setup
    // =========================================================
    async function registerProfessional({ name, email, phone, password, location }) {
        // Don't write session until professional + location rows succeed.
        const userRes = await registerUser({ name, email, phone, password, role: 'professional', writeSession: false });
        if (!userRes.success) return userRes;

        const newPro = {
            user_id: userRes.user_id,
            company_name: name,
            service_type: null,
            location: location,
            verification_status: 'pending',
            portfolio_images: '[]',
            portfolio_video: null
        };
        
        const { data: proData, error: proError } = await client.from('professionals').insert([newPro]).select().single();
        if (proError) return { success: false, error: proError.message };

        const newLoc = {
            user_id: userRes.user_id,
            professional_id: proData.professional_id,
            city: location,
            country: 'India'
        };
        const { error: locError } = await client.from('locations').insert([newLoc]);
        if (locError) {
            // Don't fail silently — surface FK/constraint issues so the flow can be fixed.
            return { success: false, error: locError.message };
        }

        // Now that all rows exist, create session once.
        const { data: userRow, error: userErr } = await client.from('users').select('*').eq('user_id', userRes.user_id).maybeSingle();
        if (!userErr && userRow) {
            const { password_hash: __, ...safeUser } = userRow;
            _writeSession({ ...safeUser, loggedIn: true, sessionStart: new Date().toISOString() });
        }

        return { success: true, user_id: userRes.user_id, professional_id: proData.professional_id };
    }

    async function saveProfessionalProfile(userId, data) {
        const updateData = {};
        if (data.company_name) updateData.company_name = data.company_name;
        if (data.service_type) updateData.service_type = data.service_type;
        if (data.portfolio_images && Array.isArray(data.portfolio_images)) {
            updateData.portfolio_images = JSON.stringify(data.portfolio_images);
        }
        if (data.portfolio_video) updateData.portfolio_video = data.portfolio_video;

        const { error } = await client.from('professionals').update(updateData).eq('user_id', userId);
        if (error) return { success: false, error: error.message };
        
        return { success: true };
    }

    async function uploadMedia(fileObj) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ success: true, base64Url: e.target.result });
            reader.onerror = () => reject({ success: false, error: 'File read failed' });
            reader.readAsDataURL(fileObj);
        });
    }

    // =========================================================
    // GET Views & Joins
    // =========================================================
    async function getProfessionalByUserId(userId) {
        const { data: pro } = await client.from('professionals').select('*').eq('user_id', userId).maybeSingle();
        if (!pro) return null;
        
        const { data: loc } = await client.from('locations').select('*').eq('professional_id', pro.professional_id).maybeSingle();
        pro.location_details = loc;
        pro.services = []; // Mock empty services since table is not implemented
        return pro;
    }

    async function getAllProfessionals() {
        const { data: pros, error } = await client.from('professionals').select('*, users(*)');
        if (error || !pros) return [];
        return pros.map(pro => {
            const user = pro.users || {};
            const { password_hash: _, ...safeUser } = user;
            return { ...safeUser, ...pro };
        });
    }

    async function getApprovedProviders() {
        const allPros = await getAllProfessionals();
        return allPros
            .filter(p => _normStr(p.verification_status) === 'approved')
            .map(p => ({
                id: p.professional_id,
                name: p.company_name,
                type: _normServiceType(p.service_type) || 'builder',
                city: p.location || 'Unknown',
                rating: 4.8,
                projects: 10,
                status: 'active',
                img: JSON.parse(p.portfolio_images || '[]')[0] || 'images/modern.png',
                email: p.email,
                phone: p.phone,
            }));
    }

    // =========================================================
    // 4. Verification Workflow
    // =========================================================
    async function approveProfessional(professionalId) {
        const { error } = await client.from('professionals').update({ verification_status: 'approved' }).eq('professional_id', professionalId);
        return { success: !error, error: error?.message };
    }

    async function rejectProfessional(professionalId) {
        const { error } = await client.from('professionals').update({ verification_status: 'rejected' }).eq('professional_id', professionalId);
        return { success: !error, error: error?.message };
    }

    // =========================================================
    // Aliases to support existing frontend Dashboard
    // =========================================================
    function getSession() { return _readSession(); }
    function logout() { localStorage.removeItem(KEYS.SESSION); }
    
    async function getAllUsers() {
        const { data: users } = await client.from('users').select('*');
        return (users || []).map(({ password_hash: _, ...u }) => u);
    }
    
    async function emailExists(e) {
        const { data } = await client.from('users').select('user_id').eq('email', e.trim().toLowerCase()).maybeSingle();
        return !!data;
    }

    async function getAllProviders() {
        const pros = await getAllProfessionals();
        return pros.map(p => ({
            id: p.professional_id,
            name: p.company_name,
            type: _normServiceType(p.service_type) || 'builder',
            city: p.location,
            rating: 4.8,
            projects: 10,
            status: _normStr(p.verification_status) === 'approved' ? 'active' : (_normStr(p.verification_status) === 'pending' ? 'pending' : 'inactive'),
            img: JSON.parse(p.portfolio_images || '[]')?.[0] || 'images/modern.png',
            email: p.email,
            phone: p.phone,
            source: 'database',
            userId: p.user_id
        }));
    }

    async function addProvider(data) {
        // IMPORTANT: do not overwrite current session (admin) when creating a system provider.
        const userRes = await registerUser({ name: data.name, email: data.email || 'auto_sys@sys.com', phone: data.phone, password: 'sys', role: 'professional', writeSession: false });
        if(!userRes.success) return userRes;
        
        await client.from('professionals').insert([{
            user_id: userRes.user_id,
            company_name: data.name,
            service_type: _normServiceType(data.type) || null,
            location: data.city,
            verification_status: 'approved',
            portfolio_images: JSON.stringify([data.img])
        }]);
        return { success: true };
    }

    async function updateProvider(id, data) {
         // `id` is expected to be a professional_id for provider CRUD.
         if (data.status === 'active') return await approveProfessional(id);
         if (data.status === 'inactive') return await rejectProfessional(id);
         
         // Field updates (company_name/service_type/location + related user email/phone)
         const { data: pro, error: proErr } = await client
            .from('professionals')
            .select('professional_id,user_id,portfolio_images')
            .eq('professional_id', id)
            .maybeSingle();
         if (proErr) return { success: false, error: proErr.message };
         if (!pro) return { success: false, error: 'Provider not found.' };

         const proUpdate = {};
         if (data.name) proUpdate.company_name = data.name;
         if (data.type) proUpdate.service_type = _normServiceType(data.type);
         if (data.city) proUpdate.location = data.city;
         if (data.img) {
            let existing = [];
            try { existing = JSON.parse(pro.portfolio_images || '[]'); } catch { existing = []; }
            const next = [data.img, ...existing.filter(Boolean).filter(x => x !== data.img)];
            proUpdate.portfolio_images = JSON.stringify(next.slice(0, 6));
         }

         if (Object.keys(proUpdate).length > 0) {
            const { error: updErr } = await client.from('professionals').update(proUpdate).eq('professional_id', id);
            if (updErr) return { success: false, error: updErr.message };
         }

         const userUpdate = {};
         if (data.email) userUpdate.email = data.email.trim().toLowerCase();
         if (data.phone) userUpdate.phone = data.phone;
         if (data.name) userUpdate.name = data.name;
         if (Object.keys(userUpdate).length > 0) {
            const { error: userErr } = await client.from('users').update(userUpdate).eq('user_id', pro.user_id);
            if (userErr) return { success: false, error: userErr.message };
         }

         return { success: true };
    }
    
    async function deleteProvider(id) {
         await client.from('professionals').delete().eq('professional_id', id);
         return {success:true};
    }

    async function deleteUser(userId) {
         await client.from('users').delete().eq('user_id', userId);
         return {success:true};
    }

    async function updateUser(userId, data) {
         const { error } = await client.from('users').update(data).eq('user_id', userId);
         return {success: !error, error: error?.message};
    }

    return {
        registerUser, registerProfessional, loginUser, getSession, logout, getAllUsers, updateUser, deleteUser, emailExists,
        saveProfessionalProfile, getProfessionalByUserId, getAllProfessionals, uploadMedia,
        getAllProviders, getApprovedProviders, addProvider, updateProvider, deleteProvider,
        approveProfessional: async (uid) => {
            const {data} = await client.from('professionals').select('professional_id').eq('user_id', uid).maybeSingle();
            if (!data?.professional_id) return { success: false, error: 'Professional record not found for this user.' };
            return await approveProfessional(data.professional_id);
        }, 
        rejectProfessional: async (uid) => {
            const {data} = await client.from('professionals').select('professional_id').eq('user_id', uid).maybeSingle();
            if (!data?.professional_id) return { success: false, error: 'Professional record not found for this user.' };
            return await rejectProfessional(data.professional_id);
        }
    };
})();
