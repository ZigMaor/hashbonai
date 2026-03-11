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

    // ============ MODULE 3: Basic Multiplication (1-5) ============
    {
        id: 'multiplication',
        name: 'כפל בסיסי',
        icon: '✖️',
        description: 'לוח הכפל 1 עד 5!',
        exerciseCount: 10,
        quizCount: 10,

        tutorial: [
            {
                speech: 'בוא נלמד כפל! 🤩\nכפל זה חיבור מהיר!',
                content: `
                    <div class="tutorial-step">
                        <p>כפל אומר: <span class="tutorial-highlight">כמה ביחד כשיש קבוצות שוות?</span></p>
                        <div class="tutorial-equation">3 × 2 = ?</div>
                        <p>זה אומר: <span class="tutorial-highlight">3 קבוצות של 2</span></p>
                        <p>🍭🍭 + 🍭🍭 + 🍭🍭</p>
                    </div>
                `
            },
            {
                speech: 'נספור את כל הסוכריות!',
                content: `
                    <div class="tutorial-step">
                        <p>3 קבוצות של 2 סוכריות:</p>
                        <p>🍭🍭 | 🍭🍭 | 🍭🍭</p>
                        <p>סך הכל: 2 + 2 + 2 = <span class="tutorial-highlight">6!</span></p>
                        <div class="tutorial-equation">3 × 2 = 6</div>
                    </div>
                `
            },
            {
                speech: 'עוד דוגמה!',
                content: `
                    <div class="tutorial-step">
                        <div class="tutorial-equation">4 × 5 = ?</div>
                        <p>4 קבוצות של 5:</p>
                        <p>⭐⭐⭐⭐⭐</p>
                        <p>⭐⭐⭐⭐⭐</p>
                        <p>⭐⭐⭐⭐⭐</p>
                        <p>⭐⭐⭐⭐⭐</p>
                        <p>סך הכל: <span class="tutorial-highlight">20!</span></p>
                    </div>
                `
            },
            {
                speech: 'עכשיו תורך! בוא נתרגל! 🚀',
                content: `
                    <div class="tutorial-step">
                        <p style="font-size:1.5rem;">🌟 טיפ: 🌟</p>
                        <p>כפל = חיבור חוזר!</p>
                        <p>3 × 4 = 4 + 4 + 4 = 12</p>
                        <p style="margin-top:1rem;">בוא נתחיל! 💪</p>
                    </div>
                `
            }
        ],

        generateExercise(difficulty) {
            let a, b;
            if (difficulty < 3) {
                // Tables 2-5 × 2-5
                a = randInt(2, 5);
                b = randInt(2, 5);
            } else if (difficulty < 7) {
                // Tables 3-7 × 3-8
                a = randInt(3, 7);
                b = randInt(3, 8);
            } else {
                // Tables 4-9 × 4-10
                a = randInt(4, 9);
                b = randInt(4, 10);
            }
            const answer = a * b;
            const hint = `💡 ${a} × ${b} = ${Array(a).fill(b).join(' + ')}`;
            return {
                type: 'input',
                question: `${a} × ${b} = ?`,
                displayHTML: `<span>${a}</span> <span class="operator-symbol">×</span> <span>${b}</span> <span class="operator-symbol">=</span> <span style="color:#4A90D9;">?</span>`,
                answer: answer,
                hint: hint,
                visualAid: this.getVisualAid(a, b),
                explain: (userAns) => this.explainError(a, b, answer, userAns)
            };
        },

        getVisualAid(a, b) {
            // Show groups of emoji
            const emojis = ['🟦', '🟩', '🟧', '🟪', '🟥'];
            let html = '<div class="blocks-container" style="gap:1rem;">';
            for (let i = 0; i < a; i++) {
                html += '<div class="block-group" style="border:2px dashed #CBD5E0; padding:4px; border-radius:8px;">';
                for (let j = 0; j < b; j++) {
                    html += `<div class="block block-${['blue','green','orange','pink','purple'][i % 5]}"></div>`;
                }
                html += '</div>';
            }
            html += '</div>';
            return html;
        },

        explainError(a, b, correct, userAns) {
            const additions = Array(a).fill(b).join(' + ');
            return `${a} × ${b} = ${additions} = ${correct}. כפל זה חיבור חוזר! נחבר ${b} בדיוק ${a} פעמים ונקבל ${correct}!`;
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
    {
        id: 'shapes',
        name: 'צורות גיאומטריות',
        icon: '🔺',
        description: 'לומדים על צורות!',
        exerciseCount: 10,
        quizCount: 10,

        tutorial: [
            {
                speech: 'בוא נלמד על צורות! 🔷',
                content: `
                    <div class="tutorial-step">
                        <p>צורות נמצאות בכל מקום!</p>
                        <p>🔲 חלון = <span class="tutorial-highlight">ריבוע</span></p>
                        <p>📱 טלפון = <span class="tutorial-highlight">מלבן</span></p>
                        <p>⚽ כדור = <span class="tutorial-highlight">עיגול</span></p>
                        <p>🔺 גג בית = <span class="tutorial-highlight">משולש</span></p>
                    </div>
                `
            },
            {
                speech: 'לכל צורה יש תכונות!',
                content: `
                    <div class="tutorial-step">
                        <p>🔺 <span class="tutorial-highlight">משולש</span> - 3 צלעות, 3 פינות</p>
                        <p>🔲 <span class="tutorial-highlight">ריבוע</span> - 4 צלעות שוות, 4 פינות</p>
                        <p>▬ <span class="tutorial-highlight">מלבן</span> - 4 צלעות (2 ארוכות, 2 קצרות), 4 פינות</p>
                        <p>⭕ <span class="tutorial-highlight">עיגול</span> - בלי צלעות, בלי פינות!</p>
                    </div>
                `
            },
            {
                speech: 'וגם צורות מיוחדות!',
                content: `
                    <div class="tutorial-step">
                        <p>⬠ <span class="tutorial-highlight">מחומש</span> - 5 צלעות, 5 פינות</p>
                        <p>⬡ <span class="tutorial-highlight">משושה</span> - 6 צלעות, 6 פינות</p>
                        <p style="margin-top:1rem;">💡 <span class="tutorial-highlight">טיפ:</span></p>
                        <p>שם הצורה אומר כמה צלעות!</p>
                        <p>משולש = 3, מרובע = 4, מחומש = 5...</p>
                    </div>
                `
            },
            {
                speech: 'יש עוד צורות מעניינות!',
                content: `
                    <div class="tutorial-step">
                        <p>◇ <span class="tutorial-highlight">מעוין</span> - 4 צלעות שוות, כמו יהלום</p>
                        <p>⏢ <span class="tutorial-highlight">טרפז</span> - 4 צלעות, 2 מקבילות</p>
                        <p>⬮ <span class="tutorial-highlight">אליפסה</span> - כמו עיגול מתוח, בלי צלעות!</p>
                        <p>⭐ <span class="tutorial-highlight">כוכב</span> - יש לו 5 חודים!</p>
                    </div>
                `
            },
            {
                speech: 'עכשיו תורך! 🌟',
                content: `
                    <div class="tutorial-step">
                        <p>בוא נתרגל לזהות צורות!</p>
                        <p>נשאל אותך שאלות על:</p>
                        <p>✅ זיהוי צורות</p>
                        <p>✅ ספירת צלעות ופינות</p>
                        <p>✅ השוואת צורות</p>
                        <p>✅ מציאת הצורה השונה</p>
                        <p style="margin-top:1rem;">מוכנים? 🚀</p>
                    </div>
                `
            }
        ],

        _shapeData: {
            triangle:  { name: 'משולש', sides: 3, corners: 3 },
            square:    { name: 'ריבוע', sides: 4, corners: 4 },
            rectangle: { name: 'מלבן', sides: 4, corners: 4 },
            circle:    { name: 'עיגול', sides: 0, corners: 0 },
            pentagon:  { name: 'מחומש', sides: 5, corners: 5 },
            hexagon:   { name: 'משושה', sides: 6, corners: 6 },
            trapezoid: { name: 'טרפז', sides: 4, corners: 4 },
            rhombus:   { name: 'מעוין', sides: 4, corners: 4 },
            oval:      { name: 'אליפסה', sides: 0, corners: 0 },
            star:      { name: 'כוכב', sides: 10, corners: 5, points: 5 }
        },

        // Shape pools by difficulty
        _easyShapes: ['triangle', 'square', 'rectangle', 'circle'],
        _mediumShapes: ['triangle', 'square', 'rectangle', 'circle', 'pentagon', 'hexagon', 'trapezoid', 'rhombus', 'oval'],
        _hardShapes: ['triangle', 'square', 'rectangle', 'circle', 'pentagon', 'hexagon', 'trapezoid', 'rhombus', 'oval', 'star'],

        // --- Question generators ---

        _genIdentify(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            const otherNames = Object.values(this._shapeData).map(s => s.name).filter(n => n !== shape.name);
            const choices = shuffle([shape.name, ...shuffle(otherNames).slice(0, 3)]);
            return {
                type: 'choice',
                question: 'מה שם הצורה הזאת?',
                displayHTML: '<div class="question-text">מה שם הצורה הזאת?</div>',
                answer: shape.name,
                choices: choices,
                hint: `💡 ספור את הצלעות: ${shape.sides === 0 ? 'אין צלעות — זה עגול!' : `יש ${shape.sides} צלעות`}`,
                visualAid: `<div class="shape-display">${createShapeSVG(shapeKey, 180)}</div>`,
                explain: () => `זו צורה בשם ${shape.name}. ${shape.sides > 0 ? `יש לה ${shape.sides} צלעות ו-${shape.corners} פינות.` : 'אין לה צלעות ואין לה פינות!'}`
            };
        },

        _genCountSides(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            return {
                type: 'input',
                question: `כמה צלעות יש ל${shape.name}?`,
                displayHTML: `<div class="question-text">כמה צלעות יש ל${shape.name}?</div>`,
                answer: shape.sides,
                hint: '💡 צלע = קו ישר. ספור את הקווים בצורה',
                visualAid: `<div class="shape-display">${createShapeSVG(shapeKey, 180)}</div>`,
                explain: () => `ל${shape.name} יש ${shape.sides} צלעות. ${shape.sides === 0 ? 'אין קווים ישרים!' : `ספור את הקווים - יש ${shape.sides}!`}`
            };
        },

        _genCountCorners(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            return {
                type: 'input',
                question: `כמה פינות יש ל${shape.name}?`,
                displayHTML: `<div class="question-text">כמה פינות יש ל${shape.name}?</div>`,
                answer: shape.corners,
                hint: '💡 פינה = מקום שבו שני קווים נפגשים. ספור את הנקודות!',
                visualAid: `<div class="shape-display">${createShapeSVG(shapeKey, 180)}</div>`,
                explain: () => `ל${shape.name} יש ${shape.corners} פינות. ${shape.corners === 0 ? 'אין פינות כי אין קווים ישרים!' : `פינה היא המקום שבו שני קווים נפגשים.`}`
            };
        },

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
                question: 'לאיזו צורה יש יותר צלעות?',
                displayHTML: '<div class="question-text">לאיזו צורה יש יותר צלעות?</div>',
                answer: answer,
                choices: shuffle([s1.name, s2.name]),
                hint: '💡 ספור את הצלעות של כל צורה!',
                visualAid: `<div class="shape-display" style="display:flex;gap:2rem;justify-content:center;">
                    <div style="text-align:center;">${createShapeSVG(key1, 140)}<div>${s1.name}</div></div>
                    <div style="text-align:center;">${createShapeSVG(key2, 140)}<div>${s2.name}</div></div>
                </div>`,
                explain: () => `ל${s1.name} יש ${s1.sides} צלעות ול${s2.name} יש ${s2.sides} צלעות. ${answer} היא התשובה!`
            };
        },

        _genShapeByProperty(pool) {
            const shapeKey = pool[randInt(0, pool.length - 1)];
            const shape = this._shapeData[shapeKey];
            const targetSides = shape.sides;

            const questionText = targetSides === 0
                ? 'לאיזו צורה אין צלעות בכלל?'
                : `לאיזו צורה יש בדיוק ${targetSides} צלעות?`;

            // Wrong choices: shapes with DIFFERENT side count
            const wrongNames = Object.values(this._shapeData)
                .filter(s => s.sides !== targetSides)
                .map(s => s.name);
            const choices = shuffle([shape.name, ...shuffle(wrongNames).slice(0, 3)]);

            return {
                type: 'choice',
                question: questionText,
                displayHTML: `<div class="question-text">${questionText}</div>`,
                answer: shape.name,
                choices: choices,
                hint: targetSides === 0
                    ? '💡 חשוב: איזו צורה עגולה ואין לה קווים ישרים?'
                    : '💡 שם הצורה לפעמים רומז על מספר הצלעות!',
                visualAid: '',
                explain: () => `ל${shape.name} יש ${targetSides === 0 ? 'אפס' : targetSides} צלעות!`
            };
        },

        _genOddOneOut(pool) {
            const strategies = [
                { match: s => s.corners > 0, mismatch: s => s.corners === 0, reason: 'אין לה פינות, בעוד לאחרות יש' },
                { match: s => s.sides === 4, mismatch: s => s.sides !== 4 && s.sides > 0, reason: 'אין לה 4 צלעות כמו לאחרות' },
                { match: s => s.sides > 0, mismatch: s => s.sides === 0, reason: 'אין לה צלעות כמו לאחרות' }
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
                question: 'איזו צורה שונה מהאחרות?',
                displayHTML: '<div class="question-text">איזו צורה שונה מהאחרות?</div>',
                answer: oddOne[1].name,
                choices: allFour.map(([, s]) => s.name),
                hint: '💡 חפש מה משותף לשלוש צורות, ומה שונה באחת!',
                visualAid: `<div class="shape-display" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                    ${allFour.map(([k, s]) => `<div style="text-align:center;">${createShapeSVG(k, 120)}<div>${s.name}</div></div>`).join('')}
                </div>`,
                explain: () => `${oddOne[1].name} שונה כי ${strat.reason}!`
            };
        },

        _genCountStarPoints() {
            return {
                type: 'input',
                question: 'כמה חודים (קצוות בולטים) יש לכוכב?',
                displayHTML: '<div class="question-text">כמה חודים יש לכוכב?</div>',
                answer: 5,
                hint: '💡 ספור את הקצוות החדים של הכוכב!',
                visualAid: `<div class="shape-display">${createShapeSVG('star', 180)}</div>`,
                explain: () => 'לכוכב יש 5 חודים! ספור את הקצוות שבולטים החוצה.'
            };
        },

        generateExercise(difficulty) {
            let qType, pool;

            if (difficulty < 3) {
                // EASY: basic shapes, basic questions
                const types = ['identify', 'count_sides', 'count_corners'];
                qType = types[difficulty % types.length];
                pool = this._easyShapes;
            } else if (difficulty < 7) {
                // MEDIUM: all shapes + comparison/property questions
                const types = ['identify', 'sides_compare', 'shape_by_property', 'count_sides'];
                qType = types[(difficulty - 3) % types.length];
                pool = this._mediumShapes;
            } else {
                // HARD: all shapes + odd-one-out + star
                const types = ['odd_one_out', 'count_star_points', 'shape_by_property'];
                qType = types[(difficulty - 7) % types.length];
                pool = this._hardShapes;
            }

            switch (qType) {
                case 'identify': return this._genIdentify(pool);
                case 'count_sides': return this._genCountSides(pool);
                case 'count_corners': return this._genCountCorners(pool);
                case 'sides_compare': return this._genSidesCompare(pool);
                case 'shape_by_property': return this._genShapeByProperty(pool);
                case 'odd_one_out': return this._genOddOneOut(pool);
                case 'count_star_points': return this._genCountStarPoints();
                default: return this._genIdentify(pool);
            }
        }
    },

    // ============ MODULE 6: Telling Time ============
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
            let hours, minutes;
            const minuteOptions = [0, 15, 30, 45];
            if (difficulty < 3) {
                // Full and half hours
                hours = randInt(1, 12);
                minutes = [0, 30][randInt(0, 1)];
            } else if (difficulty < 7) {
                // Quarter hours
                hours = randInt(1, 12);
                minutes = minuteOptions[randInt(0, 3)];
            } else {
                // Any 5-minute interval
                hours = randInt(1, 12);
                minutes = randInt(0, 11) * 5;
            }

            const pad = (n) => n.toString().padStart(2, '0');
            const timeStr = `${hours}:${pad(minutes)}`;

            // Alternate between question types
            if (difficulty % 2 === 0) {
                // Show clock, ask time (multiple choice)
                const wrongTimes = [];
                while (wrongTimes.length < 3) {
                    const wh = randInt(1, 12);
                    const wm = difficulty < 3 ? [0, 30][randInt(0, 1)] : randInt(0, 11) * 5;
                    const wt = `${wh}:${pad(wm)}`;
                    if (wt !== timeStr && !wrongTimes.includes(wt)) {
                        wrongTimes.push(wt);
                    }
                }
                const choices = shuffle([timeStr, ...wrongTimes]);

                const clockHint = minutes === 0 ? `💡 המחוג הארוך על 12 = שעה עגולה. תסתכל על המחוג הקצר!`
                    : minutes === 30 ? `💡 המחוג הארוך על 6 = וחצי. תסתכל על המחוג הקצר!`
                    : `💡 המחוג הארוך מצביע על ${minutes / 5}. כל מספר = 5 דקות`;
                return {
                    type: 'choice',
                    question: `מה השעה?`,
                    displayHTML: `<div class="question-text">מה השעה?</div>`,
                    answer: timeStr,
                    choices: choices,
                    hint: clockHint,
                    visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, minutes)}</div>`,
                    explain: () => {
                        if (minutes === 0) {
                            return `המחוג הארוך מצביע על 12 (שעה עגולה), והמחוג הקצר מצביע על ${hours}. לכן השעה היא ${timeStr}!`;
                        }
                        return `המחוג הארוך מצביע על 6 (חצי שעה), והמחוג הקצר בין ${hours} ל-${hours === 12 ? 1 : hours + 1}. לכן השעה היא ${timeStr}!`;
                    }
                };
            } else {
                // Ask what the hour hand points to
                return {
                    type: 'input',
                    question: `על איזה מספר המחוג הקצר מצביע?`,
                    displayHTML: `<div class="question-text">על איזה מספר המחוג הקצר מצביע?</div>`,
                    answer: hours,
                    hint: `💡 המחוג הקצר (העבה) מראה את השעה. חפש לאן הוא מצביע!`,
                    visualAid: `<div class="clock-display" style="margin:0 auto;">${createClockSVG(hours, minutes)}</div>`,
                    explain: () => `המחוג הקצר (העבה) מצביע על ${hours}. השעה היא ${timeStr}!`
                };
            }
        }
    }
];
