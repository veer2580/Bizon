/* ==========================================================================
   BYIZON AI LANDING PAGE — SCRIPT & ADVANCED INTERACTION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // First, dynamically inject shared structures (Footer and Modal) if missing
  injectFooterAndModal();

  // Initialize all interactive modules safely
  initHeaderScroll();
  initScrollReveal();
  initCountUpAnimations();
  initAccordion();
  initTestimonialSlider();
  initAuthRedirects();
  initModal();
  initContactForm();
  initNeuralCanvas();
  initCardParallax();
  initCompanyDropdown();
  initDropdownClick();
  initActiveNavigation();
  initPlatformPage();
  initBlogPage();
  initPricingPage();
  initNewsPage();
});

function initActiveNavigation() {
  const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const sectionByPage = {
    'index.html': 'platform',
    'platform.html': 'platform',
    'solutions.html': 'solutions',
    'solution-operations.html': 'solutions',
    'solution-analytics.html': 'solutions',
    'solution-sales.html': 'solutions',
    'solution-enterprise.html': 'solutions',
    'ai.html': 'ai',
    'integrations.html': 'integrations',
    'blog.html': 'resources',
    'blog-article.html': 'resources',
    'help-center.html': 'resources',
    'terms.html': 'resources',
    'pricing.html': 'pricing',
    'about.html': 'company',
    'career.html': 'company',
    'contact.html': 'company',
    'news.html': 'company'
  };
  const currentSection = sectionByPage[page];
  if (!currentSection) return;

  document.querySelectorAll('.site-nav').forEach((nav) => {
    nav.querySelectorAll(':scope > a, :scope > .site-nav-dropdown > button').forEach((item) => {
      item.classList.remove('active');
      item.removeAttribute('aria-current');
    });

    const directLinks = [...nav.querySelectorAll(':scope > a')];
    const dropdowns = [...nav.querySelectorAll(':scope > .site-nav-dropdown')];
    let activeItem = directLinks.find((link) => {
      const label = link.textContent.trim().toLowerCase();
      return label === currentSection;
    });

    if (!activeItem) {
      const activeDropdown = dropdowns.find((dropdown) => {
        const label = dropdown.querySelector(':scope > button')?.textContent.trim().toLowerCase() || '';
        return label.startsWith(currentSection);
      });
      activeItem = activeDropdown?.querySelector(':scope > button');
    }

    if (activeItem) {
      activeItem.classList.add('active');
      activeItem.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('.nav-menu').forEach((nav) => {
    const items = [...nav.querySelectorAll(':scope > .nav-list > li > .nav-link')];
    items.forEach((item) => {
      item.classList.remove('active');
      item.removeAttribute('aria-current');
    });

    const activeItem = items.find((item) => item.textContent.trim().toLowerCase().startsWith(currentSection));
    if (activeItem) {
      activeItem.classList.add('active');
      activeItem.setAttribute('aria-current', 'page');
    }
  });
}

/* --------------------------------------------------------------------------
   0. Dynamic Footer & Modal Injection (For sub-pages)
   -------------------------------------------------------------------------- */
function injectFooterAndModal() {
  // 1. Dynamic Footer Injection
  if (!document.getElementById('siteFooter') && !document.querySelector('.site-footer')) {
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.id = 'siteFooter';
    footer.innerHTML = `
      <div class="container footer-container">
        <div class="footer-columns-grid">
          
          <div class="footer-brand-col">
            <div class="brand-logo footer-logo">
              <img class="brand-wordmark-image footer-brand-wordmark" src="byizon-logo-wordmark.png" alt="BYIZON">
            </div>
            <span class="footer-sublabel">AI POWERED BUSINESS OS</span>
            <p class="footer-bio">
              An intelligent business operating system connecting data, applications, workflows, and AI in one adaptive workspace.
            </p>
          </div>

          <div class="footer-link-col">
            <h4 class="col-title">PLATFORM</h4>
            <ul class="col-links">
              <li><a href="index.html">Platform</a></li>
              <li><a href="ai.html">AI Assistant</a></li>
              <li><a href="ai.html#agents">AI Agents</a></li>
              <li><a href="solution-analytics.html">Analytics</a></li>
              <li><a href="solutions.html">Reports</a></li>
              <li><a href="solution-operations.html">Automation</a></li>
            </ul>
          </div>

          <div class="footer-link-col">
            <h4 class="col-title">SOLUTIONS</h4>
            <ul class="col-links">
              <li><a href="solution-sales.html">Sales & Marketing</a></li>
              <li><a href="solution-enterprise.html">Enterprise</a></li>
            </ul>
          </div>

          <div class="footer-link-col">
            <h4 class="col-title">INTEGRATIONS</h4>
            <ul class="col-links">
              <li><a href="integrations.html"><span class="f-icon">G</span> Google Workspace</a></li>
            </ul>
          </div>

          <div class="footer-link-col">
            <h4 class="col-title">COMPANY</h4>
            <ul class="col-links">
              <li><a href="about.html">About</a></li>
              <li><a href="career.html">Careers</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>

          <div class="footer-link-col">
            <h4 class="col-title">RESOURCES</h4>
            <ul class="col-links">
              <li><a href="blog.html">Blog</a></li>
              <li><a href="help-center.html">Help Center</a></li>
              <li><a href="integrations.html">API Docs</a></li>
            </ul>
          </div>

        </div>

        <div class="footer-bottom-bar">
          <div class="footer-copy">
            © 2026 ANTELLAY Tech. All Rights Reserved. A Celebso Group Company.
          </div>
          <div class="footer-legal">
            <a href="terms.html">Privacy Policy</a>
            <span class="divider">|</span>
            <a href="terms.html">Terms of Service</a>
          </div>
          <div class="footer-socials">
            <a href="https://linkedin.com" class="social-icon" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://x.com" class="social-icon" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        <div class="footer-tagline-banner">
          <div class="tagline-wave-bg"></div>
          <span class="tagline-text">BYIZON — INTELLIGENCE, IN CONTEXT.</span>
        </div>

      </div>
    `;
    const mainEl = document.querySelector('main') || document.querySelector('.main') || document.body.firstElementChild;
    if (mainEl && mainEl.parentNode) {
      if (mainEl.nextSibling) {
        mainEl.parentNode.insertBefore(footer, mainEl.nextSibling);
      } else {
        mainEl.parentNode.appendChild(footer);
      }
    } else {
      document.body.appendChild(footer);
    }
  }

  // 2. Dynamic Modal Injection
  if (!document.getElementById('demoModal') && !document.querySelector('.modal-backdrop')) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.id = 'demoModal';
    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close" id="closeModalBtn">&times;</button>
        <div class="modal-header">
          <div class="section-badge"><span class="badge-num">AI</span><span class="badge-text">Get Started</span></div>
          <h3 class="serif-title modal-title">Experience BYIZON</h3>
          <p class="modal-sub">See how our adaptive business OS unifies your operational intelligence.</p>
        </div>
        <form class="modal-form" id="demoForm" onsubmit="handleDemoSubmit(event)">
          <div class="form-group">
            <label for="userName">Full Name</label>
            <input type="text" id="userName" placeholder="David Chen" required>
          </div>
          <div class="form-group">
            <label for="userEmail">Work Email</label>
            <input type="email" id="userEmail" placeholder="david@company.com" required>
          </div>
          <div class="form-group">
            <label for="companySize">Company Size</label>
            <select id="companySize">
              <option value="1-20">1 - 20 employees</option>
              <option value="21-100">21 - 100 employees</option>
              <option value="101-500">101 - 500 employees</option>
              <option value="500+">500+ Enterprise</option>
            </select>
          </div>
          <button type="submit" class="btn-cta-orange full-width">Request Live Demo →</button>
        </form>
        <div class="modal-success" id="modalSuccessMessage" style="display: none;">
          <div class="success-icon">✓</div>
          <h4>You're on the priority list!</h4>
          <p>Our team will reach out within 2 hours to configure your adaptive workspace.</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

/* --------------------------------------------------------------------------
   1. Sticky Header Scroll Effect
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader') || document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* --------------------------------------------------------------------------
   2. Scroll Reveal Observer (Smooth Staggered Entrance)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   3. Animated Number Counters (99%, +42%, $148,250, 10x, 20)
   -------------------------------------------------------------------------- */
function initCountUpAnimations() {
  const counterElements = document.querySelectorAll('.count-up');
  if (counterElements.length === 0) return;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counterElements.forEach(el => countObserver.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800; // ms
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easeOutExpo curve
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(easeProgress * target);

      // Formatting with commas if > 1000
      let formattedVal = currentVal;
      if (target >= 1000) {
        formattedVal = currentVal.toLocaleString('en-US');
      }

      el.textContent = `${prefix}${formattedVal}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        let finalVal = target >= 1000 ? target.toLocaleString('en-US') : target;
        el.textContent = `${prefix}${finalVal}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }
}

/* --------------------------------------------------------------------------
   4. Process Section Accordion & Auto-Cycling Timer
   -------------------------------------------------------------------------- */
let accordionAutoTimer = null;
let currentAccordionStep = 1;

function initAccordion() {
  const accordionWrap = document.querySelector('.process-right-accordion-exact');
  if (!accordionWrap) return;

  window.toggleAccordion = function(step) {
    currentAccordionStep = step;
    for (let i = 1; i <= 3; i++) {
      const item = document.getElementById(`accItem${i}`);
      if (!item) continue;
      const chevron = item.querySelector('.acc-chevron') || item.querySelector('.acc-arrow');
      const tag = item.querySelector('.acc-square-tag');
      
      if (i === step) {
        item.classList.add('active');
        if (chevron) chevron.textContent = '▲';
        if (tag) tag.classList.remove('num-muted');
      } else {
        item.classList.remove('active');
        if (chevron) chevron.textContent = '▼';
        if (tag) tag.classList.add('num-muted');
      }
    }
  };

  // Auto cycle every 4.5 seconds
  function startAutoCycle() {
    accordionAutoTimer = setInterval(() => {
      currentAccordionStep = (currentAccordionStep % 3) + 1;
      if (typeof window.toggleAccordion === 'function') {
        window.toggleAccordion(currentAccordionStep);
      }
    }, 4500);
  }

  accordionWrap.addEventListener('mouseenter', () => clearInterval(accordionAutoTimer));
  accordionWrap.addEventListener('mouseleave', () => startAutoCycle());

  startAutoCycle();
}

/* --------------------------------------------------------------------------
   5. Testimonial Carousel with Smooth Slide Transition
   -------------------------------------------------------------------------- */
const testimonials = [
  {
    quote: "“The dashboards are clean, fast, and highly accurate. It saved our team a significant amount of time by eliminating manual reporting every week and made our overall workflow much more efficient and organized.”",
    name: "David Chen",
    role: "Business Analyst",
    avatar: "DC"
  },
  {
    quote: "“Byizon unified all our disparate Salesforce, Postgres, and Stripe metrics into one adaptive view. Our executives now make data-backed calls in minutes rather than waiting days for analytics sprints.”",
    name: "Sarah Jenkins",
    role: "VP of Operations, TechFlow",
    avatar: "SJ"
  },
  {
    quote: "“The contextual AI actions are game-changing. The UI literally reconstructs itself to highlight anomalies before our customers even notice them. It’s like having 10 data engineers on autopilot.”",
    name: "Marcus Vance",
    role: "Chief Product Officer, ScaleGrid",
    avatar: "MV"
  }
];

let currentTestimonialIndex = 0;

function initTestimonialSlider() {
  const prevBtn = document.getElementById('prevTestimonialBtn');
  const nextBtn = document.getElementById('nextTestimonialBtn');
  const quoteEl = document.getElementById('testimonialQuote');
  const nameEl = document.getElementById('testimonialName');
  const roleEl = document.getElementById('testimonialRole');
  const avatarEl = document.getElementById('testimonialAvatar');
  const cardEl = document.getElementById('testimonialCard');

  if (!prevBtn || !nextBtn || !cardEl) return;

  function updateTestimonial(index, direction) {
    cardEl.style.opacity = '0.3';
    cardEl.style.transform = direction === 'next' ? 'translateX(20px) scale(0.98)' : 'translateX(-20px) scale(0.98)';
    
    setTimeout(() => {
      const data = testimonials[index];
      if (quoteEl) quoteEl.textContent = data.quote;
      if (nameEl) nameEl.textContent = data.name;
      if (roleEl) roleEl.textContent = data.role;
      if (avatarEl) avatarEl.textContent = data.avatar;
      
      cardEl.style.opacity = '1';
      cardEl.style.transform = 'translateX(0px) scale(1)';
    }, 200);
  }

  prevBtn.addEventListener('click', () => {
    currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
    updateTestimonial(currentTestimonialIndex, 'prev');
  });

  nextBtn.addEventListener('click', () => {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    updateTestimonial(currentTestimonialIndex, 'next');
  });
}

/* --------------------------------------------------------------------------
   6. 3D Mouse Parallax Hover Effect
   -------------------------------------------------------------------------- */
function initCardParallax() {
  const tiltCards = document.querySelectorAll('.hover-tilt');
  if (tiltCards.length === 0) return;

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const tiltX = (y / (rect.height / 2)) * -6; // max 6 deg
      const tiltY = (x / (rect.width / 2)) * 6;

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* --------------------------------------------------------------------------
   7. Company Dropdown Navigation (Desktop Toggle fallback)
   -------------------------------------------------------------------------- */
function initCompanyDropdown() {
  const dropdown = document.querySelector('.nav-item-dropdown');
  const toggle = document.querySelector('.nav-dropdown-toggle');
  if (!dropdown || !toggle) return;

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
}

/* --------------------------------------------------------------------------
   8. Shared Dropdown Hover-to-Click support for subpage dropdowns
   -------------------------------------------------------------------------- */
function initDropdownClick() {
  const dropdowns = document.querySelectorAll('.site-nav-dropdown');
  if (dropdowns.length === 0) return;

  dropdowns.forEach(dropdown => {
    const btn = dropdown.querySelector('button');
    const menu = dropdown.querySelector('.site-nav-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.site-nav-dropdown').forEach(other => {
        if (other !== dropdown) {
          other.classList.remove('mobile-active');
        }
      });
      dropdown.classList.toggle('mobile-active');
    });
  });

  document.addEventListener('click', () => {
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('mobile-active');
    });
  });
}

/* --------------------------------------------------------------------------
   9. Auth Redirect Handlers
   -------------------------------------------------------------------------- */
function initAuthRedirects() {
  document.querySelectorAll('.login-btn, #loginBtn').forEach(btn => {
    btn.removeAttribute('href');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.parent.location.href = '/login';
    });
  });
  document.querySelectorAll('.start-btn, #getStartedHeaderBtn').forEach(btn => {
    btn.removeAttribute('href');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.parent.location.href = '/signup';
    });
  });
}

/* --------------------------------------------------------------------------
   10. Modal Dialog Handlers
   -------------------------------------------------------------------------- */
function initModal() {
  const modal = document.getElementById('demoModal');
  const closeBtn = document.getElementById('closeModalBtn');
  if (!modal) return;

  // Broad selector matching demo/contact CTAs.
  const triggerButtons = document.querySelectorAll(
    '.btn-cta-orange, #heroCtaBtn, #seeFeaturesBtn, #tryDashboardBtn, #footerGetStartedBtn, #bookDemoBtn, a[href="contact.html"]:not(.site-nav a):not(.col-links a):not(.col-links li a):not(.start-btn)'
  );

  triggerButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  function openModal() {
    modal.classList.add('show');
  }

  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
      const form = document.getElementById('demoForm');
      const successMsg = document.getElementById('modalSuccessMessage');
      if (form) form.style.display = 'block';
      if (successMsg) successMsg.style.display = 'none';
    }, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.handleDemoSubmit = async function(e) {
    e.preventDefault();
    const form = document.getElementById('demoForm');
    const successMsg = document.getElementById('modalSuccessMessage');
    if (!form || !successMsg) return;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Request Live Demo →';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('userName').value,
          email: document.getElementById('userEmail').value,
          companySize: document.getElementById('companySize').value
        })
      });

      if (!response.ok) {
        throw new Error('Demo request failed');
      }

      form.style.display = 'none';
      successMsg.style.display = 'block';
    } catch (error) {
      alert('Could not send your request right now. Please try again shortly.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  };
}

/* --------------------------------------------------------------------------
   10. Contact Form Submission Handlers
   -------------------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Send Message →';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      const nameInput = contactForm.querySelector('input[type="text"][placeholder*="Name"]') || contactForm.querySelector('input[placeholder="Your Name"]');
      const emailInput = contactForm.querySelector('input[type="email"]') || contactForm.querySelector('input[placeholder="Email Address"]');
      const companyInput = contactForm.querySelector('input[placeholder="Company"]');
      const messageInput = contactForm.querySelector('textarea');

      try {
        const response = await fetch('/api/contact-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput ? nameInput.value : '',
            email: emailInput ? emailInput.value : '',
            company: companyInput ? companyInput.value : '',
            message: messageInput ? messageInput.value : ''
          })
        });

        if (!response.ok) {
          throw new Error('Contact message failed');
        }

        contactForm.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: #123052;">
            <div style="font-size: 54px; margin-bottom: 18px; color: #f25b2a;">✓</div>
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; margin-bottom: 8px; font-weight: 700;">Message Received!</h3>
            <p style="color: #64748b; font-size: 15px; max-width: 320px; margin: 0 auto; line-height: 1.5;">Thank you for writing to us. Our team will get back to you shortly.</p>
          </div>
        `;
      } catch (error) {
        alert('Could not send your message right now. Please try again shortly.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // Intercept generic newsletter forms
  const newsletterForm = document.querySelector('.newsletter form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input');
      if (emailInput && emailInput.value) {
        alert(`Thank you for subscribing with ${emailInput.value}!`);
        emailInput.value = '';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   11. Generative Neural Waves & AI Particle Animation
   -------------------------------------------------------------------------- */
function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = 460;
  let height = canvas.height = 340;

  const particles = [];
  const particleCount = 32;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2.5 + 1.5,
      color: i % 3 === 0 ? '#f25b2a' : (i % 3 === 1 ? '#60a5fa' : '#a855f7')
    });
  }

  let step = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    step += 0.018;
    ctx.lineWidth = 1.2;

    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.strokeStyle = j % 2 === 0 ? 'rgba(242, 91, 42, 0.25)' : 'rgba(96, 165, 250, 0.25)';
      for (let x = 0; x < width; x += 10) {
        const y = height / 2 + Math.sin(x * 0.01 + step + j) * 45 + Math.cos(x * 0.015 + step) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let i = 0; i < particleCount; i++) {
      const p1 = particles[i];
      p1.x += p1.vx;
      p1.y += p1.vy;

      if (p1.x < 0 || p1.x > width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > height) p1.vy *= -1;

      for (let j = i + 1; j < particleCount; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 85) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(148, 163, 184, ${1 - dist / 85})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      ctx.fillStyle = p1.color;
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

/* --------------------------------------------------------------------------
   12. Platform Page Interactive Core
   -------------------------------------------------------------------------- */
function initPlatformPage() {
  const platformPage = document.querySelector('.platform-page');
  if (!platformPage) return;

  const navSpans = platformPage.querySelectorAll('.console-nav span');
  const chatPrompt = platformPage.querySelector('.console-chat .prompt');
  const workingDiv = platformPage.querySelector('.console-chat .working');
  const consoleResult = platformPage.querySelector('.console-result');

  const consoleData = {
    "AI": {
      prompt: "Show me last month's sales from Slack, compare them with the previous month, and schedule a review meeting for tomorrow.",
      steps: ["Understanding request", "Connecting to Slack", "Analyzing sales updates", "Checking calendar availability"],
      result: "Done. I found your sales data, created your monthly performance dashboard and prepared a meeting for tomorrow at 11:00 AM."
    },
    "Data": {
      prompt: "Query our production database for active customer subscriptions, group by tier, and format as a clean report.",
      steps: ["Parsing query language", "Accessing SQL Database", "Grouping active subscriptions by tier", "Formatting performance data"],
      result: "Done. I queried the database, grouped subscriptions by tier (Enterprise: 45, Pro: 180, Starter: 450), and generated the subscription health report."
    },
    "Apps": {
      prompt: "Sync my HubSpot deals with Jira tickets, search for unresolved bugs, and ping the engineering channel.",
      steps: ["Connecting to HubSpot API", "Fetching Jira tickets", "Correlating bugs to deals", "Posting Slack alert"],
      result: "Done. Synced 12 open deals from HubSpot with Jira. Identified 3 high-priority blocker bugs and sent a summary to #engineering."
    },
    "Reports": {
      prompt: "Generate the Q3 financial performance report from Stripe invoices and send an email update to stakeholders.",
      steps: ["Retrieving Stripe invoices", "Aggregating revenue data", "Compiling Q3 financial summary", "Preparing email draft"],
      result: "Done. Drafted the Q3 financial report (Total MRR: ₹84.5L, +22.4% QoQ). The review email is staged and ready for your approval."
    }
  };

  let typewriterTimeout = null;
  let stepsTimeouts = [];
  let resultTimeout = null;

  function runConsoleSimulation(tabName) {
    clearTimeout(typewriterTimeout);
    stepsTimeouts.forEach(t => clearTimeout(t));
    stepsTimeouts = [];
    clearTimeout(resultTimeout);

    const data = consoleData[tabName];
    if (!data) return;

    chatPrompt.textContent = "";
    chatPrompt.style.display = "block";
    workingDiv.style.display = "none";
    workingDiv.innerHTML = `<strong>BYIZON is working on your request...</strong>`;
    consoleResult.style.display = "none";
    consoleResult.style.opacity = "0";
    consoleResult.style.transform = "translateY(10px)";
    consoleResult.style.transition = "opacity 0.5s ease, transform 0.5s ease";

    let charIndex = 0;
    function typePrompt() {
      if (charIndex < data.prompt.length) {
        chatPrompt.textContent += data.prompt.charAt(charIndex);
        charIndex++;
        typewriterTimeout = setTimeout(typePrompt, 15);
      } else {
        typewriterTimeout = setTimeout(showSteps, 400);
      }
    }
    typePrompt();

    function showSteps() {
      workingDiv.style.display = "grid";
      data.steps.forEach((step, index) => {
        const stepSpan = document.createElement('span');
        stepSpan.style.opacity = "0";
        stepSpan.style.transition = "opacity 0.4s ease";
        workingDiv.appendChild(stepSpan);

        const stepTimeout = setTimeout(() => {
          stepSpan.style.opacity = "1";
          stepSpan.innerHTML = `<span style="color: #22c55e; margin-right: 9px;">✓</span>${step}`;
        }, index * 800);
        stepsTimeouts.push(stepTimeout);
      });

      resultTimeout = setTimeout(() => {
        consoleResult.style.display = "block";
        const resultText = consoleResult.querySelector('p');
        if (resultText) resultText.textContent = data.result;

        setTimeout(() => {
          consoleResult.style.opacity = "1";
          consoleResult.style.transform = "translateY(0)";
        }, 50);
      }, data.steps.length * 800 + 400);
    }
  }

  navSpans.forEach(span => {
    span.addEventListener('click', () => {
      const text = span.textContent.trim();
      if (text === "⌂" || !consoleData[text]) return;

      navSpans.forEach(s => s.classList.remove('active'));
      span.classList.add('active');
      runConsoleSimulation(text);
    });
  });

  const activeSpan = platformPage.querySelector('.console-nav span.active');
  if (activeSpan) {
    runConsoleSimulation(activeSpan.textContent.trim());
  }

  const meetingCard = platformPage.querySelector('.meeting-card');
  const successCard = platformPage.querySelector('.success-card');
  if (meetingCard && successCard) {
    successCard.style.display = "none";
    successCard.style.opacity = "0";
    successCard.style.transform = "translateY(10px)";
    successCard.style.transition = "all 0.5s ease";

    const scheduleBtn = meetingCard.querySelector('button');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scheduleBtn.disabled = true;
        scheduleBtn.textContent = "Scheduling...";

        setTimeout(() => {
          meetingCard.style.opacity = "0";
          meetingCard.style.transform = "translateY(-10px)";
          meetingCard.style.transition = "all 0.4s ease";

          setTimeout(() => {
            meetingCard.style.display = "none";
            successCard.style.display = "block";
            setTimeout(() => {
              successCard.style.opacity = "1";
              successCard.style.transform = "translateY(0)";
            }, 50);
          }, 400);
        }, 1200);
      });
    }
  }

  const filtersBtn = platformPage.querySelector('.panel-heading button');
  if (filtersBtn) {
    filtersBtn.addEventListener('click', () => {
      const metrics = platformPage.querySelectorAll('.metric-grid div strong');
      if (metrics.length >= 3) {
        metrics[0].textContent = "₹" + (40 + Math.random() * 20).toFixed(1) + "L";
        metrics[1].textContent = Math.floor(100 + Math.random() * 50);
        metrics[2].textContent = "₹" + (1.5 + Math.random() * 0.8).toFixed(2) + "Cr";
      }
    });
  }

  const tryForm = platformPage.querySelector('.try-bar');
  if (tryForm) {
    tryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = tryForm.querySelector('input');
      if (input && input.value) {
        window.location.href = `https://byizon-ai-analytics.onrender.com/signup?prompt=${encodeURIComponent(input.value)}`;
      }
    });
  }
}

/* --------------------------------------------------------------------------
   13. Blog Page Search, Filters & Newsletter
   -------------------------------------------------------------------------- */
function initBlogPage() {
  const blogPage = document.querySelector('.blog-enterprise');
  if (!blogPage) return;

  const searchInput = blogPage.querySelector('.insight-search input');
  const filterTabs = blogPage.querySelectorAll('.blog-filter-tabs a');
  const cards = blogPage.querySelectorAll('.insight-card');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterAndSearchInsights();
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterAndSearchInsights();
    });
  });

  function filterAndSearchInsights() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const activeTab = blogPage.querySelector('.blog-filter-tabs a.active');
    const activeCategory = activeTab ? activeTab.textContent.trim().toLowerCase() : "all insights";

    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const category = card.querySelector('.eyebrow').textContent.toLowerCase().trim();

      const matchesQuery = title.includes(query) || desc.includes(query);
      const matchesCategory = (activeCategory === "all insights" || category === activeCategory);

      if (matchesQuery && matchesCategory) {
        card.style.display = "block";
        setTimeout(() => {
          card.style.opacity = "1";
          card.style.transform = "scale(1)";
        }, 50);
      } else {
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
          card.style.display = "none";
        }, 300);
      }
    });
  }

  const newsletterForm = blogPage.querySelector('.blog-newsletter form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      const button = newsletterForm.querySelector('button');
      if (input && input.value) {
        button.disabled = true;
        button.textContent = "Subscribed! ✓";
        input.disabled = true;
        
        const desc = blogPage.querySelector('.blog-newsletter p');
        if (desc) {
          desc.innerHTML = `<span style="color: #22c55e; font-weight: 700;">Success! Check your email (${input.value}) to confirm.</span>`;
        }
      }
    });
  }
}

/* --------------------------------------------------------------------------
   14. Pricing Page Billing Toggle & Console Typing Simulation
   -------------------------------------------------------------------------- */
function initPricingPage() {
  const pricingPage = document.querySelector('.pricing-page');
  if (!pricingPage) return;

  const toggleButtons = pricingPage.querySelectorAll('.billing-toggle button');
  const planCards = pricingPage.querySelectorAll('.plan-card');

  const prices = {
    monthly: {
      starter: "₹499",
      pro: "₹999"
    },
    yearly: {
      starter: "₹399",
      pro: "₹799"
    }
  };

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.textContent.trim().toLowerCase() === "yearly" ? "yearly" : "monthly";

      planCards.forEach(card => {
        const name = card.querySelector('.plan-name').textContent.trim().toLowerCase();
        const priceHeader = card.querySelector('h2');
        if (!priceHeader) return;

        if (name === "starter") {
          priceHeader.innerHTML = `${prices[mode].starter} <small>/ user / month</small>`;
          animatePriceChange(priceHeader);
        } else if (name === "pro") {
          priceHeader.innerHTML = `${prices[mode].pro} <small>/ user / month</small>`;
          animatePriceChange(priceHeader);
        }
      });
    });
  });

  function animatePriceChange(el) {
    el.style.transform = "scale(0.95)";
    el.style.opacity = "0.7";
    el.style.transition = "transform 0.15s ease, opacity 0.15s ease";
    setTimeout(() => {
      el.style.transform = "scale(1.05)";
      el.style.opacity = "1";
      setTimeout(() => {
        el.style.transform = "scale(1)";
      }, 150);
    }, 150);
  }

  const commands = pricingPage.querySelectorAll('.command-panel p');
  const consoleChatCard = pricingPage.querySelector('.assistant-console .chat-card p');
  const consoleWorkCard = pricingPage.querySelector('.assistant-console .work-card');
  const consoleResultCard = pricingPage.querySelector('.assistant-console .result-card');

  if (commands.length > 0 && consoleChatCard) {
    commands.forEach(cmd => {
      cmd.style.cursor = "pointer";
      cmd.style.transition = "color 0.2s ease";
      cmd.addEventListener('mouseenter', () => cmd.style.color = "var(--orange)");
      cmd.addEventListener('mouseleave', () => cmd.style.color = "");

      cmd.addEventListener('click', () => {
        const text = cmd.textContent.replace(/^"|"$/g, "");
        
        consoleWorkCard.style.display = "none";
        consoleResultCard.style.display = "none";
        consoleChatCard.textContent = "";

        let index = 0;
        function typeCmd() {
          if (index < text.length) {
            consoleChatCard.textContent += text.charAt(index);
            index++;
            setTimeout(typeCmd, 20);
          } else {
            setTimeout(() => {
              consoleWorkCard.style.display = "block";
              
              const items = consoleWorkCard.querySelectorAll('li');
              items.forEach((item, idx) => {
                item.style.opacity = "0.3";
                setTimeout(() => {
                  item.style.opacity = "1";
                  item.style.color = "#22c55e";
                }, idx * 600);
              });

              setTimeout(() => {
                consoleResultCard.style.display = "block";
                consoleResultCard.style.opacity = "0";
                consoleResultCard.style.transform = "translateY(10px)";
                setTimeout(() => {
                  consoleResultCard.style.opacity = "1";
                  consoleResultCard.style.transform = "translateY(0)";
                  consoleResultCard.style.transition = "all 0.4s ease";
                }, 50);
              }, items.length * 600 + 300);

            }, 400);
          }
        }
        typeCmd();
      });
    });
  }
}

/* --------------------------------------------------------------------------
   15. News Page Search, Filtering, Pagination & Sorting
   -------------------------------------------------------------------------- */
function initNewsPage() {
  const newsPage = document.querySelector('.news-page');
  if (!newsPage) return;

  const searchInput = newsPage.querySelector('.news-search input');
  const tabs = newsPage.querySelectorAll('.news-tabs a');
  const cards = newsPage.querySelectorAll('.news-card');
  const sortSelect = newsPage.querySelector('.sort-box select');
  const pagination = newsPage.querySelectorAll('.news-pagination a');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterNews();
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterNews();
    });
  });

  function filterNews() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const activeTab = newsPage.querySelector('.news-tabs a.active');
    const activeCategory = activeTab ? activeTab.textContent.trim().toLowerCase() : "all news";

    cards.forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const category = card.querySelector('.eyebrow').textContent.toLowerCase().trim();

      const matchesQuery = title.includes(query) || desc.includes(query);
      const matchesCategory = (activeCategory === "all news" || category === activeCategory);

      if (matchesQuery && matchesCategory) {
        card.style.display = "block";
        setTimeout(() => {
          card.style.opacity = "1";
          card.style.transform = "scale(1)";
        }, 50);
      } else {
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
          card.style.display = "none";
        }, 300);
      }
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const sortType = sortSelect.value.trim().toLowerCase();
      const container = newsPage.querySelector('.news-card-grid');
      const cardArray = Array.from(cards);

      if (sortType === "latest") {
        cardArray.sort((a, b) => {
          const dateA = new Date(a.querySelector('small').textContent.split('·')[0].trim());
          const dateB = new Date(b.querySelector('small').textContent.split('·')[0].trim());
          return dateB - dateA;
        });
      } else if (sortType === "popular") {
        cardArray.reverse();
      }

      cardArray.forEach(card => container.appendChild(card));
    });
  }

  pagination.forEach(pageLink => {
    pageLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (pageLink.classList.contains('active')) return;

      pagination.forEach(p => p.classList.remove('active'));
      pageLink.classList.add('active');

      const grid = newsPage.querySelector('.news-card-grid');
      grid.style.opacity = "0.3";
      grid.style.transition = "opacity 0.3s ease";

      setTimeout(() => {
        grid.style.opacity = "1";
        const cardsArray = Array.from(cards);
        cardsArray.forEach((card, index) => {
          card.style.order = Math.floor(Math.random() * cardsArray.length);
        });
      }, 500);
    });
  });

  const newsletterForm = newsPage.querySelector('.news-newsletter form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      const button = newsletterForm.querySelector('button');
      if (input && input.value) {
        button.disabled = true;
        button.textContent = "Subscribed! ✓";
        input.disabled = true;

        const p = newsPage.querySelector('.news-newsletter p');
        if (p) {
          p.innerHTML = `<span style="color: #22c55e; font-weight: 700;">Thank you! We've sent a subscription link to ${input.value}.</span>`;
        }
      }
    });
  }
}
