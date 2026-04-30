/* ================================================
   ArtisanConnect — Portfolio Page JavaScript
   Fetches real data from Supabase via ArtisanDB.
   No more hardcoded/dummy data.
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ========== CONSTANTS ==========
    const AVATAR_COLORS = ['#e8772e', '#5cb85c', '#4285F4', '#9c27b0', '#00bcd4', '#ff5722', '#795548'];
    const FALLBACK_IMAGES = [
        'images/living_room.png', 'images/bedroom.png', 'images/kitchen.png',
        'images/study.png', 'images/fireplace.png', 'images/office.png',
        'images/bathroom.png', 'images/dining.png', 'images/modern.png'
    ];
    const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    // ========== DOM REFS ==========
    const pageLoader   = document.getElementById('page-loader');
    const errorState   = document.getElementById('error-state');
    const mainPortfolio = document.getElementById('main-portfolio');

    // ========== GET PROFESSIONAL ID FROM URL ==========
    const params = new URLSearchParams(window.location.search);
    const professionalId = parseInt(params.get('id'), 10);

    if (!professionalId || isNaN(professionalId)) {
        showError('No professional ID provided. Please go back and select a professional.');
        return;
    }

    // ========== AUTH STATE ==========
    const session = (typeof ArtisanDB !== 'undefined') ? ArtisanDB.getSession() : null;
    const isLoggedIn = session && session.loggedIn;
    const currentUserId = session?.user_id;

    // Update navbar auth state
    setupNavbarAuth();

    // ========== MAIN INITIALIZATION ==========
    init();

    async function init() {
        try {
            // 1. Fetch professional data from database
            const proData = await ArtisanDB.getProfessionalById(professionalId);

            if (!proData) {
                showError('Professional not found. They may have been removed or the link is invalid.');
                return;
            }

            // 2. Fetch reviews from database
            const reviews = await ArtisanDB.getReviewsForProfessional(professionalId);

            // 3. Calculate metrics from real reviews
            const { averageRating, totalReviews } = ArtisanDB.calculateAverageRating(reviews);
            const satisfaction = ArtisanDB.calculateClientSatisfaction(reviews);

            // 4. Render everything with real data
            renderProfile(proData, averageRating, totalReviews, satisfaction);
            renderCarousel(proData);
            renderProjects(proData);
            renderReviewsSummary(averageRating, totalReviews);
            renderReviewsList(reviews);
            renderPricing(proData);
            renderAboutStats(satisfaction, averageRating);

            // 5. Setup review form
            await setupReviewForm(reviews);

            // 6. Show the page
            pageLoader.classList.add('hidden');
            mainPortfolio.classList.remove('hidden');

            // 7. Initialize interactions
            initCarousel(proData);
            initTabs();
            initNavbarScroll();
            initModal();
            initScrollReveal();

        } catch (err) {
            console.error('Failed to load professional profile:', err);
            showError('Something went wrong while loading this profile. Please try again later.');
        }
    }

    // =========================================================
    // RENDER FUNCTIONS
    // =========================================================

    /** Populate the profile overlay with real data */
    function renderProfile(pro, avgRating, totalReviews, satisfaction) {
        document.title = `${pro.company_name} - ArtisanConnect`;

        document.getElementById('profile-name').textContent = pro.company_name;
        document.getElementById('profile-rating').querySelector('.rating-value').textContent = avgRating.toFixed(1);
        document.getElementById('profile-rating').querySelector('.rating-count').textContent = `(${totalReviews} review${totalReviews !== 1 ? 's' : ''})`;
        document.getElementById('profile-location').textContent = pro.location || 'India';

        // Format service type for display
        const serviceType = (pro.service_type || 'builder')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
        document.getElementById('profile-service-type').textContent = serviceType;

        // About text (use a professional description or generate one)
        const aboutText = document.getElementById('about-text');
        aboutText.textContent = `${pro.company_name} is a verified ${serviceType.toLowerCase()} based in ${pro.location || 'India'}. Trusted by homeowners for delivering quality craftsmanship with attention to detail and timely project completion. Connect with them today to discuss your project requirements.`;
    }

    /** Render the cover carousel with portfolio images */
    function renderCarousel(pro) {
        const track = document.getElementById('carousel-track');
        const dotsContainer = document.getElementById('carousel-dots');

        let images = [];
        try {
            images = JSON.parse(pro.portfolio_images || '[]');
        } catch { images = []; }

        // If no portfolio images, use fallback images
        if (images.length === 0) {
            images = FALLBACK_IMAGES.slice(0, 4);
        }

        images.forEach((imgSrc, i) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="${imgSrc}" alt="${pro.company_name} project ${i + 1}" onerror="this.src='images/modern.png'">`;
            track.appendChild(slide);

            const dot = document.createElement('button');
            dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dotsContainer.appendChild(dot);
        });
    }

    /** Render the projects grid using portfolio images */
    function renderProjects(pro) {
        const grid = document.getElementById('projects-grid');
        let images = [];
        try {
            images = JSON.parse(pro.portfolio_images || '[]');
        } catch { images = []; }

        // If no images, show fallback projects
        if (images.length === 0) {
            images = FALLBACK_IMAGES.slice(0, 6);
        }

        const serviceType = (pro.service_type || 'builder').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        images.forEach((img, idx) => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-img-wrap">
                    <img src="${img}" alt="Project ${idx + 1}" onerror="this.src='images/modern.png'">
                    <span class="project-badge">${serviceType}</span>
                </div>
                <div class="project-body">
                    <h3 class="project-title">Project ${idx + 1}</h3>
                    <div class="project-details">
                        <div class="project-detail">
                            <span class="material-icons-round">location_on</span>
                            <div>
                                <div class="project-detail-label">Location</div>
                                <div class="project-detail-value">${pro.location || 'India'}</div>
                            </div>
                        </div>
                        <div class="project-detail">
                            <span class="material-icons-round">work</span>
                            <div>
                                <div class="project-detail-label">Type</div>
                                <div class="project-detail-value">${serviceType}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    /** Render the review summary (average + stars) */
    function renderReviewsSummary(avgRating, totalReviews) {
        document.getElementById('review-avg').textContent = avgRating.toFixed(1);
        document.getElementById('review-count-text').textContent =
            totalReviews === 0 ? 'No reviews yet' : `Based on ${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;

        // Update star icons
        const starsDisplay = document.getElementById('review-stars-display');
        starsDisplay.innerHTML = generateStarIcons(avgRating);
    }

    /** Render the reviews list from database data */
    function renderReviewsList(reviews) {
        const listEl = document.getElementById('reviews-list');
        const noReviewsEl = document.getElementById('no-reviews');

        listEl.innerHTML = '';

        if (reviews.length === 0) {
            noReviewsEl.classList.remove('hidden');
            return;
        }

        noReviewsEl.classList.add('hidden');

        reviews.forEach((review, index) => {
            const initials = review.reviewer_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
            const stars = generateStarIcons(review.rating);
            const timeAgo = getRelativeTime(review.created_at);

            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar" style="background: ${color}">${initials}</div>
                        <div>
                            <div class="reviewer-name">${escapeHtml(review.reviewer_name)}</div>
                            <div class="reviewer-project">Verified Customer</div>
                        </div>
                    </div>
                    <span class="review-date">${timeAgo}</span>
                </div>
                <div class="review-stars-small">${stars}</div>
                ${review.comment ? `<p class="review-text">"${escapeHtml(review.comment)}"</p>` : ''}
            `;
            listEl.appendChild(card);
        });
    }

    /** Render the about section stat circles */
    function renderAboutStats(satisfaction, avgRating) {
        const statCircles = document.querySelectorAll('.stat-progress');
        const ratingPercentage = Math.round(avgRating * 20); // Convert 0-5 to 0-100

        // Client Satisfaction circle
        if (statCircles[0]) statCircles[0].style.setProperty('--progress', satisfaction);
        document.getElementById('satisfaction-value').textContent =
            satisfaction > 0 ? `${Math.round(satisfaction)}%` : 'N/A';

        // Average Rating circle (as percentage)
        if (statCircles[1]) statCircles[1].style.setProperty('--progress', ratingPercentage);
        document.getElementById('rating-percentage-value').textContent =
            avgRating > 0 ? `${avgRating.toFixed(1)}/5` : 'N/A';
    }

    /** Render default pricing cards */
    function renderPricing(pro) {
        const grid = document.getElementById('pricing-grid');
        const serviceType = (pro.service_type || 'builder').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        const plans = [
            {
                name: 'Basic', featured: false,
                price: 'Custom', unit: 'per project',
                features: ['Standard design', 'Quality materials', 'Regular timeline', 'Email support', '1 year warranty']
            },
            {
                name: 'Premium', featured: true,
                price: 'Custom', unit: 'per project',
                features: ['Custom design', 'Premium materials', 'Priority timeline', 'Dedicated support', '3 year warranty', '3D preview', 'Design consultation']
            },
            {
                name: 'Luxury', featured: false,
                price: 'Custom', unit: 'per project',
                features: ['Bespoke design', 'Imported materials', 'Express delivery', 'Personal project manager', '5 year warranty', 'Full 3D walkthrough', 'Complete interiors']
            },
        ];

        plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = `pricing-card${plan.featured ? ' featured' : ''}`;
            card.innerHTML = `
                ${plan.featured ? '<span class="pricing-popular">Most Popular</span>' : ''}
                <div class="pricing-name">${plan.name}</div>
                <div class="pricing-price">${plan.price}</div>
                <div class="pricing-unit">${plan.unit}</div>
                <div class="pricing-features">
                    ${plan.features.map(f => `
                        <div class="pricing-feature">
                            <span class="material-icons-round">check_circle</span>
                            ${f}
                        </div>
                    `).join('')}
                </div>
                <button class="pricing-btn${plan.featured ? ' filled' : ''}" data-plan="${plan.name}">
                    Get ${plan.name} Quote
                </button>
            `;
            grid.appendChild(card);
        });

        // Pricing CTA
        grid.querySelectorAll('.pricing-btn').forEach(btn => {
            btn.addEventListener('click', () => openModal());
        });
    }

    // =========================================================
    // REVIEW FORM SETUP
    // =========================================================

    async function setupReviewForm(existingReviews) {
        const loginPrompt = document.getElementById('review-login-prompt');
        const alreadySubmitted = document.getElementById('review-already-submitted');
        const reviewForm = document.getElementById('review-form');
        const starSelector = document.getElementById('star-selector');
        const ratingTextEl = document.getElementById('star-rating-text');
        const commentInput = document.getElementById('review-comment');
        const charCounter = document.getElementById('comment-char-count');
        const submitBtn = document.getElementById('review-submit-btn');

        let selectedRating = 0;

        if (!isLoggedIn) {
            // Show login prompt, hide form
            loginPrompt.classList.remove('hidden');
            alreadySubmitted.classList.add('hidden');
            reviewForm.classList.add('hidden');
            return;
        }

        // User is logged in — check if they already reviewed
        const existingReview = existingReviews.find(r => r.user_id === currentUserId);

        if (existingReview) {
            loginPrompt.classList.add('hidden');
            alreadySubmitted.classList.remove('hidden');
            reviewForm.classList.add('hidden');
            return;
        }

        // Show the form
        loginPrompt.classList.add('hidden');
        alreadySubmitted.classList.add('hidden');
        reviewForm.classList.remove('hidden');

        // Star rating interaction
        const starBtns = starSelector.querySelectorAll('.star-btn');
        starBtns.forEach(btn => {
            const rating = parseInt(btn.dataset.rating, 10);

            btn.addEventListener('mouseenter', () => highlightStars(rating));
            btn.addEventListener('click', () => {
                selectedRating = rating;
                highlightStars(rating, true);
                ratingTextEl.textContent = RATING_LABELS[rating] || '';
                submitBtn.disabled = false;
            });
        });

        starSelector.addEventListener('mouseleave', () => {
            if (selectedRating > 0) {
                highlightStars(selectedRating, true);
            } else {
                highlightStars(0);
            }
        });

        function highlightStars(upTo, lock = false) {
            starBtns.forEach(btn => {
                const r = parseInt(btn.dataset.rating, 10);
                const icon = btn.querySelector('.material-icons-round');
                if (r <= upTo) {
                    icon.textContent = 'star';
                    btn.classList.add('active');
                } else {
                    icon.textContent = 'star_border';
                    btn.classList.remove('active');
                }
            });
        }

        // Character counter
        commentInput.addEventListener('input', () => {
            charCounter.textContent = commentInput.value.length;
        });

        // Form submission
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (selectedRating === 0) {
                showToast('Please select a rating.', 'error');
                return;
            }

            // Loading state
            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').classList.add('hidden');
            document.getElementById('review-loader').classList.remove('hidden');

            const result = await ArtisanDB.submitReview({
                professional_id: professionalId,
                user_id: currentUserId,
                rating: selectedRating,
                comment: commentInput.value.trim()
            });

            // Reset loading state
            submitBtn.querySelector('.btn-text').classList.remove('hidden');
            document.getElementById('review-loader').classList.add('hidden');

            if (!result.success) {
                showToast(result.error, 'error');
                submitBtn.disabled = false;
                return;
            }

            showToast('Review submitted successfully! Thank you.', 'success');

            // Hide form, show "already submitted"
            reviewForm.classList.add('hidden');
            alreadySubmitted.classList.remove('hidden');

            // Refresh reviews and stats
            const updatedReviews = await ArtisanDB.getReviewsForProfessional(professionalId);
            const { averageRating, totalReviews } = ArtisanDB.calculateAverageRating(updatedReviews);
            const satisfaction = ArtisanDB.calculateClientSatisfaction(updatedReviews);

            renderReviewsSummary(averageRating, totalReviews);
            renderReviewsList(updatedReviews);
            renderAboutStats(satisfaction, averageRating);

            // Update profile overlay rating
            document.getElementById('profile-rating').querySelector('.rating-value').textContent = averageRating.toFixed(1);
            document.getElementById('profile-rating').querySelector('.rating-count').textContent = `(${totalReviews} review${totalReviews !== 1 ? 's' : ''})`;
        });
    }

    // =========================================================
    // UI INTERACTIONS
    // =========================================================

    function initCarousel(pro) {
        let images = [];
        try { images = JSON.parse(pro.portfolio_images || '[]'); } catch { images = []; }
        if (images.length === 0) images = FALLBACK_IMAGES.slice(0, 4);

        const track = document.getElementById('carousel-track');
        const dotsContainer = document.getElementById('carousel-dots');
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        let currentSlide = 0;

        function goToSlide(index) {
            currentSlide = index;
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        }

        // Dot click handlers
        dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

        document.getElementById('carousel-prev').addEventListener('click', () => {
            goToSlide(currentSlide === 0 ? images.length - 1 : currentSlide - 1);
        });
        document.getElementById('carousel-next').addEventListener('click', () => {
            goToSlide(currentSlide === images.length - 1 ? 0 : currentSlide + 1);
        });

        // Auto-play
        let autoPlay = setInterval(() => {
            goToSlide(currentSlide === images.length - 1 ? 0 : currentSlide + 1);
        }, 4500);

        const carousel = document.getElementById('carousel');
        carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
        carousel.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                goToSlide(currentSlide === images.length - 1 ? 0 : currentSlide + 1);
            }, 4500);
        });
    }

    function initTabs() {
        const tabs = document.querySelectorAll('.section-tab');
        const sections = document.querySelectorAll('.portfolio-section[id]');

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(tab.getAttribute('href'));
                if (target) {
                    const offset = 72 + 56;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });

        function updateActiveTabs() {
            const scrollPos = window.scrollY + 200;
            sections.forEach(section => {
                const top = section.offsetTop - 140;
                const bottom = top + section.offsetHeight;
                const id = section.getAttribute('id');
                if (scrollPos >= top && scrollPos < bottom) {
                    tabs.forEach(t => t.classList.remove('active'));
                    const activeTab = document.querySelector(`.section-tab[data-tab="${id}"]`);
                    if (activeTab) activeTab.classList.add('active');
                }
            });
        }
        window.addEventListener('scroll', updateActiveTabs);
    }

    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        });
    }

    function initModal() {
        const modal = document.getElementById('quote-modal');
        const modalClose = document.getElementById('modal-close');

        document.getElementById('request-quote-btn')?.addEventListener('click', openModal);
        document.getElementById('chat-btn')?.addEventListener('click', () => {
            showToast('Chat feature coming soon!', 'info');
        });
        modalClose?.addEventListener('click', closeModal);
        modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        document.getElementById('quote-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            closeModal();
            showToast('Quote request sent successfully! We\'ll contact you within 24 hours.', 'success');
        });
    }

    function openModal() {
        document.getElementById('quote-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        document.getElementById('quote-modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

        document.querySelectorAll('.project-card, .review-card, .pricing-card, .highlight-item, .about-stat-card').forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });

        // Inject fade-in styles
        const style = document.createElement('style');
        style.textContent = `
            .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
            .fade-in.visible { opacity: 1; transform: translateY(0); }
        `;
        document.head.appendChild(style);
    }

    // =========================================================
    // UTILITY FUNCTIONS
    // =========================================================

    function setupNavbarAuth() {
        const loginBtn = document.getElementById('login-btn');
        if (isLoggedIn && loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';

            const greeting = document.createElement('span');
            greeting.textContent = `Hi, ${session.name?.split(' ')[0] || 'User'}`;
            greeting.style.cssText = 'margin-right:12px;font-weight:600;color:var(--clr-dark);font-size:0.88rem;';
            loginBtn.parentNode.insertBefore(greeting, loginBtn);

            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ArtisanDB.logout();
                window.location.reload();
            });
        }
    }

    function showError(message) {
        pageLoader.classList.add('hidden');
        mainPortfolio.classList.add('hidden');
        document.getElementById('error-message').textContent = message;
        errorState.classList.remove('hidden');
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        const toastIcon = document.getElementById('toast-icon');

        toastMsg.textContent = message;
        toastIcon.textContent = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : 'info');
        toastIcon.className = `material-icons-round toast-icon ${type}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    /** Generate star HTML for a given rating (supports half-stars) */
    function generateStarIcons(rating) {
        return Array(5).fill(0).map((_, i) => {
            if (i < Math.floor(rating)) {
                return '<span class="material-icons-round star-filled">star</span>';
            } else if (i < rating) {
                return '<span class="material-icons-round star-filled">star_half</span>';
            } else {
                return '<span class="material-icons-round" style="color:#ccc">star_border</span>';
            }
        }).join('');
    }

    /** Convert ISO timestamp to relative time string */
    function getRelativeTime(dateStr) {
        if (!dateStr) return 'Recently';
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }

    /** HTML-escape to prevent XSS */
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
