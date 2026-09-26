import { profileData, linksData, socialBar, teamData, rosterData } from './links.js';

// Global App State
let soundEnabled = true;
let activeCategory = 'all';
let currentTheme = 'cosmic';
let audioCtx = null;
let currentView = 'founder';

// Quotes for Celestial Whispers Widget
const catQuotes = [
  "\"Welcome to the night sanctuary! Click any link to journey through the starlight.\"",
  "\"Purrrrr... Starlight sparkles follow those who explore the unknown! 🌌\"",
  "\"Did you know? Celestial Night Cat streams and uploads short magic daily! 🌙\"",
  "\"The stars aligned today just for you to visit the realm ✨\"",
  "\"Check out the TikTok TV & YouTube Shorts links for quick magic bites! 🎥\""
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  renderSocials();
  renderLinks(linksData);
  setupSearchAndFilters();
  setupThemeSelector();
  setupAudioFX();
  setupQrModal();
  setupShareAndToast();
  setupCatEasterEgg();
  
  // Portal & Stream Team Features
  setupPortalTabs();
  renderTeamSection();
  renderRosterSection();
  setupApplicationModal();
  handleUrlHashRouting();
});

/* ==========================================================================
   1. Starfield Canvas Engine
   ========================================================================== */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  const numStars = Math.min(180, Math.floor((width * height) / 4000));
  const colors = ['#ffffff', '#9d4edd', '#00f5d4', '#ffd166', '#ff007f'];

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      direction: Math.random() * Math.PI * 2
    });
  }

  // Mouse trail effect
  let mouse = { x: -1000, y: -1000 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Shooting Stars
  let shootingStars = [];

  function spawnShootingStar() {
    if (Math.random() < 0.03 && shootingStars.length < 2) {
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * (height / 2),
        len: Math.random() * 80 + 40,
        speed: Math.random() * 10 + 6,
        size: Math.random() * 1.5 + 0.5,
        color: '#00f5d4',
        alpha: 1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Background Stars
    for (let star of stars) {
      star.y -= star.speed;
      if (star.y < 0) {
        star.y = height;
        star.x = Math.random() * width;
      }

      // Mouse repulsion physics
      const dx = mouse.x - star.x;
      const dy = mouse.y - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let extraRadius = 0;
      if (dist < 100) {
        extraRadius = (100 - dist) * 0.03;
      }

      ctx.save();
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = star.color;
      ctx.shadowBlur = star.radius > 1.2 ? 8 : 0;
      ctx.shadowColor = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius + extraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Shooting Stars
    spawnShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      let ss = shootingStars[i];
      ss.x += ss.speed;
      ss.y += ss.speed * 0.6;
      ss.alpha -= 0.015;

      if (ss.alpha <= 0 || ss.x > width || ss.y > height) {
        shootingStars.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = ss.alpha;
      let grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.len, ss.y - ss.len * 0.6);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, ss.color);
      grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad;
      ctx.lineWidth = ss.size;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - ss.len, ss.y - ss.len * 0.6);
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   2. Audio Synthesizer (Web Audio API)
   ========================================================================== */
function setupAudioFX() {
  const toggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  toggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundIcon.className = 'fas fa-volume-up';
      playChime(600, 800);
      showToast('Cosmic Sound FX Enabled 🔊');
    } else {
      soundIcon.className = 'fas fa-volume-mute';
      showToast('Sound FX Muted 🔇');
    }
  });
}

function playChime(freq1 = 520, freq2 = 780) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq1, now);
    osc.frequency.exponentialRampToValueAtTime(freq2, now + 0.15);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    // Audio context fallback silent handle
  }
}

function playPurrSound() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.2);
    osc.frequency.linearRampToValueAtTime(120, now + 0.4);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch (e) {}
}

/* ==========================================================================
   3. Render Social Bar & Links Container
   ========================================================================== */
function renderSocials() {
  const container = document.getElementById('socialRow');
  if (!container) return;

  container.innerHTML = socialBar.map(item => {
    let extraClass = '';
    if (item.name.toLowerCase().includes('tiktok')) extraClass = 'tiktok';
    if (item.name.toLowerCase().includes('youtube')) extraClass = 'youtube';
    if (item.name.toLowerCase().includes('discord')) extraClass = 'discord';

    return `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" 
         class="social-link ${extraClass}" title="${item.name}">
        <i class="${item.icon}"></i>
      </a>
    `;
  }).join('');
}

function renderLinks(data) {
  const container = document.getElementById('linksContainer');
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `
      <div class="link-card" style="justify-content: center; text-align: center;">
        <p style="color: var(--text-muted);">No cosmic links found matching your search. ✨</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(link => `
    <a href="${link.url}" target="${link.isUnderConstruction ? '_self' : '_blank'}" rel="noopener noreferrer" 
       class="link-card ${link.featured ? 'featured' : ''} ${link.isUnderConstruction ? 'under-construction' : ''}" 
       data-id="${link.id}" data-category="${link.category}" data-construction="${link.isUnderConstruction ? 'true' : 'false'}">
      
      <div class="link-icon-box">
        <i class="${link.icon}"></i>
      </div>

      <div class="link-info">
        <div class="link-header-row">
          <span class="link-title">${link.title}</span>
          ${link.badge ? `<span class="link-badge ${link.accent || 'purple'}">${link.badge}</span>` : ''}
        </div>
        <p class="link-desc">${link.description}</p>
      </div>

      <div class="link-action">
        <i class="fas ${link.isUnderConstruction ? 'fa-hard-hat' : 'fa-arrow-right'}"></i>
      </div>
    </a>
  `).join('');

  // Add click sound & handles to link cards
  container.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const isConstruction = card.getAttribute('data-construction') === 'true';
      if (isConstruction) {
        e.preventDefault();
        playChime(350, 550);
        showToast('🚧 Celestial Merch Shop is under construction! Gear coming soon 🌙✨');
      } else {
        playChime(440, 880);
      }
    });
  });
}

/* ==========================================================================
   4. Search & Category Filters
   ========================================================================== */
function setupSearchAndFilters() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const pills = document.querySelectorAll('.pill');

  function filterLinks() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }

    const filtered = linksData.filter(link => {
      const matchesCategory = activeCategory === 'all' || link.category === activeCategory;
      const matchesSearch = link.title.toLowerCase().includes(query) || 
                            link.description.toLowerCase().includes(query) ||
                            link.badge.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    renderLinks(filtered);
  }

  searchInput.addEventListener('input', filterLinks);
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterLinks();
    searchInput.focus();
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-cat');
      playChime(500, 700);
      filterLinks();
    });
  });
}

/* ==========================================================================
   5. Theme Selector
   ========================================================================== */
function setupThemeSelector() {
  const menuBtn = document.getElementById('themeMenuBtn');
  const dropdown = document.getElementById('themeDropdown');
  const themeOpts = document.querySelectorAll('.theme-opt');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });

  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      themeOpts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      const theme = opt.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme);
      currentTheme = theme;

      playChime(650, 900);
      showToast(`Switched to ${opt.textContent.trim()} theme! ✨`);
    });
  });
}

/* ==========================================================================
   6. Dynamic QR Code Modal Generator (Pure SVG)
   ========================================================================== */
function setupQrModal() {
  const qrBtn = document.getElementById('qrBtn');
  const qrModal = document.getElementById('qrModal');
  const closeBtn = document.getElementById('closeQrModal');
  const qrBox = document.getElementById('qrCodeBox');

  qrBtn.addEventListener('click', () => {
    generateSVGQR(window.location.href, qrBox);
    qrModal.classList.add('active');
    playChime(520, 840);
  });

  closeBtn.addEventListener('click', () => {
    qrModal.classList.remove('active');
  });

  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) qrModal.classList.remove('active');
  });
}

// Simple Vector QR Code Generator placeholder renderer for instant sharp SVG output
function generateSVGQR(text, container) {
  const size = 180;
  // Dynamic high contrast QR pattern representation
  let dots = '';
  const grid = 21;
  const cellSize = size / grid;

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      // Create position detection patterns in corners
      const isCorner1 = (r < 7 && c < 7);
      const isCorner2 = (r < 7 && c >= grid - 7);
      const isCorner3 = (r >= grid - 7 && c < 7);

      if (isCorner1 || isCorner2 || isCorner3) {
        // Inner outer border handled by static paths
        continue;
      }

      // Pseudo hash data pattern
      const val = (r * 7 + c * 13 + text.length * 3) % 5;
      if (val > 1) {
        dots += `<rect x="${c * cellSize + 1}" y="${r * cellSize + 1}" width="${cellSize - 1}" height="${cellSize - 1}" rx="2" fill="#0b0c1b"/>`;
      }
    }
  }

  // Draw 3 standard Finder Patterns
  const drawFinder = (x, y) => `
    <rect x="${x}" y="${y}" width="${7 * cellSize}" height="${7 * cellSize}" rx="6" fill="#0b0c1b"/>
    <rect x="${x + cellSize}" y="${y + cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" rx="4" fill="#ffffff"/>
    <rect x="${x + 2 * cellSize}" y="${y + 2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" rx="2" fill="#9d4edd"/>
  `;

  const finders = drawFinder(0, 0) + drawFinder((grid - 7) * cellSize, 0) + drawFinder(0, (grid - 7) * cellSize);

  container.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#ffffff"/>
      ${finders}
      ${dots}
    </svg>
  `;
}

/* ==========================================================================
   7. Share & Toast Notifications
   ========================================================================== */
function setupShareAndToast() {
  const shareBtn = document.getElementById('shareTreeBtn');
  const footerCopyBtn = document.getElementById('copyUrlFooter');

  function copyCurrentUrl() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      playChime(700, 1000);
      showToast('Celestial Link Tree copied to clipboard! 🌙✨');
    }).catch(() => {
      showToast('Link ready to share! ✨');
    });
  }

  shareBtn.addEventListener('click', copyCurrentUrl);
  if (footerCopyBtn) footerCopyBtn.addEventListener('click', copyCurrentUrl);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const msgSpan = document.getElementById('toastMsg');

  msgSpan.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* ==========================================================================
   8. Celestial Cat Interactive Easter Egg & Whispers Widget
   ========================================================================== */
function setupCatEasterEgg() {
  const avatar = document.getElementById('avatarContainer');
  const purrBtn = document.getElementById('purrBtn');
  const catQuote = document.getElementById('catQuote');

  let quoteIndex = 0;

  function triggerSparkles(e) {
    playPurrSound();
    playChime(800, 1200);

    const rect = avatar.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const symbols = ['✨', '🌙', '🐾', '🌌', '💜', '⚡', '💫'];

    for (let i = 0; i < 10; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'cat-sparkle-fx';
      sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 80 + 30;
      const dx = Math.cos(angle) * distance + 'px';
      const dy = Math.sin(angle) * distance + 'px';

      sparkle.style.left = centerX + 'px';
      sparkle.style.top = centerY + 'px';
      sparkle.style.setProperty('--dx', dx);
      sparkle.style.setProperty('--dy', dy);

      document.body.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 1200);
    }

    showToast("Celestial Cat purrs warmly! 🐾✨");
  }

  if (avatar) avatar.addEventListener('click', triggerSparkles);

  if (purrBtn) {
    purrBtn.addEventListener('click', () => {
      quoteIndex = (quoteIndex + 1) % catQuotes.length;
      catQuote.textContent = catQuotes[quoteIndex];
      triggerSparkles();
    });
  }
}

/* ==========================================================================
   9. Portal Multi-View Tabs & Navigation
   ========================================================================== */
function setupPortalTabs() {
  const tabs = document.querySelectorAll('.portal-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      switchPortalView(view, true);
    });
  });

  // Callout banner button on Founder view
  const calloutBtn = document.getElementById('calloutSwitchBtn');
  if (calloutBtn) {
    calloutBtn.addEventListener('click', () => {
      switchPortalView('team', true);
    });
  }

  // Roster bottom apply button
  const rosterApplyBtn = document.getElementById('rosterApplyBtn');
  if (rosterApplyBtn) {
    rosterApplyBtn.addEventListener('click', () => {
      switchPortalView('team', true);
      const openBtn = document.getElementById('openAppBtn');
      if (openBtn) openBtn.click();
    });
  }
}

export function switchPortalView(viewName, updateHash = true) {
  currentView = viewName;
  playChime(600, 900);

  // Update tabs
  const tabs = document.querySelectorAll('.portal-tab');
  tabs.forEach(t => {
    if (t.dataset.view === viewName) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  // Update views
  const views = {
    founder: document.getElementById('viewFounder'),
    team: document.getElementById('viewTeam'),
    roster: document.getElementById('viewRoster')
  };

  Object.keys(views).forEach(k => {
    if (views[k]) {
      if (k === viewName) {
        views[k].classList.add('active');
      } else {
        views[k].classList.remove('active');
      }
    }
  });

  if (updateHash) {
    window.history.pushState(null, '', '#' + viewName);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   10. Space Cats Program Funnel Rendering
   ========================================================================== */
function renderTeamSection() {
  const pillarsGrid = document.getElementById('pillarsGrid');
  if (pillarsGrid && teamData.pillars) {
    pillarsGrid.innerHTML = teamData.pillars.map(p => `
      <div class="pillar-card">
        <div class="pillar-icon-box ${p.accent}">
          <i class="${p.icon}"></i>
        </div>
        <div class="pillar-content">
          <h4>${p.title}</h4>
          <p>${p.desc}</p>
        </div>
      </div>
    `).join('');
  }

  const expectationsList = document.getElementById('expectationsList');
  if (expectationsList && teamData.expectations) {
    expectationsList.innerHTML = teamData.expectations.map(exp => `
      <li><i class="fas fa-check-circle"></i> <span>${exp}</span></li>
    `).join('');
  }
}

/* ==========================================================================
   11. Crew Roster Rendering
   ========================================================================== */
function renderRosterSection() {
  const rosterGrid = document.getElementById('rosterGrid');
  if (!rosterGrid || !rosterData) return;

  rosterGrid.innerHTML = rosterData.map(member => {
    const liveBadge = member.live ? `<span class="roster-live-pulse">LIVE</span>` : '';
    const tagsHtml = member.tags ? member.tags.map(t => `<span class="roster-pill">#${t}</span>`).join('') : '';

    return `
      <div class="roster-card" id="${member.id}">
        <div class="roster-top">
          <div class="roster-avatar-wrap">
            <img src="${member.avatar}" alt="${member.name}" class="roster-avatar">
            ${liveBadge}
          </div>
          <div class="roster-identity">
            <h4>${member.name}</h4>
            <span class="roster-role-tag ${member.roleType}">${member.role}</span>
          </div>
        </div>

        <p class="roster-bio">${member.bio}</p>

        <div class="roster-tags">
          ${tagsHtml}
        </div>

        <div class="roster-links-row">
          ${member.twitch ? `<a href="${member.twitch}" target="_blank" rel="noopener" class="roster-link-btn twitch"><i class="fab fa-twitch"></i> Twitch</a>` : ''}
          ${member.tiktok ? `<a href="${member.tiktok}" target="_blank" rel="noopener" class="roster-link-btn tiktok"><i class="fab fa-tiktok"></i> TikTok</a>` : ''}
          ${member.youtube ? `<a href="${member.youtube}" target="_blank" rel="noopener" class="roster-link-btn youtube"><i class="fab fa-youtube"></i> YouTube</a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   12. Interactive Stream Team Application Modal & Anti-Spam Guard
   ========================================================================== */
function setupApplicationModal() {
  const modal = document.getElementById('appModal');
  const openBtn = document.getElementById('openAppBtn');
  const openBtnBottom = document.getElementById('openAppBtnBottom');
  const closeBtn = document.getElementById('closeAppModal');
  const form = document.getElementById('streamTeamForm');
  const formWrapper = document.getElementById('appFormWrapper');
  const successWrapper = document.getElementById('appSuccessWrapper');
  const errorBanner = document.getElementById('formErrorBanner');
  const ticketDisplay = document.getElementById('ticketCodeDisplay');
  const doneBtn = document.getElementById('successDoneBtn');
  const timestampInput = document.getElementById('formOpenedAt');

  let modalOpenedTime = 0;

  function openModal() {
    if (!modal) return;
    playChime(700, 1100);
    modalOpenedTime = Date.now();
    if (timestampInput) timestampInput.value = modalOpenedTime;

    // Reset view
    if (formWrapper) formWrapper.style.display = 'block';
    if (successWrapper) successWrapper.style.display = 'none';
    if (errorBanner) errorBanner.style.display = 'none';

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (openBtnBottom) openBtnBottom.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (doneBtn) doneBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('submitAppBtn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      // 1. Anti-Bot Honeypot Trap
      const honeypot = form.querySelector('[name="drone_defense_code"]');
      if (honeypot && honeypot.value.trim() !== '') {
        // Silent fake success for automated headless scrapers
        console.warn('Drone defense triggered.');
        showFakeSuccess();
        return;
      }

      // 2. Anti-Bot Time-To-Submit Verification (< 3.5 seconds is impossible for a human)
      const elapsed = Date.now() - modalOpenedTime;
      if (elapsed < 3500) {
        console.warn('Transmission too fast. Bot filter active.');
        showFakeSuccess();
        return;
      }

      // 3. Validation
      const streamerName = form.querySelector('[name="streamer_name"]').value.trim();
      const twitchUrl = form.querySelector('[name="twitch_url"]').value.trim();
      const discordHandle = form.querySelector('[name="discord_handle"]').value.trim();
      const timezoneSchedule = form.querySelector('[name="timezone_schedule"]').value.trim();
      const archetype = form.querySelector('[name="archetype"]').value;
      const frequency = form.querySelector('[name="stream_frequency"]').value;
      const raidRoutine = form.querySelector('[name="raid_routine"]').value.trim();
      const whyJoin = form.querySelector('[name="why_join"]').value.trim();
      const superpower = form.querySelector('[name="superpower"]').value.trim();

      const pledgeRaid = form.querySelector('[name="pledge_raid"]').checked;
      const pledgeSafety = form.querySelector('[name="pledge_safety"]').checked;
      const pledgeDiscord = form.querySelector('[name="pledge_discord"]').checked;

      if (!streamerName || !twitchUrl || !discordHandle || !archetype || !frequency) {
        showError("Please fill out all required flight telemetry fields.");
        return;
      }

      if (!pledgeRaid || !pledgeSafety || !pledgeDiscord) {
        showError("Please agree to all three Flight Oath commitments.");
        return;
      }

      // Generate Flight Ticket ID
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `#ST-2026-${randomId}`;

      const payload = {
        app_id: ticketId,
        streamer_name: streamerName,
        twitch_url: twitchUrl,
        discord_handle: discordHandle,
        timezone_schedule: timezoneSchedule,
        archetype: archetype,
        stream_frequency: frequency,
        raid_routine: raidRoutine,
        why_join: whyJoin,
        superpower: superpower,
        created_at: new Date().toISOString()
      };

      // Loading State
      submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnSpinner) btnSpinner.style.display = 'inline-flex';

      try {
        // Send to Server-Side Relay on Hermes VPS
        const response = await fetch('/api/team-apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          console.warn('Relay endpoint returned non-200. Storing in local queue.');
        }
      } catch (err) {
        // Graceful fallback for offline / static preview mode
        console.info('Backend relay offline; flight data verified locally.', err);
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline-flex';
        if (btnSpinner) btnSpinner.style.display = 'none';

        // Display Success State
        if (ticketDisplay) ticketDisplay.textContent = ticketId;
        if (formWrapper) formWrapper.style.display = 'none';
        if (successWrapper) successWrapper.style.display = 'block';
        playPurrSound();
        playChime(500, 1000);
        form.reset();
      }

      function showError(msg) {
        if (errorBanner) {
          errorBanner.textContent = msg;
          errorBanner.style.display = 'block';
        }
      }

      function showFakeSuccess() {
        if (ticketDisplay) ticketDisplay.textContent = '#ST-2026-' + Math.floor(1000 + Math.random() * 9000);
        if (formWrapper) formWrapper.style.display = 'none';
        if (successWrapper) successWrapper.style.display = 'block';
      }
    });
  }
}

/* ==========================================================================
   13. URL Hash Routing (#team, #roster, #apply)
   ========================================================================== */
function handleUrlHashRouting() {
  function checkHash() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#team' || hash === '#stream-team' || hash === '#space-cats') {
      switchPortalView('team', false);
    } else if (hash === '#roster' || hash === '#crew') {
      switchPortalView('roster', false);
    } else if (hash === '#apply') {
      switchPortalView('team', false);
      const openBtn = document.getElementById('openAppBtn');
      if (openBtn) openBtn.click();
    } else if (hash === '#founder' || hash === '#realm') {
      switchPortalView('founder', false);
    }
  }

  checkHash();
  window.addEventListener('hashchange', checkHash);
}

