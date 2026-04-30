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
    function _isValidRole(role) { return role === 'user' || role === 'professional'; }
    function _getRoleFromSession(session) { return _isValidRole(session?.role) ? session.role : null; }
    async function _getRoleFromUserRow(userId) {
        if (!userId) return null;
        const { data } = await client.from('users').select('role').eq('user_id', userId).maybeSingle();
        return _isValidRole(data?.role) ? data.role : null;
    }
    async function _resolveRole(userId, session = null) {
        const roleFromSession = _getRoleFromSession(session || _readSession());
        if (roleFromSession) return roleFromSession;
        return await _getRoleFromUserRow(userId);
    }
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
    function getCurrentRole() { return _getRoleFromSession(_readSession()); }
    async function getRoleForUser(userId) { return await _getRoleFromUserRow(userId); }
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

    // =========================================================
    // 5. Review System
    // =========================================================

    /**
     * Fetch a single professional by professional_id with joined user data.
     * Used by the portfolio/profile page to show real database data.
     */
    async function getProfessionalById(professionalId) {
        const { data: pro, error } = await client
            .from('professionals')
            .select('*, users(*)')
            .eq('professional_id', professionalId)
            .maybeSingle();

        if (error || !pro) return null;

        const user = pro.users || {};
        const { password_hash: _, ...safeUser } = user;

        // Fetch location details
        const { data: loc } = await client
            .from('locations')
            .select('*')
            .eq('professional_id', professionalId)
            .maybeSingle();

        return {
            professional_id: pro.professional_id,
            user_id: pro.user_id,
            company_name: pro.company_name,
            service_type: _normServiceType(pro.service_type) || 'builder',
            location: pro.location || loc?.city || 'Unknown',
            verification_status: pro.verification_status,
            portfolio_images: pro.portfolio_images,
            portfolio_video: pro.portfolio_video,
            created_at: pro.created_at,
            email: safeUser.email,
            phone: safeUser.phone,
            name: safeUser.name || pro.company_name,
        };
    }

    /**
     * Submit a review for a professional.
     * Enforces one review per user per professional via DB unique constraint.
     */
    async function submitReview({ professional_id, user_id, rating, comment }) {
        // Validate rating range
        if (!rating || rating < 1 || rating > 5) {
            return { success: false, error: 'Rating must be between 1 and 5.' };
        }
        if (!professional_id || !user_id) {
            return { success: false, error: 'Professional ID and User ID are required.' };
        }
        const session = _readSession();
        const sessionRole = await _resolveRole(user_id, session);
        if (!session || !session.loggedIn || session.user_id !== user_id) {
            return { success: false, error: 'You must be logged in as this user.' };
        }
        if (sessionRole !== 'user') {
            return { success: false, error: 'Only normal users can submit reviews.' };
        }

        const { data: reviewAuthor } = await client
            .from('users')
            .select('role')
            .eq('user_id', user_id)
            .maybeSingle();
        if (!reviewAuthor || reviewAuthor.role !== 'user') {
            return { success: false, error: 'Only normal users can submit reviews.' };
        }

        // Check for duplicate review (belt-and-suspenders; DB also enforces this)
        const existing = await getUserReviewForProfessional(user_id, professional_id);
        if (existing) {
            return { success: false, error: 'You have already reviewed this professional.' };
        }

        const { data, error } = await client
            .from('reviews')
            .insert([{
                professional_id,
                user_id,
                rating: parseInt(rating, 10),
                comment: (comment || '').trim() || null,
                response: null
            }])
            .select()
            .single();

        if (error) {
            // Handle unique constraint violation gracefully
            if (error.code === '23505') {
                return { success: false, error: 'You have already reviewed this professional.' };
            }
            return { success: false, error: error.message };
        }

        return { success: true, review: data };
    }

    /**
     * Fetch all reviews for a professional, joined with user names.
     * Ordered newest first.
     */
    async function getReviewsForProfessional(professionalId) {
        const { data: reviews, error } = await client
            .from('reviews')
            .select('*, users(name, email)')
            .eq('professional_id', professionalId)
            .order('created_at', { ascending: false });

        if (error) return [];

        return (reviews || []).map(r => ({
            id: r.id,
            professional_id: r.professional_id,
            user_id: r.user_id,
            rating: r.rating,
            comment: r.comment,
            response: r.response || null,
            created_at: r.created_at,
            reviewer_name: r.users?.name || 'Anonymous',
            reviewer_email: r.users?.email || '',
        }));
    }

    /**
     * Check if a user already has a review for a given professional.
     * Returns the review object if found, null otherwise.
     */
    async function getUserReviewForProfessional(userId, professionalId) {
        const { data } = await client
            .from('reviews')
            .select('*')
            .eq('user_id', userId)
            .eq('professional_id', professionalId)
            .maybeSingle();
        return data || null;
    }

    async function updateReview({ review_id, user_id, rating, comment }) {
        if (!review_id || !user_id) return { success: false, error: 'Review ID and user ID are required.' };
        if (!rating || rating < 1 || rating > 5) return { success: false, error: 'Rating must be between 1 and 5.' };

        const session = _readSession();
        const sessionRole = await _resolveRole(user_id, session);
        if (!session || !session.loggedIn || session.user_id !== user_id) {
            return { success: false, error: 'You must be logged in as this user.' };
        }
        if (sessionRole !== 'user') {
            return { success: false, error: 'Only normal users can edit reviews.' };
        }

        const { data: existingReview } = await client
            .from('reviews')
            .select('id, user_id')
            .eq('id', review_id)
            .maybeSingle();
        if (!existingReview) return { success: false, error: 'Review not found.' };
        if (existingReview.user_id !== user_id) {
            return { success: false, error: 'You can only edit your own review.' };
        }

        const { data, error } = await client
            .from('reviews')
            .update({
                rating: parseInt(rating, 10),
                comment: (comment || '').trim() || null
            })
            .eq('id', review_id)
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) return { success: false, error: error.message };
        return { success: true, review: data };
    }

    async function deleteReview({ review_id, user_id }) {
        if (!review_id || !user_id) return { success: false, error: 'Review ID and user ID are required.' };
        const session = _readSession();
        const sessionRole = await _resolveRole(user_id, session);
        if (!session || !session.loggedIn || session.user_id !== user_id) {
            return { success: false, error: 'You must be logged in as this user.' };
        }
        if (sessionRole !== 'user') {
            return { success: false, error: 'Only normal users can delete reviews.' };
        }

        const { data: existingReview } = await client
            .from('reviews')
            .select('id, user_id')
            .eq('id', review_id)
            .maybeSingle();
        if (!existingReview) return { success: false, error: 'Review not found.' };
        if (existingReview.user_id !== user_id) {
            return { success: false, error: 'You can only delete your own review.' };
        }

        const { error } = await client
            .from('reviews')
            .delete()
            .eq('id', review_id)
            .eq('user_id', user_id);
        if (error) return { success: false, error: error.message };
        return { success: true };
    }

    async function submitReviewResponse({ review_id, professional_user_id, response }) {
        if (!review_id || !professional_user_id) {
            return { success: false, error: 'Review ID and professional user ID are required.' };
        }
        const cleanedResponse = (response || '').trim();
        if (!cleanedResponse) return { success: false, error: 'Response cannot be empty.' };

        const session = _readSession();
        const sessionRole = await _resolveRole(professional_user_id, session);
        if (!session || !session.loggedIn || session.user_id !== professional_user_id) {
            return { success: false, error: 'You must be logged in as this professional.' };
        }
        if (sessionRole !== 'professional') {
            return { success: false, error: 'Only professionals can respond to reviews.' };
        }

        const { data: review, error: reviewErr } = await client
            .from('reviews')
            .select('id, professional_id, response')
            .eq('id', review_id)
            .maybeSingle();
        if (reviewErr || !review) return { success: false, error: 'Review not found.' };

        const { data: pro } = await client
            .from('professionals')
            .select('professional_id, user_id')
            .eq('professional_id', review.professional_id)
            .maybeSingle();
        if (!pro) return { success: false, error: 'Professional profile not found.' };
        if (pro.user_id !== professional_user_id) {
            return { success: false, error: 'You can only respond to reviews on your own profile.' };
        }

        const { data, error } = await client
            .from('reviews')
            .update({ response: cleanedResponse })
            .eq('id', review_id)
            .eq('professional_id', review.professional_id)
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, review: data };
    }

    /**
     * Calculate average rating from an array of review objects.
     * Returns { averageRating, totalReviews }
     */
    function calculateAverageRating(reviews) {
        if (!reviews || reviews.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            averageRating: parseFloat((sum / reviews.length).toFixed(1)),
            totalReviews: reviews.length
        };
    }

    /**
     * Calculate Client Satisfaction percentage from reviews.
     * Formula: (SUM of each rating * 20) / total reviews
     *   5★ = 100%, 4★ = 80%, 3★ = 60%, 2★ = 40%, 1★ = 20%
     */
    function calculateClientSatisfaction(reviews) {
        if (!reviews || reviews.length === 0) return 0;
        const satisfactionSum = reviews.reduce((acc, r) => acc + (r.rating * 20), 0);
        return parseFloat((satisfactionSum / reviews.length).toFixed(1));
    }

    return {
        registerUser, registerProfessional, loginUser, getSession, getCurrentRole, getRoleForUser, logout, getAllUsers, updateUser, deleteUser, emailExists,
        saveProfessionalProfile, getProfessionalByUserId, getAllProfessionals, uploadMedia,
        getAllProviders, getApprovedProviders, addProvider, updateProvider, deleteProvider,
        // Professional profile (portfolio page)
        getProfessionalById,
        // Review system
        submitReview, getReviewsForProfessional, getUserReviewForProfessional, updateReview, deleteReview, submitReviewResponse,
        calculateAverageRating, calculateClientSatisfaction,
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
