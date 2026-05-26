/**
 * A.D.A.M — symptom scoring (same logic as CodeIgniter AdamModel)
 */
const SYMPTOM_WEIGHTS = {
  fever: 20,
  headache: 10,
  joint_pain: 15,
  muscle_pain: 15,
  rash: 10,
  nausea: 10,
  bleeding: 20,
};

const SYMPTOM_TOTAL = Object.keys(SYMPTOM_WEIGHTS).length;

const RISK_GUIDANCE = {
  'high-risk': {
    title: 'High concern — act now',
    className: 'result-guidance--high',
    text: 'Your reported symptoms suggest a high screening score. Seek medical care immediately, especially if you have bleeding, severe pain, or feel very unwell.',
  },
  'moderate-risk': {
    title: 'Moderate concern — monitor closely',
    className: 'result-guidance--moderate',
    text: 'Several symptoms are present. Rest, stay hydrated, avoid aspirin/ibuprofen unless directed by a doctor, and consult a clinic if fever persists or worsens.',
  },
  'low-risk': {
    title: 'Lower concern — stay alert',
    className: 'result-guidance--low',
    text: 'Fewer weighted symptoms were selected, but dengue can still develop. Watch for new fever, rash, or pain over the next few days and seek care if symptoms increase.',
  },
};

function calculateProbability(form) {
  let score = 0;

  for (const [symptom, value] of Object.entries(SYMPTOM_WEIGHTS)) {
    if (form.querySelector(`[name="${symptom}"]`)?.checked) {
      score += value;
    }
  }

  let risk;
  if (score >= 70) {
    risk = 'High Risk';
  } else if (score >= 40) {
    risk = 'Moderate Risk';
  } else {
    risk = 'Low Risk';
  }

  return {
    score,
    probability: `${score}%`,
    risk,
    riskClass: risk.toLowerCase().replace(/\s+/g, '-'),
  };
}

function handleFormSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('submit-assessment');
  if (btn) btn.classList.add('is-loading');

  const result = calculateProbability(event.target);
  const params = new URLSearchParams({
    score: String(result.score),
    probability: result.probability,
    risk: result.risk,
    riskClass: result.riskClass,
  });

  setTimeout(() => {
    window.location.href = `result.html?${params.toString()}`;
  }, 350);
}

function initAssessmentForm() {
  const form = document.getElementById('assessment-form');
  if (!form) return;

  form.addEventListener('submit', handleFormSubmit);

  const clearBtn = document.getElementById('clear-symptoms');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      form.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
      });
      updateSymptomProgress(form);
      showToast('Symptoms cleared');
    });
  }

  form.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => updateSymptomProgress(form));
  });

  updateSymptomProgress(form);
}

function updateSymptomProgress(form) {
  const countEl = document.getElementById('symptom-count');
  const scoreEl = document.getElementById('live-score');
  const fillEl = document.getElementById('symptom-progress-fill');
  const barEl = document.getElementById('symptom-progress-bar');

  if (!countEl || !scoreEl || !fillEl) return;

  const checked = form.querySelectorAll('input[type="checkbox"]:checked').length;
  const result = calculateProbability(form);

  countEl.textContent = String(checked);
  scoreEl.textContent = `Score: ${result.probability}`;
  fillEl.style.width = `${(checked / SYMPTOM_TOTAL) * 100}%`;

  if (barEl) {
    barEl.setAttribute('aria-valuenow', String(checked));
    barEl.setAttribute('aria-valuetext', `${checked} of ${SYMPTOM_TOTAL} symptoms`);
  }
}

function animateValue(el, endValue, suffix = '%') {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (el) el.textContent = `${endValue}${suffix}`;
    return;
  }

  const duration = 600;
  const start = performance.now();
  const from = 0;

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const current = Math.round(from + (endValue - from) * eased);
    el.textContent = `${current}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function renderResultGuidance(riskClass) {
  const el = document.getElementById('result-guidance');
  if (!el) return;

  const info = RISK_GUIDANCE[riskClass] ?? RISK_GUIDANCE['low-risk'];
  el.className = `result-guidance ${info.className}`;
  el.innerHTML = `<h3>${info.title}</h3><p>${info.text}</p>`;
}

function getResultSummary() {
  const params = new URLSearchParams(window.location.search);
  return {
    score: params.get('score') ?? '0',
    probability: params.get('probability') ?? '0%',
    risk: params.get('risk') ?? 'Low Risk',
    riskClass: params.get('riskClass') ?? 'low-risk',
  };
}

function buildResultShareText() {
  const { probability, risk } = getResultSummary();
  return `A.D.A.M dengue screening: ${probability} (${risk}). This is a symptom-based screening only — not a medical diagnosis.`;
}

function initResultActions() {
  const copyBtn = document.getElementById('copy-result');
  const shareBtn = document.getElementById('share-result');
  const printBtn = document.getElementById('print-result');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = `${buildResultShareText()}\n${window.location.href}`;
      try {
        await navigator.clipboard.writeText(text);
        showToast('Result copied to clipboard');
      } catch {
        showToast('Could not copy — try Share instead');
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const text = buildResultShareText();
      if (navigator.share) {
        try {
          await navigator.share({ title: 'A.D.A.M Result', text, url: window.location.href });
        } catch {
          /* user cancelled */
        }
      } else {
        try {
          await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
          showToast('Link copied to clipboard');
        } catch {
          showToast('Sharing not supported on this browser');
        }
      }
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
}

function initResultPage() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('score')) return;

  const score = Number(params.get('score') ?? '0');
  const probability = params.get('probability') ?? '0%';
  const risk = params.get('risk') ?? 'Low Risk';
  const riskClass = params.get('riskClass') ?? 'low-risk';

  const gauge = document.getElementById('result-gauge');
  const probEl = document.getElementById('result-probability');
  const riskEl = document.getElementById('result-risk');

  if (gauge) gauge.style.setProperty('--score', String(score));
  if (probEl) animateValue(probEl, score);
  if (riskEl) {
    riskEl.textContent = risk;
    riskEl.className = `risk ${riskClass}`;
  }

  renderResultGuidance(riskClass);
  document.documentElement.classList.remove('result-pending');
}

function isResultPage() {
  return /(?:^|\/)result\.html$/i.test(window.location.pathname);
}

function bootResultPage() {
  if (!isResultPage()) return;

  const params = new URLSearchParams(window.location.search);
  if (!params.has('score')) {
    window.location.replace('index.html');
    return;
  }

  const score = params.get('score') ?? '0';
  document.documentElement.classList.add('result-pending');
  document.documentElement.style.setProperty('--result-score', score);
}

const DEDICATION_PHOTO_CANDIDATES = [
  'assets/images/adam.jpg',
  'assets/images/adam.jpeg',
  'assets/images/adam.png',
  'assets/images/adam.webp',
];

const DEDICATION_PHOTO_PLACEHOLDER = 'assets/images/adam-placeholder.svg';

function initDedicationPhoto() {
  const img = document.querySelector('.dedication-photo');
  if (!img) return;

  function tryPhoto(index) {
    if (index >= DEDICATION_PHOTO_CANDIDATES.length) return;

    const candidate = new Image();
    candidate.onload = () => {
      img.src = DEDICATION_PHOTO_CANDIDATES[index];
    };
    candidate.onerror = () => tryPhoto(index + 1);
    candidate.src = DEDICATION_PHOTO_CANDIDATES[index];
  }

  img.src = DEDICATION_PHOTO_PLACEHOLDER;
  tryPhoto(0);
}

function initSiteNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => {
      const show = window.scrollY > 400;
      btn.hidden = !show;
    },
    { passive: true }
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

let toastTimeout;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add('is-visible');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => {
      toast.hidden = true;
    }, 250);
  }, 2600);
}

bootResultPage();

document.addEventListener('DOMContentLoaded', () => {
  initAssessmentForm();
  initResultPage();
  initResultActions();
  initDedicationPhoto();
  initSiteNav();
  initBackToTop();
});
