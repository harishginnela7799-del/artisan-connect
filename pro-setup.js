/* ================================================
   ArtisanConnect - Professional Setup JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ========== STATE ==========
    let currentStep = 1;
    const totalSteps = 4;
    let selectedProfession = '';
    const uploadedImages = [];
    const uploadedVideos = [];
    const MAX_IMAGES = 6;
    const MAX_VIDEOS = 2;
    const pricingFeatures = { basic: [], premium: [], luxury: [] };

    // ========== USER INFO ==========
    const user = ArtisanDB.getSession();
    if (!user || !user.loggedIn) {
        // Not logged in — redirect to login
        window.location.href = 'login.html';
        return;
    }
    if (user.name) {
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        document.getElementById('user-avatar').textContent = initials;
        document.getElementById('user-name').textContent = `Welcome, ${user.name}`;
    }

    // ========== STEP NAVIGATION ==========
    const steps = document.querySelectorAll('.setup-step');
    const stepDots = document.querySelectorAll('.step-dot');
    const stepLines = document.querySelectorAll('.step-line');
    const progressFill = document.getElementById('progress-fill');
    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');
    const footer = document.getElementById('setup-footer');

    function goToStep(step) {
        currentStep = step;

        // Update sections
        steps.forEach(s => s.classList.remove('active'));
        document.getElementById('step-' + step).classList.add('active');

        // Update step dots
        stepDots.forEach((dot, i) => {
            const stepNum = i + 1;
            dot.classList.remove('active', 'done');
            if (stepNum === step) dot.classList.add('active');
            else if (stepNum < step) dot.classList.add('done');
        });

        // Update lines
        stepLines.forEach((line, i) => {
            line.classList.toggle('done', i + 1 < step);
        });

        // Progress bar
        progressFill.style.width = `${(step / totalSteps) * 100}%`;

        // Nav buttons
        btnBack.style.visibility = step === 1 ? 'hidden' : 'visible';

        if (step === totalSteps) {
            footer.style.display = 'none';
            populateSummary();
        } else {
            footer.style.display = 'flex';
            btnNext.innerHTML = step === totalSteps - 1
                ? 'Complete Setup <span class="material-icons-round">check</span>'
                : 'Continue <span class="material-icons-round">arrow_forward</span>';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            goToStep(currentStep + 1);
        }
    });

    btnBack.addEventListener('click', () => {
        if (currentStep > 1) goToStep(currentStep - 1);
    });

    // ========== VALIDATION ==========
    function validateStep(step) {
        if (step === 1) {
            if (!selectedProfession) {
                showToast('Please select your profession', 'error');
                return false;
            }
            const exp = document.getElementById('experience-years').value;
            const city = document.getElementById('pro-city').value.trim();
            if (!exp) {
                showToast('Please select your experience', 'error');
                return false;
            }
            if (!city) {
                showToast('Please enter your city', 'error');
                return false;
            }
            return true;
        }
        if (step === 2) {
            const basicPrice = document.getElementById('price-basic').value;
            if (!basicPrice) {
                showToast('Please set at least the Basic package price', 'error');
                return false;
            }
            return true;
        }
        if (step === 3) {
            // Portfolio is optional but let them proceed
            return true;
        }
        return true;
    }

    // ========== STEP 1: PROFESSION CARDS ==========
    const professionCards = document.querySelectorAll('.profession-card');
    const extraFields = document.getElementById('extra-fields');

    professionCards.forEach(card => {
        card.addEventListener('click', () => {
            professionCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedProfession = card.dataset.profession;
            extraFields.style.display = 'block';
        });
    });

    // Bio character count
    const bioInput = document.getElementById('pro-bio');
    const bioCount = document.getElementById('bio-count');
    bioInput.addEventListener('input', () => {
        bioCount.textContent = bioInput.value.length;
    });

    // ========== STEP 2: FEATURE TAGS ==========
    ['basic', 'premium', 'luxury'].forEach(tier => {
        const input = document.getElementById(`${tier}-feature-input`);
        const container = document.getElementById(`${tier}-tags`);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = input.value.trim();
                if (val && pricingFeatures[tier].length < 8) {
                    pricingFeatures[tier].push(val);
                    renderTags(tier);
                    input.value = '';
                }
            }
        });

        function renderTags(t) {
            const cont = document.getElementById(`${t}-tags`);
            cont.innerHTML = pricingFeatures[t].map((f, i) => `
                <span class="feature-tag">
                    ${f}
                    <span class="remove-tag material-icons-round" data-tier="${t}" data-index="${i}">close</span>
                </span>
            `).join('');

            cont.querySelectorAll('.remove-tag').forEach(btn => {
                btn.addEventListener('click', () => {
                    pricingFeatures[btn.dataset.tier].splice(btn.dataset.index, 1);
                    renderTags(btn.dataset.tier);
                });
            });
        }
    });

    // ========== STEP 3: IMAGE UPLOAD ==========
    const imageInput = document.getElementById('image-input');
    const imageGrid = document.getElementById('image-upload-grid');
    const imgCountEl = document.getElementById('img-count');
    const imageTrigger = document.getElementById('image-upload-trigger');

    // Drag & drop
    imageTrigger.addEventListener('dragover', (e) => { e.preventDefault(); imageTrigger.classList.add('drag-over'); });
    imageTrigger.addEventListener('dragleave', () => imageTrigger.classList.remove('drag-over'));
    imageTrigger.addEventListener('drop', (e) => {
        e.preventDefault();
        imageTrigger.classList.remove('drag-over');
        handleImageFiles(e.dataTransfer.files);
    });

    imageInput.addEventListener('change', () => {
        handleImageFiles(imageInput.files);
        imageInput.value = '';
    });

    function handleImageFiles(files) {
        const remaining = MAX_IMAGES - uploadedImages.length;
        if (remaining <= 0) {
            showToast('Maximum 6 images allowed', 'error');
            return;
        }

        const toAdd = Array.from(files).slice(0, remaining);
        toAdd.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                showToast(`${file.name} exceeds 5MB limit`, 'error');
                return;
            }
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImages.push({ name: file.name, url: e.target.result });
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderImagePreviews() {
        // Remove existing previews
        imageGrid.querySelectorAll('.preview-card').forEach(c => c.remove());

        uploadedImages.forEach((img, i) => {
            const card = document.createElement('div');
            card.className = 'preview-card';
            card.innerHTML = `
                <img src="${img.url}" alt="${img.name}">
                <button class="preview-remove" data-type="image" data-index="${i}">
                    <span class="material-icons-round">close</span>
                </button>
                <div class="preview-name">${img.name}</div>
            `;
            imageGrid.insertBefore(card, imageTrigger);
        });

        imgCountEl.textContent = uploadedImages.length;

        // Hide trigger if max reached
        imageTrigger.style.display = uploadedImages.length >= MAX_IMAGES ? 'none' : 'flex';
    }

    // ========== STEP 3: VIDEO UPLOAD ==========
    const videoInput = document.getElementById('video-input');
    const videoGrid = document.getElementById('video-upload-grid');
    const vidCountEl = document.getElementById('vid-count');
    const videoTrigger = document.getElementById('video-upload-trigger');

    videoTrigger.addEventListener('dragover', (e) => { e.preventDefault(); videoTrigger.classList.add('drag-over'); });
    videoTrigger.addEventListener('dragleave', () => videoTrigger.classList.remove('drag-over'));
    videoTrigger.addEventListener('drop', (e) => {
        e.preventDefault();
        videoTrigger.classList.remove('drag-over');
        handleVideoFiles(e.dataTransfer.files);
    });

    videoInput.addEventListener('change', () => {
        handleVideoFiles(videoInput.files);
        videoInput.value = '';
    });

    function handleVideoFiles(files) {
        const remaining = MAX_VIDEOS - uploadedVideos.length;
        if (remaining <= 0) {
            showToast('Maximum 2 videos allowed', 'error');
            return;
        }

        const toAdd = Array.from(files).slice(0, remaining);
        toAdd.forEach(file => {
            if (file.size > 50 * 1024 * 1024) {
                showToast(`${file.name} exceeds 50MB limit`, 'error');
                return;
            }
            if (!file.type.startsWith('video/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedVideos.push({ name: file.name, url: e.target.result });
                renderVideoPreviews();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderVideoPreviews() {
        videoGrid.querySelectorAll('.preview-card').forEach(c => c.remove());

        uploadedVideos.forEach((vid, i) => {
            const card = document.createElement('div');
            card.className = 'preview-card video-preview';
            card.innerHTML = `
                <video src="${vid.url}" muted></video>
                <button class="preview-remove" data-type="video" data-index="${i}">
                    <span class="material-icons-round">close</span>
                </button>
                <div class="preview-name">${vid.name}</div>
            `;
            videoGrid.insertBefore(card, videoTrigger);
        });

        vidCountEl.textContent = uploadedVideos.length;
        videoTrigger.style.display = uploadedVideos.length >= MAX_VIDEOS ? 'none' : 'flex';
    }

    // Remove handler (delegated)
    document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.preview-remove');
        if (!removeBtn) return;

        const type = removeBtn.dataset.type;
        const index = parseInt(removeBtn.dataset.index);

        if (type === 'image') {
            uploadedImages.splice(index, 1);
            renderImagePreviews();
        } else if (type === 'video') {
            uploadedVideos.splice(index, 1);
            renderVideoPreviews();
        }
    });

    // ========== STEP 4: SUMMARY + SAVE TO DATABASE ==========
    async function populateSummary() {
        const professionLabel = selectedProfession.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const city        = document.getElementById('pro-city').value.trim();
        const exp         = document.getElementById('experience-years').value;
        const bio         = document.getElementById('pro-bio').value.trim();
        const basicPrice  = document.getElementById('price-basic').value;
        const premiumPrice= document.getElementById('price-premium').value;
        const luxuryPrice = document.getElementById('price-luxury').value;
        const basicUnit   = document.getElementById('unit-basic').value;
        const premiumUnit = document.getElementById('unit-premium').value;
        const luxuryUnit  = document.getElementById('unit-luxury').value;

        // ── DATABASE: Save professional profile ──
        // If we only filter out DataURLs, nothing gets persisted (uploads are DataURLs today).
        // Until we add proper storage uploads, persist a small subset safely:
        // - keep up to 6 images
        // - allow DataURLs, but drop extremely large ones to avoid breaking row limits
        const MAX_DATAURL_CHARS = 750_000; // ~0.75MB text per image (rough safety cap)
        const portfolioImages = uploadedImages
            .map(i => i.url)
            .filter(u => typeof u === 'string' && u.length > 0)
            .filter(u => !u.startsWith('data:') || u.length <= MAX_DATAURL_CHARS)
            .slice(0, MAX_IMAGES);

        await ArtisanDB.saveProfessionalProfile(user.user_id, {
            company_name: user.name,
            service_type: selectedProfession, // keep canonical value for filters
            portfolio_images: portfolioImages,
            portfolio_video: null
        });

        // Update go-live link
        document.getElementById('btn-go-live').href = 'portfolio.html';

        const summary = document.getElementById('complete-summary');
        summary.innerHTML = `
            <div class="summary-row">
                <span class="material-icons-round">engineering</span>
                <span class="summary-label">Profession</span>
                <span class="summary-value">${professionLabel}</span>
            </div>
            <div class="summary-row">
                <span class="material-icons-round">location_on</span>
                <span class="summary-label">Location</span>
                <span class="summary-value">${city || user.location || '—'}</span>
            </div>
            <div class="summary-row">
                <span class="material-icons-round">work_history</span>
                <span class="summary-label">Experience</span>
                <span class="summary-value">${exp || '—'} Years</span>
            </div>
            <div class="summary-row">
                <span class="material-icons-round">payments</span>
                <span class="summary-label">Pricing Set</span>
                <span class="summary-value">${[
                    basicPrice   ? 'Basic ₹'   + basicPrice   : '',
                    premiumPrice ? 'Premium ₹' + premiumPrice : '',
                    luxuryPrice  ? 'Luxury ₹'  + luxuryPrice  : ''
                ].filter(Boolean).join(' · ') || '—'}</span>
            </div>
            <div class="summary-row">
                <span class="material-icons-round">image</span>
                <span class="summary-label">Images Uploaded</span>
                <span class="summary-value">${uploadedImages.length} / ${MAX_IMAGES}</span>
            </div>
            <div class="summary-row">
                <span class="material-icons-round">videocam</span>
                <span class="summary-label">Videos Uploaded</span>
                <span class="summary-value">${uploadedVideos.length} / ${MAX_VIDEOS}</span>
            </div>
        `;
    }

    // ========== TOAST ==========
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toast-icon');
        const toastMsg = document.getElementById('toast-msg');

        toastMsg.textContent = message;
        toastIcon.textContent = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
        toast.classList.add('show');

        setTimeout(() => toast.classList.remove('show'), 3000);
    }
});
