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

  // Build project pagination dots for mobile
  const buildProjectsProgressDots = () => {
    const worksSection = document.getElementById('works');
    if (!worksSection) return;
    
    // Clean up if already exists
    let existingDots = worksSection.querySelector('.projects-progress-dots');
    if (existingDots) existingDots.remove();
    
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'projects-progress-dots hide-on-desktop';
    
    projectsData.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `progress-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('data-index', index);
      dotsContainer.appendChild(dot);
    });
    
    const stickyViewport = worksSection.querySelector('.projects-sticky-viewport');
    if (stickyViewport) {
      stickyViewport.appendChild(dotsContainer);
    } else {
      worksSection.appendChild(dotsContainer);
    }
  };

  // 7. Dynamic Projects Horizontal Render
  const projectsTrack = document.getElementById('projects-horizontal-track');
  
  const renderProjects = () => {
    if (!projectsTrack) return;
    let trackHTML = '';
    projectsData.forEach(project => {
      trackHTML += `
        <article class="project-slide-card" data-id="${project.id}" data-accent="${project.accentColor || '#ffffff'}">
          <div class="project-image-wrapper">
            <div class="project-visual-wrapper" style="width:100%; height:100%;">
              <div class="project-visual-desktop" style="width:100%; height:100%;">
                ${project.image}
              </div>
              <div class="project-visual-mobile" style="width:100%; height:100%;">
                ${project.mobileImage || project.image}
              </div>
            </div>
          </div>
          <div class="project-info">
            <div class="project-details">
              <h3 class="project-card-title">${project.title}</h3>
              <p class="project-card-category">${project.category}</p>
            </div>
            <span class="project-year">${project.year}</span>
          </div>
        </article>
      `;
    });
    projectsTrack.innerHTML = trackHTML;
    buildProjectsProgressDots();
  };
  renderProjects();

  // Bind cursor to project cards
  const bindProjectHovers = () => {
    const projectCards = document.querySelectorAll('.project-slide-card');
    addCursorHover(projectCards, 'hovering-project', 'View');
    
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        openCaseStudy(id);
      });
    });
  };
  bindProjectHovers();

  // 9. Case Study Fullscreen Modal controller
  const modal = document.getElementById('case-study-modal');
  const modalClose = document.getElementById('modal-close');
  
  const openCaseStudy = (id) => {
    const project = projectsData.find(p => p.id === id);
    if (!project) return;
    
    // Inject values
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-category').textContent = project.category;
    document.getElementById('modal-hero-visual').innerHTML = project.modalImage || project.image;
    document.getElementById('modal-meta-client').textContent = project.client;
    document.getElementById('modal-meta-role').textContent = project.role;
    document.getElementById('modal-meta-year').textContent = project.year;
    document.getElementById('modal-challenge').textContent = project.challenge;
    document.getElementById('modal-solution').textContent = project.solution;
    
    // Inject tools
    const toolsWrap = document.getElementById('modal-meta-tools');
    toolsWrap.innerHTML = '';
    project.tools.forEach(tool => {
      const span = document.createElement('span');
      span.textContent = tool;
      toolsWrap.appendChild(span);
    });
    
    // Handle specs section conditionally
    const designSpecsWrap = document.getElementById('modal-design-specs');
    const archiveSpecsWrap = document.getElementById('modal-archive-specs');
    
    if (project.id === 'sado') {
      if (designSpecsWrap) designSpecsWrap.style.display = 'none';
      if (archiveSpecsWrap) {
        archiveSpecsWrap.style.display = 'block';
        const archiveGrid = document.getElementById('modal-archive-grid');
        if (archiveGrid) {
          archiveGrid.innerHTML = `
            <div class="archive-card">
              <span class="archive-brand">Vokebowl</span>
              <span class="archive-type">Ramen & SMM Identity</span>
            </div>
            <div class="archive-card">
              <span class="archive-brand">United Drivers</span>
              <span class="archive-type">Logistics & Brand Identity</span>
            </div>
            <div class="archive-card">
              <span class="archive-brand">Sakura Academy</span>
              <span class="archive-type">Courses Visual Style</span>
            </div>
            <div class="archive-card">
              <span class="archive-brand">Kahwa Coffee</span>
              <span class="archive-type">Packaging & Concept Store</span>
            </div>
            <div class="archive-card">
              <span class="archive-brand">Perfetto Food</span>
              <span class="archive-type">SMM & Visual Identity</span>
            </div>
            <div class="archive-card">
              <span class="archive-brand">And others...</span>
              <span class="archive-type">Commercial & Art Projects</span>
            </div>
          `;
        }
      }
    } else {
      if (designSpecsWrap) designSpecsWrap.style.display = 'block';
      if (archiveSpecsWrap) archiveSpecsWrap.style.display = 'none';
      
      // Inject color palette
      const colorsWrap = document.getElementById('modal-color-palette');
      if (colorsWrap) {
        colorsWrap.innerHTML = '';
        project.colors.forEach(color => {
          const wrapper = document.createElement('div');
          wrapper.className = 'color-swatch-wrapper';
          wrapper.innerHTML = `
            <div class="color-swatch" style="background-color: ${color};">
              <span class="copied-tooltip">Copied!</span>
            </div>
            <span class="color-hex">${color}</span>
          `;
          
          // Click event to copy color HEX
          wrapper.addEventListener('click', () => {
            navigator.clipboard.writeText(color).then(() => {
              const tooltip = wrapper.querySelector('.copied-tooltip');
              tooltip.classList.add('show');
              setTimeout(() => {
                tooltip.classList.remove('show');
              }, 1000);
            });
          });
          colorsWrap.appendChild(wrapper);
        });
      }
      
      // Inject typography
      const fontsWrap = document.getElementById('modal-font-specs');
      if (fontsWrap) {
        fontsWrap.innerHTML = '';
        project.fonts.forEach((font, index) => {
          const item = document.createElement('div');
          item.className = 'font-spec-item';
          let fontFamilyStyle = font;
          let extraStyles = '';
          if (font.toUpperCase().includes('КРЕАТИВА')) {
            fontFamilyStyle = 'Montserrat';
            extraStyles = 'font-weight: 900; text-transform: uppercase; font-size: clamp(11px, 2.5vw, 14px); letter-spacing: 0.5px;';
          } else if (font.length > 20) {
            extraStyles = 'font-size: clamp(14px, 3.5vw, 18px); font-weight: 500; letter-spacing: 0.5px;';
          }
          
          item.innerHTML = `
            <span class="font-name" style="font-family: '${fontFamilyStyle}', sans-serif; ${extraStyles}">${font}</span>
            <span class="font-type">${project.fonts.length === 1 ? 'Typography' : (index === 0 ? 'Header Font' : 'Body Font')}</span>
          `;
          fontsWrap.appendChild(item);
        });
      }
    }
    
    // Handle video showcase conditionally
    const videoShowcaseWrap = document.getElementById('modal-video-showcase');
    if (project.videos || project.video) {
      if (videoShowcaseWrap) {
        videoShowcaseWrap.style.display = 'block';
        const videoContainer = document.getElementById('modal-video-container');
        if (videoContainer) {
          if (project.videos && Array.isArray(project.videos)) {
            if (project.videos.length === 1 && project.videos[0] === 'placeholder') {
              const accent = project.accentColor || '#07428c';
              videoContainer.innerHTML = `
                <div class="media-placeholder-card" style="width: 100%; min-height: 200px; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.08); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); padding: 40px; text-align: center; gap: 16px; margin-top: 15px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.5" style="filter: drop-shadow(0 0 8px ${accent}66);">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  <div>
                    <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; color: #fff; margin-bottom: 6px;">Motion Showcase Coming Soon</h3>
                    <p style="font-size: 0.9rem; color: rgba(255,255,255,0.4); max-width: 380px; margin: 0 auto;">Анимационные примеры и видеоролики будут добавлены в ближайшее время.</p>
                  </div>
                </div>
              `;
              videoContainer.style.background = 'transparent';
              videoContainer.style.border = 'none';
              videoContainer.style.aspectRatio = 'auto';
              videoContainer.style.overflow = 'visible';
            } else if (project.id === 'aether') {
              // Custom layout for AIST: 1 horizontal banner (video4) + 3 vertical cards (video1, video2, video3)
              let videosHTML = `
                <div class="video-main-banner">
                  <video src="aist_video4.mp4" controls playsinline></video>
                </div>
                <div class="video-vertical-grid">
                  <div class="video-vertical-item">
                    <video src="aist_video1.mp4" controls playsinline></video>
                  </div>
                  <div class="video-vertical-item">
                    <video src="aist_video2.mp4" controls playsinline></video>
                  </div>
                  <div class="video-vertical-item">
                    <video src="aist_video3.mp4" controls playsinline></video>
                  </div>
                </div>
              `;
              videoContainer.innerHTML = videosHTML;
            } else {
              // Render a generic grid layout of videos
              let videosHTML = `<div class="video-grid-layout">`;
              project.videos.forEach(v => {
                videosHTML += `
                  <div class="video-grid-item">
                    <video src="${v}" controls playsinline></video>
                  </div>
                `;
              });
              videosHTML += `</div>`;
              videoContainer.innerHTML = videosHTML;
            }
            videoContainer.style.background = 'transparent';
            videoContainer.style.border = 'none';
            videoContainer.style.aspectRatio = 'auto';
            videoContainer.style.overflow = 'visible';
          } else {
            videoContainer.style.background = '';
            videoContainer.style.border = '';
            videoContainer.style.aspectRatio = '';
            videoContainer.style.overflow = '';
            if (project.video.trim().startsWith('<')) {
              videoContainer.innerHTML = project.video;
            } else {
              videoContainer.innerHTML = `<video src="${project.video}" controls playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>`;
            }
          }
        }
      }
    } else {
      if (videoShowcaseWrap) videoShowcaseWrap.style.display = 'none';
    }
    // Handle graphic showcase conditionally
    const graphicShowcaseWrap = document.getElementById('modal-graphic-showcase');
    if (project.graphicImages && Array.isArray(project.graphicImages)) {
      if (graphicShowcaseWrap) {
        graphicShowcaseWrap.style.display = 'block';
        const graphicContainer = document.getElementById('modal-graphic-container');
        if (graphicContainer) {
          if (project.graphicImages.length === 1 && project.graphicImages[0] === 'placeholder') {
            const accent = project.accentColor || '#07428c';
            graphicContainer.innerHTML = `
              <div class="media-placeholder-card" style="width: 100%; min-height: 200px; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.08); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); padding: 40px; text-align: center; gap: 16px; margin-top: 15px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="1.5" style="filter: drop-shadow(0 0 8px ${accent}66);">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <div>
                  <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; color: #fff; margin-bottom: 6px;">Graphics Showcase Coming Soon</h3>
                  <p style="font-size: 0.9rem; color: rgba(255,255,255,0.4); max-width: 380px; margin: 0 auto;">Графические концепты и печатные материалы будут добавлены в ближайшее время.</p>
                </div>
              </div>
            `;
          } else {
            let graphicsHTML = '<div class="graphic-grid-layout">';
            project.graphicImages.forEach((img, idx) => {
              // Asymmetrical layout: first image spans 2 columns
              const spanClass = (idx === 0) ? 'grid-span-2' : '';
              graphicsHTML += `
                <div class="graphic-grid-item ${spanClass}" data-src="${img}">
                  <img src="${img}" alt="${project.title} Graphic ${idx + 1}" loading="lazy">
                </div>
              `;
            });
            graphicsHTML += '</div>';
            graphicContainer.innerHTML = graphicsHTML;

            // Bind lightbox triggers
            const graphicItems = graphicContainer.querySelectorAll('.graphic-grid-item');
            graphicItems.forEach(item => {
              item.addEventListener('click', () => {
                const src = item.getAttribute('data-src');
                openLightbox(src);
              });
            });
          }
        }
      }
    } else {
      if (graphicShowcaseWrap) graphicShowcaseWrap.style.display = 'none';
    }
    
    // Set custom background color if configured
    if (project.modalBg) {
      modal.style.backgroundColor = project.modalBg;
    } else {
      modal.style.backgroundColor = '';
    }

    // Force dark theme inside modal if configured
    if (project.forceDarkTheme) {
      modal.classList.add('force-dark-theme');
    } else {
      modal.classList.remove('force-dark-theme');
    }
    
    // Force light theme inside modal if configured
    if (project.forceLightTheme) {
      modal.classList.add('force-light-theme');
    } else {
      modal.classList.remove('force-light-theme');
    }

    // Handle PDF link in sidebar
    const existingPdfCard = document.getElementById('modal-meta-pdf-card');
    if (existingPdfCard) {
      existingPdfCard.remove();
    }
    
    if (project.pdf) {
      const sidebar = document.querySelector('.case-study-modal.active .modal-info-sidebar') || document.querySelector('.modal-info-sidebar');
      if (sidebar) {
        const pdfCard = document.createElement('div');
        pdfCard.className = 'meta-card';
        pdfCard.id = 'modal-meta-pdf-card';
        pdfCard.innerHTML = `
          <h3 class="meta-label">Документация</h3>
          <a href="${project.pdf}" target="_blank" class="pdf-download-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Открыть Brandbook (PDF)</span>
          </a>
        `;
        sidebar.appendChild(pdfCard);
      }
    }
    
    // Handle PDF showcase conditionally
    const pdfShowcaseWrap = document.getElementById('modal-pdf-showcase');
    if (project.pdf) {
      if (pdfShowcaseWrap) {
        // Always place PDF showcase under video showcase (motion examples)
        const videoShowcaseWrap = document.getElementById('modal-video-showcase');
        if (videoShowcaseWrap && videoShowcaseWrap.nextSibling) {
          videoShowcaseWrap.parentNode.insertBefore(pdfShowcaseWrap, videoShowcaseWrap.nextSibling);
        } else if (videoShowcaseWrap) {
          videoShowcaseWrap.parentNode.appendChild(pdfShowcaseWrap);
        }

        pdfShowcaseWrap.style.display = 'block';
        const pdfContainer = document.getElementById('modal-pdf-container');
        if (pdfContainer) {
          pdfContainer.innerHTML = `
            <iframe class="pdf-iframe" src="${project.pdf}" width="100%" height="700px" style="border: none; display: block;"></iframe>
            <div class="pdf-mobile-fallback">
              <div class="pdf-fallback-card">
                <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="pdf-fallback-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <div class="pdf-fallback-info">
                  <h4>Просмотр Brandbook (PDF)</h4>
                  <p>Мобильные устройства не поддерживают встроенный просмотр PDF-файлов. Нажмите ниже, чтобы открыть брендбук.</p>
                </div>
                <a href="${project.pdf}" target="_blank" class="pdf-fallback-btn">
                  <span>Открыть документ</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          `;
        }
      }
    } else {
      if (pdfShowcaseWrap) {
        pdfShowcaseWrap.style.display = 'none';
        const pdfContainer = document.getElementById('modal-pdf-container');
        if (pdfContainer) {
          pdfContainer.innerHTML = '';
        }
      }
    }
    
    // Open Modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock main scroll
    
    // Bind cursor changes in modal
    bindCursorInteractive();
    bindTouchActiveEvents();
  };

  const closeCaseStudy = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock scroll
    
    // Reset custom background and forced theme styling
    modal.style.backgroundColor = '';
    modal.classList.remove('force-dark-theme');
    modal.classList.remove('force-light-theme');
    
    // Clear PDF iframe to free memory
    const pdfContainer = document.getElementById('modal-pdf-container');
    if (pdfContainer) {
      pdfContainer.innerHTML = '';
    }
  };

  modalClose.addEventListener('click', closeCaseStudy);
  
  // Lightbox functionality
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  const openLightbox = (src) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (lightboxImg) lightboxImg.src = '';
    }, 400); // Wait for transition
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
  }
  
  // Close modal or lightbox with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('active')) {
        closeLightbox();
      } else if (modal.classList.contains('active')) {
        closeCaseStudy();
      }
    }
  });

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

  // 3. Horizontal Projects Scroll & Motion Loop
  const projectsSection = document.getElementById('works');
  const horizontalTrack = document.getElementById('projects-horizontal-track');
  let currentTranslate = 0;

  const animateProjectsHorizontal = () => {
    if (!projectsSection || !horizontalTrack) return;
    
    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
    const cards = horizontalTrack.querySelectorAll('.project-slide-card');
    
    if (isMobileViewport) {
      // Clean up horizontal track translation (native scroll is active on mobile)
      horizontalTrack.style.transform = '';
      
      const trackWidth = horizontalTrack.clientWidth;
      const trackScrollLeft = horizontalTrack.scrollLeft;
      
      let closestIndex = 0;
      let closestDist = Infinity;
      
      cards.forEach((card, index) => {
        const cardOffsetLeft = card.offsetLeft;
        const cardWidth = card.clientWidth;
        
        // Calculate center of card and center of viewport relative to track
        const cardCenter = cardOffsetLeft + cardWidth / 2;
        const viewportCenter = trackScrollLeft + trackWidth / 2;
        
        // Relative distance from center of viewport (-1.0 to 1.0)
        const maxDist = trackWidth / 2 || 200;
        const diff = cardCenter - viewportCenter;
        const relX = diff / maxDist;
        const distFromCenter = Math.abs(relX);
        
        if (distFromCenter < closestDist) {
          closestDist = distFromCenter;
          closestIndex = index;
        }
        
        // A. Scale: active card in center is slightly larger
        const scale = 1.05 - Math.min(0.12, distFromCenter * 0.22);
        
        // B. 3D Rotation: tilt rotation around Y and Z axis
        const rotateY = relX * -18; // 3D tilt facing scroll direction
        const rotateZ = relX * 3;
        
        // C. Alternating Stagger (Wave wiggles)
        const staggerSign = index % 2 === 0 ? 1 : -1;
        const staggerBase = 12; // vertical stagger offset in px
        const yOffset = staggerSign * staggerBase + (distFromCenter * staggerSign * -4);
        
        // D. Image Parallax
        const img = card.querySelector('.project-visual-mobile img');
        if (img) {
          const imgTranslate = relX * -25; // horizontal parallax shift
          img.style.transform = `scale(1.2) translateX(${imgTranslate}px)`;
        }
        
        // E. Focus Opacity
        const opacity = 1.0 - Math.min(0.5, distFromCenter * 0.7);
        
        // F. Custom Ambient Accent Glow & Border
        const accentColor = card.getAttribute('data-accent') || '#ffffff';
        let boxShadow = '';
        let borderColor = '';
        
        if (distFromCenter < 0.35) {
          const glowAlpha = Math.floor((1.0 - distFromCenter * 2.85) * 100);
          const hexAlpha = Math.max(0, Math.min(255, Math.floor(glowAlpha * 2.55))).toString(16).padStart(2, '0');
          boxShadow = `0 16px 40px -10px ${accentColor}${hexAlpha}`;
          borderColor = accentColor;
        } else {
          boxShadow = '0 4px 20px -8px rgba(0,0,0,0.5)';
          borderColor = 'rgba(255,255,255,0.08)';
        }
        
        card.style.transform = `translateY(${yOffset}px) scale(${scale}) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg)`;
        card.style.opacity = opacity;
        card.style.boxShadow = '';
        card.style.borderColor = '';
        
        const imgWrapper = card.querySelector('.project-image-wrapper');
        if (imgWrapper) {
          imgWrapper.style.boxShadow = boxShadow;
          imgWrapper.style.borderColor = borderColor;
        }
      });
      
      // Update pagination dots
      const dots = document.querySelectorAll('.progress-dot');
      dots.forEach((dot, idx) => {
        if (idx === closestIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      
      currentTranslate = 0;
      requestAnimationFrame(animateProjectsHorizontal);
      return;
    }
    
    // Desktop: calculate scroll metrics
    const rect = projectsSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Scroll progress pct (0 at top, 1 at bottom of projects section)
    const scrollStart = rect.top + window.scrollY;
    const scrollDistance = rect.height - viewportHeight;
    const currentScroll = window.scrollY - scrollStart;
    
    // Normalized percentage [0, 1]
    const pct = Math.max(0, Math.min(1, currentScroll / scrollDistance));
    
    // Total translation range
    const trackWidth = horizontalTrack.scrollWidth;
    const maxTranslate = Math.max(0, trackWidth - window.innerWidth);
    const targetTranslate = pct * maxTranslate;
    
    // Lerp translation for smooth luxury inertia
    currentTranslate += (targetTranslate - currentTranslate) * 0.08;
    horizontalTrack.style.transform = `translateX(${-currentTranslate}px)`;
    
    // Alternating Wave and Stagger motion for each card
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const cardCenter = cardRect.left + cardWidth / 2;
      
      // Relative distance from center of screen (-1.0 to 1.0)
      const relX = cardCenter / window.innerWidth;
      const distFromCenter = Math.abs(relX - 0.5);
      
      // A. Scale: active card in center is slightly larger
      const scale = 1.03 - Math.min(0.08, distFromCenter * 0.18);
      
      // B. Rotation: tilts away from the direction it moves
      const rotate = (relX - 0.5) * -6;
      
      // C. Alternating Stagger (Wave wiggles)
      const staggerSign = index % 2 === 0 ? 1 : -1;
      const staggerBase = 60; // Max vertical offset in px
      const yOffset = staggerSign * staggerBase * Math.min(1, distFromCenter * 2.0);
      
      // D. Image Parallax
      const img = card.querySelector('.project-visual-desktop img');
      if (img) {
        const imgTranslate = (relX - 0.5) * -50;
        img.style.transform = `scale(1.2) translateX(${imgTranslate}px)`;
      }
      
      // E. Focus Opacity
      const opacity = 1.0 - Math.min(0.45, distFromCenter * 0.7);
      
      card.style.transform = `translateY(${yOffset}px) scale(${scale}) rotate(${rotate}deg)`;
      card.style.opacity = opacity;
      card.style.boxShadow = '';
      card.style.borderColor = '';
      
      const imgWrapper = card.querySelector('.project-image-wrapper');
      if (imgWrapper) {
        imgWrapper.style.boxShadow = '';
        imgWrapper.style.borderColor = '';
      }
    });
    
    requestAnimationFrame(animateProjectsHorizontal);
  };
  
  // Start horizontal projects animation loop
  animateProjectsHorizontal();

  // --- 15. Scroll-driven Elastic Motion (Main Page & Modal) ---
  let elasticLastScrollY = window.scrollY;
  let elasticLastModalScrollTop = 0;
  let mainVelocity = 0;
  let modalVelocity = 0;
  let smoothedMainVelocity = 0;
  let smoothedModalVelocity = 0;

  const elasticLoop = () => {
    // A. Main page scroll velocity
    const currentScrollY = window.scrollY;
    const mainDiff = currentScrollY - elasticLastScrollY;
    mainVelocity = mainDiff;
    elasticLastScrollY = currentScrollY;
    
    smoothedMainVelocity += (mainVelocity - smoothedMainVelocity) * 0.08;
    const cappedMain = Math.max(-100, Math.min(100, smoothedMainVelocity));
    document.documentElement.style.setProperty('--scroll-velocity', cappedMain.toFixed(2));

    // B. Modal scroll velocity
    const modalWrapper = document.querySelector('.modal-scroll-wrapper');
    if (modalWrapper) {
      const modalActive = modalWrapper.closest('.case-study-modal').classList.contains('active');
      if (modalActive) {
        const currentScrollTop = modalWrapper.scrollTop;
        const modalDiff = currentScrollTop - elasticLastModalScrollTop;
        modalVelocity = modalDiff;
        elasticLastModalScrollTop = currentScrollTop;
      } else {
        modalVelocity = 0;
        elasticLastModalScrollTop = 0;
      }
    } else {
      modalVelocity = 0;
      elasticLastModalScrollTop = 0;
    }
    
    smoothedModalVelocity += (modalVelocity - smoothedModalVelocity) * 0.08;
    const cappedModal = Math.max(-100, Math.min(100, smoothedModalVelocity));
    document.documentElement.style.setProperty('--modal-scroll-velocity', cappedModal.toFixed(2));

    requestAnimationFrame(elasticLoop);
  };
  
  requestAnimationFrame(elasticLoop);

  // Initial bindings
  bindCursorInteractive();
  bindTouchActiveEvents();
});
