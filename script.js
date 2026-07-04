/* ==========================================================================
   INTERACTIVE LOGIC: PORTFOLIO MAIN JS (BLENDED STYLE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Projects Data loading
  const projectsData = window.portfolioProjects || [];
  
  // 2. Theme Toggle Controller
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');
  
  // Check local storage for theme
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    if (isLight) {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  });

  // 3. Custom Cursor Follower Controller
  const cursor = document.getElementById('custom-cursor');
  const cursorText = cursor.querySelector('.cursor-text');
  
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let isMobile = false;

  // Detect Mobile/Touch devices
  const checkDevice = () => {
    isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
    if (isMobile) {
      cursor.style.display = 'none';
      document.body.style.cursor = 'auto';
    } else {
      cursor.style.display = 'flex';
      document.body.style.cursor = 'none';
    }
  };
  checkDevice();
  window.addEventListener('resize', checkDevice);

  // Track Mouse movement
  document.addEventListener('mousemove', (e) => {
    if (isMobile) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update interactive background light coordinates
    document.documentElement.style.setProperty('--mouse-bg-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-bg-y', `${e.clientY}px`);
  });

  // Track Touch movement (Mobile Glow follow)
  const updateTouchCoordinates = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    document.documentElement.style.setProperty('--mouse-bg-x', `${touch.clientX}px`);
    document.documentElement.style.setProperty('--mouse-bg-y', `${touch.clientY}px`);
  };
  document.addEventListener('touchstart', updateTouchCoordinates, { passive: true });
  document.addEventListener('touchmove', updateTouchCoordinates, { passive: true });

  // Mousedown / Mouseup states for cursor click animation
  document.addEventListener('mousedown', () => {
    if (!isMobile) cursor.classList.add('clicking');
  });
  
  document.addEventListener('mouseup', () => {
    if (!isMobile) cursor.classList.remove('clicking');
  });

  // Smooth Follower Lerp Loop
  const updateCursor = () => {
    if (!isMobile) {
      // Linear interpolation: 15% step towards mouse position
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      
      cursor.style.left = `${followerX}px`;
      cursor.style.top = `${followerY}px`;
    }
    requestAnimationFrame(updateCursor);
  };
  updateCursor();

  // Hover states binders
  const addCursorHover = (elements, hoverClass, text = '') => {
    elements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (isMobile) return;
        cursor.classList.add(hoverClass);
        if (text) {
          cursorText.textContent = text;
        }
      });
      el.addEventListener('mouseleave', () => {
        if (isMobile) return;
        cursor.classList.remove(hoverClass);
      });
    });
  };

  // Bind links & buttons
  const bindCursorInteractive = () => {
    const interactives = document.querySelectorAll('a, button, input, textarea, .filter-btn, .color-swatch-wrapper, .bento-card, .pricing-card');
    addCursorHover(interactives, 'hovering-link');
  };

  // 4. Bento Cards Hover Border Glow
  const cards = document.querySelectorAll('.bento-card, .process-card, .meta-card, .design-specs, .pricing-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });



  // 6. Dynamic Hero Showcase Carousel
  const carouselTrack = document.getElementById('carousel-track');
  if (carouselTrack) {
    const generateCarousel = () => {
      let itemsHTML = '';
      // Render all projects
      projectsData.forEach(project => {
        itemsHTML += `
          <div class="carousel-item" data-id="${project.id}">
            <div class="carousel-item-image-wrap" style="width:90%; height:90%; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
              ${project.image}
            </div>
          </div>
        `;
      });
      // Double elements for infinite loop
      carouselTrack.innerHTML = itemsHTML + itemsHTML;
    };
    generateCarousel();

    // Bind cursor View state to carousel items
    const bindCarouselHovers = () => {
      const items = document.querySelectorAll('.carousel-item');
      addCursorHover(items, 'hovering-project', 'View');
      
      // On click open modal
      items.forEach(item => {
        item.addEventListener('click', () => {
          const id = item.getAttribute('data-id');
          openCaseStudy(id);
        });
      });
    };
    bindCarouselHovers();
  }

  // 7. Bind custom cursor to premium brand cards
  const bindBrandHovers = () => {
    const brandCards = document.querySelectorAll('.brand-card');
    addCursorHover(brandCards, 'hovering-project', 'View');
  };
  bindBrandHovers();

  // 10. Magnetic Button Hover effect
  const magneticButtons = document.querySelectorAll('.magnetic-button');
  
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      if (isMobile) return;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull button towards mouse (lerp factor)
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      
      const circle = btn.querySelector('.btn-circle');
      if (circle) {
        circle.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      const circle = btn.querySelector('.btn-circle');
      if (circle) {
        circle.style.transform = 'translate(0, 0)';
      }
    });


  });

  // 10.5 Generic Mobile Touch Active feedback
  const bindTouchActiveEvents = () => {
    if (!isMobile) return;
    const selectors = 'a, button, .chip, .pricing-card, .modal-close-btn, .lightbox-close-btn, .theme-toggle-btn';
    const elements = document.querySelectorAll(selectors);
    
    elements.forEach(el => {
      el.addEventListener('touchstart', () => {
        el.classList.add('touch-active');
      }, { passive: true });
      
      el.addEventListener('touchend', () => {
        el.classList.remove('touch-active');
      });
      
      el.addEventListener('touchcancel', () => {
        el.classList.remove('touch-active');
      });
    });
  };
  bindTouchActiveEvents();

  // 11. Mobile Drawer Navigation toggle
  const menuTrigger = document.getElementById('menu-trigger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  
  const toggleMobileMenu = () => {
    const active = menuTrigger.classList.toggle('active');
    menuTrigger.setAttribute('aria-expanded', active ? 'true' : 'false');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = active ? 'hidden' : '';
  };

  menuTrigger.addEventListener('click', toggleMobileMenu);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuTrigger.classList.remove('active');
      menuTrigger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // 12. Intersection Observer (Scroll Reveal effect)
  const reveals = document.querySelectorAll('.scroll-reveal');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  };
  
  const revealObserver = new IntersectionObserver(revealCallback, {
    root: null,
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });
  
  reveals.forEach(el => revealObserver.observe(el));

  // 13. Active Nav Links Indicator on Scroll
  const sections = document.querySelectorAll('section[id]');
  const scrollActiveLink = () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.navigation-links a[href*=${sectionId}]`);
      
      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelectorAll('.navigation-links a').forEach(l => l.classList.remove('active'));
          navLink.classList.add('active');
        }
      }
    });
  };
  window.addEventListener('scroll', scrollActiveLink);



  // 15. Contact Form Validation & Submission feedback
  const form = document.getElementById('portfolio-contact-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // ==========================================
    // НАСТРОЙКИ TELEGRAM БОТА
    const TELEGRAM_BOT_TOKEN = '8852043443:AAHdOig4C1iRScw8lx0Lc6LXiXQVmdwqqPE';
    const TELEGRAM_CHAT_ID = '881414503';
    // ==========================================
    
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    
    let isValid = true;
    
    if (nameInput.value.trim() === '') {
      nameInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      nameInput.parentElement.classList.remove('has-error');
    }
    
    if (emailInput.value.trim() === '') {
      emailInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      emailInput.parentElement.classList.remove('has-error');
    }
    
    if (messageInput.value.trim() === '') {
      messageInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      messageInput.parentElement.classList.remove('has-error');
    }
    
    if (isValid) {
      const name = nameInput.value.trim();
      const contact = emailInput.value.trim();
      const message = messageInput.value.trim();
      
      const escapeHTML = (str) => {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
      };
      
      const text = `🔔 <b>Новая заявка с портфолио!</b>\n\n` +
                   `👤 <b>Имя:</b> ${escapeHTML(name)}\n` +
                   `📞 <b>Контакт:</b> ${escapeHTML(contact)}\n\n` +
                   `💬 <b>Описание задачи:</b>\n${escapeHTML(message)}`;

      if (TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' && TELEGRAM_CHAT_ID !== 'YOUR_CHAT_ID_HERE') {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'HTML'
          })
        })
        .catch(err => console.error('Ошибка сети при отправке в Telegram:', err));
      }

      showSuccessToast();
      form.reset();
    }
  });

  const showSuccessToast = () => {
    const toast = document.createElement('div');
    toast.className = 'form-success-popup';
    toast.innerHTML = `
      <svg class="success-icon" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" fill="none">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span class="success-text">Сообщение успешно отправлено!</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3500);
  };

  const inputs = form.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim() !== '') {
        input.parentElement.classList.remove('has-error');
      }
    });
  });

  // ==========================================================================
  // CREATIVE MOTION & INTERACTIVE TRANSITIONS
  // ==========================================================================

  // 1. Parallax background section numbers
  const parallaxNumbers = document.querySelectorAll('.bg-section-number');

  // 2. Scroll-Driven Marquees
  const marqueeTrack1 = document.querySelector('.marquee-track-1');
  const marqueeTrack2 = document.querySelector('.marquee-track-2');

  if (marqueeTrack1) {
    marqueeTrack1.innerHTML += marqueeTrack1.innerHTML + marqueeTrack1.innerHTML; // Triple to ensure loop width
  }
  if (marqueeTrack2) {
    marqueeTrack2.innerHTML += marqueeTrack2.innerHTML + marqueeTrack2.innerHTML;
  }

  let basePos1 = 0;
  let scrollSpeed = 0;
  let lastScrollY = window.scrollY;
  let speedTarget = 0;

  // 3. Section Theme Color Morphing (Observer-based)
  const morphSections = document.querySelectorAll('section[id]');
  const morphObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        // Remove all previous theme classes
        document.body.classList.remove('theme-home', 'theme-about', 'theme-skills', 'theme-works', 'theme-pricing', 'theme-contact');
        // Add current section theme class
        document.body.classList.add(`theme-${id}`);
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: '-15% 0px -35% 0px'
  });
  
  morphSections.forEach(sec => morphObserver.observe(sec));

  // 4. Section Entrance Animations Observer
  const animateSections = document.querySelectorAll('[data-animate]');
  const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.08,
    rootMargin: '0px 0px -80px 0px'
  });

  animateSections.forEach(sec => animationObserver.observe(sec));

  // Scroll Listener Loop
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;

    // A. Parallax background numbers
    parallaxNumbers.forEach(num => {
      const rect = num.parentElement.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const speed = parseFloat(num.getAttribute('data-parallax-speed')) || 0.12;
        const relativeOffset = (window.innerHeight - rect.top) * speed;
        num.style.transform = `translateY(${relativeOffset - 40}px)`;
      }
    });

    // B. Calculate scroll speed for inertia marquees
    const diff = sy - lastScrollY;
    speedTarget = diff * 0.45;
    lastScrollY = sy;
  });

  // Smooth marquee loop (RequestAnimationFrame)
  const animateMarquees = () => {
    scrollSpeed += (speedTarget - scrollSpeed) * 0.1;
    speedTarget *= 0.9; // Friction

    basePos1 -= (1.0 + Math.abs(scrollSpeed));

    if (basePos1 < -1500) basePos1 = 0;

    if (marqueeTrack1) {
      marqueeTrack1.style.transform = `translateX(${basePos1}px)`;
    }
    if (marqueeTrack2) {
      marqueeTrack2.style.transform = `translateX(${basePos1}px)`;
    }

    requestAnimationFrame(animateMarquees);
  };
  animateMarquees();

  // --- 15. Scroll-driven Elastic Motion (Main Page) ---
  let elasticLastScrollY = window.scrollY;
  let mainVelocity = 0;
  let smoothedMainVelocity = 0;

  const elasticLoop = () => {
    // Main page scroll velocity
    const currentScrollY = window.scrollY;
    const mainDiff = currentScrollY - elasticLastScrollY;
    mainVelocity = mainDiff;
    elasticLastScrollY = currentScrollY;
    
    smoothedMainVelocity += (mainVelocity - smoothedMainVelocity) * 0.08;
    const cappedMain = Math.max(-100, Math.min(100, smoothedMainVelocity));
    document.documentElement.style.setProperty('--scroll-velocity', cappedMain.toFixed(2));

    requestAnimationFrame(elasticLoop);
  };
  
  requestAnimationFrame(elasticLoop);

  // Initial bindings
  bindCursorInteractive();
  bindTouchActiveEvents();
});
