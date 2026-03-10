/* ==========================================
   חשבונאי - Main Application Logic
   Navigation, scoring, sound, localStorage,
   confetti, and all screen management.
   ========================================== */

// ==========================================
// APP STATE
// ==========================================
const App = {
    // Player profile (saved to localStorage separately)
    playerName: '',
    playerGender: '', // 'boy' or 'girl'
    selectedGender: '', // temp during registration

    // Persistent state (saved to localStorage)
    state: {
        score: 0,
        modulesProgress: {},   // { moduleId: { completed, exercisesDone, quizDone, quizScore, correctFirst, correctSecond, totalAttempted } }
        milestonesReached: [],  // [100, 300, ...]
        totalTimeSeconds: 0,
        sessionStart: null
    },

    // Combined module list
    allModules: [],

    // Transient state (current session only)
    currentModule: null,
    currentExercise: null,
    currentExerciseIndex: 0,
    exercises: [],
    tutorialStep: 0,
    isQuizMode: false,
    quizCorrectCount: 0,
    quizFirstTryCount: 0,
    currentAttempt: 0,  // 0 = first try, 1 = second try
    pendingMilestones: [],
    timeInterval: null,

    // Accessibility state
    a11y: {
        fontSize: 'medium',    // 'small', 'medium', 'large'
        highContrast: false,
        stopAnimations: false,
        focusHighlight: false,
        panelOpen: false
    },

    // ==========================================
    // INITIALIZATION
    // ==========================================
    init() {
        this.allModules = [...MODULES, ...(typeof LANGUAGE_MODULES !== 'undefined' ? LANGUAGE_MODULES : [])];
        this.loadPlayerProfile();
        this.loadState();
        this.loadA11ySettings();
        this.startTimeTracking();
        this.initKeyboardNav();
        // Show registration if no profile, otherwise splash
        if (this.playerName) {
            this.updatePlayerTexts();
            this.showScreen('splash');
        } else {
            this.showScreen('register');
        }
    },

    // ==========================================
    // PLAYER PROFILE
    // ==========================================
    loadPlayerProfile() {
        const profile = localStorage.getItem('hashbonai_player');
        if (profile) {
            try {
                const p = JSON.parse(profile);
                this.playerName = p.name || '';
                this.playerGender = p.gender || 'boy';
            } catch (e) {}
        }
    },

    savePlayerProfile() {
        localStorage.setItem('hashbonai_player', JSON.stringify({
            name: this.playerName,
            gender: this.playerGender
        }));
    },

    isBoy() {
        return this.playerGender !== 'girl';
    },

    // Gender-aware text helper
    g(boyText, girlText) {
        return this.isBoy() ? boyText : girlText;
    },

    // Replace gendered words in static text
    genderizeText(text) {
        if (!text || this.isBoy()) return text;
        // Feminine replacements for tutorial/UI text
        // Note: \b doesn't work with Hebrew, so we use explicit patterns
        return text
            .replace(/בוא נ/g, 'בואי נ')
            .replace(/בוא /g, 'בואי ')
            .replace(/אתה לא בטוח/g, 'את לא בטוחה')
            .replace(/אתה הכותב/g, 'את הכותבת')
            .replace(/שאתה /g, 'שאת ')
            .replace(/אתה /g, 'את ')
            .replace(/תענה /g, 'תעני ')
            .replace(/שתקרא /g, 'שתקראי ')
            .replace(/תצטרך /g, 'תצטרכי ')
            .replace(/תשמע /g, 'תשמעי ')
            .replace(/תבחר /g, 'תבחרי ')
            .replace(/תסתכל /g, 'תסתכלי ')
            .replace(/תתחיל /g, 'תתחילי ')
            .replace(/תחשוב/g, 'תחשבי')
            .replace(/ספר מה/g, 'ספרי מה')
            .replace(/כתוב /g, 'כתבי ')
            .replace(/תן ל/g, 'תני ל')
            .replace(/עכשיו תנסה/g, 'עכשיו תנסי')
            .replace(/מוכנים/g, 'מוכנות')
            .replace(/שתכיר/g, 'שתכירי');
    },

    selectGender(gender) {
        this.selectedGender = gender;
        const boyBtn = document.getElementById('btn-gender-boy');
        const girlBtn = document.getElementById('btn-gender-girl');
        boyBtn.className = 'btn btn-gender' + (gender === 'boy' ? ' selected-boy' : '');
        girlBtn.className = 'btn btn-gender' + (gender === 'girl' ? ' selected-girl' : '');
        // ACCESSIBILITY: Update ARIA checked states for radio group
        boyBtn.setAttribute('aria-checked', gender === 'boy' ? 'true' : 'false');
        girlBtn.setAttribute('aria-checked', gender === 'girl' ? 'true' : 'false');
        this.checkRegisterReady();
    },

    checkRegisterReady() {
        const name = document.getElementById('register-name').value.trim();
        const btn = document.getElementById('btn-register-start');
        const ready = !!(name && this.selectedGender);
        btn.disabled = !ready;
        // ACCESSIBILITY: keep aria-disabled in sync
        btn.setAttribute('aria-disabled', ready ? 'false' : 'true');
    },

    registerAndStart() {
        const name = document.getElementById('register-name').value.trim();
        if (!name || !this.selectedGender) return;
        this.playerName = name;
        this.playerGender = this.selectedGender;
        this.savePlayerProfile();
        this.updatePlayerTexts();
        this.playClick();
        this.showScreen('splash');
    },

    updatePlayerTexts() {
        const name = this.playerName;
        // Splash button
        const splashText = document.getElementById('splash-start-text');
        if (splashText) splashText.textContent = `!${this.g('בוא', 'בואי')} נתחיל, ${name}`;
        // Dashboard greeting
        const greeting = document.getElementById('dashboard-greeting');
        if (greeting) greeting.textContent = `שלום ${name}! 👋`;
        // Celebration congrats
        const congrats = document.getElementById('celebration-congrats');
        if (congrats) congrats.textContent = `כל הכבוד ${name}! 🎉`;
        // Celebration show mom
        const showMom = document.getElementById('celebration-show-mom');
        if (showMom) showMom.textContent = `${this.g('תראה', 'תראי')} לאמא את המסך הזה - ${this.g('מגיע לך', 'מגיעה לך')} מתנה!`;
        // Parent report title
        const reportTitle = document.getElementById('parent-report-title');
        if (reportTitle) reportTitle.textContent = `📊 דוח התקדמות - ${name}`;
    },

    // ==========================================
    // CHANGE NAME
    // ==========================================
    showChangeName() {
        const dialog = document.getElementById('change-name-dialog');
        dialog.classList.remove('hidden');
        const input = document.getElementById('change-name-input');
        input.value = this.playerName;
        this._changeNameFocusOrigin = document.activeElement;
        setTimeout(() => {
            input.focus();
            input.select();
        }, 50);
        // Trap focus & Escape
        this._changeNameKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideChangeName();
            }
        };
        dialog.addEventListener('keydown', this._changeNameKeyHandler);
    },

    hideChangeName() {
        const dialog = document.getElementById('change-name-dialog');
        dialog.classList.add('hidden');
        if (this._changeNameKeyHandler) dialog.removeEventListener('keydown', this._changeNameKeyHandler);
        if (this._changeNameFocusOrigin) {
            try { this._changeNameFocusOrigin.focus(); } catch(e) {}
        }
    },

    confirmChangeName() {
        const input = document.getElementById('change-name-input');
        const newName = input.value.trim();
        if (!newName) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            return;
        }
        this.playerName = newName;
        this.savePlayerProfile();
        this.updatePlayerTexts();
        this.hideChangeName();
        this.updateDashboard();
    },

    // ==========================================
    // LOCAL STORAGE
    // ==========================================
    _stateChecksum(state) {
        // Simple checksum to deter casual localStorage tampering
        const str = JSON.stringify(state) + '_h4shb0n41_s4lt';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash |= 0; // Convert to 32-bit integer
        }
        return hash.toString(36);
    },

    saveState() {
        const data = {
            state: this.state,
            _ck: this._stateChecksum(this.state)
        };
        localStorage.setItem('hashbonai_state', JSON.stringify(data));
    },

    loadState() {
        const saved = localStorage.getItem('hashbonai_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Support both old format (no checksum) and new format
                if (parsed._ck !== undefined) {
                    // New format with checksum
                    if (this._stateChecksum(parsed.state) === parsed._ck) {
                        this.state = { ...this.state, ...parsed.state };
                    } else {
                        console.warn('State checksum mismatch — possible tampering. Resetting.');
                        localStorage.removeItem('hashbonai_state');
                    }
                } else {
                    // Old format (migration) — accept once, will be saved with checksum
                    this.state = { ...this.state, ...parsed };
                }
            } catch (e) {
                console.warn('Failed to load saved state');
            }
        }
        // Initialize module progress for any new modules
        this.allModules.forEach(m => {
            if (!this.state.modulesProgress[m.id]) {
                this.state.modulesProgress[m.id] = {
                    completed: false,
                    exercisesDone: 0,
                    quizDone: false,
                    quizScore: 0,
                    correctFirst: 0,
                    correctSecond: 0,
                    totalAttempted: 0,
                    maxExercisesDone: 0,
                    quizBonusAwarded: false
                };
            }
            // Migrate existing progress: add new fields if missing
            const p = this.state.modulesProgress[m.id];
            if (p.maxExercisesDone === undefined) p.maxExercisesDone = p.exercisesDone || 0;
            if (p.quizBonusAwarded === undefined) p.quizBonusAwarded = p.completed || false;
        });
    },

    resetProgress() {
        localStorage.removeItem('hashbonai_state');
        localStorage.removeItem('hashbonai_stories');
        this.state = {
            score: 0,
            modulesProgress: {},
            milestonesReached: [],
            totalTimeSeconds: 0,
            sessionStart: Date.now()
        };
        this.allModules.forEach(m => {
            this.state.modulesProgress[m.id] = {
                completed: false,
                exercisesDone: 0,
                quizDone: false,
                quizScore: 0,
                correctFirst: 0,
                correctSecond: 0,
                totalAttempted: 0,
                maxExercisesDone: 0,
                quizBonusAwarded: false
            };
        });
        this.saveState();
        this.goToDashboard();
    },

    // ==========================================
    // TIME TRACKING
    // ==========================================
    startTimeTracking() {
        this.state.sessionStart = Date.now();
        this.timeInterval = setInterval(() => {
            this.state.totalTimeSeconds++;
            if (this.state.totalTimeSeconds % 30 === 0) {
                this.saveState();
            }
        }, 1000);
    },

    getFormattedTime() {
        const totalMin = Math.floor(this.state.totalTimeSeconds / 60);
        if (totalMin < 60) return `${totalMin} דקות`;
        const hrs = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        return `${hrs} שעות ו-${mins} דקות`;
    },

    // ==========================================
    // SOUND EFFECTS (Web Audio API)
    // ==========================================
    audioCtx: null,

    getAudioCtx() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    },

    // Play a success sound (ascending tones)
    playSuccess() {
        try {
            const ctx = this.getAudioCtx();
            const freqs = [523, 659, 784]; // C5, E5, G5
            freqs.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.3);
            });
        } catch (e) { /* Audio not supported */ }
    },

    // Play an error sound (descending tone)
    playError() {
        try {
            const ctx = this.getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.3);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) { /* Audio not supported */ }
    },

    // Play a celebration fanfare
    playFanfare() {
        try {
            const ctx = this.getAudioCtx();
            const melody = [523, 523, 659, 784, 784, 659, 784, 1047];
            melody.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.18);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.25);
                osc.start(ctx.currentTime + i * 0.18);
                osc.stop(ctx.currentTime + i * 0.18 + 0.25);
            });
        } catch (e) { /* Audio not supported */ }
    },

    // Play a click sound
    playClick() {
        try {
            const ctx = this.getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) { /* Audio not supported */ }
    },

    // ==========================================
    // CONFETTI
    // ==========================================
    confettiCanvas: null,
    confettiCtx: null,
    confettiPieces: [],
    confettiRunning: false,

    launchConfetti(duration) {
        // ACCESSIBILITY: Respect stop-animations setting
        if (this.a11y && this.a11y.stopAnimations) return;
        duration = duration || 3000;
        if (!this.confettiCanvas) {
            this.confettiCanvas = document.getElementById('confetti-canvas');
            this.confettiCtx = this.confettiCanvas.getContext('2d');
        }
        const canvas = this.confettiCanvas;
        const ctx = this.confettiCtx;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4A90D9', '#9B72CF', '#FF8C42', '#FF6B9D'];
        this.confettiPieces = [];

        for (let i = 0; i < 120; i++) {
            this.confettiPieces.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 200,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 10
            });
        }

        this.confettiRunning = true;
        const startTime = Date.now();

        const animate = () => {
            if (!this.confettiRunning) return;
            if (Date.now() - startTime > duration) {
                this.confettiRunning = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.confettiPieces.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05;
                p.rotation += p.rotSpeed;

                if (p.y > canvas.height + 20) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.vy = Math.random() * 3 + 2;
                }
            });
            requestAnimationFrame(animate);
        };
        animate();
    },

    // ==========================================
    // SCREEN MANAGEMENT
    // ==========================================
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById('screen-' + screenId);
        if (screen) {
            screen.classList.add('active');
            // Scroll to top
            window.scrollTo(0, 0);
            // ACCESSIBILITY: Move focus to screen heading or first focusable element
            setTimeout(() => {
                const heading = screen.querySelector('h1, h2');
                if (heading) {
                    heading.setAttribute('tabindex', '-1');
                    heading.focus();
                } else {
                    screen.setAttribute('tabindex', '-1');
                    screen.focus();
                }
            }, 100);
        }
    },

    // ==========================================
    // APP START
    // ==========================================
    startApp() {
        this.playClick();
        this.updatePlayerTexts();
        this.goToDashboard();
    },

    // ==========================================
    // DASHBOARD
    // ==========================================
    goToDashboard() {
        this.showScreen('dashboard');
        this.updateDashboard();
        this.checkMilestones();
    },

    updateDashboard() {
        // Update score
        document.getElementById('dashboard-score').textContent = this.state.score;

        // Update progress bar — based on points, aligned with milestone markers
        const maxPoints = 1500; // highest milestone
        const progressPercent = Math.min(100, Math.round((this.state.score / maxPoints) * 100));
        document.getElementById('dashboard-progress').style.width = progressPercent + '%';
        document.getElementById('dashboard-progress-text').textContent = this.state.score + ' / ' + maxPoints;
        // ACCESSIBILITY: Update ARIA progress bar attributes
        const progressContainer = document.getElementById('dashboard-progress-container');
        if (progressContainer) progressContainer.setAttribute('aria-valuenow', progressPercent);

        // Update milestones
        const milestones = [100, 300, 500, 1000, 1500];
        milestones.forEach(pts => {
            const el = document.querySelector(`.milestone-item[data-points="${pts}"]`);
            if (el) {
                if (this.state.score >= pts) {
                    el.classList.add('reached');
                } else {
                    el.classList.remove('reached');
                }
            }
        });

        // Render math module cards
        this._renderModuleCards('math-modules-grid', MODULES);

        // Render language module cards
        if (typeof LANGUAGE_MODULES !== 'undefined') {
            this._renderModuleCards('language-modules-grid', LANGUAGE_MODULES, true);
        }
    },

    _renderModuleCards(gridId, modules, isLanguage) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        grid.innerHTML = '';

        modules.forEach((mod) => {
            const progress = this.state.modulesProgress[mod.id];
            const isCompleted = progress?.completed;
            const hasStarted = progress?.exercisesDone > 0;

            const card = document.createElement('div');
            card.className = `module-card ${isCompleted ? 'completed' : ''} ${!isCompleted ? 'current' : ''} ${isLanguage ? 'language-card' : ''}`;
            // ACCESSIBILITY: role, tabindex, keyboard support for module cards
            card.setAttribute('role', 'listitem');
            card.setAttribute('tabindex', '0');

            let statusIcon = '';
            let statusText = '';
            if (isCompleted) { statusIcon = '✅'; statusText = 'הושלם'; }
            else if (hasStarted) { statusIcon = '▶️'; statusText = 'בתהליך'; }
            else { statusIcon = '🎯'; statusText = 'טרם התחיל'; }

            card.setAttribute('aria-label', `${mod.name} - ${mod.description} - ${statusText}`);

            let progressHTML = '';
            if (!isCompleted) {
                const totalSteps = mod.exerciseCount + (mod.quizCount || 0);
                const doneSteps = (progress?.exercisesDone || 0) + (progress?.quizDone ? (mod.quizCount || 0) : 0);
                const pct = hasStarted ? Math.round((doneSteps / totalSteps) * 100) : 0;
                progressHTML = `<div class="module-progress"><div class="progress-container progress-small" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="התקדמות ב${mod.name}"><div class="progress-bar" style="width:${pct}%"></div></div></div>`;
            }

            card.innerHTML = `
                <div class="module-icon" aria-hidden="true">${mod.icon}</div>
                <div class="module-info">
                    <div class="module-name">${mod.name}</div>
                    <div class="module-desc">${mod.description}</div>
                    ${progressHTML}
                </div>
                <div class="module-status" aria-hidden="true">${statusIcon}</div>
            `;

            card.onclick = () => this.startModule(mod.id);
            // ACCESSIBILITY: Enter and Space key activate module
            card.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.startModule(mod.id);
                }
            };
            grid.appendChild(card);
        });
    },

    // ==========================================
    // MODULE START
    // ==========================================
    startModule(moduleId) {
        this.playClick();
        const mod = this.allModules.find(m => m.id === moduleId);
        if (!mod) return;

        this.currentModule = mod;
        const progress = this.state.modulesProgress[moduleId];

        // Creative writing module: no quiz
        if (mod.isCreative && progress.exercisesDone >= mod.exerciseCount) {
            progress.exercisesDone = 0; // Reset for replay
        }

        // If module exercises are done but quiz isn't, go to quiz
        if (!mod.isCreative && progress.exercisesDone >= mod.exerciseCount && !progress.quizDone) {
            this.startQuiz();
            return;
        }

        // If module is completed, allow replay
        if (progress.completed) {
            // Reset for replay
            progress.exercisesDone = 0;
            progress.quizDone = false;
            progress.quizScore = 0;
        }

        // Show tutorial first if first time
        if (progress.exercisesDone === 0) {
            this.startTutorial();
        } else {
            this.startExercises();
        }
    },

    // ==========================================
    // TUTORIAL
    // ==========================================
    startTutorial() {
        this.tutorialStep = 0;
        this.showScreen('tutorial');
        document.getElementById('tutorial-title').textContent = this.currentModule.name;
        document.getElementById('tutorial-score').textContent = this.state.score;
        this.renderTutorial();
    },

    renderTutorial() {
        const tutorial = this.currentModule.tutorial;
        const step = tutorial[this.tutorialStep];

        document.getElementById('tutorial-speech').textContent = this.genderizeText(step.speech);
        document.getElementById('tutorial-content').innerHTML = this.genderizeText(step.content);

        // Update dots
        const dotsContainer = document.getElementById('tutorial-dots');
        dotsContainer.innerHTML = '';
        tutorial.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `tutorial-dot ${i === this.tutorialStep ? 'active' : ''} ${i < this.tutorialStep ? 'done' : ''}`;
            dotsContainer.appendChild(dot);
        });

        // Update nav buttons
        document.getElementById('tutorial-prev').style.visibility = this.tutorialStep === 0 ? 'hidden' : 'visible';
        const nextBtn = document.getElementById('tutorial-next');
        if (this.tutorialStep === tutorial.length - 1) {
            nextBtn.textContent = '⬅️ !עכשיו תנסה';
            nextBtn.className = 'btn btn-success';
        } else {
            nextBtn.textContent = '⬅️ קדימה';
            nextBtn.className = 'btn btn-primary';
        }
    },

    tutorialNext() {
        this.playClick();
        if (this.tutorialStep < this.currentModule.tutorial.length - 1) {
            this.tutorialStep++;
            this.renderTutorial();
        } else {
            this.startExercises();
        }
    },

    tutorialPrev() {
        this.playClick();
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.renderTutorial();
        }
    },

    // ==========================================
    // EXERCISES
    // ==========================================
    startExercises() {
        this.isQuizMode = false;
        this.exercises = [];
        this.currentExerciseIndex = 0;
        this.currentAttempt = 0;

        const mod = this.currentModule;
        const progress = this.state.modulesProgress[mod.id];
        const remaining = mod.exerciseCount - progress.exercisesDone;

        // Generate exercises
        for (let i = 0; i < remaining; i++) {
            const difficulty = progress.exercisesDone + i;
            this.exercises.push(mod.generateExercise(difficulty));
        }

        this.showScreen('exercise');
        document.getElementById('exercise-title').textContent = mod.name;
        document.getElementById('exercise-total').textContent = mod.exerciseCount;
        this.showExercise();
    },

    showExercise() {
        this._answerLocked = false;
        const ex = this.exercises[this.currentExerciseIndex];
        if (!ex) {
            this.exercisesComplete();
            return;
        }

        this.currentExercise = ex;
        this.currentAttempt = 0;
        const progress = this.state.modulesProgress[this.currentModule.id];
        const currentNum = progress.exercisesDone + 1;

        document.getElementById('exercise-current').textContent = currentNum;
        document.getElementById('exercise-score').textContent = this.state.score;

        // Progress bar
        const pct = ((currentNum - 1) / this.currentModule.exerciseCount) * 100;
        document.getElementById('exercise-progress-bar').style.width = pct + '%';
        // ACCESSIBILITY: update ARIA progress
        const exProgressBar = document.getElementById('exercise-progress-container');
        if (exProgressBar) exProgressBar.setAttribute('aria-valuenow', Math.round(pct));

        // Question
        document.getElementById('question-area').innerHTML = ex.displayHTML;

        // Bind TTS buttons that use data-tts-word (security: avoids inline onclick)
        document.querySelectorAll('[data-tts-word]').forEach(btn => {
            btn.onclick = () => {
                if (typeof speakHebrew === 'function') speakHebrew(btn.dataset.ttsWord);
            };
        });

        // Visual aid - only for shapes/clock
        const needsVisual = this.currentModule.id === 'shapes' || this.currentModule.id === 'clock';
        document.getElementById('visual-aid').innerHTML = needsVisual ? (ex.visualAid || '') : '';

        // Answer area
        const answerArea = document.getElementById('answer-area');
        const choicesArea = document.getElementById('choices-area');
        const creativeArea = document.getElementById('creative-area');

        // Hide all answer areas first
        answerArea.classList.add('hidden');
        choicesArea.classList.add('hidden');
        if (creativeArea) creativeArea.classList.add('hidden');

        if (ex.type === 'creative') {
            // Creative writing mode
            if (creativeArea) {
                creativeArea.classList.remove('hidden');
                document.getElementById('creative-text').value = '';
            }
        } else if (ex.type === 'input') {
            answerArea.classList.remove('hidden');
            const input = document.getElementById('answer-input');
            input.value = '';
            input.className = 'answer-input';
            input.disabled = false;
            input.focus();
        } else if (ex.type === 'choice') {
            choicesArea.classList.remove('hidden');
            choicesArea.innerHTML = '';
            ex.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice;
                btn.onclick = () => this.checkChoiceAnswer(choice, btn);
                choicesArea.appendChild(btn);
            });
        }

        // Hint system
        const hintArea = document.getElementById('hint-area');
        if (hintArea) {
            if (ex.hint && ex.type !== 'creative') {
                hintArea.classList.remove('hidden');
                document.getElementById('hint-btn').disabled = false;
                document.getElementById('hint-btn').textContent = '💡 רמז (-5 נקודות)';
                document.getElementById('hint-text').classList.add('hidden');
            } else {
                hintArea.classList.add('hidden');
            }
        }

        // TTS for spelling
        if (ex.ttsText && typeof speakHebrew === 'function') {
            setTimeout(() => speakHebrew(ex.ttsText), 500);
        }

        // Hide feedback
        document.getElementById('feedback-area').classList.add('hidden');
        document.getElementById('feedback-area').className = 'feedback-area hidden';
    },

    // ==========================================
    // CHECK ANSWER (Input type)
    // ==========================================
    checkAnswer() {
        if (this._answerLocked) return;
        const input = document.getElementById('answer-input');
        const userAnswer = parseInt(input.value);

        if (isNaN(userAnswer)) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            return;
        }

        this._answerLocked = true;
        const ex = this.currentExercise;
        const isCorrect = userAnswer === ex.answer;
        const feedbackArea = document.getElementById('feedback-area');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackMsg = document.getElementById('feedback-message');
        const feedbackExpl = document.getElementById('feedback-explanation');

        input.disabled = true;

        if (isCorrect) {
            input.className = 'answer-input correct';
            this.handleCorrectAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl);
        } else {
            input.className = 'answer-input wrong shake';
            this.handleWrongAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl, ex, userAnswer);
        }
    },

    // ==========================================
    // CHECK ANSWER (Choice type)
    // ==========================================
    checkChoiceAnswer(choice, btn) {
        if (this._answerLocked) return;
        this._answerLocked = true;
        const ex = this.currentExercise;
        const isCorrect = choice === ex.answer;
        const feedbackArea = document.getElementById('feedback-area');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackMsg = document.getElementById('feedback-message');
        const feedbackExpl = document.getElementById('feedback-explanation');

        // Disable all choice buttons
        document.querySelectorAll('#choices-area .choice-btn').forEach(b => {
            b.disabled = true;
            if (b.textContent === ex.answer) b.classList.add('correct');
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.handleCorrectAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl);
        } else {
            btn.classList.add('wrong');
            this.handleWrongAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl, ex, choice);
        }
    },

    // ==========================================
    // CORRECT / WRONG HANDLING
    // ==========================================
    handleCorrectAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl) {
        const progress = this.state.modulesProgress[this.currentModule.id];
        let points = 0;

        // Check if this exercise was already scored (replay detection)
        const isReplay = this.isQuizMode
            ? progress.quizBonusAwarded   // Quiz was already completed once
            : progress.exercisesDone < progress.maxExercisesDone; // Exercise position already scored

        if (!isReplay) {
            if (this.currentAttempt === 0) {
                points = 10;
                progress.correctFirst++;
            } else {
                points = 5;
                progress.correctSecond++;
            }
            this.state.score += points;
            progress.totalAttempted++;
        }

        if (this.isQuizMode) {
            this.quizCorrectCount++;
            if (this.currentAttempt === 0) this.quizFirstTryCount++;
        }

        this.saveState();
        this.playSuccess();
        this.launchConfetti(1500);

        feedbackArea.classList.remove('hidden');
        feedbackArea.className = 'feedback-area correct';
        feedbackIcon.textContent = ['🎉', '⭐', '🌟', '💪', '🎊', '✨'][Math.floor(Math.random() * 6)];
        feedbackMsg.textContent = ['!מעולה', '!נכון', '!כל הכבוד', '!מדהים', '!יופי'][Math.floor(Math.random() * 5)];
        feedbackExpl.textContent = isReplay ? '✅ כבר קיבלת נקודות!' : `+${points} נקודות!`;

        // Fix: Reset next button to "הבא!" after correct answer (especially after retry)
        const nextBtnId = this.isQuizMode ? 'quiz-feedback-next-btn' : 'feedback-next-btn';
        const nextBtn = document.getElementById(nextBtnId);
        if (nextBtn) {
            nextBtn.textContent = '⬅️ !הבא';
            nextBtn.onclick = () => {
                if (this.isQuizMode) this.nextQuizQuestion();
                else this.nextExercise();
            };
            setTimeout(() => nextBtn.focus(), 200);
        }

        // Update score displays
        this.updateScoreDisplays();

        // ACCESSIBILITY: Announce score change to screen readers
        const announcer = document.getElementById('score-announcer');
        if (announcer) announcer.textContent = isReplay
            ? `נכון! כבר קיבלת נקודות. סך הכל: ${this.state.score} נקודות`
            : `נכון! +${points} נקודות. סך הכל: ${this.state.score} נקודות`;

        // Milestones are deferred — checked only when returning to dashboard
        // This prevents the celebration screen from interrupting exercises or quizzes
    },

    handleWrongAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl, ex, userAnswer) {
        this.currentAttempt++;
        this.playError();

        // ACCESSIBILITY: Announce wrong answer to screen readers
        const announcer = document.getElementById('feedback-announcer');
        if (announcer) announcer.textContent = this.currentAttempt === 1 ? 'לא נכון, נסה שוב' : `התשובה הנכונה: ${ex.answer}`;

        feedbackArea.classList.remove('hidden');
        feedbackArea.className = 'feedback-area wrong';

        if (this.currentAttempt === 1) {
            // First wrong - encourage retry
            feedbackIcon.textContent = '🤔';
            feedbackMsg.textContent = `!לא בדיוק, ${this.g('נסה', 'נסי')} שוב`;
            feedbackExpl.innerHTML = typeof ex.explain === 'function' ? this.genderizeText(ex.explain(userAnswer)) : '';

            // Allow retry
            const nextBtn = document.getElementById(this.isQuizMode ? 'quiz-feedback-next-btn' : 'feedback-next-btn');
            nextBtn.textContent = `🔄 ${this.g('נסה', 'נסי')} שוב`;
            setTimeout(() => nextBtn.focus(), 200);
            nextBtn.onclick = () => {
                this._answerLocked = false;
                feedbackArea.classList.add('hidden');
                if (ex.type === 'input') {
                    const input = document.getElementById(this.isQuizMode ? 'quiz-answer-input' : 'answer-input');
                    input.value = '';
                    input.className = 'answer-input';
                    input.disabled = false;
                    input.focus();
                } else {
                    // Re-enable choice buttons
                    const choicesId = this.isQuizMode ? 'quiz-choices-area' : 'choices-area';
                    document.querySelectorAll(`#${choicesId} .choice-btn`).forEach(b => {
                        b.disabled = false;
                        b.classList.remove('wrong', 'correct');
                    });
                }
            };
        } else {
            // Second wrong - show answer and move on
            const progress = this.state.modulesProgress[this.currentModule.id];
            progress.totalAttempted++;
            this.saveState();

            feedbackIcon.textContent = '💡';
            feedbackMsg.textContent = `התשובה הנכונה היא: ${ex.answer}`;
            feedbackExpl.innerHTML = typeof ex.explain === 'function' ? this.genderizeText(ex.explain(userAnswer)) : '';

            const nextBtn = document.getElementById(this.isQuizMode ? 'quiz-feedback-next-btn' : 'feedback-next-btn');
            nextBtn.textContent = '⬅️ !הבא';
            nextBtn.onclick = () => {
                if (this.isQuizMode) {
                    this.nextQuizQuestion();
                } else {
                    this.nextExercise();
                }
            };
            setTimeout(() => nextBtn.focus(), 200);
        }
    },

    // ==========================================
    // NEXT EXERCISE
    // ==========================================
    nextExercise() {
        const progress = this.state.modulesProgress[this.currentModule.id];
        progress.exercisesDone++;
        // Track highest exercise count ever reached (for replay scoring prevention)
        if (progress.exercisesDone > progress.maxExercisesDone) {
            progress.maxExercisesDone = progress.exercisesDone;
        }
        this.currentExerciseIndex++;
        this.saveState();

        // Reset next button
        const nextBtn = document.getElementById('feedback-next-btn');
        nextBtn.textContent = '⬅️ !הבא';
        nextBtn.onclick = () => this.nextExercise();

        if (this.currentExerciseIndex >= this.exercises.length) {
            this.exercisesComplete();
        } else {
            this.showExercise();
        }
    },

    exercisesComplete() {
        // Creative writing module: complete without quiz
        if (this.currentModule.isCreative) {
            const progress = this.state.modulesProgress[this.currentModule.id];
            // Only award module completion bonus if not already awarded
            if (!progress.quizBonusAwarded) {
                this.state.score += 50; // Module completion bonus
                progress.quizBonusAwarded = true;
            }
            progress.completed = true;
            progress.quizDone = true;
            this.saveState();
            this.playFanfare();
            this.launchConfetti(3000);
            // Show a mini celebration and return to dashboard
            setTimeout(() => {
                this.goToDashboard(); // milestones checked inside goToDashboard
            }, 2000);
            return;
        }
        // All exercises done, go to quiz
        this.startQuiz();
    },

    // ==========================================
    // QUIZ
    // ==========================================
    startQuiz() {
        this.isQuizMode = true;
        this.quizCorrectCount = 0;
        this.quizFirstTryCount = 0;
        this.exercises = [];
        this.currentExerciseIndex = 0;
        this.currentAttempt = 0;

        const mod = this.currentModule;
        // Generate quiz exercises (varied difficulty)
        for (let i = 0; i < mod.quizCount; i++) {
            this.exercises.push(mod.generateExercise(i));
        }

        this.showScreen('quiz');
        document.getElementById('quiz-title').textContent = `מבחן: ${mod.name} 📝`;
        document.getElementById('quiz-total').textContent = mod.quizCount;
        document.getElementById('quiz-score').textContent = this.state.score;
        this.showQuizQuestion();
    },

    showQuizQuestion() {
        this._answerLocked = false;
        const ex = this.exercises[this.currentExerciseIndex];
        if (!ex) {
            this.quizComplete();
            return;
        }

        this.currentExercise = ex;
        this.currentAttempt = 0;

        document.getElementById('quiz-current').textContent = this.currentExerciseIndex + 1;
        document.getElementById('quiz-score').textContent = this.state.score;

        const pct = (this.currentExerciseIndex / this.currentModule.quizCount) * 100;
        document.getElementById('quiz-progress-bar').style.width = pct + '%';
        // ACCESSIBILITY: update quiz ARIA progress
        const quizProgressBar = document.getElementById('quiz-progress-container');
        if (quizProgressBar) quizProgressBar.setAttribute('aria-valuenow', Math.round(pct));

        document.getElementById('quiz-question-area').innerHTML = ex.displayHTML;

        // Bind TTS buttons that use data-tts-word (security: avoids inline onclick)
        document.querySelectorAll('#quiz-question-area [data-tts-word]').forEach(btn => {
            btn.onclick = () => {
                if (typeof speakHebrew === 'function') speakHebrew(btn.dataset.ttsWord);
            };
        });

        const needsQuizVisual = this.currentModule.id === 'shapes' || this.currentModule.id === 'clock';
        document.getElementById('quiz-visual-aid').innerHTML = needsQuizVisual ? (ex.visualAid || '') : '';

        const answerArea = document.getElementById('quiz-answer-area');
        const choicesArea = document.getElementById('quiz-choices-area');

        if (ex.type === 'input') {
            answerArea.classList.remove('hidden');
            choicesArea.classList.add('hidden');
            const input = document.getElementById('quiz-answer-input');
            input.value = '';
            input.className = 'answer-input';
            input.disabled = false;
            input.focus();
        } else {
            answerArea.classList.add('hidden');
            choicesArea.classList.remove('hidden');
            choicesArea.innerHTML = '';
            ex.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice;
                btn.onclick = () => this.checkQuizChoiceAnswer(choice, btn);
                choicesArea.appendChild(btn);
            });
        }

        // Quiz hint system
        const quizHintArea = document.getElementById('quiz-hint-area');
        if (quizHintArea) {
            if (ex.hint) {
                quizHintArea.classList.remove('hidden');
                document.getElementById('quiz-hint-btn').disabled = false;
                document.getElementById('quiz-hint-btn').textContent = '💡 רמז (-5 נקודות)';
                document.getElementById('quiz-hint-text').classList.add('hidden');
            } else {
                quizHintArea.classList.add('hidden');
            }
        }

        // TTS for spelling
        if (ex.ttsText && typeof speakHebrew === 'function') {
            setTimeout(() => speakHebrew(ex.ttsText), 500);
        }

        document.getElementById('quiz-feedback-area').classList.add('hidden');
        document.getElementById('quiz-feedback-area').className = 'feedback-area hidden';
    },

    checkQuizAnswer() {
        if (this._answerLocked) return;
        const input = document.getElementById('quiz-answer-input');
        const userAnswer = parseInt(input.value);

        if (isNaN(userAnswer)) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            return;
        }

        const ex = this.currentExercise;
        const isCorrect = userAnswer === ex.answer;
        const feedbackArea = document.getElementById('quiz-feedback-area');
        const feedbackIcon = document.getElementById('quiz-feedback-icon');
        const feedbackMsg = document.getElementById('quiz-feedback-message');
        const feedbackExpl = document.getElementById('quiz-feedback-explanation');

        input.disabled = true;

        if (isCorrect) {
            input.className = 'answer-input correct';
            this.handleCorrectAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl);
        } else {
            input.className = 'answer-input wrong shake';
            this.handleWrongAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl, ex, userAnswer);
        }
    },

    checkQuizChoiceAnswer(choice, btn) {
        if (this._answerLocked) return;
        this._answerLocked = true;
        const ex = this.currentExercise;
        const isCorrect = choice === ex.answer;
        const feedbackArea = document.getElementById('quiz-feedback-area');
        const feedbackIcon = document.getElementById('quiz-feedback-icon');
        const feedbackMsg = document.getElementById('quiz-feedback-message');
        const feedbackExpl = document.getElementById('quiz-feedback-explanation');

        document.querySelectorAll('#quiz-choices-area .choice-btn').forEach(b => {
            b.disabled = true;
            if (b.textContent === ex.answer) b.classList.add('correct');
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.handleCorrectAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl);
        } else {
            btn.classList.add('wrong');
            this.handleWrongAnswer(feedbackArea, feedbackIcon, feedbackMsg, feedbackExpl, ex, choice);
        }
    },

    nextQuizQuestion() {
        this.currentExerciseIndex++;

        const nextBtn = document.getElementById('quiz-feedback-next-btn');
        nextBtn.textContent = '⬅️ !הבא';
        nextBtn.onclick = () => this.nextQuizQuestion();

        if (this.currentExerciseIndex >= this.exercises.length) {
            this.quizComplete();
        } else {
            this.showQuizQuestion();
        }
    },

    quizComplete() {
        const mod = this.currentModule;
        const progress = this.state.modulesProgress[mod.id];
        const quizTotal = mod.quizCount;

        progress.quizDone = true;
        progress.quizScore = this.quizCorrectCount;

        // Only award bonuses if quiz wasn't already completed before
        let bonusPoints = 0;
        let perfectBonus = 0;
        if (!progress.quizBonusAwarded) {
            // Module completion bonus
            bonusPoints = 50;
            this.state.score += bonusPoints;

            // Perfect quiz bonus
            if (this.quizFirstTryCount === quizTotal) {
                perfectBonus = 100;
                this.state.score += perfectBonus;
            }
            progress.quizBonusAwarded = true;
        }

        progress.completed = true;
        this.saveState();

        // Show results
        this.showScreen('quiz-results');

        const stars = this.quizCorrectCount >= quizTotal ? '⭐⭐⭐' :
                      this.quizCorrectCount >= quizTotal * 0.7 ? '⭐⭐' : '⭐';

        document.getElementById('results-correct').textContent = `${this.quizCorrectCount}/${quizTotal}`;
        document.getElementById('results-stars').textContent = stars;

        let pointsText = '';
        if (bonusPoints > 0) {
            pointsText = `+${bonusPoints} נקודות על סיום המודול!`;
            if (perfectBonus > 0) {
                pointsText += `\n+${perfectBonus} בונוס על ציון מושלם! 🌟`;
            }
        } else {
            pointsText = '✅ כבר קיבלת נקודות על מודול זה!';
        }
        document.getElementById('results-points').textContent = pointsText;

        let message = '';
        if (this.quizCorrectCount === quizTotal) {
            message = `מושלם! ציון 100%! ${this.g('אתה גאון', 'את גאונה')}! 🏆`;
        } else if (this.quizCorrectCount >= quizTotal * 0.8) {
            message = 'כל הכבוד! תוצאה מעולה! 🌟';
        } else if (this.quizCorrectCount >= quizTotal * 0.6) {
            message = 'יפה מאוד! המשך להתאמן! 💪';
        } else {
            message = `לא נורא! ${this.g('תנסה', 'תנסי')} שוב ${this.g('ותשתפר', 'ותשתפרי')}! 😊`;
        }
        document.getElementById('results-message').textContent = message;
        document.getElementById('results-title').textContent = `סיימת את ${mod.name}!`;

        this.playFanfare();
        this.launchConfetti(4000);

        // Don't check milestones here — they will be checked when the user
        // clicks "back to dashboard" from the results screen.
        // This prevents the celebration overlay from hiding the results.
    },

    // ==========================================
    // MILESTONES
    // ==========================================
    checkMilestones() {
        const name = this.playerName || '';
        const milestones = [
            { points: 100, emoji: '⭐', title: 'כוכב כסף!', subtitle: `!${name}, ${this.g('אתה מדהים', 'את מדהימה')}`, silver: true },
            { points: 300, emoji: '🌟', title: 'כוכב זהב!', subtitle: `!${name} על` },
            { points: 500, emoji: '🏆', title: `!${this.g('גיבור', 'גיבורת')} חשבון`, subtitle: '!אמא תאשר לך מתנה', isGift: true },
            { points: 1000, emoji: '👑', title: `!${this.g('אלוף', 'אלופת')} ישראל`, subtitle: '!מתנה מיוחדת מאמא', isGift: true },
            { points: 1500, emoji: '📚', title: `!${this.g('אלוף', 'אלופת')} קריאה וחשבון`, subtitle: `!${this.g('אתה גאון אמיתי', 'את גאונה אמיתית')}`, isGift: true }
        ];

        milestones.forEach(m => {
            if (this.state.score >= m.points && !this.state.milestonesReached.includes(m.points)) {
                this.state.milestonesReached.push(m.points);
                this.pendingMilestones.push(m);
            }
        });

        this.saveState();

        if (this.pendingMilestones.length > 0) {
            this.showNextMilestone();
        }
    },

    showNextMilestone() {
        if (this.pendingMilestones.length === 0) return;

        const milestone = this.pendingMilestones.shift();
        this.showScreen('celebration');

        const emojiEl = document.getElementById('celebration-emoji');
        emojiEl.textContent = milestone.emoji;
        emojiEl.classList.toggle('silver', !!milestone.silver);
        document.getElementById('celebration-title').textContent = milestone.title;
        document.getElementById('celebration-subtitle').textContent = milestone.subtitle;
        document.getElementById('celebration-points').textContent = `${this.state.score} נקודות!`;

        const giftMsg = document.getElementById('celebration-gift-message');
        const showMomBtn = document.getElementById('show-mom-btn');

        if (milestone.isGift) {
            giftMsg.classList.remove('hidden');
            showMomBtn.classList.remove('hidden');
            document.getElementById('gift-points-text').textContent = `הגעת ל-${milestone.points} נקודות!`;
        } else {
            giftMsg.classList.add('hidden');
            showMomBtn.classList.add('hidden');
        }

        this.playFanfare();
        this.launchConfetti(5000);
    },

    leaveResults() {
        this.playClick();
        this.goToDashboard(); // milestones checked inside goToDashboard
    },

    dismissCelebration() {
        this.playClick();
        if (this.pendingMilestones.length > 0) {
            this.showNextMilestone();
        } else {
            this.goToDashboard();
        }
    },

    // ==========================================
    // PARENT SECTION
    // ==========================================
    showParentLogin() {
        this.showParentSummary();
    },

    showParentSummary() {
        this.showScreen('parent');

        // Total score
        document.getElementById('parent-total-score').textContent = this.state.score;

        // Modules completed
        const completedCount = this.allModules.filter(m => this.state.modulesProgress[m.id]?.completed).length;
        document.getElementById('parent-modules-done').textContent = `${completedCount} / ${this.allModules.length}`;

        // Time
        document.getElementById('parent-time').textContent = this.getFormattedTime();

        // Accuracy
        let totalCorrect = 0, totalAttempted = 0;
        this.allModules.forEach(m => {
            const p = this.state.modulesProgress[m.id];
            if (p) {
                totalCorrect += (p.correctFirst || 0) + (p.correctSecond || 0);
                totalAttempted += p.totalAttempted || 0;
            }
        });
        const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        document.getElementById('parent-accuracy').textContent = accuracy + '%';

        // Math module details
        this._renderParentModuleDetails('parent-math-details', MODULES);

        // Language module details
        if (typeof LANGUAGE_MODULES !== 'undefined') {
            this._renderParentModuleDetails('parent-language-details', LANGUAGE_MODULES);
        }

        // Strengths
        const strengths = [];
        const improvements = [];
        this.allModules.forEach(m => {
            const p = this.state.modulesProgress[m.id];
            if (p && p.totalAttempted > 0) {
                const acc = ((p.correctFirst + p.correctSecond) / p.totalAttempted) * 100;
                if (acc >= 80) strengths.push(m.name);
                else if (acc < 60) improvements.push(m.name);
            }
        });

        document.getElementById('parent-strengths').textContent =
            strengths.length > 0 ? strengths.join(', ') : 'עדיין אין מספיק נתונים';

        document.getElementById('parent-improvements').textContent =
            improvements.length > 0 ? improvements.join(', ') : 'הכל נראה מצוין!';

        // Recommendations
        const recs = [];
        const mathCompleted = MODULES.filter(m => this.state.modulesProgress[m.id]?.completed).length;
        const langCompleted = (typeof LANGUAGE_MODULES !== 'undefined') ?
            LANGUAGE_MODULES.filter(m => this.state.modulesProgress[m.id]?.completed).length : 0;
        if (mathCompleted === 0 && langCompleted === 0) recs.push('להתחיל עם מודול חיבור או קריאה.');
        if (mathCompleted < MODULES.length) recs.push('להמשיך להתאמן בחשבון.');
        if (typeof LANGUAGE_MODULES !== 'undefined' && langCompleted < LANGUAGE_MODULES.length) recs.push('להתאמן גם בשפה.');
        if (accuracy < 70) recs.push('לחזור על מודולים שהציון בהם נמוך.');
        if (this.state.totalTimeSeconds < 600) recs.push('להקדיש לפחות 10 דקות למידה ביום.');
        if (recs.length === 0) recs.push(`להמשיך ככה! ${this.playerName} ${this.g('מתקדם', 'מתקדמת')} יפה! 🌟`);

        document.getElementById('parent-recommendations').textContent = recs.join(' ');
    },

    _renderParentModuleDetails(containerId, modules) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        modules.forEach(m => {
            const p = this.state.modulesProgress[m.id];
            const item = document.createElement('div');
            item.className = 'parent-module-item';
            const status = p?.completed ? '✅ הושלם' : (p?.exercisesDone > 0 ? `📝 ${p.exercisesDone}/${m.exerciseCount} תרגילים` : '⏳ טרם התחיל');
            const quizInfo = (p?.quizDone && m.quizCount > 0) ? ` | מבחן: ${p.quizScore}/${m.quizCount}` : '';
            item.innerHTML = `<span>${m.icon} ${m.name}</span><span>${status}${quizInfo}</span>`;
            container.appendChild(item);
        });
    },

    confirmReset() {
        this.showConfirm('האם לאפס את כל ההתקדמות? זה לא ניתן לביטול!', () => {
            this.resetProgress();
        });
    },

    // ==========================================
    // CONFIRM DIALOG
    // ==========================================
    showConfirm(message, onYes) {
        const overlay = document.getElementById('confirm-dialog');
        overlay.classList.remove('hidden');
        document.getElementById('confirm-message').textContent = message;

        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');

        yesBtn.onclick = () => {
            overlay.classList.add('hidden');
            this._restoreFocusAfterDialog();
            onYes();
        };

        noBtn.onclick = () => {
            overlay.classList.add('hidden');
            this._restoreFocusAfterDialog();
        };

        // ACCESSIBILITY: Store focus origin and focus the dialog
        this._dialogFocusOrigin = document.activeElement;
        setTimeout(() => noBtn.focus(), 50);

        // ACCESSIBILITY: Trap focus within dialog
        this._dialogKeyHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.classList.add('hidden');
                this._restoreFocusAfterDialog();
                return;
            }
            if (e.key === 'Tab') {
                const focusable = [yesBtn, noBtn];
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
        };
        overlay.addEventListener('keydown', this._dialogKeyHandler);
    },

    _restoreFocusAfterDialog() {
        const overlay = document.getElementById('confirm-dialog');
        if (this._dialogKeyHandler) overlay.removeEventListener('keydown', this._dialogKeyHandler);
        if (this._dialogFocusOrigin) {
            try { this._dialogFocusOrigin.focus(); } catch(e) {}
        }
    },

    confirmExit() {
        this.showConfirm('בטוח שרוצה לצאת? ההתקדמות נשמרת!', () => {
            this.isQuizMode = false;
            this.goToDashboard();
        });
    },

    // ==========================================
    // HINT SYSTEM
    // ==========================================
    useHint() {
        if (!this.currentExercise || !this.currentExercise.hint) return;

        if (this.state.score < 5) {
            const hintTextId = this.isQuizMode ? 'quiz-hint-text' : 'hint-text';
            const el = document.getElementById(hintTextId);
            el.textContent = 'אין מספיק נקודות! צריך לפחות 5 נקודות.';
            el.classList.remove('hidden');
            return;
        }

        // Deduct points
        this.state.score -= 5;
        this.saveState();
        this.updateScoreDisplays();

        // Show hint
        const hintTextId = this.isQuizMode ? 'quiz-hint-text' : 'hint-text';
        const hintBtnId = this.isQuizMode ? 'quiz-hint-btn' : 'hint-btn';
        document.getElementById(hintTextId).textContent = this.currentExercise.hint;
        document.getElementById(hintTextId).classList.remove('hidden');
        document.getElementById(hintBtnId).disabled = true;
        document.getElementById(hintBtnId).textContent = '💡 רמז נחשף';

        this.playClick();
    },

    // ==========================================
    // CREATIVE WRITING
    // ==========================================
    saveCreativeStory() {
        const text = document.getElementById('creative-text').value.trim();
        if (!text) {
            document.getElementById('creative-text').classList.add('shake');
            setTimeout(() => document.getElementById('creative-text').classList.remove('shake'), 500);
            return;
        }

        const ex = this.currentExercise;
        if (!ex || !ex.promptData) return;

        // Save story to localStorage
        let stories;
        try { stories = JSON.parse(localStorage.getItem('hashbonai_stories') || '[]'); }
        catch (e) { stories = []; }
        stories.push({
            date: new Date().toLocaleDateString('he-IL'),
            title: ex.promptData.title,
            emojis: ex.promptData.emojis,
            helpers: ex.promptData.helpers,
            text: text
        });
        localStorage.setItem('hashbonai_stories', JSON.stringify(stories));

        // Award points (only for new exercises, not replay)
        const progress = this.state.modulesProgress[this.currentModule.id];
        const isReplay = progress.exercisesDone < progress.maxExercisesDone;
        if (!isReplay) {
            this.state.score += 10;
            progress.correctFirst++;
            progress.totalAttempted++;
        }
        this.saveState();
        this.updateScoreDisplays();

        // Show success
        this.playSuccess();
        this.launchConfetti(1500);

        // Move to next
        const feedbackArea = document.getElementById('feedback-area');
        feedbackArea.classList.remove('hidden');
        feedbackArea.className = 'feedback-area correct';
        document.getElementById('feedback-icon').textContent = '✍️';
        document.getElementById('feedback-message').textContent = '!הסיפור נשמר';
        document.getElementById('feedback-explanation').textContent = '+10 נקודות!';

        const nextBtn = document.getElementById('feedback-next-btn');
        nextBtn.textContent = '⬅️ !הבא';
        nextBtn.onclick = () => this.nextExercise();
        // Milestones deferred to dashboard
    },

    // ==========================================
    // STORIES GALLERY
    // ==========================================
    showStoriesGallery() {
        this.playClick();
        this.showScreen('stories');

        const gallery = document.getElementById('stories-gallery');
        const emptyMsg = document.getElementById('empty-gallery');
        let stories;
        try { stories = JSON.parse(localStorage.getItem('hashbonai_stories') || '[]'); }
        catch (e) { stories = []; }

        // Clear existing cards (keep empty message)
        gallery.querySelectorAll('.story-card').forEach(c => c.remove());

        if (stories.length === 0) {
            emptyMsg.textContent = `עדיין לא ${this.g('כתבת', 'כתבת')} סיפורים. ${this.g('בוא', 'בואי')} נתחיל! ✍️`;
            emptyMsg.classList.remove('hidden');
            return;
        }

        emptyMsg.classList.add('hidden');

        // Show stories newest first
        [...stories].reverse().forEach((story, idx) => {
            const card = document.createElement('div');
            card.className = 'story-card';
            card.innerHTML = `
                <div class="story-card-header">
                    <span class="story-card-emojis">${escapeHTML(story.emojis)}</span>
                    <span class="story-card-date">${escapeHTML(story.date)}</span>
                </div>
                <div class="story-card-title">${escapeHTML(story.title)}</div>
                <div class="story-card-text">${escapeHTML(story.text)}</div>
                <div class="story-card-actions">
                    <button class="btn btn-print btn-small" onclick="window.print()">🖨️ הדפס</button>
                </div>
            `;
            gallery.appendChild(card);
        });
    },

    // ==========================================
    // SCORE UPDATES
    // ==========================================
    updateScoreDisplays() {
        const score = this.state.score;
        ['dashboard-score', 'tutorial-score', 'exercise-score', 'quiz-score'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = score;
        });
    },

    // ==========================================
    // ACCESSIBILITY: Widget Functions
    // ==========================================
    loadA11ySettings() {
        try {
            const saved = localStorage.getItem('hashbonai_a11y');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.a11y = { ...this.a11y, ...parsed };
            }
        } catch (e) {}
        // Apply saved settings
        this.applyA11ySettings();
    },

    saveA11ySettings() {
        localStorage.setItem('hashbonai_a11y', JSON.stringify(this.a11y));
    },

    applyA11ySettings() {
        const root = document.documentElement;
        // Font size
        root.classList.remove('a11y-font-small', 'a11y-font-medium', 'a11y-font-large');
        root.classList.add('a11y-font-' + this.a11y.fontSize);
        // High contrast
        root.classList.toggle('a11y-high-contrast', this.a11y.highContrast);
        // Stop animations
        root.classList.toggle('a11y-stop-animations', this.a11y.stopAnimations);
        // Focus highlight
        root.classList.toggle('a11y-focus-highlight', this.a11y.focusHighlight);

        // Update toggle states in panel
        this._updateA11yToggle('a11y-contrast-toggle', this.a11y.highContrast);
        this._updateA11yToggle('a11y-anim-toggle', this.a11y.stopAnimations);
        this._updateA11yToggle('a11y-focus-toggle', this.a11y.focusHighlight);

        // Update font size button active states
        document.querySelectorAll('.a11y-btn-row .a11y-btn').forEach(btn => btn.classList.remove('a11y-active'));
        const sizeMap = { 'small': 0, 'medium': 1, 'large': 2 };
        const row = document.querySelector('.a11y-btn-row');
        if (row) {
            const btns = row.querySelectorAll('.a11y-btn');
            if (btns[sizeMap[this.a11y.fontSize]]) {
                btns[sizeMap[this.a11y.fontSize]].classList.add('a11y-active');
            }
        }
    },

    _updateA11yToggle(id, state) {
        const toggle = document.getElementById(id);
        if (toggle) toggle.setAttribute('aria-checked', state ? 'true' : 'false');
    },

    toggleA11yPanel() {
        const panel = document.getElementById('a11y-panel');
        const btn = document.getElementById('a11y-toggle-btn');
        this.a11y.panelOpen = !this.a11y.panelOpen;

        if (this.a11y.panelOpen) {
            panel.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
            // Focus first control in panel
            setTimeout(() => {
                const firstBtn = panel.querySelector('button, [tabindex]');
                if (firstBtn) firstBtn.focus();
            }, 100);
            // ACCESSIBILITY: Trap focus in panel with Escape to close
            this._a11yPanelKeyHandler = (e) => {
                if (e.key === 'Escape') {
                    this.toggleA11yPanel();
                }
            };
            panel.addEventListener('keydown', this._a11yPanelKeyHandler);
        } else {
            panel.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
            if (this._a11yPanelKeyHandler) {
                panel.removeEventListener('keydown', this._a11yPanelKeyHandler);
            }
            btn.focus();
        }
    },

    setFontSize(size) {
        this.a11y.fontSize = size;
        this.applyA11ySettings();
        this.saveA11ySettings();
    },

    toggleHighContrast() {
        this.a11y.highContrast = !this.a11y.highContrast;
        this.applyA11ySettings();
        this.saveA11ySettings();
    },

    toggleAnimations() {
        this.a11y.stopAnimations = !this.a11y.stopAnimations;
        this.applyA11ySettings();
        this.saveA11ySettings();
        // Stop any running confetti
        if (this.a11y.stopAnimations) {
            this.confettiRunning = false;
            if (this.confettiCtx && this.confettiCanvas) {
                this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
            }
        }
    },

    toggleFocusHighlight() {
        this.a11y.focusHighlight = !this.a11y.focusHighlight;
        this.applyA11ySettings();
        this.saveA11ySettings();
    },

    readPageAloud() {
        if (!('speechSynthesis' in window)) {
            alert('הדפדפן שלך לא תומך בהקראה.');
            return;
        }
        // Stop any current speech
        window.speechSynthesis.cancel();

        // Get visible text from active screen
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;

        const text = activeScreen.innerText || activeScreen.textContent;
        if (!text.trim()) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'he-IL';
        utterance.rate = 0.85;

        // Show stop button, hide read button
        const stopBtn = document.getElementById('a11y-stop-reading');
        if (stopBtn) stopBtn.classList.remove('hidden');

        utterance.onend = () => {
            if (stopBtn) stopBtn.classList.add('hidden');
        };

        window.speechSynthesis.speak(utterance);
    },

    stopReadingAloud() {
        window.speechSynthesis.cancel();
        const stopBtn = document.getElementById('a11y-stop-reading');
        if (stopBtn) stopBtn.classList.add('hidden');
    },

    resetA11ySettings() {
        this.a11y = {
            fontSize: 'medium',
            highContrast: false,
            stopAnimations: false,
            focusHighlight: false,
            panelOpen: this.a11y.panelOpen
        };
        this.applyA11ySettings();
        this.saveA11ySettings();
        // Stop any speech
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },

    // ==========================================
    // ACCESSIBILITY: Keyboard Navigation
    // ==========================================
    initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // ACCESSIBILITY: Arrow key navigation for choice buttons and radio groups
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' ||
                e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                const focused = document.activeElement;
                if (!focused) return;

                // Arrow keys for choice buttons
                if (focused.classList.contains('choice-btn')) {
                    e.preventDefault();
                    const parent = focused.closest('.choices-area');
                    if (!parent) return;
                    const btns = [...parent.querySelectorAll('.choice-btn:not([disabled])')];
                    const idx = btns.indexOf(focused);
                    if (idx === -1) return;
                    const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? -1 : 1; // RTL
                    const next = btns[(idx + dir + btns.length) % btns.length];
                    if (next) next.focus();
                    return;
                }

                // Arrow keys for gender radio group
                if (focused.classList.contains('btn-gender')) {
                    e.preventDefault();
                    const other = focused.id === 'btn-gender-boy' ? 'btn-gender-girl' : 'btn-gender-boy';
                    const otherBtn = document.getElementById(other);
                    if (otherBtn) {
                        otherBtn.focus();
                        otherBtn.click();
                    }
                    return;
                }

                // Arrow keys for module cards
                if (focused.classList.contains('module-card')) {
                    e.preventDefault();
                    const parent = focused.closest('.modules-grid');
                    if (!parent) return;
                    const cards = [...parent.querySelectorAll('.module-card')];
                    const idx = cards.indexOf(focused);
                    if (idx === -1) return;
                    const dir = (e.key === 'ArrowDown' || e.key === 'ArrowLeft') ? 1 : -1; // RTL
                    const next = cards[(idx + dir + cards.length) % cards.length];
                    if (next) next.focus();
                    return;
                }
            }
        });
    }
};

// ==========================================
// INITIALIZE APP ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
