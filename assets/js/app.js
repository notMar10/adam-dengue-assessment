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
  const result = calculateProbability(event.target);
  const params = new URLSearchParams({
    score: String(result.score),
    probability: result.probability,
    risk: result.risk,
    riskClass: result.riskClass,
  });
  window.location.href = `result.html?${params.toString()}`;
}

function initAssessmentForm() {
  const form = document.getElementById('assessment-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

function initResultPage() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('score')) {
    return;
  }

  const score = params.get('score') ?? '0';
  const probability = params.get('probability') ?? '0%';
  const risk = params.get('risk') ?? 'Low Risk';
  const riskClass = params.get('riskClass') ?? 'low-risk';

  const gauge = document.getElementById('result-gauge');
  const probEl = document.getElementById('result-probability');
  const riskEl = document.getElementById('result-risk');

  if (gauge) gauge.style.setProperty('--score', score);
  if (probEl) probEl.textContent = probability;
  if (riskEl) {
    riskEl.textContent = risk;
    riskEl.className = `risk ${riskClass}`;
  }
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

bootResultPage();

document.addEventListener('DOMContentLoaded', () => {
  initAssessmentForm();
  initResultPage();
  initDedicationPhoto();
});
