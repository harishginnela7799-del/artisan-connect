/* ================================================
   ArtisanConnect - Interactive JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ========== AUTH STATE MANAGEMENT ==========
    if (typeof ArtisanDB !== 'undefined') {
        const session = ArtisanDB.getSession();
        if (session && session.loggedIn) {
            const loginBtn = document.getElementById('login-btn');
            const mobileLoginBtn = document.querySelector('.login-mobile');
            
            // Add Greeting + Convert Login buttons to Logout
            if (loginBtn) {
                loginBtn.textContent = 'Logout';
                loginBtn.href = '#';
                
                // Add Name Greeting before the logout button
                const greeting = document.createElement('span');
                greeting.textContent = `Hi, ${session.name.split(' ')[0]}`;
                greeting.style.marginRight = '12px';
                greeting.style.fontWeight = '600';
                greeting.style.color = 'var(--clr-dark)';
                loginBtn.parentNode.insertBefore(greeting, loginBtn);

                loginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    ArtisanDB.logout();
                    window.location.reload();
                });
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.textContent = 'Logout';
                mobileLoginBtn.href = '#';
                
                // Add Name Greeting for mobile
                const mGreeting = document.createElement('li');
                mGreeting.innerHTML = `<span class="mobile-nav-link" style="color:var(--clr-accent)">Hi, ${session.name}</span>`;
                mobileLoginBtn.parentNode.parentNode.insertBefore(mGreeting, mobileLoginBtn.parentNode);

                mobileLoginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    ArtisanDB.logout();
                    window.location.reload();
                });
            }

            // Optional: change Register button if they are a pro
            if (session.role === 'professional') {
                const regBtnDesktop = document.getElementById('nav-register');
                const regBtnMobile = document.querySelector('a[href="#register"]');
                if(regBtnDesktop) { regBtnDesktop.textContent = 'My Portfolio'; regBtnDesktop.href = 'portfolio.html'; }
                if(regBtnMobile)  { regBtnMobile.textContent = 'My Portfolio'; regBtnMobile.href = 'portfolio.html'; }
            }
        }
    }

    // ========== RENDER BUILDERS FROM DATABASE ==========
    async function renderBuilders() {
        const grid = document.getElementById('builders-grid');
        if (!grid) return;
        
        let providers = [];
        if (typeof ArtisanDB !== 'undefined') {
            providers = await ArtisanDB.getApprovedProviders();
        }
        
        if (providers.length === 0) {
            grid.innerHTML = '<p style="text-align:center; padding: 40px; color:#999; grid-column: 1/-1;">No professionals found. Add some from the admin dashboard.</p>';
            return;
        }

        const imagesFallback = ['images/bedroom.png', 'images/kitchen.png', 'images/study.png', 'images/fireplace.png'];

        grid.innerHTML = providers.map((p, index) => {
            const delay = index * 0.1;
            const safeType = p.type || 'builder';
            return `
            <div class="builder-card visible fade-in" id="card-${p.id}" data-city="${p.city.toLowerCase()}" data-profession="${safeType}" style="animation-delay: ${delay}s">
                <div class="card-banner">
                    <img src="${p.img || 'images/living_room.png'}" alt="${p.name} project" class="banner-img">
                    <div class="card-rating">
                        <span class="material-icons-round star">star</span>
                        <span>${(p.rating || 4.5).toFixed(1)}</span>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${p.name}</h3>
                    <p class="card-location">
                        <span class="material-icons-round loc-icon">location_on</span>
                        ${p.city}
                    </p>
                    <div class="card-gallery">
                        ${imagesFallback.map(img => `<img src="${img}" alt="Gallery image" class="gallery-thumb">`).join('')}
                    </div>
                    <a href="portfolio.html?id=${p.id}" class="btn-portfolio">View Portfolio</a>
                </div>
            </div>
            `;
        }).join('');
        
        // Re-run filters to account for current selection
        filterCards();
    }
    renderBuilders();

    // ========== NAVBAR SCROLL EFFECTS ==========
    const navbar = document.getElementById('navbar');
    const filtersSection = document.querySelector('.filters-section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Sticky filter shadow
        if (filtersSection) {
            const rect = filtersSection.getBoundingClientRect();
            if (rect.top <= 72) {
                filtersSection.classList.add('stuck');
            } else {
                filtersSection.classList.remove('stuck');
            }
        }
    });

    // ========== HAMBURGER MENU ==========
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ========== CITY FILTER CHIPS ==========
    const cityFilters = document.getElementById('city-filters');
    if (cityFilters) {
        cityFilters.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;

            // Update active state
            cityFilters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            filterCards();
        });
    }

    // ========== PROFESSION FILTER CHIPS ==========
    const professionFilters = document.getElementById('profession-filters');
    if (professionFilters) {
        professionFilters.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;

            // Update active state
            professionFilters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            filterCards();
        });
    }

    // ========== CARD FILTERING ==========
    function filterCards() {
        const activeCity = document.querySelector('#city-filters .chip.active')?.dataset.city || 'all';
        const activeProfession = document.querySelector('#profession-filters .chip.active')?.dataset.profession || 'builder';
        const searchQuery = document.getElementById('hero-search-input')?.value.toLowerCase().trim() || '';
        const cards = document.querySelectorAll('.builder-card');

        cards.forEach((card, index) => {
            const cardCity = card.dataset.city || '';
            const cardProfession = card.dataset.profession || '';
            const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            
            const cityMatch = activeCity === 'all' || cardCity === activeCity.toLowerCase();
            const professionMatch = cardProfession === activeProfession;
            
            const searchMatch = !searchQuery || 
                                cardTitle.includes(searchQuery) || 
                                cardCity.includes(searchQuery) || 
                                cardProfession.includes(searchQuery);

            if (cityMatch && professionMatch && searchMatch) {
                card.style.display = '';
                card.style.animationDelay = `${index * 0.1}s`;
                card.style.animation = 'none';
                // Trigger reflow
                card.offsetHeight;
                card.style.animation = '';
            } else {
                card.style.display = 'none';
            }
        });

        // Check if any cards are visible
        const visibleCards = document.querySelectorAll('.builder-card:not([style*="display: none"])');
        const grid = document.getElementById('builders-grid');

        // Remove "no results" message if it exists
        const existing = grid.querySelector('.no-results');
        if (existing) existing.remove();

        if (visibleCards.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 24px;
                    color: #999;
                ">
                    <span class="material-icons-round" style="font-size: 48px; color: #ddd; margin-bottom: 16px; display: block;">search_off</span>
                    <p style="font-size: 1.1rem; font-weight: 600; color: #666;">No professionals found</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;">Try adjusting your filters to find more results.</p>
                </div>
            `;
            grid.appendChild(noResults);
        }
    }

    // ========== SEARCH EVENT LISTENERS ==========
    const searchInput = document.getElementById('hero-search-input');
    const searchBtn = document.getElementById('hero-search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterCards();
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
                filterCards();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
            filterCards();
        });
    }

    const navSearchBtn = document.getElementById('search-btn');
    if (navSearchBtn) {
        navSearchBtn.addEventListener('click', () => {
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => document.getElementById('hero-search-input')?.focus(), 500);
        });
    }

    // ========== STAT COUNTER ANIMATION ==========
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;

        const statsSection = document.getElementById('stats');
        if (!statsSection) return;

        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            statsAnimated = true;

            statNumbers.forEach(stat => {
                const target = parseFloat(stat.dataset.target);
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const startTime = performance.now();

                function updateStat(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = eased * target;

                    if (isDecimal) {
                        stat.textContent = current.toFixed(1);
                    } else {
                        stat.textContent = Math.floor(current);
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateStat);
                    }
                }

                requestAnimationFrame(updateStat);
            });
        }
    }

    window.addEventListener('scroll', animateStats);
    animateStats(); // Check on load too

    // ========== SCROLL REVEAL (Intersection Observer) ==========
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const fadeElements = document.querySelectorAll(
        '.builder-card, .step-card, .inspiration-item, .cta-content'
    );

    fadeElements.forEach(el => {
        el.classList.add('fade-in');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 72 + 80; // navbar + filter bar height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ========== ACTIVE NAV LINK HIGHLIGHT ==========
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${id}`) {
                    if (scrollPos >= top && scrollPos < bottom) {
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            });
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // ========== SEARCH FUNCTIONALITY ==========
    const heroSearchInput = document.getElementById('hero-search-input');
    const heroSearchBtn = document.getElementById('hero-search-btn');

    function performSearch() {
        const query = heroSearchInput?.value.toLowerCase().trim();
        if (!query) return;

        // Scroll to builders section
        const browseSection = document.getElementById('browse');
        if (browseSection) {
            const offset = 72;
            const top = browseSection.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }

        // Reset filters
        const cityChips = document.querySelectorAll('#city-filters .chip');
        cityChips.forEach(c => c.classList.remove('active'));
        const allCitiesChip = document.querySelector('#city-filters .chip[data-city="all"]');
        if (allCitiesChip) allCitiesChip.classList.add('active');

        // Search through cards
        const cards = document.querySelectorAll('.builder-card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const location = card.querySelector('.card-location')?.textContent.toLowerCase() || '';

            if (title.includes(query) || location.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', performSearch);
    }

    if (heroSearchInput) {
        heroSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // ========== GALLERY THUMB LIGHTBOX EFFECT ==========
    document.querySelectorAll('.gallery-thumb:not(.gallery-more)').forEach(thumb => {
        thumb.addEventListener('click', () => {
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.85);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                animation: lbFadeIn 0.3s ease;
            `;

            const img = document.createElement('img');
            img.src = thumb.src;
            img.alt = thumb.alt;
            img.style.cssText = `
                max-width: 85vw;
                max-height: 85vh;
                border-radius: 12px;
                box-shadow: 0 16px 64px rgba(0,0,0,0.5);
                animation: lbZoomIn 0.3s ease;
            `;

            lightbox.appendChild(img);
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';

            lightbox.addEventListener('click', () => {
                lightbox.style.animation = 'lbFadeOut 0.2s ease forwards';
                setTimeout(() => {
                    lightbox.remove();
                    document.body.style.overflow = '';
                }, 200);
            });
        });
    });

    // Add lightbox animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lbFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes lbZoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(style);

    // ========== PARALLAX EFFECT ON HERO ==========
    const heroBg = document.querySelector('.hero-bg-img');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            if (scrollPos < 800) {
                heroBg.style.transform = `scale(${1 + scrollPos * 0.0001}) translateY(${scrollPos * 0.3}px)`;
            }
        });
    }
});
