(() => {
  'use strict';

  const form = document.getElementById('profile-form');
  if (!form) return;

  const fieldNames = ['name', 'role', 'city', 'github', 'favorite_tool', 'message', 'challenge'];
  const visualIds = {
    name: 'profile-name',
    role: 'profile-role',
    city: 'profile-city',
    favorite_tool: 'profile-tool',
    message: 'profile-message',
    challenge: 'profile-challenge'
  };
  const feedback = document.getElementById('editor-feedback');

  function getProfile() {
    const result = {};
    for (const name of fieldNames) {
      result[name] = (form.elements.namedItem(name)?.value || '').trim();
    }
    return result;
  }

  function initials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] || 'T').slice(0, 2)).toUpperCase();
  }

  function renderPreview() {
    const profile = getProfile();
    for (const [field, id] of Object.entries(visualIds)) {
      const target = document.getElementById(id);
      target.textContent = field === 'message' ? `“${profile[field]}”` : (profile[field] || '—');
    }
    document.getElementById('profile-avatar').textContent = initials(profile.name);
    const github = document.getElementById('profile-github');
    github.textContent = `github.com/${profile.github || 'tu-usuario'} ↗`;
    // El patrón de GitHub se valida desde el formulario antes de descargar.
    github.href = /^[-A-Za-z0-9]+$/.test(profile.github)
      ? `https://github.com/${encodeURIComponent(profile.github)}`
      : 'https://github.com';
  }

  form.addEventListener('input', () => {
    renderPreview();
    feedback.textContent = 'Vista previa actualizada. Descarga el JSON y haz git push para publicar.';
  });

  form.addEventListener('reset', () => {
    // El navegador restaura los campos después del evento reset.
    requestAnimationFrame(() => {
      renderPreview();
      feedback.textContent = 'Valores originales restaurados.';
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const profile = getProfile();
    const blob = new Blob([JSON.stringify(profile, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'profile.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback.textContent = '¡Archivo descargado! Reemplaza profile.json, haz commit y push para publicarlo en EC2.';
  });

  renderPreview();
})();
