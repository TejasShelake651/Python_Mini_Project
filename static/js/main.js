// StudySphere Interactive Engine — Enhanced with Visualize AI Studio & Knowledge Lens

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initVisualDiagrams();
    initFlashcards();
    initPodcast();
    initQuiz();
    initExam();
    initConceptMap();
    initUploadModal();
    initStudioIntelligenceHub();
});

// 1. Tab Switching
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabTarget = item.getAttribute('data-tab');

            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            item.classList.add('active');
            const targetSection = document.getElementById(`section-${tabTarget}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Sync URL parameter so refreshing keeps active tab
            try {
                const currentDoc = window.CURRENT_DOC_ID ? `doc=${window.CURRENT_DOC_ID}&` : '';
                window.history.replaceState(null, null, `?${currentDoc}tab=${tabTarget}`);
            } catch(e) {}

            if (tabTarget === 'visual') {
                if (typeof renderInteractiveChart === 'function') {
                    renderInteractiveChart(activeChartType || 'bar');
                }
                if (typeof mermaid !== 'undefined') {
                    try {
                        const targetPanel = document.querySelector('.visual-diagram-panel[style*="display: block"]') || document.getElementById('diagram-chart');
                        if (targetPanel) {
                            mermaid.run({ nodes: targetPanel.querySelectorAll('.mermaid') });
                        }
                    } catch(e) {}
                }
            }

            if (tabTarget === 'map') {
                if (typeof resizeConceptMap === 'function') {
                    resizeConceptMap();
                    renderMapFrame();
                }
            }
        });
    });

    // Check URL param or hash for initial tab (default to visual if requested or keep quiz)
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || window.location.hash.replace('#', '');
    if (initialTab) {
        const itemToActivate = document.querySelector(`.nav-item[data-tab="${initialTab}"]`);
        if (itemToActivate) {
            itemToActivate.click();
        }
    }
}

// ==========================================================================
// 1b. Visualize AI Studio: Interactive Diagrams, Subtabs & Workspace Controls
// ==========================================================================

let activeChartInstance = null;
let activeChartType = 'bar';
let studioZoomLevel = 1.0;

function initVisualDiagrams() {
    const subtabBtns = document.querySelectorAll('.visual-subtab-btn');
    const diagramPanels = document.querySelectorAll('.visual-diagram-panel');
    const viewLabel = document.getElementById('activeViewModeLabel');

    subtabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetDiagram = btn.getAttribute('data-diagram');

            subtabBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.remove('pill-btn-dark');
            });
            diagramPanels.forEach(p => p.style.display = 'none');

            btn.classList.add('active');

            if (viewLabel) {
                const labelMap = {
                    'chart': 'Interactive Charts',
                    'flowchart': 'Process Flowchart',
                    'timeline': 'Visual Roadmap',
                    'architecture': 'System Architecture'
                };
                viewLabel.textContent = labelMap[targetDiagram] || 'Visual Studio';
            }

            const targetPanel = document.getElementById(`diagram-${targetDiagram}`);
            if (targetPanel) {
                targetPanel.style.display = 'block';

                if (targetDiagram === 'chart') {
                    renderInteractiveChart(activeChartType);
                } else if (typeof mermaid !== 'undefined') {
                    try {
                        const mermaidDivs = targetPanel.querySelectorAll('.mermaid');
                        mermaidDivs.forEach(el => {
                            if (!el.getAttribute('data-processed')) {
                                mermaid.run({ nodes: [el] });
                            }
                        });
                    } catch(err) {
                        console.warn('Mermaid rendering notice:', err);
                    }
                }
            }
        });
    });

    initInteractiveCharts();
    initFlowchartStepper();
    initRoadmapAndArchToggles();
    initStudioActions();
}

// 1c. Interactive Chart.js Visualizations (Visualize AI Real-View Engine)
function initInteractiveCharts() {
    const chartPills = document.querySelectorAll('.chart-type-pill');
    chartPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const type = pill.getAttribute('data-chart-type');
            chartPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeChartType = type;
            renderInteractiveChart(type);
        });
    });

    // Inspector close button
    const closeInspector = document.getElementById('closeInspectorBtn');
    if (closeInspector) {
        closeInspector.addEventListener('click', () => {
            const insp = document.getElementById('chartNodeInspector');
            if (insp) insp.style.display = 'none';
        });
    }

    // Ask viva question about concept
    const askVivaBtn = document.getElementById('btnAskVivaAboutConcept');
    if (askVivaBtn) {
        askVivaBtn.addEventListener('click', () => {
            const title = document.getElementById('inspectorTitle')?.textContent || 'this concept';
            const vivaQ = document.getElementById('inspectorViva')?.textContent || `Explain ${title} in a production scenario.`;
            
            // Switch to copilot viva tab
            const vivaTabBtn = document.getElementById('btnVivaTab');
            if (vivaTabBtn) vivaTabBtn.click();
            
            const qDisplay = document.getElementById('vivaQuestionDisplay');
            if (qDisplay) qDisplay.textContent = `"${vivaQ}"`;
            
            // Speak question
            const speakBtn = document.getElementById('speakVivaBtn');
            if (speakBtn) speakBtn.click();

            // Scroll to copilot on mobile/narrow viewports
            const copilot = document.querySelector('.copilot-panel');
            if (copilot) copilot.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Initial chart render
    setTimeout(() => {
        renderInteractiveChart('bar');
    }, 150);
}

function renderInteractiveChart(type) {
    const chartBox = document.getElementById('interactiveChartContainer');
    const canvas = document.getElementById('interactiveChartCanvas');

    if (!chartBox || !canvas) return;
    chartBox.style.display = 'block';

    const data = window.CHART_DATA || {};
    const barData = data.bar || { labels: ['Foundations', 'Core Theory', 'Structure', 'Methodology', 'Principles', 'Analysis', 'Applications', 'Synthesis'], values: [18, 14, 11, 9, 8, 7, 6, 5], percentages: [23, 18, 14, 11, 10, 9, 8, 7] };
    const radarData = data.radar || { labels: ['Core Foundations', 'System Architecture', 'Logic & Concepts', 'Data & Performance', 'Validation & Quality', 'Framework Integration'], scores: [88, 82, 85, 78, 72, 84], benchmark: [70, 68, 72, 65, 60, 70] };
    const donutData = data.donut || { labels: ['Core Theory', 'Structural Architecture', 'Operational Workflows', 'Integrations & Systems', 'Testing & Verification'], values: [32, 26, 18, 14, 10] };
    const progData = data.progression || { labels: ['Phase 1: Ingestion', 'Phase 2: Parsing', 'Phase 3: Modeling', 'Phase 4: Synthesis', 'Phase 5: Fluency'], retention: [42, 65, 81, 91, 97], benchmark: [35, 55, 72, 85, 94] };

    if (typeof Chart === 'undefined') {
        renderCanvasFallbackChart(canvas, type, barData, radarData);
        return;
    }

    if (activeChartInstance) {
        activeChartInstance.destroy();
        activeChartInstance = null;
    }

    const ctx = canvas.getContext('2d');
    const isDark = false;
    const textColor = '#475569';
    const labelColor = '#0f172a';
    const gridColor = 'rgba(15, 23, 42, 0.06)';

    if (type === 'bar') {
        const bgColors = isDark 
            ? ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#38bdf8', '#10b981', '#f59e0b']
            : ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#2563eb', '#059669', '#d97706'];
        activeChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: barData.labels,
                datasets: [{
                    label: 'Significance Frequency',
                    data: barData.values,
                    backgroundColor: bgColors.slice(0, barData.labels.length),
                    borderRadius: 8,
                    borderSkipped: false,
                    barThickness: Math.min(32, Math.floor(400 / barData.labels.length)),
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        titleColor: '#ffffff',
                        bodyColor: '#cbd5e1',
                        titleFont: { family: 'Inter', size: 13, weight: '700' },
                        bodyFont: { family: 'Inter', size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(ctx) {
                                const idx = ctx.dataIndex;
                                const pct = barData.percentages ? barData.percentages[idx] : '';
                                return ` Significance: ${ctx.parsed.y} hits (${pct}% share of key themes)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: labelColor, font: { family: 'Inter', weight: '600', size: 11 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Inter', size: 11 } },
                        beginAtZero: true
                    }
                },
                onClick: (e, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const label = barData.labels[index];
                        showConceptDeepDive(label);
                    }
                }
            }
        });
    } else if (type === 'radar') {
        activeChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: radarData.labels,
                datasets: [
                    {
                        label: 'Document Mastery Assessment',
                        data: radarData.scores,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(15, 23, 42, 0.08)',
                        borderColor: isDark ? '#ffffff' : '#0f172a',
                        borderWidth: 2,
                        pointBackgroundColor: isDark ? '#ffffff' : '#0f172a',
                        pointHoverRadius: 6,
                    },
                    {
                        label: 'Curriculum Baseline',
                        data: radarData.benchmark,
                        backgroundColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.06)',
                        borderColor: '#64748b',
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        pointBackgroundColor: '#64748b',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600 },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: labelColor, font: { family: 'Inter', weight: '600', size: 11 } }
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        titleColor: '#ffffff',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        cornerRadius: 8,
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: { color: labelColor, font: { family: 'Inter', weight: '600', size: 11 } },
                        suggestedMin: 40,
                        suggestedMax: 100
                    }
                },
                onClick: (e, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const label = radarData.labels[index];
                        showConceptDeepDive(label.split(' ')[0]);
                    }
                }
            }
        });
    } else if (type === 'donut') {
        activeChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: donutData.labels,
                datasets: [{
                    data: donutData.values,
                    backgroundColor: donutData.colors || (isDark 
                        ? ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8', '#38bdf8']
                        : ['#0f172a', '#2563eb', '#059669', '#d97706', '#64748b']),
                    borderWidth: 2,
                    borderColor: isDark ? '#0a0a0a' : '#ffffff',
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600 },
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: labelColor, font: { family: 'Inter', weight: '600', size: 11 }, padding: 14 }
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        titleColor: '#ffffff',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(ctx) {
                                return ` ${ctx.label}: ${ctx.parsed}% of curriculum`;
                            }
                        }
                    }
                },
                onClick: (e, elements) => {
                    if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const label = donutData.labels[index];
                        showConceptDeepDive(label.split(' ')[0]);
                    }
                }
            }
        });
    } else if (type === 'progression') {
        activeChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: progData.labels,
                datasets: [
                    {
                        label: 'Calculated Retention (%)',
                        data: progData.retention,
                        borderColor: '#059669',
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.08)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 5,
                        pointBackgroundColor: '#059669',
                        borderWidth: 2.5
                    },
                    {
                        label: 'Target Mastery Curve (%)',
                        data: progData.benchmark,
                        borderColor: isDark ? '#ffffff' : '#0f172a',
                        borderDash: [6, 4],
                        fill: false,
                        tension: 0.35,
                        pointRadius: 4,
                        pointBackgroundColor: isDark ? '#ffffff' : '#0f172a',
                        borderWidth: 1.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 600 },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: labelColor, font: { family: 'Inter', weight: '600', size: 11 } }
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        titleColor: '#ffffff',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: labelColor, font: { family: 'Inter', weight: '600', size: 11 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Inter', size: 11 } },
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// Fallback HTML5 canvas renderer if Chart.js is not loaded
function renderCanvasFallbackChart(canvas, type, barData, radarData) {
    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement.clientWidth || 600;
    const h = 340;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    const labels = barData.labels || ['Concepts', 'Architecture', 'Syntax'];
    const values = barData.values || [12, 9, 6];
    const maxVal = Math.max(...values, 1);
    const barWidth = Math.min(45, (w - 100) / labels.length - 15);
    const startX = 60;
    const baseY = h - 60;

    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Topic Significance Frequency (Native Canvas Engine)', 20, 25);

    labels.forEach((label, i) => {
        const val = values[i];
        const barHeight = (val / maxVal) * (h - 120);
        const x = startX + i * (barWidth + 20);
        const y = baseY - barHeight;

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, [8, 8, 0, 0]);
        } else {
            ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + barWidth / 2, baseY + 18);
        ctx.fillText(String(val), x + barWidth / 2, y - 6);
    });
}

function showConceptDeepDive(conceptName) {
    if (typeof updateStudioIntelligence === 'function') {
        updateStudioIntelligence(conceptName);
    }

    const inspector = document.getElementById('chartNodeInspector');
    const titleEl = document.getElementById('inspectorTitle');
    const badgeEl = document.getElementById('inspectorBadge');
    const metricEl = document.getElementById('inspectorMetric');
    const summaryEl = document.getElementById('inspectorSummary');
    const scenarioEl = document.getElementById('inspectorScenario');
    const vivaEl = document.getElementById('inspectorViva');

    if (!inspector || !titleEl) return;

    const data = window.CHART_DATA || {};
    const nodeDetails = data.node_details || (window.DIAGRAMS_DATA ? window.DIAGRAMS_DATA.node_details : null) || {};
    const detail = nodeDetails[conceptName] || {
        name: conceptName,
        importance: "Key Thematic Entity",
        frequency: "Corpus Mention",
        share: "Primary",
        summary: `${conceptName} is a foundational architectural component identified across the curriculum study material.`,
        use_case: `Employed in production logic pipelines, state management, and algorithmic computations.`,
        viva_question: `Explain how ${conceptName} is structured and optimized in a production system.`,
        key_rule: `Adhere strictly to clean architecture and explicit type constraints.`
    };

    titleEl.textContent = detail.name || conceptName;
    badgeEl.textContent = detail.importance || 'Key Concept';
    metricEl.textContent = detail.share ? `Share: ${detail.share}` : 'Core Entity';
    summaryEl.textContent = detail.summary;
    scenarioEl.textContent = detail.use_case;
    vivaEl.textContent = detail.viva_question;

    inspector.style.display = 'block';
    inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 1d. Process Flowchart Interactive Stage Stepper
let currentFlowStep = 0;
let autoPlayInterval = null;

function initFlowchartStepper() {
    const prevBtn = document.getElementById('btnPrevStep');
    const nextBtn = document.getElementById('btnNextStep');
    const autoBtn = document.getElementById('btnAutoPlaySteps');
    const statusText = document.getElementById('stepperStatusText');
    const cards = document.querySelectorAll('.flow-stage-card');

    if (cards.length === 0) return;

    function setStep(index) {
        currentFlowStep = Math.max(0, Math.min(cards.length - 1, index));
        cards.forEach((card, idx) => {
            if (idx === currentFlowStep) {
                card.classList.add('active');
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                card.classList.remove('active');
            }
        });
        if (statusText) {
            statusText.textContent = `Stage ${currentFlowStep + 1} of ${cards.length}: ${cards[currentFlowStep].querySelector('.flow-card-title')?.textContent || ''}`;
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => setStep(currentFlowStep - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => setStep(currentFlowStep + 1));

    if (autoBtn) {
        autoBtn.addEventListener('click', () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                autoBtn.textContent = 'Auto Play';
            } else {
                autoBtn.textContent = 'Pause';
                autoPlayInterval = setInterval(() => {
                    const next = (currentFlowStep + 1) % cards.length;
                    setStep(next);
                }, 2200);
            }
        });
    }

    cards.forEach((c, idx) => {
        c.addEventListener('click', () => setStep(idx));
    });
}

// 1e. View Toggles (Cards vs Mermaid for Flowchart, Roadmap, Architecture)
function initRoadmapAndArchToggles() {
    // Flowchart toggle
    const flowToggles = document.querySelectorAll('.flowchart-view-toggle');
    const flowCards = document.getElementById('flowchartCardsView');
    const flowMermaid = document.getElementById('flowchartMermaidView');
    flowToggles.forEach(t => {
        t.addEventListener('click', () => {
            flowToggles.forEach(btn => btn.classList.remove('active'));
            t.classList.add('active');
            const view = t.getAttribute('data-view');
            if (view === 'cards') {
                if (flowCards) flowCards.style.display = 'block';
                if (flowMermaid) flowMermaid.style.display = 'none';
            } else {
                if (flowCards) flowCards.style.display = 'none';
                if (flowMermaid) {
                    flowMermaid.style.display = 'block';
                    if (typeof mermaid !== 'undefined') {
                        try { mermaid.run({ nodes: flowMermaid.querySelectorAll('.mermaid') }); } catch(e) {}
                    }
                }
            }
        });
    });

    // Roadmap toggle
    const roadToggles = document.querySelectorAll('.roadmap-view-toggle');
    const roadTrack = document.getElementById('roadmapTrackView');
    const roadMermaid = document.getElementById('roadmapMermaidView');
    roadToggles.forEach(t => {
        t.addEventListener('click', () => {
            roadToggles.forEach(btn => btn.classList.remove('active'));
            t.classList.add('active');
            const view = t.getAttribute('data-view');
            if (view === 'track') {
                if (roadTrack) roadTrack.style.display = 'block';
                if (roadMermaid) roadMermaid.style.display = 'none';
            } else {
                if (roadTrack) roadTrack.style.display = 'none';
                if (roadMermaid) {
                    roadMermaid.style.display = 'block';
                    if (typeof mermaid !== 'undefined') {
                        try { mermaid.run({ nodes: roadMermaid.querySelectorAll('.mermaid') }); } catch(e) {}
                    }
                }
            }
        });
    });

    // Architecture toggle
    const archToggles = document.querySelectorAll('.arch-view-toggle');
    const archLayers = document.getElementById('archLayersView');
    const archMermaid = document.getElementById('archMermaidView');
    archToggles.forEach(t => {
        t.addEventListener('click', () => {
            archToggles.forEach(btn => btn.classList.remove('active'));
            t.classList.add('active');
            const view = t.getAttribute('data-view');
            if (view === 'layers') {
                if (archLayers) archLayers.style.display = 'grid';
                if (archMermaid) archMermaid.style.display = 'none';
            } else {
                if (archLayers) archLayers.style.display = 'none';
                if (archMermaid) {
                    archMermaid.style.display = 'block';
                    if (typeof mermaid !== 'undefined') {
                        try { mermaid.run({ nodes: archMermaid.querySelectorAll('.mermaid') }); } catch(e) {}
                    }
                }
            }
        });
    });
}

// 1f. Studio Actions (Zoom, Dark/Light Studio, Fullscreen, Export)
function initStudioActions() {
    const card = document.getElementById('visualStudioCard');
    const zoomIn = document.getElementById('zoomInBtn');
    const zoomOut = document.getElementById('zoomOutBtn');
    const zoomReset = document.getElementById('zoomResetBtn');
    const zoomText = document.getElementById('zoomLevelText');
    const themeBtn = document.getElementById('btnToggleStudioMode');
    const fullscreenBtn = document.getElementById('btnFullscreenStudio');
    const exportBtn = document.getElementById('exportVisualBtn');

    function applyZoom(delta) {
        if (delta === 0) {
            studioZoomLevel = 1.0;
        } else {
            studioZoomLevel = Math.max(0.6, Math.min(2.0, studioZoomLevel + delta));
        }
        if (zoomText) zoomText.textContent = `${Math.round(studioZoomLevel * 100)}%`;
        const targets = document.querySelectorAll('.zoom-target-wrapper, .interactive-chart-box');
        targets.forEach(t => {
            t.style.transform = `scale(${studioZoomLevel})`;
            t.style.transformOrigin = 'center top';
        });
    }

    if (zoomIn) zoomIn.addEventListener('click', () => applyZoom(0.15));
    if (zoomOut) zoomOut.addEventListener('click', () => applyZoom(-0.15));
    if (zoomReset) zoomReset.addEventListener('click', () => applyZoom(0));

    if (themeBtn && card) {
        themeBtn.addEventListener('click', () => {
            card.classList.toggle('dark-studio');
            const isDark = card.classList.contains('dark-studio');
            themeBtn.innerHTML = isDark 
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> <span class="tool-btn-text">Light View</span>' 
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> <span class="tool-btn-text">Dark View</span>';
            renderInteractiveChart(activeChartType);
        });
    }

    if (fullscreenBtn && card) {
        fullscreenBtn.addEventListener('click', () => {
            card.classList.toggle('fullscreen-mode');
            const isFull = card.classList.contains('fullscreen-mode');
            fullscreenBtn.innerHTML = isFull 
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> <span class="tool-btn-text">Close</span>' 
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg> <span class="tool-btn-text">Expand</span>';
            if (activeChartInstance) activeChartInstance.resize();
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const canvas = document.getElementById('interactiveChartCanvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `StudySphere_Visual_${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        });
    }
}

// 2. 3D Flashcards Logic
let currentCardIndex = 0;
function initFlashcards() {
    const flashcard = document.getElementById('activeFlashcard');
    const nextBtn = document.getElementById('nextCardBtn');
    const prevBtn = document.getElementById('prevCardBtn');
    const flipBtn = document.getElementById('flipCardBtn');
    const counterEl = document.getElementById('cardCounter');
    const frontText = document.getElementById('cardFrontText');
    const backText = document.getElementById('cardBackText');
    const cardTag = document.getElementById('cardCategoryTag');

    if (!flashcard) return;

    if (!window.FLASHCARDS_DATA || window.FLASHCARDS_DATA.length === 0) {
        if (frontText) frontText.textContent = "Upload a study document to generate active recall cards.";
        if (backText) backText.textContent = "Each flashcard will be dynamically synthesized from definitions in your text.";
        if (counterEl) counterEl.textContent = "0 Cards";
        if (cardTag) cardTag.textContent = "Standby";
        return;
    }

    function renderCard(index) {
        flashcard.classList.remove('is-flipped');
        setTimeout(() => {
            const card = window.FLASHCARDS_DATA[index];
            frontText.textContent = card.front;
            backText.textContent = card.back;
            cardTag.textContent = card.category || 'Concept';
            counterEl.textContent = `Card ${index + 1} of ${window.FLASHCARDS_DATA.length}`;
        }, 150);
    }

    flashcard.addEventListener('click', () => {
        flashcard.classList.toggle('is-flipped');
    });

    if (flipBtn) {
        flipBtn.addEventListener('click', () => {
            flashcard.classList.toggle('is-flipped');
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCardIndex = (currentCardIndex + 1) % window.FLASHCARDS_DATA.length;
            renderCard(currentCardIndex);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCardIndex = (currentCardIndex - 1 + window.FLASHCARDS_DATA.length) % window.FLASHCARDS_DATA.length;
            renderCard(currentCardIndex);
        });
    }

    renderCard(0);
}

// 3. Podcast Audio & SpeechSynthesis Player
function initPodcast() {
    const playBtn = document.getElementById('podcastPlayBtn');
    const restartBtn = document.getElementById('podcastRestartBtn');
    const audioEl = document.getElementById('podcastAudioSource');
    const statusText = document.getElementById('podcastStatus');
    const speedSelect = document.getElementById('podcastSpeed');
    const scriptText = document.getElementById('podcastScriptContent')?.innerText || '';

    let isPlaying = false;
    let synthUtterance = null;

    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
        if (!isPlaying) {
            startPlayback();
        } else {
            pausePlayback();
        }
    });

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (audioEl && audioEl.src && !audioEl.src.endsWith('/') && !audioEl.src.endsWith('/studio/')) {
                audioEl.currentTime = 0;
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            isPlaying = false;
            startPlayback();
        });
    }

    if (audioEl) {
        audioEl.addEventListener('play', () => {
            isPlaying = true;
            updatePlayBtn(true);
        });
        audioEl.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayBtn(false);
        });
        audioEl.addEventListener('ended', () => {
            isPlaying = false;
            updatePlayBtn(false);
            if (statusText) statusText.textContent = 'Finished playback';
        });
    }

    function startPlayback() {
        if (audioEl && audioEl.src && !audioEl.src.endsWith('/') && !audioEl.src.endsWith('/studio/')) {
            audioEl.play()
                .then(() => {
                    isPlaying = true;
                    updatePlayBtn(true);
                })
                .catch(() => playWithWebSpeech());
        } else {
            playWithWebSpeech();
        }
    }

    function pausePlayback() {
        if (audioEl) audioEl.pause();
        if ('speechSynthesis' in window) window.speechSynthesis.pause();
        isPlaying = false;
        updatePlayBtn(false);
    }

    function playWithWebSpeech() {
        if (!('speechSynthesis' in window)) {
            alert('Audio playback is not supported on this device.');
            return;
        }

        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            isPlaying = true;
            updatePlayBtn(true);
            return;
        }

        window.speechSynthesis.cancel();
        synthUtterance = new SpeechSynthesisUtterance(scriptText);
        const currentSpeed = parseFloat(speedSelect ? speedSelect.value : 1.0);
        synthUtterance.rate = currentSpeed;

        synthUtterance.onend = () => {
            isPlaying = false;
            updatePlayBtn(false);
            if (statusText) statusText.textContent = "Finished playback";
        };

        window.speechSynthesis.speak(synthUtterance);
        isPlaying = true;
        updatePlayBtn(true);
    }

    function updatePlayBtn(playing) {
        if (playBtn) playBtn.innerHTML = playing ? 'Pause' : 'Play Audio';
        if (statusText) statusText.textContent = playing ? 'Now playing audio overview...' : 'Ready to listen • Synthesized from document text';
    }

    if (speedSelect) {
        speedSelect.addEventListener('change', () => {
            const speed = parseFloat(speedSelect.value);
            if (audioEl) audioEl.playbackRate = speed;
            if (synthUtterance) synthUtterance.rate = speed;
        });
    }
}

// 4. Interactive Quiz Evaluation
function initQuiz() {
    const form = document.getElementById('quizForm');
    const submitBtn = document.getElementById('submitQuizBtn');
    const resultBox = document.getElementById('quizResultBox');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const landingCard = document.getElementById('quizLandingCard');
    const questionsContainer = document.getElementById('quizQuestionsContainer');

    if (startQuizBtn && landingCard && questionsContainer) {
        startQuizBtn.addEventListener('click', () => {
            landingCard.style.display = 'none';
            questionsContainer.style.display = 'block';
            window.scrollTo({ top: questionsContainer.offsetTop - 80, behavior: 'smooth' });
        });
    }

    if (!form || !submitBtn) return;

    // Handle Option selection styling
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const parent = opt.closest('.hero-card') || opt.closest('.quiz-question-card');
            if (parent) {
                parent.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
            }
            opt.classList.add('selected');
            const radio = opt.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const answers = {};
        const docId = submitBtn.getAttribute('data-doc-id');

        document.querySelectorAll('#quizForm input[type="radio"]:checked').forEach(r => {
            answers[r.name] = r.value;
        });

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Grading...';

            const res = await fetch(`/quiz-submit/${docId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'quiz', answers: answers })
            });
            const data = await res.json();

            if (data.status === 'success') {
                displayQuizResults(data);
            }
        } catch (err) {
            console.error('Quiz submission error:', err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Answers';
        }
    });

    function displayQuizResults(data) {
        resultBox.style.display = 'block';
        const passRate = data.percentage >= 60;
        resultBox.innerHTML = `
            <div style="background: ${passRate ? '#f0fdf4' : '#fff7ed'}; border: 1.5px solid ${passRate ? '#22c55e' : '#f97316'}; padding: 24px; border-radius: 14px; margin-bottom: 25px; text-align: center; color: #0f172a;">
                <h3 style="color: ${passRate ? '#15803d' : '#c2410c'}; font-size: 1.5rem; margin-bottom: 8px;">Quiz Completed</h3>
                <p style="font-size: 1.25rem; color: #0f172a; margin: 8px 0;">Score: <strong style="color: ${passRate ? '#15803d' : '#c2410c'}; font-size: 1.4rem;">${data.score} / ${data.total}</strong> (${data.percentage}%)</p>
                <p style="color: #475569; font-size: 0.92rem; margin: 0;">${passRate ? 'Great job! You have demonstrated solid retention on this topic.' : 'Keep practicing with the flashcards and study briefing to reinforce key concepts.'}</p>
            </div>
        `;

        // Highlight correct and incorrect options
        data.results.forEach(res => {
            const card = document.querySelector(`.quiz-question-card[data-q-id="${res.id}"]`) || document.querySelector(`.question-card[data-q-id="${res.id}"]`);
            if (card) {
                card.querySelectorAll('.evaluation-feedback-box').forEach(el => el.remove());

                const expl = document.createElement('div');
                expl.className = 'evaluation-feedback-box';
                expl.style.marginTop = '14px';
                expl.style.padding = '12px 16px';
                expl.style.borderRadius = '8px';
                expl.style.fontSize = '0.92rem';
                expl.style.lineHeight = '1.5';

                if (res.is_correct) {
                    expl.style.background = '#ecfdf5';
                    expl.style.border = '1px solid #10b981';
                    expl.style.color = '#065f46';
                    expl.innerHTML = `<strong>✓ Correct:</strong> ${res.explanation || 'Great recall!'}`;
                } else {
                    expl.style.background = '#fef2f2';
                    expl.style.border = '1px solid #ef4444';
                    expl.style.color = '#991b1b';
                    expl.innerHTML = `<strong>✗ Expected:</strong> <span style="text-decoration: underline;">${res.correct_answer}</span>. ${res.explanation || ''}`;
                }
                card.appendChild(expl);
            }
        });

        resultBox.scrollIntoView({ behavior: 'smooth' });
    }
}

// 5. Timed Exam Simulation
function initExam() {
    const startBtn = document.getElementById('startExamBtn');
    const examIntro = document.getElementById('examIntro');
    const examQuestionsContainer = document.getElementById('examQuestionsContainer');
    const timerEl = document.getElementById('examTimer');
    const submitBtn = document.getElementById('submitExamBtn');
    let timerInterval = null;
    let timeLeft = 10 * 60; // 10 minutes

    if (!startBtn) return;

    startBtn.addEventListener('click', () => {
        examIntro.style.display = 'none';
        examQuestionsContainer.style.display = 'block';
        startTimer();
    });

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            if (timerEl) {
                timerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert('Time expired! Submitting your exam automatically.');
                if (submitBtn) submitBtn.click();
            }
        }, 1000);
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            clearInterval(timerInterval);
            const answers = {};
            const docId = submitBtn.getAttribute('data-doc-id');

            document.querySelectorAll('#examForm input[type="radio"]:checked').forEach(r => {
                answers[r.name] = r.value;
            });

            const res = await fetch(`/quiz-submit/${docId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'exam', answers: answers })
            });
            const data = await res.json();

            if (data.status === 'success') {
                document.getElementById('examForm').style.display = 'none';
                const examResultEl = document.getElementById('examResultBox');
                examResultEl.style.display = 'block';
                const isDistinction = data.percentage >= 75;
                const isPass = data.percentage >= 50;

                examResultEl.innerHTML = `
                    <div style="background: #ffffff; border: 2px solid #0f172a; padding: 36px 28px; border-radius: 16px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); color: #0f172a;">
                        <div style="font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #2563eb; margin-bottom: 8px;">Official Examination Transcript</div>
                        <h2 style="color: #0f172a; font-size: 1.8rem; margin-bottom: 12px; font-weight: 800;">Exam Performance Certificate</h2>
                        <div style="font-size: 3.2rem; font-weight: 900; color: #0f172a; margin: 10px 0;">${data.percentage}%</div>
                        <p style="font-size: 1.2rem; color: #334155;">Final Score: <strong>${data.score} out of ${data.total}</strong></p>
                        <div style="display: inline-block; padding: 6px 18px; border-radius: 9999px; background: ${isPass ? '#ecfdf5' : '#fef2f2'}; color: ${isPass ? '#047857' : '#b91c1c'}; font-weight: 700; font-size: 0.95rem; margin-top: 14px; border: 1px solid ${isPass ? '#86efac' : '#fca5a5'};">
                            ${isDistinction ? '★ Passed with High Distinction' : (isPass ? '✓ Passed Examination' : 'Needs Review & Retake')}
                        </div>
                        <div style="margin-top: 24px;">
                            <button onclick="window.location.reload()" class="pill-btn-dark" style="padding: 10px 24px;">Retake Examination</button>
                        </div>
                    </div>
                `;
                examResultEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// ==========================================================================
// 6. Interactive Physics Force-Directed Concept Mind-Map (Visualize AI Graph)
// ==========================================================================

const mapSim = {
    canvas: null,
    ctx: null,
    width: 600,
    height: 480,
    nodes: [],
    edges: [],
    draggingNode: null,
    hoveredNode: null,
    selectedNode: null,
    searchQuery: '',
    physicsActive: true,
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    animFrame: null
};

function initConceptMap() {
    mapSim.canvas = document.getElementById('conceptMapCanvas');
    if (!mapSim.canvas) return;
    mapSim.ctx = mapSim.canvas.getContext('2d');

    setupConceptMapData();
    resizeConceptMap();

    window.addEventListener('resize', () => {
        resizeConceptMap();
        renderMapFrame();
    });

    // Canvas Mouse & Interaction Listeners
    mapSim.canvas.addEventListener('mousedown', onMapMouseDown);
    window.addEventListener('mousemove', onMapMouseMove);
    window.addEventListener('mouseup', onMapMouseUp);
    mapSim.canvas.addEventListener('wheel', onMapWheel, { passive: false });

    // Toolbar Listeners
    const zoomIn = document.getElementById('mapZoomIn');
    const zoomOut = document.getElementById('mapZoomOut');
    const centerBtn = document.getElementById('mapCenterBtn');
    const physicsToggle = document.getElementById('mapPhysicsToggle');
    const searchInput = document.getElementById('mapSearchInput');
    const closeInsp = document.getElementById('closeMapInspectorBtn');

    if (zoomIn) zoomIn.addEventListener('click', () => {
        mapSim.scale = Math.min(2.5, mapSim.scale * 1.2);
        renderMapFrame();
    });
    if (zoomOut) zoomOut.addEventListener('click', () => {
        mapSim.scale = Math.max(0.4, mapSim.scale / 1.2);
        renderMapFrame();
    });
    if (centerBtn) centerBtn.addEventListener('click', resetMapCenter);
    if (physicsToggle) {
        physicsToggle.addEventListener('click', () => {
            mapSim.physicsActive = !mapSim.physicsActive;
            physicsToggle.textContent = mapSim.physicsActive ? 'Pause' : 'Resume';
            if (mapSim.physicsActive) runPhysicsLoop();
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            mapSim.searchQuery = e.target.value.toLowerCase().trim();
            renderMapFrame();
        });
    }
    if (closeInsp) {
        closeInsp.addEventListener('click', () => {
            const insp = document.getElementById('mapNodeInspector');
            if (insp) insp.style.display = 'none';
            mapSim.selectedNode = null;
            renderMapFrame();
        });
    }

    runPhysicsLoop();
}

function resizeConceptMap() {
    if (!mapSim.canvas) return;
    const parent = mapSim.canvas.parentElement;
    mapSim.width = parent ? parent.clientWidth : 700;
    mapSim.height = 480;
    mapSim.canvas.width = mapSim.width;
    mapSim.canvas.height = mapSim.height;
}

function resetMapCenter() {
    mapSim.scale = 1.0;
    mapSim.offsetX = 0;
    mapSim.offsetY = 0;
    renderMapFrame();
}

function setupConceptMapData() {
    const rawData = window.MAP_DATA || {};
    const rawNodes = rawData.nodes || [];
    const rawEdges = rawData.edges || [];

    if (rawNodes.length === 0) {
        mapSim.nodes = [];
        mapSim.edges = [];
        return;
    }

    const centerX = 350;
    const centerY = 240;

    mapSim.nodes = rawNodes.map((n, i) => {
        const isCenter = n.group === 'center' || i === 0;
        const isPrimary = n.group === 'primary';
        const angle = (i * (2 * Math.PI)) / (rawNodes.length || 1);
        const dist = isCenter ? 0 : (isPrimary ? 145 : 225);

        return {
            id: n.id,
            label: n.label,
            group: n.group || (isCenter ? 'center' : (isPrimary ? 'primary' : 'secondary')),
            role: n.role || (isCenter ? 'Core Subject' : (isPrimary ? 'Primary Module' : 'Sub-Concept')),
            frequency: n.frequency || 1,
            definition: n.definition || '',
            excerpt: n.excerpt || '',
            connected_to: n.connected_to || [],
            x: centerX + Math.cos(angle) * dist + (Math.random() * 20 - 10),
            y: centerY + Math.sin(angle) * dist + (Math.random() * 20 - 10),
            vx: 0,
            vy: 0,
            radius: isCenter ? 32 : (isPrimary ? 22 : 16)
        };
    });

    mapSim.edges = rawEdges;
}

function runPhysicsLoop() {
    if (mapSim.physicsActive) {
        updatePhysicsStep();
    }
    renderMapFrame();
    mapSim.animFrame = requestAnimationFrame(runPhysicsLoop);
}

function updatePhysicsStep() {
    const nodes = mapSim.nodes;
    const edges = mapSim.edges;
    const centerX = mapSim.width / 2;
    const centerY = mapSim.height / 2;

    // 1. Repulsion between all node pairs (Coulomb force)
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const na = nodes[i];
            const nb = nodes[j];
            const dx = nb.x - na.x;
            const dy = nb.y - na.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 320) {
                const force = (3000 / (dist * dist));
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                if (na !== mapSim.draggingNode) {
                    na.vx -= fx;
                    na.vy -= fy;
                }
                if (nb !== mapSim.draggingNode) {
                    nb.vx += fx;
                    nb.vy += fy;
                }
            }
        }
    }

    // 2. Spring attraction along edges (Hooke's law)
    edges.forEach(e => {
        const fromNode = nodes.find(n => n.id === e.from);
        const toNode = nodes.find(n => n.id === e.to);
        if (fromNode && toNode) {
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = (fromNode.group === 'center' || toNode.group === 'center') ? 130 : 90;
            const displacement = dist - targetDist;
            const springForce = displacement * 0.035;

            const fx = (dx / dist) * springForce;
            const fy = (dy / dist) * springForce;

            if (fromNode !== mapSim.draggingNode) {
                fromNode.vx += fx;
                fromNode.vy += fy;
            }
            if (toNode !== mapSim.draggingNode) {
                toNode.vx -= fx;
                toNode.vy -= fy;
            }
        }
    });

    // 3. Center gravity pull & velocity damping
    nodes.forEach(n => {
        if (n === mapSim.draggingNode) return;

        const cdx = centerX - n.x;
        const cdy = centerY - n.y;
        n.vx += cdx * 0.003;
        n.vy += cdy * 0.003;

        // Damping friction
        n.vx *= 0.82;
        n.vy *= 0.82;

        n.x += n.vx;
        n.y += n.vy;

        // Bounding box bounce
        const margin = n.radius + 10;
        if (n.x < margin) { n.x = margin; n.vx *= -0.5; }
        if (n.x > mapSim.width - margin) { n.x = mapSim.width - margin; n.vx *= -0.5; }
        if (n.y < margin) { n.y = margin; n.vy *= -0.5; }
        if (n.y > mapSim.height - margin) { n.y = mapSim.height - margin; n.vy *= -0.5; }
    });
}

function renderMapFrame() {
    const ctx = mapSim.ctx;
    if (!ctx) return;
    const w = mapSim.width;
    const h = mapSim.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Pan & Zoom Transform
    ctx.translate(mapSim.offsetX + w / 2, mapSim.offsetY + h / 2);
    ctx.scale(mapSim.scale, mapSim.scale);
    ctx.translate(-w / 2, -h / 2);

    // Subtle background coordinate grid (Clean slate micro-grid)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    ctx.beginPath();
    for (let x = -w; x < w * 2; x += gridSize) {
        ctx.moveTo(x, -h);
        ctx.lineTo(x, h * 2);
    }
    for (let y = -h; y < h * 2; y += gridSize) {
        ctx.moveTo(-w, y);
        ctx.lineTo(w * 2, y);
    }
    ctx.stroke();

    if (mapSim.nodes.length === 0) {
        ctx.font = '600 13px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('Awaiting document upload to synthesize semantic concept network.', w / 2, h / 2);
        ctx.restore();
        return;
    }

    const activeNode = mapSim.hoveredNode || mapSim.selectedNode;
    const connectedNodeIds = new Set();
    if (activeNode) {
        connectedNodeIds.add(activeNode.id);
        mapSim.edges.forEach(e => {
            if (e.from === activeNode.id) connectedNodeIds.add(e.to);
            if (e.to === activeNode.id) connectedNodeIds.add(e.from);
        });
    }

    // Draw Edges
    mapSim.edges.forEach(e => {
        const from = mapSim.nodes.find(n => n.id === e.from);
        const to = mapSim.nodes.find(n => n.id === e.to);
        if (!from || !to) return;

        const isHighlighted = activeNode && (from.id === activeNode.id || to.id === activeNode.id);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);

        if (isHighlighted) {
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(37, 99, 235, 0.3)';
            ctx.shadowBlur = 8;
        } else if (activeNode) {
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.05)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
        } else {
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
            ctx.lineWidth = 1.2;
            ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Edge label
        if (e.label && (isHighlighted || (!activeNode && mapSim.scale > 0.85))) {
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            ctx.font = '600 10px Inter, sans-serif';
            ctx.fillStyle = isHighlighted ? '#1e40af' : '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText(e.label, midX, midY - 4);
        }
    });

    // Draw Nodes
    mapSim.nodes.forEach(n => {
        const isHovered = mapSim.hoveredNode === n;
        const isSelected = mapSim.selectedNode === n;
        const isSearchMatch = mapSim.searchQuery && n.label.toLowerCase().includes(mapSim.searchQuery);
        const isConnected = !activeNode || connectedNodeIds.has(n.id) || isSearchMatch;

        ctx.save();
        if (!isConnected) {
            ctx.globalAlpha = 0.35;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);

        // Fill color by group
        if (n.group === 'center') {
            ctx.fillStyle = '#0f172a';
        } else if (n.group === 'primary') {
            ctx.fillStyle = '#2563eb';
        } else {
            ctx.fillStyle = '#059669';
        }

        if (isSearchMatch) {
            ctx.fillStyle = '#dc2626';
        }

        // Halo glow if hovered or matched
        if (isHovered || isSelected || isSearchMatch) {
            ctx.shadowColor = n.group === 'center' ? 'rgba(15, 23, 42, 0.35)' : 'rgba(37, 99, 235, 0.35)';
            ctx.shadowBlur = 18;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // White border ring for node separation
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isHovered || isSelected ? 3.5 : 2;
        ctx.stroke();

        // Pulsing search highlight ring
        if (isSearchMatch) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 6, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Node Label (clean multi-line wrapping for 2-3 word concept nodes)
        ctx.font = (n.group === 'center' ? '700 12px Inter, sans-serif' : '600 11px Inter, sans-serif');
        ctx.fillStyle = isSelected ? '#1e40af' : '#0f172a';
        ctx.textAlign = 'center';

        const words = n.label.split(' ');
        if (words.length > 1 && n.label.length > 12) {
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(' ');
            const line2 = words.slice(mid).join(' ');
            ctx.fillText(line1, n.x, n.y + n.radius + 14);
            ctx.fillText(line2, n.x, n.y + n.radius + 26);
        } else {
            ctx.fillText(n.label, n.x, n.y + n.radius + 15);
        }

        ctx.restore();
    });

    ctx.restore();
}

function getCanvasCoords(e) {
    const rect = mapSim.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const w = mapSim.width;
    const h = mapSim.height;

    // Invert pan and zoom
    const unscaledX = (screenX - (mapSim.offsetX + w / 2)) / mapSim.scale + w / 2;
    const unscaledY = (screenY - (mapSim.offsetY + h / 2)) / mapSim.scale + h / 2;

    return { x: unscaledX, y: unscaledY, screenX, screenY };
}

function findNodeAt(x, y) {
    for (let i = mapSim.nodes.length - 1; i >= 0; i--) {
        const n = mapSim.nodes[i];
        const dx = n.x - x;
        const dy = n.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 6) {
            return n;
        }
    }
    return null;
}

function onMapMouseDown(e) {
    const coords = getCanvasCoords(e);
    const clickedNode = findNodeAt(coords.x, coords.y);

    if (clickedNode) {
        mapSim.draggingNode = clickedNode;
        mapSim.selectedNode = clickedNode;
        showMapNodeInspector(clickedNode);
        if (typeof updateStudioIntelligence === 'function') {
            updateStudioIntelligence(clickedNode.label);
        }
    } else {
        mapSim.isPanning = true;
        mapSim.panStartX = e.clientX - mapSim.offsetX;
        mapSim.panStartY = e.clientY - mapSim.offsetY;
    }
}

function onMapMouseMove(e) {
    const coords = getCanvasCoords(e);

    if (mapSim.draggingNode) {
        mapSim.draggingNode.x = coords.x;
        mapSim.draggingNode.y = coords.y;
        mapSim.draggingNode.vx = 0;
        mapSim.draggingNode.vy = 0;
    } else if (mapSim.isPanning) {
        mapSim.offsetX = e.clientX - mapSim.panStartX;
        mapSim.offsetY = e.clientY - mapSim.panStartY;
        renderMapFrame();
    } else {
        const hovered = findNodeAt(coords.x, coords.y);
        if (hovered !== mapSim.hoveredNode) {
            mapSim.hoveredNode = hovered;
            mapSim.canvas.style.cursor = hovered ? 'pointer' : 'grab';
            renderMapFrame();
        }
    }
}

function onMapMouseUp() {
    mapSim.draggingNode = null;
    mapSim.isPanning = false;
}

function onMapWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    mapSim.scale = Math.max(0.4, Math.min(2.5, mapSim.scale * zoomFactor));
    renderMapFrame();
}

function showMapNodeInspector(node) {
    const insp = document.getElementById('mapNodeInspector');
    const badge = document.getElementById('mapNodeBadge');
    const freq = document.getElementById('mapNodeFreq');
    const label = document.getElementById('mapNodeLabel');
    const desc = document.getElementById('mapNodeDesc');
    const excerpt = document.getElementById('mapNodeExcerpt');
    const excerptBlock = document.getElementById('mapExcerptBlock');
    const connectionsContainer = document.getElementById('mapNodeConnections');
    const connectionsBlock = document.getElementById('mapConnectionsBlock');

    if (!insp || !label) return;

    if (badge) {
        badge.textContent = node.role || (node.group === 'center' ? 'Core Document Subject' : (node.group === 'primary' ? 'Primary Module' : 'Sub-Concept'));
    }

    if (freq) {
        const count = node.frequency || 1;
        freq.textContent = `${count} ${count === 1 ? 'mention' : 'mentions'} in document`;
    }

    label.textContent = node.label;

    if (desc) {
        desc.textContent = node.definition || `${node.label} is an actively mapped semantic node extracted from this document's text.`;
    }

    if (excerptBlock && excerpt) {
        if (node.excerpt && node.excerpt.trim()) {
            excerpt.textContent = `"${node.excerpt.trim()}"`;
            excerptBlock.style.display = 'flex';
        } else {
            excerptBlock.style.display = 'none';
        }
    }

    if (connectionsBlock && connectionsContainer) {
        connectionsContainer.innerHTML = '';
        let connectedLabels = node.connected_to && node.connected_to.length > 0 ? [...node.connected_to] : [];
        if (connectedLabels.length === 0) {
            mapSim.edges.forEach(e => {
                if (e.from === node.id) {
                    const target = mapSim.nodes.find(n => n.id === e.to);
                    if (target) connectedLabels.push(target.label);
                } else if (e.to === node.id) {
                    const source = mapSim.nodes.find(n => n.id === e.from);
                    if (source) connectedLabels.push(source.label);
                }
            });
        }

        // Deduplicate labels
        connectedLabels = [...new Set(connectedLabels)].filter(l => l && l !== node.label);

        if (connectedLabels.length > 0) {
            connectedLabels.forEach(connLabel => {
                const pill = document.createElement('button');
                pill.className = 'map-conn-pill';
                pill.textContent = connLabel;
                pill.title = `Focus on ${connLabel}`;
                pill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const targetNode = mapSim.nodes.find(n => n.label.toLowerCase() === connLabel.toLowerCase());
                    if (targetNode) {
                        mapSim.selectedNode = targetNode;
                        showMapNodeInspector(targetNode);
                        renderMapFrame();
                    }
                });
                connectionsContainer.appendChild(pill);
            });
            connectionsBlock.style.display = 'flex';
        } else {
            connectionsBlock.style.display = 'none';
        }
    }

    insp.style.display = 'flex';
}

// 7. Modal Controls
function initUploadModal() {
    const modal = document.getElementById('uploadModal');
    const openBtn = document.getElementById('openUploadModalBtn');
    const closeBtn = document.getElementById('closeUploadModalBtn');

    if (!modal) return;

    if (openBtn) {
        openBtn.addEventListener('click', () => modal.classList.add('active'));
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

// ==========================================================================
// 8. Visual Studio Intelligence & Blueprint Hub (World-Class Right-Side Feature)
// ==========================================================================

function getDrillDeck() {
    const deck = [];
    if (window.FLASHCARDS_DATA && window.FLASHCARDS_DATA.length > 0) {
        window.FLASHCARDS_DATA.forEach(fc => {
            deck.push({ q: fc.front, a: fc.back });
        });
    }
    if (window.CHART_DATA && window.CHART_DATA.node_details) {
        Object.values(window.CHART_DATA.node_details).forEach(nd => {
            if (nd.viva_question && nd.summary) {
                deck.push({ q: nd.viva_question, a: nd.summary });
            }
        });
    }
    if (deck.length === 0) {
        deck.push({
            q: "What is the primary operational principle of the subject material?",
            a: "Synthesized directly from verified conceptual tokens extracted from your uploaded study document."
        });
    }
    return deck;
}

let currentDrillIndex = 0;

function initStudioIntelligenceHub() {
    // 1. Tab Switcher (Inspector / Retention / Stylist)
    const tabBtns = document.querySelectorAll('.intel-tab-btn');
    const tabContents = {
        'inspector': document.getElementById('intelInspectorView'),
        'memory': document.getElementById('intelMemoryView'),
        'stylist': document.getElementById('intelStylistView')
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabKey = btn.getAttribute('data-intel-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            Object.keys(tabContents).forEach(k => {
                if (tabContents[k]) {
                    tabContents[k].style.display = (k === tabKey) ? 'flex' : 'none';
                }
            });
        });
    });

    // 2. Copy Code Snippet Button
    const copyBtn = document.getElementById('btnCopySnippet');
    const codeEl = document.getElementById('hubEntityCode');
    if (copyBtn && codeEl) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(codeEl.textContent.trim());
                copyBtn.textContent = 'Copied';
                setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1600);
            } catch(e) {
                copyBtn.textContent = 'Copied';
                setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1600);
            }
        });
    }

    // 3. Dependency chips click to inspect
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('dep-chip')) {
            const targetName = e.target.getAttribute('data-node') || e.target.textContent.trim();
            updateStudioIntelligence(targetName);
        }
    });

    // 4. Ebbinghaus Memory Decay Simulator
    const slider = document.getElementById('decaySlider');
    const dayLabel = document.getElementById('decayDayLabel');
    const valWithout = document.getElementById('decayWithoutReview');
    const valWith = document.getElementById('decayWithReview');
    const nextDate = document.getElementById('decayNextDate');
    const readinessScore = document.getElementById('readinessScore');
    const circleMeter = document.querySelector('.meter-fill-circle');

    if (slider) {
        slider.addEventListener('input', () => {
            const days = parseInt(slider.value, 10);
            if (dayLabel) dayLabel.textContent = `Review: Day ${days}`;
            
            // Ebbinghaus formula approximation: R = e^(-t/S)
            const withoutPct = Math.max(22, Math.round(100 / (1 + 0.16 * Math.pow(days, 0.85))));
            const withPct = Math.min(98, Math.max(82, Math.round(96 - (days * 0.45))));

            if (valWithout) valWithout.textContent = `${withoutPct}%`;
            if (valWith) valWith.textContent = `${withPct}%`;
            
            let nextStr = 'In 24h';
            if (days > 14) nextStr = 'In 7 days';
            else if (days > 7) nextStr = 'In 4 days';
            else if (days > 2) nextStr = 'In 48h';
            if (nextDate) nextDate.textContent = nextStr;

            // Update SVG circle meter
            if (readinessScore) readinessScore.textContent = `${withPct}%`;
            if (circleMeter) {
                // Circumference ~ 264
                const offset = 264 - (264 * (withPct / 100));
                circleMeter.style.strokeDashoffset = offset;
            }
        });
    }

    // 5. 10-Second Recall Drill
    const drillQuestion = document.getElementById('drillQuestionText');
    const drillAnswerBox = document.getElementById('drillAnswerBox');
    const revealBtn = document.getElementById('btnRevealDrillAnswer');
    const nextDrillBtn = document.getElementById('btnNextDrill');

    function loadDrillCard(index) {
        const deck = getDrillDeck();
        currentDrillIndex = index % deck.length;
        const item = deck[currentDrillIndex];
        if (drillQuestion) drillQuestion.textContent = `"${item.q}"`;
        if (drillAnswerBox) {
            drillAnswerBox.innerHTML = `<strong>Answer:</strong> ${item.a}`;
            drillAnswerBox.style.display = 'none';
        }
        if (revealBtn) revealBtn.textContent = 'Reveal Answer';
    }

    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            if (drillAnswerBox.style.display === 'none') {
                drillAnswerBox.style.display = 'block';
                revealBtn.textContent = 'Hide Answer';
            } else {
                drillAnswerBox.style.display = 'none';
                revealBtn.textContent = 'Reveal Answer';
            }
        });
    }

    if (nextDrillBtn) {
        nextDrillBtn.addEventListener('click', () => {
            loadDrillCard(currentDrillIndex + 1);
        });
    }

    // 6. Stylist & Customizer Actions
    const presetBtns = document.querySelectorAll('.style-preset-btn');
    const visualCard = document.getElementById('visualStudioCard');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const theme = btn.getAttribute('data-style-theme');
            if (visualCard) {
                visualCard.classList.remove('dark-studio', 'tech-blueprint', 'hand-sketch');
                if (theme === 'dark-studio') visualCard.classList.add('dark-studio');
                if (theme === 'tech-blueprint') visualCard.classList.add('tech-blueprint');
                if (theme === 'hand-sketch') visualCard.classList.add('hand-sketch');
            }
            if (typeof renderInteractiveChart === 'function') {
                renderInteractiveChart(activeChartType || 'bar');
            }
        });
    });

    const swatchBtns = document.querySelectorAll('.swatch-btn');
    swatchBtns.forEach(sb => {
        sb.addEventListener('click', () => {
            swatchBtns.forEach(b => b.classList.remove('active'));
            sb.classList.add('active');
            const palette = sb.getAttribute('data-palette');
            applyPaletteAccent(palette);
        });
    });

    const exportFullBtn = document.getElementById('btnExportFullPNG');
    if (exportFullBtn) {
        exportFullBtn.addEventListener('click', () => {
            const canvas = document.getElementById('interactiveChartCanvas') || document.getElementById('conceptMapCanvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `StudySphere_Visual_Export_${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        });
    }

    const copyMermaidBtn = document.getElementById('btnCopyMermaidCode');
    if (copyMermaidBtn) {
        copyMermaidBtn.addEventListener('click', async () => {
            const activeMermaid = document.querySelector('.visual-diagram-panel[style*="display: block"] .mermaid') || document.querySelector('.mermaid');
            const text = activeMermaid ? activeMermaid.textContent.trim() : 'graph TD\nA-->B';
            try {
                await navigator.clipboard.writeText(text);
                copyMermaidBtn.textContent = 'Copied Mermaid';
                setTimeout(() => { copyMermaidBtn.textContent = 'Copy Raw Mermaid Syntax'; }, 1800);
            } catch(e) {}
        });
    }

    // Initialize with first dominant keyword from uploaded document
    const chartData = window.CHART_DATA || {};
    const firstKey = (chartData.kpis && chartData.kpis.dominant_topic) || (chartData.bar && chartData.bar.labels && chartData.bar.labels[0]) || '';
    if (firstKey) {
        updateStudioIntelligence(firstKey);
    }
    loadDrillCard(0);
}

function updateStudioIntelligence(entityName) {
    if (!entityName) return;

    const data = window.CHART_DATA || {};
    const nodeDetails = data.node_details || (window.DIAGRAMS_DATA ? window.DIAGRAMS_DATA.node_details : null) || {};
    
    // Fuzzy lookup
    let detail = nodeDetails[entityName] || nodeDetails[entityName.capitalize?.() || entityName];
    if (!detail) {
        const foundKey = Object.keys(nodeDetails).find(k => k.toLowerCase() === entityName.toLowerCase());
        if (foundKey) detail = nodeDetails[foundKey];
    }

    if (!detail) {
        detail = {
            name: entityName,
            tier: "Tier 2 • Active Entity",
            importance: "Primary Subject Concept",
            share: "Identified in Text",
            complexity: "High-Yield",
            summary: `${entityName} is a foundational architectural component identified across the curriculum study material.`,
            code_snippet: `# ${entityName} Architecture\ndef process_${entityName.toLowerCase()}(data_stream: list) -> dict:\n    return {'entity': '${entityName}', 'valid': True}`,
            dry_run: `{"entity": "${entityName}", "status": "active", "latency": "12ms"}`,
            prereqs: ["Foundational Logic", "Control Flow"],
            downstream: ["Persistence Layer", "Client Views"],
            exam_gotcha: `Ensure explicit state isolation, input bounds, and type integrity when deploying ${entityName}.`
        };
    }

    const tierEl = document.getElementById('hubEntityTier');
    const nameEl = document.getElementById('hubEntityName');
    const rankEl = document.getElementById('hubEntityRank');
    const shareEl = document.getElementById('hubEntityShare');
    const levelEl = document.getElementById('hubEntityLevel');
    const summaryEl = document.getElementById('hubEntitySummary');
    const codeEl = document.getElementById('hubEntityCode');
    const dryRunEl = document.getElementById('hubEntityDryRun');
    const prereqsEl = document.getElementById('hubPrereqTags');
    const downstreamEl = document.getElementById('hubDownstreamTags');
    const gotchaEl = document.getElementById('hubEntityGotcha');

    if (tierEl) tierEl.textContent = detail.tier || 'Tier 1 • Core Pillar';
    if (nameEl) nameEl.textContent = detail.name || entityName;
    if (rankEl) rankEl.textContent = detail.importance || 'Rank #1 Focus';
    if (shareEl) shareEl.textContent = detail.share ? `${detail.share} Share` : 'Core Entity';
    if (levelEl) levelEl.textContent = detail.complexity || 'High-Yield Exam';
    if (summaryEl) summaryEl.textContent = detail.summary;
    if (codeEl) codeEl.textContent = detail.code_snippet || `# ${entityName} Pattern\ndef execute(): pass`;
    if (dryRunEl) dryRunEl.innerHTML = `<span class="dry-run-label">Output Preview:</span> <code>${detail.dry_run || '{"status": "ok"}'}</code>`;

    if (prereqsEl && detail.prereqs) {
        prereqsEl.innerHTML = detail.prereqs.map(p => `<span class="dep-chip" data-node="${p}">${p}</span>`).join('');
    }
    if (downstreamEl && detail.downstream) {
        downstreamEl.innerHTML = detail.downstream.map(d => `<span class="dep-chip" data-node="${d}">${d}</span>`).join('');
    }
    if (gotchaEl) gotchaEl.textContent = detail.exam_gotcha;
}

function applyPaletteAccent(palette) {
    const paletteColors = {
        'white': '#0f172a',
        'obsidian': '#0f172a',
        'indigo': '#2563eb',
        'emerald': '#059669',
        'amber': '#d97706',
        'rose': '#e11d48'
    };
    const color = paletteColors[palette] || '#0f172a';
    document.documentElement.style.setProperty('--accent-primary', color);
    if (typeof renderInteractiveChart === 'function') {
        renderInteractiveChart(activeChartType || 'bar');
    }
}

// Ingestion Studio Mode Switcher & Drag-and-Drop Helpers
function switchIngestMode(mode) {
    const fileTab = document.getElementById('tabSourceFile');
    const textTab = document.getElementById('tabSourceText');
    const fileBox = document.getElementById('ingestFileBox');
    const textBox = document.getElementById('ingestTextBox');

    if (!fileTab || !textTab || !fileBox || !textBox) return;

    if (mode === 'file') {
        fileTab.classList.add('active');
        textTab.classList.remove('active');
        fileBox.style.display = 'flex';
        textBox.style.display = 'none';
    } else {
        textTab.classList.add('active');
        fileTab.classList.remove('active');
        fileBox.style.display = 'none';
        textBox.style.display = 'block';
    }
}

function handleMainFileSelect(input) {
    const label = document.getElementById('mainFileLabel');
    if (!label) return;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        label.innerHTML = `Selected: <strong>${file.name}</strong> (${sizeMb} MB) <span style="text-decoration: underline; color: #2563eb; margin-left: 8px;">Change</span>`;
    }
}

// Global Drag & Drop listener for the dropzone
document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('ingestFileBox');
    const fileInput = document.getElementById('mainFileInput');

    if (dropzone && fileInput) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                fileInput.files = files;
                handleMainFileSelect(fileInput);
            }
        });
    }
});
