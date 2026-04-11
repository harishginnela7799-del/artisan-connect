/* ================================================
   ArtisanConnect - Portfolio Page JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ========== BUILDER DATA ==========
    const builders = {
        rajput: {
            name: 'Rajput & Sons Builders',
            rating: 4.9,
            reviews: 128,
            experience: 8,
            projects: 150,
            location: 'Karimnagar',
            profession: 'Builder',
            about: 'With over 8 years of experience in residential and commercial construction, Rajput & Sons Builders brings vision to life with precision and passion. Our team specializes in modern, sustainable designs that blend Indian architectural heritage with contemporary aesthetics. Every project is treated as a masterpiece — from concept to completion. We pride ourselves on transparent pricing, on-time delivery, and building relationships that last beyond the project.',
            coverImages: ['images/living_room.png', 'images/bedroom.png', 'images/kitchen.png', 'images/study.png'],
            projectsList: [
                { title: 'Modern Villa - Karimnagar', image: 'images/living_room.png', budget: '₹45 Lakhs', duration: '8 Months', type: 'Residential' },
                { title: 'Luxury Apartment Interiors', image: 'images/bedroom.png', budget: '₹12 Lakhs', duration: '3 Months', type: 'Interior' },
                { title: 'Contemporary Kitchen Design', image: 'images/kitchen.png', budget: '₹6 Lakhs', duration: '6 Weeks', type: 'Renovation' },
                { title: 'Heritage Study Room', image: 'images/study.png', budget: '₹4 Lakhs', duration: '4 Weeks', type: 'Interior' },
                { title: 'Cozy Fireplace Lounge', image: 'images/fireplace.png', budget: '₹8 Lakhs', duration: '5 Weeks', type: 'Interior' },
                { title: 'Modern Office Space', image: 'images/office.png', budget: '₹18 Lakhs', duration: '4 Months', type: 'Commercial' },
            ],
            reviewsList: [
                { name: 'Arun Sharma', project: 'Villa Construction', rating: 5, text: 'Exceptional work! Rajput & Sons delivered our dream villa on time and within budget. The attention to detail was remarkable. Every corner of our home reflects quality craftsmanship. Would highly recommend to anyone looking for reliable builders.', date: '2 weeks ago', color: '#e8772e' },
                { name: 'Priya Reddy', project: 'Kitchen Renovation', rating: 5, text: 'Transformed our old kitchen into a modern masterpiece. The team was professional, clean, and incredibly talented. They suggested design improvements that we hadn\'t even thought of. Truly a five-star experience!', date: '1 month ago', color: '#5cb85c' },
                { name: 'Vikram Patel', project: 'Office Interiors', rating: 4, text: 'Great team to work with. They completed our office renovation ahead of schedule. The quality of materials used was top-notch. Minor communication delays but overall very satisfied with the outcome.', date: '2 months ago', color: '#4285F4' },
                { name: 'Meena Devi', project: 'Home Extension', rating: 5, text: 'We hired Rajput & Sons for a home extension project and couldn\'t be happier. They handled all permits and approvals, making the process stress-free. The new space is beautiful and exactly what we wanted.', date: '3 months ago', color: '#9c27b0' },
            ],
            pricing: {
                basic: { price: '800', unit: 'per sq ft', features: ['Basic floor plan', 'Standard materials', 'Regular timeline', 'Email support', 'Basic warranty (1 year)'] },
                premium: { price: '1,400', unit: 'per sq ft', features: ['Custom floor plan', 'Premium materials', 'Priority timeline', '24/7 dedicated support', 'Extended warranty (5 years)', '3D visualization', 'Interior consultation'] },
                luxury: { price: '2,200', unit: 'per sq ft', features: ['Bespoke design', 'Imported materials', 'Fast-track delivery', 'Personal project manager', 'Lifetime structural warranty', 'Full 3D walkthrough', 'Complete interior design', 'Smart home integration'] },
            },
            satisfaction: 98,
            onTime: 95,
        },
        indore: {
            name: 'Indore Space Crafts',
            rating: 4.8,
            reviews: 96,
            experience: 6,
            projects: 110,
            location: 'Warangal',
            profession: 'Builder',
            about: 'Indore Space Crafts is a premier construction firm specializing in innovative space utilization and modern design. With 6 years of dedicated service, we have completed over 110 projects ranging from compact urban homes to spacious commercial complexes. Our team combines engineering excellence with creative design to deliver spaces that inspire.',
            coverImages: ['images/kitchen.png', 'images/bathroom.png', 'images/dining.png', 'images/modern.png'],
            projectsList: [
                { title: 'Modern Kitchen Suite', image: 'images/kitchen.png', budget: '₹8 Lakhs', duration: '6 Weeks', type: 'Kitchen' },
                { title: 'Spa-Inspired Bathroom', image: 'images/bathroom.png', budget: '₹5 Lakhs', duration: '4 Weeks', type: 'Bathroom' },
                { title: 'Elegant Dining Hall', image: 'images/dining.png', budget: '₹10 Lakhs', duration: '8 Weeks', type: 'Interior' },
                { title: 'Contemporary Living Space', image: 'images/modern.png', budget: '₹15 Lakhs', duration: '3 Months', type: 'Residential' },
                { title: 'Executive Office', image: 'images/office.png', budget: '₹22 Lakhs', duration: '4 Months', type: 'Commercial' },
                { title: 'Luxury Bedroom Design', image: 'images/bedroom.png', budget: '₹7 Lakhs', duration: '5 Weeks', type: 'Interior' },
            ],
            reviewsList: [
                { name: 'Suresh Kumar', project: 'Home Construction', rating: 5, text: 'Outstanding quality of work. The team was very professional and kept us informed throughout the project. Our home turned out even better than we imagined. Truly grateful for their dedication.', date: '1 week ago', color: '#e8772e' },
                { name: 'Lakshmi Rao', project: 'Bathroom Renovation', rating: 5, text: 'The bathroom transformation was incredible. From a cramped old space to a spa-like retreat. The tile work and fixtures are premium quality. Very impressed with their creative solutions.', date: '3 weeks ago', color: '#5cb85c' },
                { name: 'Ravi Teja', project: 'Commercial Space', rating: 4, text: 'Good work on our commercial project. Met all specifications and delivered on time. The cost was reasonable for the quality we received. Would use again.', date: '2 months ago', color: '#4285F4' },
            ],
            pricing: {
                basic: { price: '750', unit: 'per sq ft', features: ['Standard design', 'Quality materials', 'Regular timeline', 'Email support', '1 year warranty'] },
                premium: { price: '1,300', unit: 'per sq ft', features: ['Custom design', 'Premium materials', 'Priority timeline', 'Dedicated support', '3 year warranty', '3D preview', 'Design consultation'] },
                luxury: { price: '2,000', unit: 'per sq ft', features: ['Bespoke design', 'Imported materials', 'Express delivery', 'Project manager', '5 year warranty', 'Full 3D walkthrough', 'Complete interiors', 'Home automation'] },
            },
            satisfaction: 96,
            onTime: 93,
        },
        awadh: {
            name: 'Awadh Interiors',
            rating: 5.0,
            reviews: 84,
            experience: 10,
            projects: 200,
            location: 'Sircilla',
            profession: 'Interior Designer',
            about: 'Awadh Interiors brings a decade of interior design mastery to every project. We specialize in creating spaces that tell stories — blending traditional Awadhi craftsmanship with modern sensibilities. With 200+ completed projects, our portfolio spans luxury residences, boutique hotels, and premium commercial spaces. Every design is a unique expression of our client\'s personality and lifestyle.',
            coverImages: ['images/fireplace.png', 'images/living_room.png', 'images/bedroom.png', 'images/study.png'],
            projectsList: [
                { title: 'Royal Fireplace Lounge', image: 'images/fireplace.png', budget: '₹12 Lakhs', duration: '8 Weeks', type: 'Luxury' },
                { title: 'Minimalist Living Room', image: 'images/living_room.png', budget: '₹9 Lakhs', duration: '6 Weeks', type: 'Interior' },
                { title: 'Master Bedroom Suite', image: 'images/bedroom.png', budget: '₹7 Lakhs', duration: '5 Weeks', type: 'Interior' },
                { title: 'Heritage Study Room', image: 'images/study.png', budget: '₹5 Lakhs', duration: '3 Weeks', type: 'Interior' },
                { title: 'Gourmet Kitchen', image: 'images/kitchen.png', budget: '₹8 Lakhs', duration: '6 Weeks', type: 'Kitchen' },
                { title: 'Modern Dining Space', image: 'images/dining.png', budget: '₹6 Lakhs', duration: '4 Weeks', type: 'Interior' },
            ],
            reviewsList: [
                { name: 'Anjali Mishra', project: 'Complete Home Interior', rating: 5, text: 'Awadh Interiors transformed our entire home into a palace. The attention to detail, the use of colors, and the craftsmanship are beyond compare. They truly understand the art of interior design. A perfect 5-star experience!', date: '5 days ago', color: '#9c27b0' },
                { name: 'Deepak Singh', project: 'Living Room Design', rating: 5, text: 'Absolutely stunning work. The living room is now the highlight of our home. Every guest compliments the design. The team was a pleasure to work with — creative, punctual, and very professional.', date: '2 weeks ago', color: '#e8772e' },
                { name: 'Kavitha Nair', project: 'Bedroom Makeover', rating: 5, text: 'Our bedroom went from ordinary to extraordinary. The color scheme, lighting design, and furniture selection were all perfect. Awadh Interiors is the gold standard for interior design.', date: '1 month ago', color: '#5cb85c' },
                { name: 'Rohit Gupta', project: 'Office Design', rating: 5, text: 'We hired them for our startup office and the result exceeded all expectations. The space is now vibrant, functional, and inspiring. Our team loves working here. Highly recommend!', date: '6 weeks ago', color: '#4285F4' },
            ],
            pricing: {
                basic: { price: '600', unit: 'per sq ft', features: ['Standard design', 'Local materials', 'Regular timeline', 'Email support', '1 year warranty'] },
                premium: { price: '1,100', unit: 'per sq ft', features: ['Custom design', 'Premium materials', 'Priority timeline', 'Dedicated designer', '3 year warranty', 'Mood boards', 'Material sourcing'] },
                luxury: { price: '1,800', unit: 'per sq ft', features: ['Bespoke luxury design', 'Imported materials', 'Express delivery', 'Personal designer', 'Lifetime warranty', '3D visualization', 'Full furnishing', 'Art curation'] },
            },
            satisfaction: 100,
            onTime: 97,
        },
        sharma: {
            name: 'Sharma Design Studio',
            rating: 4.7,
            reviews: 72,
            experience: 5,
            projects: 85,
            location: 'Hyderabad, TS',
            profession: 'Interior Designer',
            about: 'Sharma Design Studio brings contemporary design thinking to traditional Indian spaces. Our 5 years in the industry have been marked by innovation and client satisfaction. We specialize in creating functional, beautiful interiors that maximize space and light. Our designs are sustainable, stylish, and built to stand the test of time.',
            coverImages: ['images/modern.png', 'images/dining.png', 'images/office.png', 'images/bathroom.png'],
            projectsList: [
                { title: 'Modern Loft Home', image: 'images/modern.png', budget: '₹20 Lakhs', duration: '4 Months', type: 'Residential' },
                { title: 'Contemporary Dining', image: 'images/dining.png', budget: '₹6 Lakhs', duration: '5 Weeks', type: 'Interior' },
                { title: 'Corporate Office Space', image: 'images/office.png', budget: '₹25 Lakhs', duration: '5 Months', type: 'Commercial' },
                { title: 'Luxury Bathroom Design', image: 'images/bathroom.png', budget: '₹4 Lakhs', duration: '3 Weeks', type: 'Bathroom' },
                { title: 'Cozy Living Room', image: 'images/living_room.png', budget: '₹8 Lakhs', duration: '6 Weeks', type: 'Interior' },
                { title: 'Smart Kitchen', image: 'images/kitchen.png', budget: '₹7 Lakhs', duration: '5 Weeks', type: 'Kitchen' },
            ],
            reviewsList: [
                { name: 'Sanjay Reddy', project: 'Apartment Interior', rating: 5, text: 'Sharma Design Studio did a fantastic job with our apartment. The modern design choices were perfect for our lifestyle. Great communication throughout the project. Very happy with the result.', date: '1 week ago', color: '#e8772e' },
                { name: 'Pooja Rani', project: 'Office Design', rating: 4, text: 'Good work on our office renovation. The space feels more open and professional. A few minor delays but the final outcome was worth the wait. Would recommend.', date: '3 weeks ago', color: '#5cb85c' },
                { name: 'Harsh Vardhan', project: 'Kitchen Redesign', rating: 5, text: 'Brilliant kitchen redesign! The storage solutions and countertop choices were spot on. Our kitchen is now the most beautiful room in the house. Thank you, Sharma Design Studio!', date: '2 months ago', color: '#4285F4' },
            ],
            pricing: {
                basic: { price: '550', unit: 'per sq ft', features: ['Standard design', 'Quality materials', 'Regular timeline', 'Email support', '1 year warranty'] },
                premium: { price: '1,000', unit: 'per sq ft', features: ['Custom design', 'Premium materials', 'Priority timeline', 'Dedicated support', '2 year warranty', 'Mood boards', 'Design consultation'] },
                luxury: { price: '1,600', unit: 'per sq ft', features: ['Bespoke design', 'Premium imported materials', 'Express delivery', 'Personal designer', '5 year warranty', '3D walkthrough', 'Full furnishing', 'Lighting design'] },
            },
            satisfaction: 94,
            onTime: 91,
        },
        heritage: {
            name: 'Heritage Architects',
            rating: 4.6,
            reviews: 56,
            experience: 12,
            projects: 180,
            location: 'Karimnagar',
            profession: 'Architect',
            about: 'Heritage Architects is a design-led architectural practice with 12 years of experience in creating iconic structures. We blend traditional Indian architectural elements with cutting-edge modern design. Our portfolio includes residential masterpieces, commercial landmarks, and heritage restoration projects. We believe architecture should inspire, protect, and endure.',
            coverImages: ['images/study.png', 'images/fireplace.png', 'images/living_room.png', 'images/modern.png'],
            projectsList: [
                { title: 'Heritage Library Design', image: 'images/study.png', budget: '₹35 Lakhs', duration: '6 Months', type: 'Institutional' },
                { title: 'Classic Fireplace Room', image: 'images/fireplace.png', budget: '₹10 Lakhs', duration: '8 Weeks', type: 'Residential' },
                { title: 'Grand Living Hall', image: 'images/living_room.png', budget: '₹28 Lakhs', duration: '5 Months', type: 'Residential' },
                { title: 'Modern Heritage Fusion', image: 'images/modern.png', budget: '₹42 Lakhs', duration: '8 Months', type: 'Commercial' },
                { title: 'Elegant Bedroom Suite', image: 'images/bedroom.png', budget: '₹8 Lakhs', duration: '6 Weeks', type: 'Interior' },
                { title: 'Courtyard Kitchen', image: 'images/kitchen.png', budget: '₹12 Lakhs', duration: '10 Weeks', type: 'Residential' },
            ],
            reviewsList: [
                { name: 'DR. Raman Kumar', project: 'Residential Villa', rating: 5, text: 'Heritage Architects designed our dream villa and it\'s absolutely breathtaking. The blend of traditional and modern elements is masterful. They truly understand the art of architecture. A world-class team.', date: '2 weeks ago', color: '#9c27b0' },
                { name: 'Sita Lakshmi', project: 'Heritage Restoration', rating: 4, text: 'They restored our 80-year-old family home beautifully while preserving its character. Some timeline extensions but the quality is undeniable. Very specialized knowledge of heritage structures.', date: '1 month ago', color: '#e8772e' },
                { name: 'Kiran Rao', project: 'Commercial Complex', rating: 5, text: 'Designed a stunning commercial complex for us. The building has become a landmark in the area. Their architectural vision is truly remarkable. Exceeded our expectations completely.', date: '3 months ago', color: '#5cb85c' },
            ],
            pricing: {
                basic: { price: '50', unit: 'per sq ft (design)', features: ['Basic architectural plan', '2D drawings', 'Standard consultation', 'Email support', 'Government approvals assistance'] },
                premium: { price: '90', unit: 'per sq ft (design)', features: ['Detailed architectural plan', '3D modeling', 'Interior layout', 'Dedicated architect', 'Full approval handling', 'Site visits (monthly)', 'Structural design'] },
                luxury: { price: '150', unit: 'per sq ft (design)', features: ['Bespoke architectural design', 'Full 3D visualization', 'Interior + landscape design', 'Personal architect', 'Complete project management', 'Weekly site visits', 'MEP design', 'Vastu compliance'] },
            },
            satisfaction: 92,
            onTime: 88,
        },
        elite: {
            name: 'Elite Paints & Finishes',
            rating: 4.9,
            reviews: 142,
            experience: 7,
            projects: 320,
            location: 'Warangal',
            profession: 'Painter',
            about: 'Elite Paints & Finishes is the leading painting and finishing service in the region. With 7 years of experience and 320+ projects, we specialize in everything from residential painting to commercial-grade finishes, texture work, and decorative art. Our team of skilled painters uses only premium, eco-friendly paints to deliver flawless results every time.',
            coverImages: ['images/dining.png', 'images/bedroom.png', 'images/bathroom.png', 'images/office.png'],
            projectsList: [
                { title: 'Artistic Dining Room Finish', image: 'images/dining.png', budget: '₹1.5 Lakhs', duration: '1 Week', type: 'Painting' },
                { title: 'Premium Bedroom Painting', image: 'images/bedroom.png', budget: '₹80,000', duration: '5 Days', type: 'Painting' },
                { title: 'Waterproof Bathroom Finish', image: 'images/bathroom.png', budget: '₹60,000', duration: '3 Days', type: 'Waterproofing' },
                { title: 'Office Wall Texturing', image: 'images/office.png', budget: '₹2.5 Lakhs', duration: '2 Weeks', type: 'Texture' },
                { title: 'Custom Kitchen Finishes', image: 'images/kitchen.png', budget: '₹90,000', duration: '4 Days', type: 'Painting' },
                { title: 'Exterior Home Painting', image: 'images/modern.png', budget: '₹3.5 Lakhs', duration: '3 Weeks', type: 'Exterior' },
            ],
            reviewsList: [
                { name: 'Naresh Yadav', project: 'Full Home Painting', rating: 5, text: 'Elite Paints did an incredible job painting our entire home. The finish is smooth, even, and beautiful. They were very neat — no mess, no drips. The colors look exactly as we wanted. Best painters in Warangal!', date: '3 days ago', color: '#e8772e' },
                { name: 'Sunita Devi', project: 'Texture Wall Art', rating: 5, text: 'The texture work on our living room wall is stunning. It\'s become the focal point of the entire room. Their artistic ability is exceptional. Highly recommended for decorative painting!', date: '2 weeks ago', color: '#9c27b0' },
                { name: 'Ramesh Goud', project: 'Office Painting', rating: 5, text: 'Professional, fast, and high-quality work. They completed our entire office in record time with zero disruption. The color consultation was very helpful. Best in the business!', date: '1 month ago', color: '#5cb85c' },
                { name: 'Lavanya', project: 'Exterior Painting', rating: 4, text: 'Great exterior work on our home. The weather-resistant paint they used looks fantastic. Minor touch-ups needed after rain but they came back and fixed everything promptly.', date: '2 months ago', color: '#4285F4' },
            ],
            pricing: {
                basic: { price: '18', unit: 'per sq ft', features: ['Standard paint (2 coats)', 'Basic color selection', 'Surface preparation', 'Clean-up included', '6 months warranty'] },
                premium: { price: '32', unit: 'per sq ft', features: ['Premium paint (3 coats)', 'Unlimited colors', 'Wall repair & prep', 'Texture options', '2 year warranty', 'Color consultation', 'Primer coat'] },
                luxury: { price: '55', unit: 'per sq ft', features: ['Imported premium paint', 'Custom color mixing', 'Complete wall treatment', 'Designer textures & art', '5 year warranty', 'Personal color advisor', 'Waterproofing', 'Anti-fungal treatment'] },
            },
            satisfaction: 99,
            onTime: 97,
        },
    };

    // ========== GET BUILDER ID FROM URL ==========
    const params = new URLSearchParams(window.location.search);
    const builderId = params.get('id') || 'rajput';
    const data = builders[builderId] || builders.rajput;

    // ========== POPULATE PAGE ==========
    document.title = `${data.name} - ArtisanConnect`;

    // Profile Info
    document.getElementById('profile-name').textContent = data.name;
    document.getElementById('profile-rating').querySelector('.rating-value').textContent = data.rating;
    document.getElementById('profile-rating').querySelector('.rating-count').textContent = `(${data.reviews} reviews)`;
    document.getElementById('profile-meta').innerHTML = `
        <span class="meta-chip">
            <span class="material-icons-round">work_history</span>
            ${data.experience} Years Experience
        </span>
        <span class="meta-divider">|</span>
        <span class="meta-chip">
            <span class="material-icons-round">architecture</span>
            ${data.projects} Projects
        </span>
    `;

    // About
    document.getElementById('about-text').textContent = data.about;

    // Update stat circles
    const statCircles = document.querySelectorAll('.stat-progress');
    if (statCircles[0]) statCircles[0].style.setProperty('--progress', data.satisfaction);
    if (statCircles[1]) statCircles[1].style.setProperty('--progress', data.onTime);
    document.querySelectorAll('.stat-circle-value')[0].textContent = data.satisfaction + '%';
    document.querySelectorAll('.stat-circle-value')[1].textContent = data.onTime + '%';

    // Review summary
    document.getElementById('review-avg').textContent = data.rating;
    document.querySelector('.review-count').textContent = `Based on ${data.reviews} reviews`;

    // ========== CAROUSEL ==========
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    let currentSlide = 0;

    data.coverImages.forEach((imgSrc, i) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `<img src="${imgSrc}" alt="${data.name} project ${i + 1}">`;
        track.appendChild(slide);

        const dot = document.createElement('button');
        dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    document.getElementById('carousel-prev').addEventListener('click', () => {
        goToSlide(currentSlide === 0 ? data.coverImages.length - 1 : currentSlide - 1);
    });
    document.getElementById('carousel-next').addEventListener('click', () => {
        goToSlide(currentSlide === data.coverImages.length - 1 ? 0 : currentSlide + 1);
    });

    // Auto-play carousel
    let autoPlay = setInterval(() => {
        goToSlide(currentSlide === data.coverImages.length - 1 ? 0 : currentSlide + 1);
    }, 4500);

    // Pause on hover
    document.getElementById('carousel').addEventListener('mouseenter', () => clearInterval(autoPlay));
    document.getElementById('carousel').addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => {
            goToSlide(currentSlide === data.coverImages.length - 1 ? 0 : currentSlide + 1);
        }, 4500);
    });

    // ========== PROJECTS ==========
    const projectsGrid = document.getElementById('projects-grid');
    data.projectsList.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-img-wrap">
                <img src="${project.image}" alt="${project.title}">
                <span class="project-badge">${project.type}</span>
            </div>
            <div class="project-body">
                <h3 class="project-title">${project.title}</h3>
                <div class="project-details">
                    <div class="project-detail">
                        <span class="material-icons-round">payments</span>
                        <div>
                            <div class="project-detail-label">Budget</div>
                            <div class="project-detail-value">${project.budget}</div>
                        </div>
                    </div>
                    <div class="project-detail">
                        <span class="material-icons-round">schedule</span>
                        <div>
                            <div class="project-detail-label">Duration</div>
                            <div class="project-detail-value">${project.duration}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        projectsGrid.appendChild(card);
    });

    // ========== REVIEWS ==========
    const reviewsList = document.getElementById('reviews-list');
    data.reviewsList.forEach(review => {
        const initials = review.name.split(' ').map(n => n[0]).join('');
        const stars = Array(5).fill(0).map((_, i) =>
            `<span class="material-icons-round">${i < review.rating ? 'star' : 'star_border'}</span>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar" style="background: ${review.color}">${initials}</div>
                    <div>
                        <div class="reviewer-name">${review.name}</div>
                        <div class="reviewer-project">${review.project}</div>
                    </div>
                </div>
                <span class="review-date">${review.date}</span>
            </div>
            <div class="review-stars-small">${stars}</div>
            <p class="review-text">"${review.text}"</p>
        `;
        reviewsList.appendChild(card);
    });

    // ========== PRICING ==========
    const pricingGrid = document.getElementById('pricing-grid');
    const plans = [
        { key: 'basic', name: 'Basic', featured: false },
        { key: 'premium', name: 'Premium', featured: true },
        { key: 'luxury', name: 'Luxury', featured: false },
    ];

    plans.forEach(plan => {
        const p = data.pricing[plan.key];
        const card = document.createElement('div');
        card.className = `pricing-card${plan.featured ? ' featured' : ''}`;
        card.innerHTML = `
            ${plan.featured ? '<span class="pricing-popular">Most Popular</span>' : ''}
            <div class="pricing-name">${plan.name}</div>
            <div class="pricing-price"><span class="currency">₹</span>${p.price}</div>
            <div class="pricing-unit">${p.unit}</div>
            <div class="pricing-features">
                ${p.features.map(f => `
                    <div class="pricing-feature">
                        <span class="material-icons-round">check_circle</span>
                        ${f}
                    </div>
                `).join('')}
            </div>
            <button class="pricing-btn${plan.featured ? ' filled' : ''}" data-plan="${plan.name}">
                Choose ${plan.name}
            </button>
        `;
        pricingGrid.appendChild(card);
    });

    // Pricing CTA
    pricingGrid.querySelectorAll('.pricing-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openModal();
        });
    });

    // ========== NAVBAR SCROLL ==========
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    // ========== SECTION TABS ==========
    const tabs = document.querySelectorAll('.section-tab');
    const sections = document.querySelectorAll('.portfolio-section[id]');

    // Smooth scroll for tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(tab.getAttribute('href'));
            if (target) {
                const offset = 72 + 56; // navbar + tabs height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Active tab on scroll
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

    // ========== MODAL ==========
    const modal = document.getElementById('quote-modal');
    const modalClose = document.getElementById('modal-close');

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.getElementById('request-quote-btn').addEventListener('click', openModal);
    document.getElementById('chat-btn').addEventListener('click', () => {
        showToast('Chat feature coming soon!', 'info');
    });
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Quote form
    document.getElementById('quote-form').addEventListener('submit', (e) => {
        e.preventDefault();
        closeModal();
        showToast('Quote request sent successfully! We\'ll contact you within 24 hours.', 'success');
    });

    // ========== TOAST ==========
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        const toastIcon = document.getElementById('toast-icon');

        toastMsg.textContent = message;
        toastIcon.textContent = type === 'success' ? 'check_circle' : 'info';
        toastIcon.className = `material-icons-round toast-icon ${type}`;
        toast.classList.add('show');

        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    // ========== SCROLL REVEAL ==========
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

    // Add fade-in styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});
