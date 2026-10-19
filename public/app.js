// ==========================================================================
// CrackEx Network - Official Frontend Application
// Features:
// 1. 1-Click Server IP Copy (mc.crackex.xyz) with Animated Toast Feedback
// 2. 3 Core Game Modes: Survival, Lifesteal, More Coming Soon
// 3. Game Mode Details Modals with In-Game Commands
// 4. Settings Modal for Server IP Management
// ==========================================================================

class CrackExNetworkApp {
  constructor() {
    // Server Address
    this.serverIp = 'mc.crackex.xyz';

    // Mode details data dictionary for the 3 game modes
    this.modeDetails = {
      survival: {
        title: 'Survival',
        badge: 'COMMUNITY',
        icon: '🌲',
        command: '/server survival',
        desc: 'Enhanced semi-vanilla survival featuring grief prevention, player warps, land claiming, custom world generation, and an active player-run economy.'
      },
      lifesteal: {
        title: 'Lifesteal',
        badge: 'HARDCORE PVP',
        icon: '❤️‍🔥',
        command: '/server lifesteal',
        desc: 'The ultimate high-stakes PvP survival. Slay opponents to steal their maximum heart capacity. Form clans, build concealed bases, and craft heart beacons.'
      },
      comingsoon: {
        title: 'More Coming Soon',
        badge: 'IN DEVELOPMENT',
        icon: '🔮',
        command: 'Coming Soon',
        desc: 'New competitive minigames, tournament arenas, and community-requested modes are currently in development. Join our Discord at crackex.xyz/discord to suggest your favorite mode!'
      }
    };

    // Cache elements and bind events
    this.cacheDOMElements();
    this.bindEvents();
  }

  cacheDOMElements() {
    // Navigation elements
    this.navCopyIpBtn = document.getElementById('navCopyIpBtn');
    this.apiSettingsBtn = document.getElementById('apiSettingsBtn');

    // Hero Section elements
    this.heroServerIpDisplay = document.getElementById('heroServerIpDisplay');
    this.heroCopyIpBtn = document.getElementById('heroCopyIpBtn');
    this.heroCopyBtnText = document.getElementById('heroCopyBtnText');
    this.heroJoinServerBtn = document.getElementById('heroJoinServerBtn');

    // Game Mode details buttons & modal
    this.modeDetailsBtns = document.querySelectorAll('.mode-details-btn');
    this.modeDetailModal = document.getElementById('modeDetailModal');
    this.closeModeDetailBtn = document.getElementById('closeModeDetailBtn');
    this.modeModalIcon = document.getElementById('modeModalIcon');
    this.modeModalBadge = document.getElementById('modeModalBadge');
    this.modeModalTitle = document.getElementById('modeModalTitle');
    this.modeModalDesc = document.getElementById('modeModalDesc');
    this.modeModalCommand = document.getElementById('modeModalCommand');
    this.copyModeCmdBtn = document.getElementById('copyModeCmdBtn');
    this.modalJoinServerBtn = document.getElementById('modalJoinServerBtn');

    // Settings Modal elements
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.settingsCurrentAddress = document.getElementById('settingsCurrentAddress');
    this.serverConfigForm = document.getElementById('serverConfigForm');
    this.serverIpInput = document.getElementById('serverIpInput');
    this.saveServerIpBtn = document.getElementById('saveServerIpBtn');
    this.settingsAlert = document.getElementById('settingsAlert');

    // Toast Notification
    this.toastNotification = document.getElementById('toastNotification');
    this.toastMessage = document.getElementById('toastMessage');

    // Additional Copy Buttons
    this.joinStepCopyBtns = document.querySelectorAll('.join-step-copy-btn');
    this.bannerCopyIpBtn = document.getElementById('bannerCopyIpBtn');
  }

  bindEvents() {
    // 1. Copy IP actions
    const handleCopyIp = () => this.copyToClipboard(this.serverIp, 'Server IP: mc.crackex.xyz copied to clipboard!');
    if (this.navCopyIpBtn) this.navCopyIpBtn.addEventListener('click', handleCopyIp);
    if (this.heroCopyIpBtn) {
      this.heroCopyIpBtn.addEventListener('click', () => {
        this.copyToClipboard(this.serverIp, 'Server IP: mc.crackex.xyz copied to clipboard!');
        if (this.heroCopyBtnText) {
          const original = this.heroCopyBtnText.textContent;
          this.heroCopyBtnText.textContent = 'COPIED TO CLIPBOARD!';
          setTimeout(() => {
            this.heroCopyBtnText.textContent = original;
          }, 2000);
        }
      });
    }
    if (this.bannerCopyIpBtn) this.bannerCopyIpBtn.addEventListener('click', handleCopyIp);
    this.joinStepCopyBtns.forEach(btn => btn.addEventListener('click', handleCopyIp));

    // 2. Join Server Action (Scroll to guide & copy)
    const handleJoinServer = () => {
      this.copyToClipboard(this.serverIp, 'Server IP: mc.crackex.xyz copied! Paste into Minecraft Multiplayer.');
      const joinSection = document.getElementById('howToJoinSection');
      if (joinSection) {
        joinSection.scrollIntoView({ behavior: 'smooth' });
      }
      if (this.modeDetailModal && !this.modeDetailModal.classList.contains('hidden')) {
        this.closeModeDetailModal();
      }
    };
    if (this.heroJoinServerBtn) this.heroJoinServerBtn.addEventListener('click', handleJoinServer);
    if (this.modalJoinServerBtn) this.modalJoinServerBtn.addEventListener('click', handleJoinServer);

    // 3. Game Mode Info Modals
    this.modeDetailsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const modeKey = btn.dataset.mode;
        this.openModeDetailModal(modeKey);
      });
    });
    if (this.closeModeDetailBtn) {
      this.closeModeDetailBtn.addEventListener('click', () => this.closeModeDetailModal());
    }
    if (this.modeDetailModal) {
      this.modeDetailModal.addEventListener('click', (e) => {
        if (e.target === this.modeDetailModal) this.closeModeDetailModal();
      });
    }
    if (this.copyModeCmdBtn) {
      this.copyModeCmdBtn.addEventListener('click', () => {
        if (this.modeModalCommand) {
          this.copyToClipboard(this.modeModalCommand.textContent.trim(), 'Jump command copied to clipboard!');
        }
      });
    }

    // 4. Settings Modal Controls
    if (this.apiSettingsBtn) {
      this.apiSettingsBtn.addEventListener('click', () => this.openSettingsModal());
    }
    if (this.closeSettingsBtn) {
      this.closeSettingsBtn.addEventListener('click', () => this.closeSettingsModal());
    }
    if (this.settingsModal) {
      this.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.settingsModal) this.closeSettingsModal();
      });
    }

    // Server Config Form Submit
    if (this.serverConfigForm) {
      this.serverConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveServerConfig();
      });
    }

    // Global Key Listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.settingsModal && !this.settingsModal.classList.contains('hidden')) {
          this.closeSettingsModal();
        } else if (this.modeDetailModal && !this.modeDetailModal.classList.contains('hidden')) {
          this.closeModeDetailModal();
        }
      }
    });
  }

  // ==========================================================================
  // CLIPBOARD & TOAST NOTIFICATION
  // ==========================================================================
  copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    if (!navigator.clipboard) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast(successMsg);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast(successMsg);
    }).catch(() => {
      this.showToast(`Server IP: ${text}`);
    });
  }

  showToast(message) {
    if (!this.toastNotification || !this.toastMessage) return;
    this.toastMessage.textContent = message;
    this.toastNotification.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastNotification.classList.remove('show');
    }, 3200);
  }

  // ==========================================================================
  // GAME MODE DETAILS MODAL
  // ==========================================================================
  openModeDetailModal(modeKey) {
    const mode = this.modeDetails[modeKey];
    if (!mode || !this.modeDetailModal) return;

    if (this.modeModalIcon) this.modeModalIcon.textContent = mode.icon;
    if (this.modeModalTitle) this.modeModalTitle.textContent = mode.title;
    if (this.modeModalBadge) this.modeModalBadge.textContent = mode.badge;
    if (this.modeModalDesc) this.modeModalDesc.textContent = mode.desc;
    if (this.modeModalCommand) this.modeModalCommand.textContent = mode.command;

    this.modeDetailModal.classList.remove('hidden');
  }

  closeModeDetailModal() {
    if (this.modeDetailModal) {
      this.modeDetailModal.classList.add('hidden');
    }
  }

  // ==========================================================================
  // SETTINGS MODAL
  // ==========================================================================
  openSettingsModal() {
    if (!this.settingsModal) return;
    if (this.serverIpInput) this.serverIpInput.value = this.serverIp;
    if (this.settingsAlert) this.settingsAlert.classList.add('hidden');
    this.settingsModal.classList.remove('hidden');
  }

  closeSettingsModal() {
    if (!this.settingsModal) return;
    this.settingsModal.classList.add('hidden');
  }

  async handleSaveServerConfig() {
    const serverIp = this.serverIpInput ? this.serverIpInput.value.trim() : '';

    if (this.saveServerIpBtn) {
      this.saveServerIpBtn.disabled = true;
      this.saveServerIpBtn.textContent = 'Saving...';
    }

    try {
      const res = await fetch('/api/config/server-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverIp })
      });
      const data = await res.json();

      if (data.success) {
        if (serverIp) {
          this.serverIp = serverIp;
          if (this.heroServerIpDisplay) this.heroServerIpDisplay.textContent = serverIp;
          if (this.settingsCurrentAddress) this.settingsCurrentAddress.textContent = serverIp;
        }
        this.showSettingsAlert('Configuration saved!', 'success');
      } else {
        this.showSettingsAlert(data.message || 'Failed to save configuration.', 'error');
      }
    } catch (err) {
      this.showSettingsAlert(`Error: ${err.message}`, 'error');
    } finally {
      if (this.saveServerIpBtn) {
        this.saveServerIpBtn.disabled = false;
        this.saveServerIpBtn.textContent = 'Save Address';
      }
    }
  }

  showSettingsAlert(message, type = 'info') {
    if (!this.settingsAlert) return;
    this.settingsAlert.textContent = message;
    this.settingsAlert.className = `mt-4 p-3 rounded-xl text-xs ${
      type === 'success' 
        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
        : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
    }`;
    this.settingsAlert.classList.remove('hidden');
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.crackexApp = new CrackExNetworkApp();
});
