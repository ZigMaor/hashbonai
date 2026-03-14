/* ==========================================
   חשבונאי - Math Modules Definition
   All 6 curriculum modules with tutorials,
   exercise generators, and answer checking.
   ========================================== */

// ==========================================
// Security: HTML escape to prevent XSS injection
// ==========================================
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// ==========================================
// Helper: generate random int in range [min, max]
// ==========================================
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// Helper: shuffle an array
// ==========================================
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ==========================================
// Helper: create colored blocks HTML
// ==========================================
function createBlocks(count, color) {
    let html = `<div class="block-group" role="img" aria-label="${count} קוביות">`;
    for (let i = 0; i < count; i++) {
        html += `<div class="block block-${color}" aria-hidden="true"></div>`;
    }
    html += '</div>';
    return html;
}

// ==========================================
// Helper: create number line SVG
// ==========================================
function createNumberLine(start, end, highlight, jumpFrom, jumpTo) {
    const width = 500;
    const margin = 40;
    const lineY = 35;
    const range = end - start;
    const step = (width - 2 * margin) / range;

    let svg = `<svg class="number-line-svg" viewBox="0 0 ${width} 70" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ציר מספרים מ-${start} עד ${end}">`;
    // Main line
    svg += `<line x1="${margin}" y1="${lineY}" x2="${width - margin}" y2="${lineY}" stroke="#CBD5E0" stroke-width="3"/>`;

    // Tick marks and numbers
    const tickInterval = range <= 20 ? 1 : (range <= 50 ? 5 : 10);
    for (let i = start; i <= end; i += tickInterval) {
        const x = margin + (i - start) * step;
        const isHighlight = i === highlight;
        svg += `<line x1="${x}" y1="${lineY - 8}" x2="${x}" y2="${lineY + 8}" stroke="${isHighlight ? '#FF8C42' : '#718096'}" stroke-width="${isHighlight ? 3 : 1.5}"/>`;
        svg += `<text x="${x}" y="${lineY + 25}" text-anchor="middle" font-size="12" font-weight="${isHighlight ? '700' : '400'}" fill="${isHighlight ? '#FF8C42' : '#718096'}">${i}</text>`;
    }

    // Jump arc
    if (jumpFrom !== undefined && jumpTo !== undefined) {
        const x1 = margin + (jumpFrom - start) * step;
        const x2 = margin + (jumpTo - start) * step;
        const midX = (x1 + x2) / 2;
        const arcY = lineY - 30;
        svg += `<path d="M${x1},${lineY - 8} Q${midX},${arcY} ${x2},${lineY - 8}" fill="none" stroke="#4A90D9" stroke-width="2.5" marker-end="url(#arrowhead)"/>`;
        svg += `<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#4A90D9"/></marker></defs>`;
    }

    // Highlight circle
    if (highlight !== undefined && highlight >= start && highlight <= end) {
        const hx = margin + (highlight - start) * step;
        svg += `<circle cx="${hx}" cy="${lineY}" r="8" fill="#FF8C42" opacity="0.3"/>`;
    }

    svg += '</svg>';
    return svg;
}

// ==========================================
// Helper: create clock SVG
// ==========================================
function createClockSVG(hours, minutes) {
    const cx = 100, cy = 100, r = 85;
    const minStr = minutes < 10 ? '0' + minutes : '' + minutes;
    let svg = `<svg class="clock-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="שעון מראה ${hours}:${minStr}">`;

    // Clock face
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#4A90D9" stroke-width="4"/>`;

    // Hour markers
    for (let i = 1; i <= 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const numR = r - 18;
        const tickR1 = r - 8;
        const tickR2 = r - 2;
        const nx = cx + numR * Math.cos(angle);
        const ny = cy + numR * Math.sin(angle);
        const tx1 = cx + tickR1 * Math.cos(angle);
        const ty1 = cy + tickR1 * Math.sin(angle);
        const tx2 = cx + tickR2 * Math.cos(angle);
        const ty2 = cy + tickR2 * Math.sin(angle);
        svg += `<line x1="${tx1}" y1="${ty1}" x2="${tx2}" y2="${ty2}" stroke="#2D3748" stroke-width="2"/>`;
        svg += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="central" font-size="16" font-weight="700" fill="#2D3748">${i}</text>`;
    }

    // Minute hand
    const minAngle = (minutes * 6 - 90) * Math.PI / 180;
    const minLen = r - 20;
    const mx = cx + minLen * Math.cos(minAngle);
    const my = cy + minLen * Math.sin(minAngle);
    svg += `<line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="#4A90D9" stroke-width="3" stroke-linecap="round"/>`;

    // Hour hand
    const hrAngle = ((hours % 12) * 30 + minutes * 0.5 - 90) * Math.PI / 180;
    const hrLen = r - 38;
    const hx = cx + hrLen * Math.cos(hrAngle);
    const hy = cy + hrLen * Math.sin(hrAngle);
    svg += `<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#2D3748" stroke-width="4.5" stroke-linecap="round"/>`;

    // Center dot
    svg += `<circle cx="${cx}" cy="${cy}" r="5" fill="#FF8C42"/>`;

    svg += '</svg>';
    return svg;
}

// ==========================================
// Helper: create digital clock display HTML
// ==========================================
function createDigitalClockHTML(hours, minutes) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `<div style="display:inline-flex;align-items:center;justify-content:center;background:#1a1a2e;color:#4ade80;font-family:'Courier New',monospace;font-size:2rem;font-weight:bold;padding:0.4rem 1rem;border-radius:10px;border:2px solid #333;direction:ltr;letter-spacing:2px;">${hours}:${pad(minutes)}</div>`;
}

// ==========================================
// Helper: create shape SVG
// ==========================================
function createShapeSVG(shape, size) {
    size = size || 150;
    const colors = ['#4A90D9', '#6BCB77', '#FF8C42', '#9B72CF', '#FF6B9D'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shapeNames = { triangle: 'משולש', square: 'ריבוע', rectangle: 'מלבן', circle: 'עיגול', pentagon: 'מחומש', hexagon: 'משושה', trapezoid: 'טרפז', rhombus: 'מעוין', oval: 'אליפסה', star: 'כוכב' };
    let svg = `<svg class="shape-svg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="צורה: ${shapeNames[shape] || shape}">`;
    const cx = size / 2, cy = size / 2;
    const s = size * 0.35;

    switch (shape) {
        case 'triangle':
            svg += `<polygon points="${cx},${cy - s} ${cx - s},${cy + s} ${cx + s},${cy + s}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'square':
            svg += `<rect x="${cx - s}" y="${cy - s}" width="${s * 2}" height="${s * 2}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'rectangle':
            svg += `<rect x="${cx - s * 1.3}" y="${cy - s * 0.7}" width="${s * 2.6}" height="${s * 1.4}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'circle':
            svg += `<circle cx="${cx}" cy="${cy}" r="${s}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'pentagon':
            const pts5 = [];
            for (let i = 0; i < 5; i++) {
                const a = (i * 72 - 90) * Math.PI / 180;
                pts5.push(`${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`);
            }
            svg += `<polygon points="${pts5.join(' ')}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'hexagon':
            const pts6 = [];
            for (let i = 0; i < 6; i++) {
                const a = (i * 60 - 90) * Math.PI / 180;
                pts6.push(`${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`);
            }
            svg += `<polygon points="${pts6.join(' ')}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'trapezoid':
            svg += `<polygon points="${cx - s * 0.6},${cy - s * 0.7} ${cx + s * 0.6},${cy - s * 0.7} ${cx + s},${cy + s * 0.7} ${cx - s},${cy + s * 0.7}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'rhombus':
            svg += `<polygon points="${cx},${cy - s} ${cx + s * 0.7},${cy} ${cx},${cy + s} ${cx - s * 0.7},${cy}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'oval':
            svg += `<ellipse cx="${cx}" cy="${cy}" rx="${s * 1.3}" ry="${s * 0.8}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
        case 'star':
            const starPts = [];
            for (let i = 0; i < 10; i++) {
                const a = (i * 36 - 90) * Math.PI / 180;
                const r = i % 2 === 0 ? s : s * 0.45;
                starPts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
            }
            svg += `<polygon points="${starPts.join(' ')}" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>`;
            break;
    }

    svg += '</svg>';
    return svg;
}


// ==========================================
// MODULE DEFINITIONS
// ==========================================

const MODULES = [
    // ============ MODULE 1: Addition up to 100 ============
    {
        id: 'addition',
        name: 'חיבור עד 100',
        icon: '➕',
        description: 'לומדים לחבר מספרים!',
        exerciseCount: 10,
        quizCount: 10,

        // Tutorial steps
        tutorial: [
            {
                speech: 'היום נלמד חיבור! 🎉\nחיבור זה כשמוסיפים מספרים ביחד.',
                content: `
                    <div class="tutorial-step">
                        <p>חיבור אומר: <span class="tutorial-highlight">כמה ביחד?</span></p>
                        <div class="tutorial-equation">3 + 2 = ?</div>
                        <p>אם יש לי 3 תפוחים 🍎🍎🍎</p>
                        <p>ומוסיפים עוד 2 תפוחים 🍎🍎</p>
                        <p>כמה יש ביחד?</p>
                    </div>
                `
            },
            {
                speech: 'נספור ביחד!',
                content: `
                    <div class="tutorial-step">
                        <p>🍎🍎🍎 + 🍎🍎</p>
                        <p>נספור: 1, 2, 3, 4, <span class="tutorial-highlight">5!</span></p>
                        <div class="tutorial-equation">3 + 2 = 5</div>
                        <p>מעולה! התשובה היא 5! ✨</p>
                    </div>
                `
            },
            {
                speech: 'עכשיו ננסה מספרים גדולים יותר!',
                content: `
                    <div class="tutorial-step">
                        <div class="tutorial-equation">24 + 13 = ?</div>
                        <p>פירוק: 20+10 = <span class="tutorial-highlight">30</span></p>
                        <p>ועוד: 4+3 = <span class="tutorial-highlight">7</span></p>
                        <p>ביחד: 30+7 = <span class="tutorial-highlight">37</span></p>
                        <div class="tutorial-equation">24 + 13 = 37 ✅</div>
                    </div>
                `
            },
            {
                speech: 'עכשיו תורך! 💪\nנתחיל עם תרגילים!',
                content: `
                    <div class="tutorial-step">
                        <p style="font-size:1.5rem;">🌟 טיפ: 🌟</p>
                        <p>תמיד אפשר לפרק מספרים</p>
                        <p>לעשרות ויחידות!</p>
                        <p style="margin-top:1rem;">מוכנים? בואו נתרגל! 🚀</p>
                    </div>
                `
            }
        ],

        // Generate a single exercise
        generateExercise(difficulty) {
            // difficulty: 0-2 (easy), 3-6 (medium), 7-9 (hard)
            let a, b;
            if (difficulty < 3) {
                // Two digits, no carrying
                a = randInt(12, 45);
                b = randInt(11, 40);
                if ((a % 10) + (b % 10) >= 10) {
                    b = (b - b % 10) + randInt(1, 9 - (a % 10));
                }
            } else if (difficulty < 7) {
                // Two digits, with carrying
                a = randInt(25, 65);
                b = randInt(18, 99 - a);
            } else {
                // Hard: larger numbers, always carrying
                a = randInt(35, 75);
                b = randInt(25, 99 - a);
                // Force carrying
                if ((a % 10) + (b % 10) < 10) {
                    b = (b - b % 10) + randInt(10 - (a % 10), 9);
                }
            }
            const answer = a + b;
            const tens_a = Math.floor(a / 10), ones_a = a % 10;
            const tens_b = Math.floor(b / 10), ones_b = b % 10;
            const hint = a + b <= 10
                ? `💡 התחל מ-${a} וספור ${b} קדימה`
                : `💡 פרק: ${tens_a * 10}+${tens_b * 10}=${(tens_a + tens_b) * 10}, ${ones_a}+${ones_b}=${ones_a + ones_b}`;
            return {
                type: 'input',
                question: `${a} + ${b} = ?`,
                displayHTML: `<span>${a}</span> <span class="operator-symbol">+</span> <span>${b}</span> <span class="operator-symbol">=</span> <span style="color:#4A90D9;">?</span>`,
                answer: answer,
                hint: hint,
                a: a,
                b: b,
                visualAid: this.getVisualAid(a, b, answer),
                explain: (userAns) => this.explainError(a, b, answer, userAns)
            };
        },

        getVisualAid(a, b, answer) {
            if (a + b <= 20) {
                return `<div class="blocks-container">
                    ${createBlocks(a, 'blue')}
                    <span class="operator-symbol" style="font-size:1.5rem;">+</span>
                    ${createBlocks(b, 'green')}
                </div>`;
            }
            return createNumberLine(0, Math.min(answer + 10, 110), undefined, a, answer);
        },

        explainError(a, b, correct, userAns) {
            const tens_a = Math.floor(a / 10), ones_a = a % 10;
            const tens_b = Math.floor(b / 10), ones_b = b % 10;
            if (a + b <= 10) {
                return `בוא נספור: ${a} ועוד ${b}. נתחיל מ-${a} ונוסיף ${b}: ${Array.from({length: b}, (_, i) => a + i + 1).join(', ')}. התשובה היא ${correct}!`;
            }
            return `נפרק: ${a} = ${tens_a * 10}+${ones_a}, ${b} = ${tens_b * 10}+${ones_b}. עשרות: ${tens_a * 10}+${tens_b * 10}=${(tens_a + tens_b) * 10}. יחידות: ${ones_a}+${ones_b}=${ones_a + ones_b}. ביחד: ${correct}!`;
        }
    },

    // ============ MODULE 2: Subtraction up to 100 ============
    {
        id: 'subtraction',
        name: 'חיסור עד 100',
        icon: '➖',
        description: 'לומדים לחסר מספרים!',
        exerciseCount: 10,
        quizCount: 10,

        tutorial: [
            {
                speech: 'עכשיו נלמד חיסור! ✂️\nחיסור זה כשמורידים מספרים.',
                content: `
                    <div class="tutorial-step">
                        <p>חיסור אומר: <span class="tutorial-highlight">כמה נשאר?</span></p>
                        <div class="tutorial-equation">5 - 2 = ?</div>
                        <p>אם יש לי 5 עוגיות 🍪🍪🍪🍪🍪</p>
                        <p>ואכלתי 2 עוגיות ❌❌</p>
                        <p>כמה נשאר?</p>
                    </div>
                `
            },
            {
                speech: 'נספור כמה נשאר!',
                content: `
                    <div class="tutorial-step">
                        <p>🍪🍪🍪🍪🍪 פחות 🍪🍪</p>
                        <p>נשאר: 🍪🍪🍪</p>
                        <div class="tutorial-equation">5 - 2 = 3</div>
                        <p>נשארו <span class="tutorial-highlight">3</span> עוגיות! 😋</p>
                    </div>
                `
            },
            {
                speech: 'ננסה עם מספרים גדולים!',
                content: `
                    <div class="tutorial-step">
                        <div class="tutorial-equation">47 - 23 = ?</div>
                        <p>פירוק: 40-20 = <span class="tutorial-highlight">20</span></p>
                        <p>ועוד: 7-3 = <span class="tutorial-highlight">4</span></p>
                        <p>ביחד: 20+4 = <span class="tutorial-highlight">24</span></p>
                        <div class="tutorial-equation">47 - 23 = 24 ✅</div>
                    </div>
                `
            },
            {
                speech: 'מעולה! עכשיו תורך! 🌟',
                content: `
                    <div class="tutorial-step">
                        <p style="font-size:1.5rem;">🌟 טיפ: 🌟</p>
                        <p>בחיסור, תמיד המספר הגדול בא ראשון!</p>
                        <p>אפשר גם לפרק לעשרות ויחידות.</p>
                        <p style="margin-top:1rem;">בוא נתרגל! 💪</p>
                    </div>
                `
            }
        ],

        generateExercise(difficulty) {
            let a, b;
            if (difficulty < 3) {
                // Two digits, no borrowing
                a = randInt(25, 60);
                b = randInt(11, 30);
                if ((a % 10) < (b % 10)) {
                    b = (b - b % 10) + randInt(0, a % 10);
                }
            } else if (difficulty < 7) {
                // Two digits, with borrowing
                a = randInt(40, 85);
                b = randInt(15, a - 10);
            } else {
                // Hard: larger numbers, with borrowing
                a = randInt(50, 99);
                b = randInt(20, a - 5);
                // Force borrowing
                if ((a % 10) >= (b % 10)) {
                    b = (b - b % 10) + randInt((a % 10) + 1, 9);
                    if (b > a - 2) b = a - randInt(3, 10);
                }
            }
            const answer = a - b;
            const tens_a = Math.floor(a / 10), ones_a = a % 10;
            const tens_b = Math.floor(b / 10), ones_b = b % 10;
            const hint = a <= 20
                ? `💡 התחל מ-${a} וספור ${b} אחורה`
                : `💡 פרק: ${tens_a * 10}−${tens_b * 10}=${(tens_a - tens_b) * 10}, ${ones_a}−${ones_b}=${ones_a - ones_b}`;
            return {
                type: 'input',
                question: `${a} - ${b} = ?`,
                displayHTML: `<span>${a}</span> <span class="operator-symbol">−</span> <span>${b}</span> <span class="operator-symbol">=</span> <span style="color:#4A90D9;">?</span>`,
                answer: answer,
                hint: hint,
                visualAid: this.getVisualAid(a, b, answer),
                explain: (userAns) => this.explainError(a, b, answer, userAns)
            };
        },

        getVisualAid(a, b, answer) {
            if (a <= 20) {
                // Show blocks with some crossed out
                let html = '<div class="blocks-container">';
                html += '<div class="block-group">';
                for (let i = 0; i < a; i++) {
                    if (i >= answer) {
                        html += `<div class="block block-pink" style="opacity:0.3;text-decoration:line-through;"></div>`;
                    } else {
                        html += `<div class="block block-blue"></div>`;
                    }
                }
                html += '</div></div>';
                return html;
            }
            return createNumberLine(Math.max(0, answer - 5), a + 5, undefined, a, answer);
        },

        explainError(a, b, correct, userAns) {
            const tens_a = Math.floor(a / 10), ones_a = a % 10;
            const tens_b = Math.floor(b / 10), ones_b = b % 10;
            if (a <= 10) {
                return `נתחיל מ-${a} ונספור אחורה ${b} צעדים: ${Array.from({length: b}, (_, i) => a - i - 1).join(', ')}. התשובה היא ${correct}!`;
            }
            return `נפרק: ${a} = ${tens_a * 10}+${ones_a}, ${b} = ${tens_b * 10}+${ones_b}. עשרות: ${tens_a * 10}-${tens_b * 10}=${(tens_a - tens_b) * 10}. יחידות: ${ones_a}-${ones_b}=${ones_a - ones_b}. ביחד: ${correct}!`;
        }
    },

    // ============ MODULE 3: כפל — Multiplication ============
    {
        id: 'multiplication',
        name: 'כפל',
        icon: '✖️',
        description: 'כפל בעזרת קבוצות שוות, ישר מספרים ומלבן!',
        exerciseCount: 10,
        quizCount: 10,

        tutorial: [
            {
                speech: 'בוא נלמד כפל! 🤩\nכפל זה חיבור חוזר של קבוצות שוות!',
                content: `
                    <div class="tutorial-step">
                        <p><span class="tutorial-highlight">כפל = קבוצות שוות</span></p>
                        <p>3 × 4 אומר: <span class="tutorial-highlight">3 קבוצות של 4</span></p>
                        <p>🍭🍭🍭🍭 | 🍭🍭🍭🍭 | 🍭🍭🍭🍭</p>
                        <p>זה כמו <span class="tutorial-highlight">חיבור חוזר</span>:</p>
                        <div class="tutorial-equation">3 × 4 = 4 + 4 + 4 = 12</div>
                    </div>
                `
            },
            {
                speech: 'אפשר לפתור כפל גם בספירה בקפיצות שוות!',
                content: `
                    <div class="tutorial-step">
                        <p><span class="tutorial-highlight">ספירה בקפיצות שוות</span></p>
                        <p>3 × 5 = ?</p>
                        <p>נקפוץ 3 קפיצות של 5:</p>
                        <p>5 ← 10 ← <span class="tutorial-highlight">15</span></p>
                        <div class="tutorial-equation">3 × 5 = 15</div>
                    </div>
                `
            },
            {
                speech: 'גם ישר המספרים עוזר לנו!',
                content: `
                    <div class="tutorial-step">
                        <p><span class="tutorial-highlight">כפל בעזרת ישר המספרים</span></p>
                        <p>4 × 3 = ?</p>
                        <p>נעשה 4 קפיצות של 3 על ישר המספרים:</p>
                        <p>0 →3→ 3 →3→ 6 →3→ 9 →3→ <span class="tutorial-highlight">12</span></p>
                        <div class="tutorial-equation">4 × 3 = 12</div>
                    </div>
                `
            },
            {
                speech: 'אפשר לראות כפל גם בתור מלבן!',
                content: `
                    <div class="tutorial-step">
                        <p><span class="tutorial-highlight">כפל בעזרת מלבן</span></p>
                        <p>2 שורות × 5 טורים:</p>
                        <p>⬜⬜⬜⬜⬜</p>
                        <p>⬜⬜⬜⬜⬜</p>
                        <div class="tutorial-equation">2 × 5 = 10</div>
                    </div>
                `
            },
            {
                speech: 'וזכרו את חוק החילוף! הסדר לא משנה!',
                content: `
                    <div class="tutorial-step">
                        <p><span class="tutorial-highlight">חוק החילוף</span></p>
                        <p>הסדר בכפל לא משנה!</p>
                        <p>🍎🍎🍎 | 🍎🍎🍎 = <span class="tutorial-highlight">2 × 3 = 6</span></p>
                        <p>🍎🍎 | 🍎🍎 | 🍎🍎 = <span class="tutorial-highlight">3 × 2 = 6</span></p>
                        <div class="tutorial-equation">2 × 3 = 3 × 2</div>
                        <p style="margin-top:1rem;">בוא נתחיל! 💪</p>
                    </div>
                `
            }
        ],

        // ---- Difficulty ranges ----
        _getRange(difficulty) {
            if (difficulty < 3) return { minA: 2, maxA: 5, minB: 2, maxB: 5 };
            if (difficulty < 7) return { minA: 2, maxA: 7, minB: 2, maxB: 8 };
            return { minA: 3, maxA: 9, minB: 3, maxB: 10 };
        },

        // ---- Question generators ----

        // Basic: a × b = ?
        _genBasicMult(difficulty) {
            const r = this._getRange(difficulty);
            const a = randInt(r.minA, r.maxA), b = randInt(r.minB, r.maxB);
            const answer = a * b;
            return {
                type: 'input',
                question: `${a} × ${b} = ?`,
                displayHTML: `<div class="question-text"><div style="direction:ltr;display:inline-block;">${a} × ${b} = <span style="color:#4A90D9;">?</span></div></div>`,
                answer,
                hint: `💡 חיבור חוזר: ${a} × ${b} = ${Array(a).fill(b).join(' + ')}`,
                visualAid: this._groupsVisual(a, b),
                explain: () => `${a} × ${b} = ${Array(a).fill(b).join(' + ')} = ${answer}. כפל זה חיבור חוזר!`
            };
        },

        // Write as repeated addition: 4 × 3 = ? + ? + ? + ? → answer is product
        _genRepeatedAddition(difficulty) {
            const r = this._getRange(difficulty);
            const a = randInt(r.minA, Math.min(r.maxA, 6)), b = randInt(r.minB, r.maxB);
            const answer = a * b;
            const addStr = Array(a).fill(b).join(' + ');
            return {
                type: 'input',
                question: `${addStr} = ?`,
                displayHTML: `<div class="question-text"><div style="direction:ltr;display:inline-block;">${addStr} = <span style="color:#4A90D9;">?</span></div></div>`,
                answer,
                hint: `💡 זה בעצם ${a} × ${b}! חיבור חוזר = כפל`,
                visualAid: this._groupsVisual(a, b),
                explain: () => `${addStr} = ${answer}. חיבור חוזר של ${b} בדיוק ${a} פעמים זה ${a} × ${b} = ${answer}!`
            };
        },

        // Write addition as multiplication: 5+5+5 = ?×? → choose correct multiplication
        _genWriteAsMult(difficulty) {
            const r = this._getRange(difficulty);
            const a = randInt(r.minA, Math.min(r.maxA, 6)), b = randInt(r.minB, r.maxB);
            const addStr = Array(a).fill(b).join(' + ');
            const correctStr = `${a} × ${b}`;
            const wrongs = [];
            wrongs.push(`${b} × ${a}`); // commutative — also correct but we handle below
            wrongs.push(`${a + 1} × ${b}`);
            wrongs.push(`${a} × ${b + 1}`);
            wrongs.push(`${b} × ${a + 1}`);
            // filter out duplicates and correct
            const choices = [correctStr];
            for (const w of wrongs) {
                if (!choices.includes(w) && choices.length < 4) choices.push(w);
            }
            let safety = 0;
            while (choices.length < 4 && safety++ < 20) {
                const c = `${randInt(2, 9)} × ${randInt(2, 9)}`;
                if (!choices.includes(c)) choices.push(c);
            }
            return {
                type: 'choice',
                question: `${addStr} = ?`,
                displayHTML: `<div class="question-text">איזה תרגיל כפל מתאים?<br><div style="direction:ltr;display:inline-block;">${addStr}</div></div>`,
                answer: correctStr,
                choices: shuffle(choices),
                hint: `💡 כמה פעמים מופיע ${b}? ← זה מספר הקבוצות`,
                visualAid: this._groupsVisual(a, b),
                explain: () => `${addStr} — המספר ${b} מופיע ${a} פעמים, לכן זה ${a} × ${b}. (גם ${b} × ${a} נכון לפי חוק החילוף!)`
            };
        },

        // Skip counting: complete the sequence
        _genSkipCounting(difficulty) {
            const r = this._getRange(difficulty);
            const step = randInt(r.minB, Math.min(r.maxB, 8));
            const count = randInt(r.minA, Math.min(r.maxA, 6));
            const seq = [];
            for (let i = 1; i <= count; i++) seq.push(step * i);
            // Hide last 1-2 elements
            const hideCount = difficulty < 3 ? 1 : (difficulty < 7 ? 1 : 2);
            const visiblePart = seq.slice(0, seq.length - hideCount);
            const answer = seq[seq.length - 1]; // last element
            const seqDisplay = visiblePart.map(n => `<span>${n}</span>`).join(' , ');
            const questionMarks = hideCount === 2 ? ` , <span style="color:#E53E3E;">?</span> , <span style="color:#4A90D9;">?</span>` : ` , <span style="color:#4A90D9;">?</span>`;
            return {
                type: 'input',
                question: `מה המספר הבא בסדרה?`,
                displayHTML: `<div class="question-text">ספירה בקפיצות של ${step}:<br><div style="direction:ltr;display:inline-block;">${seqDisplay}${questionMarks}</div></div>`,
                answer,
                hint: `💡 כל פעם מוסיפים ${step}. מה בא אחרי ${visiblePart[visiblePart.length - 1]}?`,
                visualAid: this._numberLineVisual(step, count),
                explain: () => `הסדרה קופצת ב-${step} כל פעם: ${seq.join(', ')}. התשובה היא ${answer}!`
            };
        },

        // Number line jumps: how many jumps / where do we land
        _genNumberLine(difficulty) {
            const r = this._getRange(difficulty);
            const jumpSize = randInt(r.minB, Math.min(r.maxB, 7));
            const jumpCount = randInt(r.minA, Math.min(r.maxA, 6));
            const endpoint = jumpSize * jumpCount;
            // Two sub-types
            if (Math.random() < 0.5) {
                // Given jumps and size → where do we land?
                return {
                    type: 'input',
                    question: `${jumpCount} קפיצות של ${jumpSize} על ישר המספרים — מגיעים ל...?`,
                    displayHTML: `<div class="question-text">${jumpCount} קפיצות של ${jumpSize} על ישר המספרים<br>נקודת הסיום = <span style="color:#4A90D9;">?</span></div>`,
                    answer: endpoint,
                    hint: `💡 ${jumpCount} × ${jumpSize} = ?`,
                    visualAid: this._numberLineVisual(jumpSize, jumpCount),
                    explain: () => `${jumpCount} קפיצות של ${jumpSize}: ${Array.from({length: jumpCount}, (_, i) => jumpSize * (i + 1)).join(', ')}. נקודת הסיום היא ${endpoint}!`
                };
            } else {
                // Given endpoint and jump size → how many jumps?
                return {
                    type: 'input',
                    question: `קפיצות של ${jumpSize} עד ${endpoint} — כמה קפיצות?`,
                    displayHTML: `<div class="question-text">קפיצות של ${jumpSize} על ישר המספרים עד ${endpoint}<br>מספר הקפיצות = <span style="color:#4A90D9;">?</span></div>`,
                    answer: jumpCount,
                    hint: `💡 כמה פעמים ${jumpSize} נכנס ב-${endpoint}?`,
                    visualAid: this._numberLineVisual(jumpSize, jumpCount),
                    explain: () => `מ-0 עד ${endpoint} בקפיצות של ${jumpSize}: ${Array.from({length: jumpCount}, (_, i) => jumpSize * (i + 1)).join(', ')}. זה ${jumpCount} קפיצות! (${jumpCount} × ${jumpSize} = ${endpoint})`
                };
            }
        },

        // Rectangle array: rows × columns
        _genRectangleArray(difficulty) {
            const r = this._getRange(difficulty);
            const rows = randInt(r.minA, Math.min(r.maxA, 6));
            const cols = randInt(r.minB, Math.min(r.maxB, 7));
            const answer = rows * cols;
            const rectHTML = this._rectVisual(rows, cols);
            if (Math.random() < 0.5) {
                // Count total
                return {
                    type: 'input',
                    question: `כמה ריבועים יש במלבן?`,
                    displayHTML: `<div class="question-text">מלבן: ${rows} שורות × ${cols} טורים<br>סך הכל = <span style="color:#4A90D9;">?</span></div>`,
                    answer,
                    hint: `💡 ${rows} שורות × ${cols} טורים = ?`,
                    visualAid: rectHTML,
                    explain: () => `${rows} שורות × ${cols} טורים = ${rows} × ${cols} = ${answer} ריבועים!`
                };
            } else {
                // Write the multiplication exercise
                const correctStr = `${rows} × ${cols}`;
                const choices = [correctStr, `${cols} × ${rows}`, `${rows + 1} × ${cols}`, `${rows} × ${cols + 1}`];
                const unique = [...new Set(choices)];
                let safety = 0;
                while (unique.length < 4 && safety++ < 20) {
                    const c = `${randInt(2, 8)} × ${randInt(2, 8)}`;
                    if (!unique.includes(c)) unique.push(c);
                }
                return {
                    type: 'choice',
                    question: `איזה תרגיל כפל מתאים למלבן?`,
                    displayHTML: `<div class="question-text">כמה שורות? כמה טורים?</div>`,
                    answer: correctStr,
                    choices: shuffle(unique.slice(0, 4)),
                    hint: `💡 ספרו: כמה שורות? כמה טורים?`,
                    visualAid: rectHTML,
                    explain: () => `המלבן מכיל ${rows} שורות ו-${cols} טורים, לכן ${rows} × ${cols} = ${answer}. (גם ${cols} × ${rows} נכון — חוק החילוף!)`
                };
            }
        },

        // Equal groups word problem
        _genGroupsProblem(difficulty) {
            const r = this._getRange(difficulty);
            const groups = randInt(r.minA, Math.min(r.maxA, 7));
            const perGroup = randInt(r.minB, Math.min(r.maxB, 8));
            const answer = groups * perGroup;
            const scenarios = [
                { item: 'ילדים', container: 'קבוצות', singular: 'קבוצה', each: 'אחת', emoji: '👦' },
                { item: 'עפרונות', container: 'קלמרים', singular: 'קלמר', each: 'אחד', emoji: '✏️' },
                { item: 'תפוחים', container: 'שקיות', singular: 'שקית', each: 'אחת', emoji: '🍎' },
                { item: 'ממתקים', container: 'שקיות', singular: 'שקית', each: 'אחת', emoji: '🍬' },
                { item: 'כדורים', container: 'קופסאות', singular: 'קופסה', each: 'אחת', emoji: '⚽' },
                { item: 'פרחים', container: 'אגרטלים', singular: 'אגרטל', each: 'אחד', emoji: '🌸' },
                { item: 'ביצים', container: 'תבניות', singular: 'תבנית', each: 'אחת', emoji: '🥚' },
                { item: 'עוגיות', container: 'צלחות', singular: 'צלחת', each: 'אחת', emoji: '🍪' }
            ];
            const s = scenarios[randInt(0, scenarios.length - 1)];
            const problemText = `יש ${groups} ${s.container}. בכל ${s.singular} יש ${perGroup} ${s.item}. כמה ${s.item} יש בסך הכל?`;
            return {
                type: 'input',
                question: problemText,
                displayHTML: `<div class="question-text">${s.emoji} ${problemText}</div>`,
                answer,
                hint: `💡 ${groups} ${s.container} × ${perGroup} ${s.item} = ?`,
                visualAid: this._groupsVisual(groups, perGroup),
                explain: () => `${groups} × ${perGroup} = ${answer}. יש ${groups} ${s.container}, בכל ${s.each} ${perGroup} ${s.item}, סך הכל ${answer} ${s.item}!`
            };
        },

        // Commutative property
        _genCommutative(difficulty) {
            const r = this._getRange(difficulty);
            const a = randInt(r.minA, r.maxA), b = randInt(r.minB, r.maxB);
            if (a === b) return this._genBasicMult(difficulty); // avoid trivial case
            const answer = a * b;
            // Which equals a × b?
            const correctStr = `${b} × ${a}`;
            const wrongs = [`${a} × ${a}`, `${b} × ${b}`, `${a + 1} × ${b}`, `${a} × ${b + 1}`];
            const choices = [correctStr];
            for (const w of wrongs) {
                if (!choices.includes(w) && w !== `${a} × ${b}` && choices.length < 4) choices.push(w);
            }
            let safety = 0;
            while (choices.length < 4 && safety++ < 20) {
                const c = `${randInt(2, 9)} × ${randInt(2, 9)}`;
                if (!choices.includes(c)) choices.push(c);
            }
            return {
                type: 'choice',
                question: `לפי חוק החילוף: ${a} × ${b} = ?`,
                displayHTML: `<div class="question-text">חוק החילוף:<br><div style="direction:ltr;display:inline-block;">${a} × ${b} = <span style="color:#4A90D9;">?</span></div></div>`,
                answer: correctStr,
                choices: shuffle(choices),
                hint: `💡 חוק החילוף: הסדר בכפל לא משנה! ${a} × ${b} = ${b} × ${a}`,
                visualAid: `<div class="blocks-container" style="gap:1rem;"><div style="text-align:center;"><div style="font-weight:bold;margin-bottom:4px;">${a} × ${b}</div>${this._miniRect(a, b)}</div><div style="font-size:1.5rem;align-self:center;">=</div><div style="text-align:center;"><div style="font-weight:bold;margin-bottom:4px;">${b} × ${a}</div>${this._miniRect(b, a)}</div></div>`,
                explain: () => `חוק החילוף: ${a} × ${b} = ${b} × ${a} = ${answer}. הסדר לא משנה — התוצאה תמיד זהה!`
            };
        },

        // ---- Visual helpers ----

        _groupsVisual(groups, perGroup) {
            let html = '<div class="blocks-container" style="gap:0.8rem;flex-wrap:wrap;">';
            const colors = ['blue', 'green', 'orange', 'pink', 'purple'];
            for (let i = 0; i < Math.min(groups, 8); i++) {
                html += `<div class="block-group" style="border:2px dashed #CBD5E0;padding:4px;border-radius:8px;">`;
                for (let j = 0; j < Math.min(perGroup, 10); j++) {
                    html += `<div class="block block-${colors[i % 5]}"></div>`;
                }
                html += '</div>';
            }
            html += '</div>';
            return html;
        },

        _numberLineVisual(jumpSize, jumpCount) {
            const end = jumpSize * jumpCount;
            const maxVal = end + jumpSize;
            const width = 400, height = 80, margin = 30;
            let svg = `<svg viewBox="0 0 ${width} ${height}" style="max-width:100%;direction:ltr;">`;
            // Line
            svg += `<line x1="${margin}" y1="50" x2="${width - margin}" y2="50" stroke="#333" stroke-width="2"/>`;
            // Arrow
            svg += `<polygon points="${width - margin},50 ${width - margin - 8},44 ${width - margin - 8},56" fill="#333"/>`;
            // Ticks and labels
            const tickStep = Math.max(1, Math.ceil(maxVal / 12));
            for (let v = 0; v <= maxVal; v += tickStep) {
                const x = margin + (v / maxVal) * (width - 2 * margin);
                svg += `<line x1="${x}" y1="46" x2="${x}" y2="54" stroke="#333" stroke-width="1.5"/>`;
                svg += `<text x="${x}" y="68" text-anchor="middle" font-size="10" fill="#333">${v}</text>`;
            }
            // Jumps
            const arcColors = ['#E53E3E', '#DD6B20', '#38A169', '#3182CE', '#805AD5', '#D53F8C'];
            for (let i = 0; i < jumpCount; i++) {
                const x1 = margin + ((jumpSize * i) / maxVal) * (width - 2 * margin);
                const x2 = margin + ((jumpSize * (i + 1)) / maxVal) * (width - 2 * margin);
                const mx = (x1 + x2) / 2;
                const color = arcColors[i % arcColors.length];
                svg += `<path d="M${x1},48 Q${mx},${15} ${x2},48" fill="none" stroke="${color}" stroke-width="2"/>`;
                svg += `<polygon points="${x2},48 ${x2 - 4},40 ${x2 - 6},48" fill="${color}"/>`;
                svg += `<text x="${mx}" y="14" text-anchor="middle" font-size="9" fill="${color}">+${jumpSize}</text>`;
            }
            svg += '</svg>';
            return svg;
        },

        _rectVisual(rows, cols) {
            const size = 28, gap = 3;
            const w = cols * (size + gap) + gap;
            const h = rows * (size + gap) + gap;
            let svg = `<svg viewBox="0 0 ${w} ${h}" style="max-width:100%;">`;
            const colors = ['#63B3ED', '#68D391', '#F6AD55', '#FC8181', '#B794F4'];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = gap + c * (size + gap), y = gap + r * (size + gap);
                    svg += `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="4" fill="${colors[r % colors.length]}" stroke="#fff" stroke-width="1"/>`;
                }
            }
            svg += '</svg>';
            return svg;
        },

        _miniRect(rows, cols) {
            const s = 14, g = 2;
            const w = cols * (s + g) + g, h = rows * (s + g) + g;
            let svg = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    svg += `<rect x="${g + c * (s + g)}" y="${g + r * (s + g)}" width="${s}" height="${s}" rx="2" fill="#63B3ED" stroke="#fff" stroke-width="1"/>`;
                }
            }
            svg += '</svg>';
            return svg;
        },

        // ---- Main generator ----
        generateExercise(difficulty) {
            const generators = [];
            if (difficulty < 3) {
                // Easy: basic mult, repeated addition, groups problem
                generators.push(
                    () => this._genBasicMult(difficulty),
                    () => this._genRepeatedAddition(difficulty),
                    () => this._genGroupsProblem(difficulty),
                    () => this._genSkipCounting(difficulty)
                );
            } else if (difficulty < 7) {
                // Medium: all of the above + write as mult, number line, rectangle
                generators.push(
                    () => this._genBasicMult(difficulty),
                    () => this._genRepeatedAddition(difficulty),
                    () => this._genWriteAsMult(difficulty),
                    () => this._genSkipCounting(difficulty),
                    () => this._genNumberLine(difficulty),
                    () => this._genRectangleArray(difficulty),
                    () => this._genGroupsProblem(difficulty)
                );
            } else {
                // Hard: all types including commutative
                generators.push(
                    () => this._genBasicMult(difficulty),
                    () => this._genWriteAsMult(difficulty),
                    () => this._genSkipCounting(difficulty),
                    () => this._genNumberLine(difficulty),
                    () => this._genRectangleArray(difficulty),
                    () => this._genGroupsProblem(difficulty),
                    () => this._genCommutative(difficulty)
                );
            }
            return generators[randInt(0, generators.length - 1)]();
        }
    },

    // ============ MODULE 4: Word Problems ============
    {
        id: 'word_problems',
        name: 'בעיות מילוליות',
        icon: '📝',
        description: 'פותרים חידות חשבון!',
        exerciseCount: 10,
        quizCount: 10,

        tutorial: [
            {
                speech: 'עכשיו נלמד לפתור חידות! 🧩',
                content: `
                    <div class="tutorial-step">
                        <p>בבעיה מילולית צריך:</p>
                        <p>1️⃣ <span class="tutorial-highlight">לקרוא בעיון</span></p>
                        <p>2️⃣ <span class="tutorial-highlight">למצוא את המספרים</span></p>
                        <p>3️⃣ <span class="tutorial-highlight">להבין מה לעשות</span> (חיבור? חיסור?)</p>
                        <p>4️⃣ <span class="tutorial-highlight">לחשב ולענות!</span></p>
                    </div>
                `
            },
            {
                speech: 'ננסה ביחד!',
                content: `
                    <div class="tutorial-step word-problem">
                        <div class="word-problem-emoji">🍎</div>
                        <p>"לדני יש 5 תפוחים.</p>
                        <p>הוא קיבל עוד 3 תפוחים.</p>
                        <p>כמה תפוחים יש לדני?"</p>
                        <p style="margin-top:1rem;">המילה <span class="tutorial-highlight">"עוד"</span> = חיבור!</p>
                        <div class="tutorial-equation">5 + 3 = 8</div>
                    </div>
                `
            },
            {
                speech: 'עוד דוגמה!',
                content: `
                    <div class="tutorial-step word-problem">
                        <div class="word-problem-emoji">🍬</div>
                        <p>"לשרה היו 10 סוכריות.</p>
                        <p>היא נתנה 4 לחברה.</p>
                        <p>כמה סוכריות נשארו?"</p>
                        <p style="margin-top:1rem;">המילה <span class="tutorial-highlight">"נתנה"</span> = חיסור!</p>
                        <div class="tutorial-equation">10 - 4 = 6</div>
                    </div>
                `
            },
            {
                speech: 'מוכנים? בואו נפתור חידות! 🎯',
                content: `
                    <div class="tutorial-step">
                        <p style="font-size:1.5rem;">🌟 מילים חשובות: 🌟</p>
                        <p><span class="tutorial-highlight">עוד, קיבל, הוסיף</span> ← חיבור ➕</p>
                        <p><span class="tutorial-highlight">נתן, הלך, אכל, שבר</span> ← חיסור ➖</p>
                        <p><span class="tutorial-highlight">כל אחד, קבוצות של</span> ← כפל ✖️</p>
                        <p style="margin-top:1rem;">בוא נתחיל! 🚀</p>
                    </div>
                `
            }
        ],

        // Word problem templates
        _problems: [
            // Addition problems
            { template: (a, b) => { const n = escapeHTML(App.playerName); return `ל${n} יש ${a} צבעים. אמא קנתה ${App.g('לו','לה')} עוד ${b} צבעים. כמה צבעים יש ל${n}?`; }, op: '+', emoji: '🖍️' },
            { template: (a, b) => `בכיתה יש ${a} ילדים. הגיעו עוד ${b} ילדים. כמה ילדים יש בכיתה?`, op: '+', emoji: '👧' },
            { template: (a, b) => `על העץ יש ${a} ציפורים. הגיעו עוד ${b} ציפורים. כמה ציפורים יש על העץ?`, op: '+', emoji: '🐦' },
            { template: (a, b) => { const n = escapeHTML(App.playerName); return `${n} ${App.g('קרא','קראה')} ${a} עמודים אתמול ו-${b} עמודים היום. כמה עמודים ${App.g('קרא','קראה')} ביחד?`; }, op: '+', emoji: '📖' },
            { template: (a, b) => `בחנות יש ${a} בובות ועוד ${b} דובים. כמה צעצועים יש ביחד?`, op: '+', emoji: '🧸' },
            // Subtraction problems
            { template: (a, b) => { const n = escapeHTML(App.playerName); return `ל${n} היו ${a} מדבקות. ${App.g('הוא נתן','היא נתנה')} ${b} ${App.g('לחבר','לחברה')}. כמה מדבקות נשארו?`; }, op: '-', emoji: '⭐' },
            { template: (a, b) => { const n = escapeHTML(App.playerName); return `בצלחת היו ${a} עוגיות. ${n} ${App.g('אכל','אכלה')} ${b}. כמה עוגיות נשארו?`; }, op: '-', emoji: '🍪' },
            { template: (a, b) => `באוטובוס היו ${a} אנשים. ירדו ${b} אנשים. כמה אנשים נשארו?`, op: '-', emoji: '🚌' },
            { template: (a, b) => { const n = escapeHTML(App.playerName); return `ל${n} היו ${a} בלונים. עפו ${b} בלונים. כמה בלונים נשארו?`; }, op: '-', emoji: '🎈' },
            { template: (a, b) => `על השולחן היו ${a} כוסות. שברו ${b} כוסות. כמה כוסות נשארו?`, op: '-', emoji: '🥤' },
            // Multiplication problems
            { template: (a, b) => `לכל ילד יש ${b} סוכריות. יש ${a} ילדים. כמה סוכריות יש ביחד?`, op: '×', emoji: '🍬' },
            { template: (a, b) => `בכל שקית יש ${b} תפוחים. יש ${a} שקיות. כמה תפוחים יש ביחד?`, op: '×', emoji: '🍎' },
        ],

        generateExercise(difficulty) {
            let problemList;
            if (difficulty < 4) {
                problemList = this._problems.filter(p => p.op === '+');
            } else if (difficulty < 7) {
                problemList = this._problems.filter(p => p.op === '-');
            } else {
                problemList = this._problems.filter(p => p.op === '×');
            }
            const prob = problemList[randInt(0, problemList.length - 1)];
            let a, b, answer;

            if (prob.op === '+') {
                a = randInt(25, 65);
                b = randInt(15, 99 - a);
                answer = a + b;
            } else if (prob.op === '-') {
                a = randInt(40, 90);
                b = randInt(12, a - 5);
                answer = a - b;
            } else {
                a = randInt(3, 8);
                b = randInt(3, 9);
                answer = a * b;
            }

            let hint;
            if (prob.op === '+') hint = `💡 חפש מילים כמו "עוד" או "ביחד" — זה חיבור: ${a} + ${b}`;
            else if (prob.op === '-') hint = `💡 חפש מילים כמו "נשארו" או "עפו" — זה חיסור: ${a} - ${b}`;
            else hint = `💡 קבוצות שוות = כפל: ${a} × ${b}`;

            return {
                type: 'input',
                question: prob.template(a, b),
                displayHTML: `<div class="word-problem"><div class="word-problem-emoji">${prob.emoji}</div><div class="question-text">${prob.template(a, b)}</div></div>`,
                answer: answer,
                hint: hint,
                visualAid: '',
                explain: (userAns) => {
                    if (prob.op === '+') return `צריך לחבר: ${a} + ${b} = ${answer}. המילה "עוד" או "ביחד" אומרת חיבור!`;
                    if (prob.op === '-') return `צריך לחסר: ${a} - ${b} = ${answer}. המילה "נשארו" או "נתנה" אומרת חיסור!`;
                    return `צריך לכפול: ${a} × ${b} = ${answer}. כשיש קבוצות שוות, זה כפל!`;
                }
            };
        }
    },

    // ============ MODULE 5: Geometric Shapes ============
    // Based on "כוח" grade 2 geometry curriculum:
    // מצלעים (polygons), זוויות ישרות (right angles),
    // היקף (perimeter), סימטריה (symmetry)
    {
        id: 'shapes',
        name: 'צורות גיאומטריות',
        icon: '🔺',
        description: 'לומדים על מצלעים!',
        exerciseCount: 10,
        quizCount: 10,

        tutorial: [
            {
                speech: 'בוא נלמד על מצלעים! 🔷',
                content: `
                    <div class="tutorial-step">
                        <p><span class="tutorial-highlight">מצלע</span> הוא צורה סגורה שעשויה רק מקווים ישרים.</p>
                        <p>הקווים נקראים <span class="tutorial-highlight">צלעות</span>,</p>
                        <p>ונקודות החיבור בין הצלעות נקראות <span class="tutorial-highlight">קדקודים</span>.</p>
                        <p style="margin-top:0.5rem;">סוג המצלע נקבע לפי מספר הצלעות או הקדקודים שלו.</p>
                    </div>
                `
            },
            {
                speech: 'לכל מצלע יש שם לפי מספר הצלעות!',
                content: `
                    <div class="tutorial-step">
                        <p>🔺 <span class="tutorial-highlight">משולש</span> - 3 צלעות, 3 קדקודים</p>
                        <p>🔲 <span class="tutorial-highlight">מרובע</span> - 4 צלעות, 4 קדקודים</p>
                        <p>⬠ <span class="tutorial-highlight">מחומש</span> - 5 צלעות, 5 קדקודים</p>
                        <p>⬡ <span class="tutorial-highlight">משושה</span> - 6 צלעות, 6 קדקודים</p>
                        <p style="margin-top:0.5rem;">💡 שם המצלע אומר כמה צלעות!</p>
                    </div>
                `
            },
            {
                speech: 'יש סוגים מיוחדים של מרובעים!',
                content: `
                    <div class="tutorial-step">
                        <p>🔲 <span class="tutorial-highlight">ריבוע</span> - 4 צלעות שוות, כל הזוויות ישרות</p>
                        <p>▬ <span class="tutorial-highlight">מלבן</span> - כל הזוויות ישרות, לא כל הצלעות שוות</p>
                        <p>◇ <span class="tutorial-highlight">מעוין</span> - 4 צלעות שוות, בלי זוויות ישרות</p>
                    </div>
                `
            },
            {
                speech: 'מה זו זווית ישרה?',
                content: `
                    <div class="tutorial-step">
                        <p><span class="tutorial-highlight">זווית ישרה</span> היא כמו פינה של דף. 📐</p>
                        <p>אפשר לבדוק בעזרת פינה של דף או של קלף!</p>
                        <p style="margin-top:0.5rem;">✅ ל<span class="tutorial-highlight">ריבוע</span> - 4 זוויות ישרות</p>
                        <p>✅ ל<span class="tutorial-highlight">מלבן</span> - 4 זוויות ישרות</p>
                        <p>❌ ל<span class="tutorial-highlight">מעוין</span> - אין זוויות ישרות</p>
                    </div>
                `
            },
            {
                speech: 'ועכשיו נלמד על היקף!',
                content: `
                    <div class="tutorial-step">
                        <p><span class="tutorial-highlight">היקף</span> של מצלע הוא סכום אורכי הצלעות שלו.</p>
                        <p style="margin-top:0.5rem;">למשל: משולש עם צלעות 3, 3, 5</p>
                        <p>היקף = 3 + 3 + 5 = <span class="tutorial-highlight">11 ס"מ</span></p>
                        <p style="margin-top:0.5rem;">💡 אם כל הצלעות שוות, אפשר להשתמש בכפל!</p>
                        <p>מחומש עם צלע 3 → היקף = 3 × 5 = <span class="tutorial-highlight">15 ס"מ</span></p>
                    </div>
                `
            },
            {
                speech: 'עכשיו תורך! 🌟',
                content: `
                    <div class="tutorial-step">
                        <p>בוא נתרגל!</p>
                        <p>✅ זיהוי מצלעים</p>
                        <p>✅ ספירת צלעות וקדקודים</p>
                        <p>✅ זוויות ישרות</p>
                        <p>✅ חישוב היקף</p>
                        <p style="margin-top:1rem;">מוכנים? 🚀</p>
                    </div>
                `
            }
        ],

        _shapeData: {
            triangle:  { name: 'משולש', sides: 3, vertices: 3, rightAngles: 0, allSidesEqual: false },
            square:    { name: 'ריבוע', sides: 4, vertices: 4, rightAngles: 4, allSidesEqual: true },
            rectangle: { name: 'מלבן', sides: 4, vertices: 4, rightAngles: 4, allSidesEqual: false },
            pentagon:  { name: 'מחומש', sides: 5, vertices: 5, rightAngles: 0, allSidesEqual: false },
            hexagon:   { name: 'משושה', sides: 6, vertices: 6, rightAngles: 0, allSidesEqual: false },
            rhombus:   { name: 'מעוין', sides: 4, vertices: 4, rightAngles: 0, allSidesEqual: true }
        },

        // Shape pools by difficulty
        _easyShapes: ['triangle', 'square', 'rectangle'],
        _mediumShapes: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'],
        _hardShapes: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'rhombus'],

        // --- Question generators ---

        // Q1: Identify shape name
        _genIdentify(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            const otherNames = Object.values(this._shapeData).map(s => s.name).filter(n => n !== shape.name);
            const choices = shuffle([shape.name, ...shuffle(otherNames).slice(0, 3)]);
            return {
                type: 'choice',
                question: 'מה שם המצלע?',
                displayHTML: '<div class="question-text">מה שם המצלע?</div>',
                answer: shape.name,
                choices: choices,
                hint: `💡 ספרו את הצלעות: יש ${shape.sides} צלעות`,
                visualAid: `<div class="shape-display">${createShapeSVG(shapeKey, 180)}</div>`,
                explain: () => `זהו ${shape.name}. יש לו ${shape.sides} צלעות ו-${shape.vertices} קדקודים.`
            };
        },

        // Q2: Count sides (צלעות)
        _genCountSides(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            return {
                type: 'input',
                question: `כמה צלעות יש ל${shape.name}?`,
                displayHTML: `<div class="question-text">כמה צלעות יש ל${shape.name}?</div>`,
                answer: shape.sides,
                hint: '💡 צלע = קו ישר. ספרו את הקווים!',
                visualAid: `<div class="shape-display">${createShapeSVG(shapeKey, 180)}</div>`,
                explain: () => `ל${shape.name} יש ${shape.sides} צלעות.`
            };
        },

        // Q3: Count vertices (קדקודים)
        _genCountVertices(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            return {
                type: 'input',
                question: `כמה קדקודים יש ל${shape.name}?`,
                displayHTML: `<div class="question-text">כמה קדקודים יש ל${shape.name}?</div>`,
                answer: shape.vertices,
                hint: '💡 קדקוד = נקודת חיבור בין שתי צלעות. סמנו וספרו!',
                visualAid: `<div class="shape-display">${createShapeSVG(shapeKey, 180)}</div>`,
                explain: () => `ל${shape.name} יש ${shape.vertices} קדקודים. קדקוד הוא הנקודה שבה שתי צלעות נפגשות.`
            };
        },

        // Q4: Compare sides between two shapes
        _genSidesCompare(pool) {
            let key1, key2, s1, s2;
            let attempts = 0;
            do {
                key1 = pool[randInt(0, pool.length - 1)];
                key2 = pool[randInt(0, pool.length - 1)];
                s1 = this._shapeData[key1];
                s2 = this._shapeData[key2];
                attempts++;
            } while (s1.sides === s2.sides && attempts < 20);
            if (s1.sides === s2.sides) return this._genIdentify(pool);

            const answer = s1.sides > s2.sides ? s1.name : s2.name;
            return {
                type: 'choice',
                question: 'לאיזה מצלע יש יותר צלעות?',
                displayHTML: '<div class="question-text">לאיזה מצלע יש יותר צלעות?</div>',
                answer: answer,
                choices: shuffle([s1.name, s2.name]),
                hint: '💡 ספרו את הצלעות של כל מצלע!',
                visualAid: `<div class="shape-display" style="display:flex;gap:2rem;justify-content:center;">
                    <div style="text-align:center;">${createShapeSVG(key1, 140)}<div>${s1.name}</div></div>
                    <div style="text-align:center;">${createShapeSVG(key2, 140)}<div>${s2.name}</div></div>
                </div>`,
                explain: () => `ל${s1.name} יש ${s1.sides} צלעות ול${s2.name} יש ${s2.sides} צלעות. ל${answer} יש יותר!`
            };
        },

        // Q5: Does shape have right angles? (זוויות ישרות)
        _genRightAngles(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            const hasRightAngles = shape.rightAngles > 0;
            return {
                type: 'choice',
                question: `האם ל${shape.name} יש זוויות ישרות?`,
                displayHTML: `<div class="question-text">האם ל${shape.name} יש זוויות ישרות? 📐</div>`,
                answer: hasRightAngles ? 'כן' : 'לא',
                choices: ['כן', 'לא'],
                hint: '💡 זווית ישרה היא כמו פינה של דף. בדקו אם הפינות נראות כמו פינת דף!',
                visualAid: `<div class="shape-display">${createShapeSVG(shapeKey, 180)}</div>`,
                explain: () => hasRightAngles
                    ? `כן! ל${shape.name} יש ${shape.rightAngles} זוויות ישרות.`
                    : `לא! ל${shape.name} אין זוויות ישרות. הזוויות שלו לא כמו פינת דף.`
            };
        },

        // Q6: How many right angles?
        _genCountRightAngles(pool) {
            const shapesWithRA = pool.filter(k => this._shapeData[k].rightAngles > 0);
            const useWithRA = shapesWithRA.length > 0 && Math.random() < 0.6;
            const pickPool = useWithRA ? shapesWithRA : pool;
            const shapeKey = pickPool[randInt(0, pickPool.length - 1)];
            const shape = this._shapeData[shapeKey];
            return {
                type: 'input',
                question: `כמה זוויות ישרות יש ל${shape.name}?`,
                displayHTML: `<div class="question-text">כמה זוויות ישרות יש ל${shape.name}? 📐</div>`,
                answer: shape.rightAngles,
                hint: '💡 זווית ישרה = כמו פינת דף. לריבוע ולמלבן יש 4!',
                visualAid: `<div class="shape-display">${createShapeSVG(shapeKey, 180)}</div>`,
                explain: () => shape.rightAngles > 0
                    ? `ל${shape.name} יש ${shape.rightAngles} זוויות ישרות.`
                    : `ל${shape.name} אין זוויות ישרות (0).`
            };
        },

        // Q7: Identify shape by its properties
        _genShapeByProperty(pool) {
            const properties = [
                { q: 'לאיזה מצלע יש 4 זוויות ישרות וכל הצלעות שוות?', answer: 'ריבוע', key: 'square', hint: '💡 כל הצלעות שוות + כל הזוויות ישרות = ?' },
                { q: 'לאיזה מצלע יש 4 זוויות ישרות, אבל לא כל הצלעות שוות?', answer: 'מלבן', key: 'rectangle', hint: '💡 כל הזוויות ישרות, אבל לא כל הצלעות שוות...' },
                { q: 'לאיזה מצלע יש 4 צלעות שוות אבל אין זוויות ישרות?', answer: 'מעוין', key: 'rhombus', hint: '💡 כל הצלעות שוות, אבל הזוויות לא ישרות...' },
                { q: 'לאיזה מצלע יש 3 צלעות ו-3 קדקודים?', answer: 'משולש', key: 'triangle', hint: '💡 שם המצלע רומז: מ-שולש = שלוש!' },
                { q: 'לאיזה מצלע יש 5 צלעות ו-5 קדקודים?', answer: 'מחומש', key: 'pentagon', hint: '💡 מ-חומש = חמש!' },
                { q: 'לאיזה מצלע יש 6 צלעות ו-6 קדקודים?', answer: 'משושה', key: 'hexagon', hint: '💡 מ-שושה = שש!' }
            ];

            const available = properties.filter(p => pool.includes(p.key));
            if (available.length === 0) return this._genIdentify(pool);

            const prop = available[randInt(0, available.length - 1)];
            const otherNames = Object.values(this._shapeData).map(s => s.name).filter(n => n !== prop.answer);
            const choices = shuffle([prop.answer, ...shuffle(otherNames).slice(0, 3)]);

            return {
                type: 'choice',
                question: prop.q,
                displayHTML: `<div class="question-text">${prop.q}</div>`,
                answer: prop.answer,
                choices: choices,
                hint: prop.hint,
                visualAid: '',
                explain: () => `התשובה היא ${prop.answer}!`
            };
        },

        // Q8: Perimeter calculation (היקף)
        _genPerimeter(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            let sides, perimeter, exercise, visualHTML;

            if (shape.allSidesEqual) {
                const sideLen = randInt(2, 9);
                perimeter = sideLen * shape.sides;
                sides = Array(shape.sides).fill(sideLen);
                exercise = sides.join(' + ') + ' = ' + perimeter;
                visualHTML = `<div class="shape-display">
                    ${createShapeSVG(shapeKey, 180)}
                    <div style="text-align:center;margin-top:0.5rem;">אורך כל צלע: ${sideLen} ס"מ</div>
                </div>`;
            } else if (shapeKey === 'rectangle') {
                const len = randInt(3, 9);
                const wid = randInt(2, len - 1);
                perimeter = 2 * (len + wid);
                sides = [len, wid, len, wid];
                exercise = `${len} + ${wid} + ${len} + ${wid} = ${perimeter}`;
                visualHTML = `<div class="shape-display">
                    ${createShapeSVG(shapeKey, 180)}
                    <div style="text-align:center;margin-top:0.5rem;">צלעות: ${len} ס"מ ו-${wid} ס"מ</div>
                </div>`;
            } else if (shapeKey === 'triangle') {
                let s1, s2, s3, valid = false;
                for (let i = 0; i < 10 && !valid; i++) {
                    s1 = randInt(2, 8); s2 = randInt(2, 8); s3 = randInt(2, 8);
                    valid = (s1 + s2 > s3) && (s1 + s3 > s2) && (s2 + s3 > s1);
                }
                if (!valid) { s1 = 3; s2 = 4; s3 = 5; }
                perimeter = s1 + s2 + s3;
                sides = [s1, s2, s3];
                exercise = `${s1} + ${s2} + ${s3} = ${perimeter}`;
                visualHTML = `<div class="shape-display">
                    ${createShapeSVG(shapeKey, 180)}
                    <div style="text-align:center;margin-top:0.5rem;">צלעות: ${s1}, ${s2}, ${s3} ס"מ</div>
                </div>`;
            } else {
                sides = [];
                for (let i = 0; i < shape.sides; i++) { sides.push(randInt(2, 6)); }
                perimeter = sides.reduce((a, b) => a + b, 0);
                exercise = sides.join(' + ') + ' = ' + perimeter;
                visualHTML = `<div class="shape-display">
                    ${createShapeSVG(shapeKey, 180)}
                    <div style="text-align:center;margin-top:0.5rem;">צלעות: ${sides.join(', ')} ס"מ</div>
                </div>`;
            }

            return {
                type: 'input',
                question: `מה ההיקף של ה${shape.name}?`,
                displayHTML: `<div class="question-text">מה ההיקף של ה${shape.name}? (בס"מ)</div>`,
                answer: perimeter,
                hint: `💡 היקף = סכום אורכי כל הצלעות: ${sides.join(' + ')}`,
                visualAid: visualHTML,
                explain: () => `היקף ה${shape.name} = ${exercise} ס"מ`
            };
        },

        // Q9: Perimeter with equal sides using multiplication
        _genPerimeterMultiply(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            const sideLen = randInt(2, 8);
            const perimeter = sideLen * shape.sides;

            return {
                type: 'input',
                question: `ל${shape.name} כל הצלעות שוות. אורך כל צלע ${sideLen} ס"מ. מה ההיקף?`,
                displayHTML: `<div class="question-text">ל${shape.name} כל הצלעות שוות.<br>אורך כל צלע: ${sideLen} ס"מ. מה ההיקף?</div>`,
                answer: perimeter,
                hint: `💡 כשכל הצלעות שוות: היקף = אורך צלע × מספר צלעות = ${sideLen} × ${shape.sides}`,
                visualAid: `<div class="shape-display">
                    ${createShapeSVG(shapeKey, 180)}
                    <div style="text-align:center;margin-top:0.5rem;">אורך כל צלע: ${sideLen} ס"מ</div>
                </div>`,
                explain: () => `היקף = ${sideLen} × ${shape.sides} = ${perimeter} ס"מ`
            };
        },

        // Q10: Odd one out (יוצא דופן)
        _genOddOneOut(pool) {
            const strategies = [
                { match: s => s.rightAngles > 0, mismatch: s => s.rightAngles === 0, reason: 'אין לו זוויות ישרות, אבל לאחרים יש' },
                { match: s => s.sides === 4, mismatch: s => s.sides !== 4, reason: 'אין לו 4 צלעות כמו לאחרים' },
                { match: s => s.allSidesEqual, mismatch: s => !s.allSidesEqual, reason: 'לא כל הצלעות שלו שוות, אבל לאחרים כל הצלעות שוות' },
                { match: s => s.rightAngles === 0, mismatch: s => s.rightAngles > 0, reason: 'יש לו זוויות ישרות, אבל לאחרים אין' }
            ];
            const strat = strategies[randInt(0, strategies.length - 1)];

            const allEntries = Object.entries(this._shapeData).filter(([k]) => pool.includes(k));
            const matching = allEntries.filter(([, s]) => strat.match(s));
            const different = allEntries.filter(([, s]) => strat.mismatch(s));

            if (matching.length < 3 || different.length < 1) return this._genIdentify(pool);

            const picked3 = shuffle(matching).slice(0, 3);
            const oddOne = shuffle(different)[0];
            const allFour = shuffle([...picked3, oddOne]);

            return {
                type: 'choice',
                question: 'איזה מצלע יוצא דופן?',
                displayHTML: '<div class="question-text">איזה מצלע יוצא דופן?</div>',
                answer: oddOne[1].name,
                choices: allFour.map(([, s]) => s.name),
                hint: '💡 חפשו מה משותף לשלושה מצלעים, ומה שונה באחד!',
                visualAid: `<div class="shape-display" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                    ${allFour.map(([k, s]) => `<div style="text-align:center;">${createShapeSVG(k, 120)}<div>${s.name}</div></div>`).join('')}
                </div>`,
                explain: () => `${oddOne[1].name} יוצא דופן כי ${strat.reason}!`
            };
        },

        generateExercise(difficulty) {
            let qType, pool;

            if (difficulty < 3) {
                // EASY: basic shapes - identify, count sides/vertices
                const types = ['identify', 'count_sides', 'count_vertices'];
                qType = types[difficulty % types.length];
                pool = this._easyShapes;
            } else if (difficulty < 6) {
                // MEDIUM: more shapes + right angles + comparisons
                const types = ['right_angles', 'count_right_angles', 'sides_compare', 'shape_by_property'];
                qType = types[(difficulty - 3) % types.length];
                pool = this._mediumShapes;
            } else {
                // HARD: all shapes + perimeter + odd-one-out
                const types = ['perimeter', 'perimeter_multiply', 'odd_one_out', 'shape_by_property'];
                qType = types[(difficulty - 6) % types.length];
                pool = this._hardShapes;
            }

            switch (qType) {
                case 'identify': return this._genIdentify(pool);
                case 'count_sides': return this._genCountSides(pool);
                case 'count_vertices': return this._genCountVertices(pool);
                case 'sides_compare': return this._genSidesCompare(pool);
                case 'right_angles': return this._genRightAngles(pool);
                case 'count_right_angles': return this._genCountRightAngles(pool);
                case 'shape_by_property': return this._genShapeByProperty(pool);
                case 'perimeter': return this._genPerimeter(pool);
                case 'perimeter_multiply': return this._genPerimeterMultiply(pool);
                case 'odd_one_out': return this._genOddOneOut(pool);
                default: return this._genIdentify(pool);
            }
        }
    },

    // ============ MODULE 6: Telling Time ============
    // Based on "שבילים חדשים 6" grade 2 curriculum:
    // Full hours, half hours, digital format, time duration
    {
        id: 'clock',
        name: 'שעון',
        icon: '🕐',
        description: 'לומדים לקרוא שעון!',
        exerciseCount: 10,
        quizCount: 10,

        tutorial: [
            {
                speech: 'בוא נלמד לקרוא שעון! ⏰',
                content: `
                    <div class="tutorial-step">
                        <p>לשעון יש שני מחוגים:</p>
                        <p>🕐 <span class="tutorial-highlight">מחוג קצר</span> = שעות</p>
                        <p>🕐 <span class="tutorial-highlight">מחוג ארוך</span> = דקות</p>
                        <div style="margin:1rem auto; width:150px;">
                            ${createClockSVG(3, 0)}
                        </div>
                        <p>כאן השעה <span class="tutorial-highlight">3:00</span></p>
                    </div>
                `
            },
            {
                speech: 'שעה עגולה - המחוג הארוך על 12!',
                content: `
                    <div class="tutorial-step">
                        <p>כשהמחוג הארוך מצביע על <span class="tutorial-highlight">12</span></p>
                        <p>זו שעה עגולה!</p>
                        <div style="display:flex;justify-content:center;gap:2rem;margin:1rem 0;align-items:flex-end;">
                            <div style="width:90px;text-align:center;"><div style="width:80px;height:80px;margin:0 auto;">${createClockSVG(9, 0)}</div><div style="font-weight:bold;">9:00</div></div>
                            <div style="width:90px;text-align:center;"><div style="width:80px;height:80px;margin:0 auto;">${createClockSVG(12, 0)}</div><div style="font-weight:bold;">12:00</div></div>
                        </div>
                        <p>מסתכלים רק על המחוג <span class="tutorial-highlight">הקצר</span>!</p>
                    </div>
                `
            },
            {
                speech: 'וחצי שעה - המחוג הארוך על 6!',
                content: `
                    <div class="tutorial-step">
                        <p>כשהמחוג הארוך מצביע על <span class="tutorial-highlight">6</span></p>
                        <p>זה "וחצי"! למשל:</p>
                        <div style="display:flex;justify-content:center;gap:2rem;margin:1rem 0;align-items:flex-end;">
                            <div style="width:90px;text-align:center;"><div style="width:80px;height:80px;margin:0 auto;">${createClockSVG(3, 30)}</div><div style="font-weight:bold;">3:30</div></div>
                            <div style="width:90px;text-align:center;"><div style="width:80px;height:80px;margin:0 auto;">${createClockSVG(7, 30)}</div><div style="font-weight:bold;">7:30</div></div>
                        </div>
                        <p>3 וחצי, 7 וחצי</p>
                    </div>
                `
            },
            {
                speech: 'יש גם שעון דיגיטלי!',
                content: `
                    <div class="tutorial-step">
                        <p>בשעון דיגיטלי רואים <span class="tutorial-highlight">מספרים</span>:</p>
                        <div style="display:flex;justify-content:center;gap:1.5rem;margin:1rem 0;align-items:center;">
                            <div style="width:80px;height:80px;">${createClockSVG(8, 0)}</div>
                            <div style="font-size:1.5rem;">→</div>
                            ${createDigitalClockHTML(8, 0)}
                        </div>
                        <div style="display:flex;justify-content:center;gap:1.5rem;margin:1rem 0;align-items:center;">
                            <div style="width:80px;height:80px;">${createClockSVG(8, 30)}</div>
                            <div style="font-size:1.5rem;">→</div>
                            ${createDigitalClockHTML(8, 30)}
                        </div>
                        <p>שעה עגולה = <span class="tutorial-highlight">:00</span></p>
                        <p>חצי שעה = <span class="tutorial-highlight">:30</span></p>
                        <p>בשעה אחת יש <span class="tutorial-highlight">60 דקות</span>!</p>
                    </div>
                `
            },
            {
                speech: 'מעולה! בוא נתרגל! ⏰',
                content: `
                    <div class="tutorial-step">
                        <p style="font-size:1.5rem;">🌟 טיפ: 🌟</p>
                        <p>1️⃣ תסתכל על המחוג <span class="tutorial-highlight">הארוך</span> קודם</p>
                        <p>2️⃣ אם הוא על 12 → שעה עגולה</p>
                        <p>3️⃣ אם הוא על 6 → וחצי</p>
                        <p>4️⃣ אז תסתכל על המחוג <span class="tutorial-highlight">הקצר</span> לדעת איזו שעה</p>
                        <p style="margin-top:1rem;">מוכנים? 🚀</p>
                    </div>
                `
            }
        ],

        generateExercise(difficulty) {
            const pad = (n) => n.toString().padStart(2, '0');
            const fmtTime = (h, m) => `${h}:${pad(m)}`;

            // Add time helper (handles 12-hour wrap)
            const addTime = (h, m, addMin) => {
                const total = h * 60 + m + addMin;
                let newH = Math.floor(total / 60) % 12;
                if (newH === 0) newH = 12;
                return { hours: newH, minutes: total % 60 };
            };

            // Generate wrong time choices
            const makeWrongTimes = (correctH, correctM, count, includeHalf) => {
                const correct = fmtTime(correctH, correctM);
                const wrongs = [];
                let attempts = 0;
                while (wrongs.length < count && attempts < 50) {
                    attempts++;
                    const wh = randInt(1, 12);
                    const wm = includeHalf ? [0, 30][randInt(0, 1)] : 0;
                    const ws = fmtTime(wh, wm);
                    if (ws !== correct && !wrongs.includes(ws)) wrongs.push(ws);
                }
                return wrongs;
            };

            const hours = randInt(1, 12);

            // ===== EASY (0-2): Full hours only =====
            if (difficulty < 3) {
                const qType = difficulty % 3;

                if (qType === 0) {
                    // Read analog clock → choose time
                    const choices = shuffle([fmtTime(hours, 0), ...makeWrongTimes(hours, 0, 3, false)]);
                    return {
                        type: 'choice',
                        question: 'מה השעה?',
                        displayHTML: '<div class="question-text">מה השעה?</div>',
                        answer: fmtTime(hours, 0),
                        choices: choices,
                        hint: '💡 המחוג הארוך על 12 = שעה עגולה. תסתכל על המחוג הקצר!',
                        visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, 0)}</div>`,
                        explain: () => `המחוג הארוך על 12 (שעה עגולה), והמחוג הקצר על ${hours}. השעה ${fmtTime(hours, 0)}!`
                    };
                } else if (qType === 1) {
                    // Identify hour hand number
                    return {
                        type: 'input',
                        question: 'על איזה מספר המחוג הקצר מצביע?',
                        displayHTML: '<div class="question-text">על איזה מספר המחוג הקצר מצביע?</div>',
                        answer: hours,
                        hint: '💡 המחוג הקצר (העבה) מראה את השעה!',
                        visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, 0)}</div>`,
                        explain: () => `המחוג הקצר מצביע על ${hours}. השעה ${fmtTime(hours, 0)}!`
                    };
                } else {
                    // Match analog to digital format
                    const choices = shuffle([fmtTime(hours, 0), ...makeWrongTimes(hours, 0, 3, false)]);
                    return {
                        type: 'choice',
                        question: 'מה השעה בשעון הדיגיטלי?',
                        displayHTML: '<div class="question-text">מה השעה בשעון הדיגיטלי?</div>',
                        answer: fmtTime(hours, 0),
                        choices: choices,
                        hint: '💡 שעה עגולה בשעון דיגיטלי נכתבת עם :00',
                        visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, 0)}</div>`,
                        explain: () => `המחוג הקצר על ${hours}. בשעון דיגיטלי: ${fmtTime(hours, 0)}!`
                    };
                }

            // ===== MEDIUM (3-6): Half hours + digital =====
            } else if (difficulty < 7) {
                const qType = (difficulty - 3) % 4;

                if (qType === 0) {
                    // Read half hour
                    const choices = shuffle([fmtTime(hours, 30), ...makeWrongTimes(hours, 30, 3, true)]);
                    return {
                        type: 'choice',
                        question: 'מה השעה?',
                        displayHTML: '<div class="question-text">מה השעה?</div>',
                        answer: fmtTime(hours, 30),
                        choices: choices,
                        hint: '💡 המחוג הארוך על 6 = וחצי. תסתכל על המחוג הקצר!',
                        visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, 30)}</div>`,
                        explain: () => `המחוג הארוך על 6 = חצי שעה. המחוג הקצר ליד ${hours}. השעה ${hours} וחצי = ${fmtTime(hours, 30)}!`
                    };
                } else if (qType === 1) {
                    // Read mixed (full or half)
                    const minutes = [0, 30][randInt(0, 1)];
                    const choices = shuffle([fmtTime(hours, minutes), ...makeWrongTimes(hours, minutes, 3, true)]);
                    return {
                        type: 'choice',
                        question: 'מה השעה?',
                        displayHTML: '<div class="question-text">מה השעה?</div>',
                        answer: fmtTime(hours, minutes),
                        choices: choices,
                        hint: minutes === 0
                            ? '💡 המחוג הארוך על 12 = שעה עגולה!'
                            : '💡 המחוג הארוך על 6 = וחצי!',
                        visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, minutes)}</div>`,
                        explain: () => minutes === 0
                            ? `המחוג הארוך על 12 = שעה עגולה. המחוג הקצר על ${hours}. השעה ${fmtTime(hours, 0)}!`
                            : `המחוג הארוך על 6 = חצי שעה. המחוג הקצר ליד ${hours}. השעה ${fmtTime(hours, 30)}!`
                    };
                } else if (qType === 2) {
                    // Digital to analog: show digital time, pick correct clock
                    const minutes = [0, 30][randInt(0, 1)];
                    const correctIdx = randInt(0, 2);
                    const labels = ['\u05D0', '\u05D1', '\u05D2']; // א ב ג

                    const clockTimes = [];
                    for (let i = 0; i < 3; i++) {
                        if (i === correctIdx) {
                            clockTimes.push({ h: hours, m: minutes });
                        } else {
                            let wh, wm;
                            do {
                                wh = randInt(1, 12);
                                wm = [0, 30][randInt(0, 1)];
                            } while ((wh === hours && wm === minutes) || clockTimes.some(t => t.h === wh && t.m === wm));
                            clockTimes.push({ h: wh, m: wm });
                        }
                    }

                    const clocksHTML = clockTimes.map((t, i) =>
                        `<div style="text-align:center;width:100px;">` +
                        `<div style="font-weight:bold;font-size:1.3rem;color:#e67e22;margin-bottom:0.3rem;">${labels[i]}</div>` +
                        `<div style="width:90px;height:90px;margin:0 auto;">${createClockSVG(t.h, t.m)}</div>` +
                        `</div>`
                    ).join('');

                    return {
                        type: 'choice',
                        question: `באיזה שעון השעה ${fmtTime(hours, minutes)}?`,
                        displayHTML: `<div class="question-text">באיזה שעון השעה ${fmtTime(hours, minutes)}?</div>`,
                        answer: labels[correctIdx],
                        choices: labels,
                        hint: minutes === 0
                            ? `💡 חפש שעון שהמחוג הארוך על 12 והקצר על ${hours}!`
                            : `💡 חפש שעון שהמחוג הארוך על 6 והקצר ליד ${hours}!`,
                        visualAid: `<div style="display:flex;justify-content:center;gap:1rem;margin:0 auto;">${clocksHTML}</div>`,
                        explain: () => `השעה ${fmtTime(hours, minutes)} מוצגת בשעון ${labels[correctIdx]}!`
                    };
                } else {
                    // Minutes in half hour / full hour
                    if (randInt(0, 1) === 0) {
                        return {
                            type: 'input',
                            question: 'כמה דקות יש בחצי שעה?',
                            displayHTML: '<div class="question-text">בשעה אחת יש 60 דקות.<br>כמה דקות יש ב<span class="tutorial-highlight">חצי</span> שעה?</div>',
                            answer: 30,
                            hint: '💡 בשעה יש 60 דקות. חצי מ-60 זה...',
                            explain: () => 'בשעה יש 60 דקות. חצי מ-60 = 30 דקות!'
                        };
                    } else {
                        return {
                            type: 'input',
                            question: 'כמה דקות יש בשעה שלמה?',
                            displayHTML: '<div class="question-text">כמה דקות יש בשעה שלמה?</div>',
                            answer: 60,
                            hint: '💡 בשעה אחת יש... דקות?',
                            explain: () => 'בשעה שלמה יש 60 דקות!'
                        };
                    }
                }

            // ===== HARD (7-9): Duration & sequences =====
            } else {
                const qType = (difficulty - 7) % 3;

                if (qType === 0) {
                    // Add half hour
                    const minutes = [0, 30][randInt(0, 1)];
                    const result = addTime(hours, minutes, 30);
                    const resultStr = fmtTime(result.hours, result.minutes);
                    const choices = shuffle([resultStr, ...makeWrongTimes(result.hours, result.minutes, 3, true)]);
                    return {
                        type: 'choice',
                        question: `עכשיו השעה ${fmtTime(hours, minutes)}. מה תהיה השעה אחרי חצי שעה?`,
                        displayHTML: `<div class="question-text">עכשיו השעה ${fmtTime(hours, minutes)}.<br>מה תהיה השעה אחרי <span class="tutorial-highlight">חצי שעה</span>?</div>`,
                        answer: resultStr,
                        choices: choices,
                        hint: `💡 חצי שעה = 30 דקות. תוסיף 30 דקות ל-${fmtTime(hours, minutes)}!`,
                        visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, minutes)}</div>`,
                        explain: () => `${fmtTime(hours, minutes)} + חצי שעה = ${resultStr}!`
                    };
                } else if (qType === 1) {
                    // Add full hour - word problem
                    const minutes = [0, 30][randInt(0, 1)];
                    const result = addTime(hours, minutes, 60);
                    const resultStr = fmtTime(result.hours, result.minutes);
                    const choices = shuffle([resultStr, ...makeWrongTimes(result.hours, result.minutes, 3, true)]);

                    const scenarios = [
                        `יעל יצאה לטיול בשעה ${fmtTime(hours, minutes)}.\nהיא חזרה אחרי שעה.\nמתי חזרה?`,
                        `אדם התחיל לצפות בסרט בשעה ${fmtTime(hours, minutes)}.\nהסרט נמשך שעה.\nמתי הסרט נגמר?`,
                        `השיעור התחיל בשעה ${fmtTime(hours, minutes)}.\nאורך השיעור שעה.\nמתי השיעור נגמר?`
                    ];
                    const scenario = scenarios[randInt(0, scenarios.length - 1)];

                    return {
                        type: 'choice',
                        question: scenario,
                        displayHTML: `<div class="question-text">${scenario.replace(/\n/g, '<br>')}</div>`,
                        answer: resultStr,
                        choices: choices,
                        hint: `💡 תוסיף שעה אחת (60 דקות) ל-${fmtTime(hours, minutes)}!`,
                        visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, minutes)}</div>`,
                        explain: () => `${fmtTime(hours, minutes)} + שעה = ${resultStr}!`
                    };
                } else {
                    // Bus sequence - arrives every half hour
                    const startHour = randInt(5, 9);
                    const busNum = randInt(2, 4);
                    const result = addTime(startHour, 0, 30 * (busNum - 1));
                    const resultStr = fmtTime(result.hours, result.minutes);
                    const ordinal = ['\u05E9\u05E0\u05D9', '\u05E9\u05DC\u05D9\u05E9\u05D9', '\u05E8\u05D1\u05D9\u05E2\u05D9'][busNum - 2]; // שני שלישי רביעי
                    const choices = shuffle([resultStr, ...makeWrongTimes(result.hours, result.minutes, 3, true)]);

                    return {
                        type: 'choice',
                        question: `האוטובוס מגיע כל חצי שעה.\nהראשון בשעה ${fmtTime(startHour, 0)}.\nמתי מגיע ה${ordinal}?`,
                        displayHTML: `<div class="question-text">\u05D4\u05D0\u05D5\u05D8\u05D5\u05D1\u05D5\u05E1 \u05DE\u05D2\u05D9\u05E2 \u05DB\u05DC \u05D7\u05E6\u05D9 \u05E9\u05E2\u05D4.<br>\u05D4\u05E8\u05D0\u05E9\u05D5\u05DF \u05D1\u05E9\u05E2\u05D4 ${fmtTime(startHour, 0)}.<br>\u05DE\u05EA\u05D9 \u05DE\u05D2\u05D9\u05E2 \u05D4${ordinal}?</div>`,
                        answer: resultStr,
                        choices: choices,
                        hint: `💡 הראשון ב-${fmtTime(startHour, 0)}. הבא אחרי חצי שעה...`,
                        explain: () => {
                            let expl = `הראשון: ${fmtTime(startHour, 0)}`;
                            for (let i = 1; i < busNum; i++) {
                                const t = addTime(startHour, 0, 30 * i);
                                expl += ` → ${fmtTime(t.hours, t.minutes)}`;
                            }
                            return expl + ` = ה${ordinal}!`;
                        }
                    };
                }
            }
        }
    }
];
