/* © 2026 KΛZX - https://kazx-dev.com/ - Licence MIT (voir LICENSE) */
(function () {

  const noms = {
    '#ffffff': 'Blanc',
    '#ffb454': 'Ambre',
    '#5ee0ff': 'Cyan',
    '#b48cff': 'Violet',
    '#ff6f91': 'Rose'
  };

  let audio = null;

  function jouerNote(frequence, delai, duree, volume, finale) {
    const t = audio.currentTime + delai;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const filtre = audio.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequence, t);
    if (finale) osc.frequency.exponentialRampToValueAtTime(finale, t + duree);

    filtre.type = 'lowpass';
    filtre.frequency.value = 1500;

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duree);

    osc.connect(filtre);
    filtre.connect(gain);
    gain.connect(audio.destination);
    osc.start(t);
    osc.stop(t + duree + 0.05);
  }

  function jouerSon(allume) {
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();

      if (allume) {
        jouerNote(110, 0, 0.4, 0.2, 72);
        jouerNote(523, 0.03, 0.9, 0.11);
        jouerNote(784, 0.16, 1.1, 0.08);
      } else {
        jouerNote(98, 0, 0.35, 0.16, 65);
        jouerNote(587, 0, 0.6, 0.08, 440);
      }
    } catch (e) {}
  }

  function initialiserCarte(racine) {
    const carte = racine.querySelector('.lc-carte');
    const bouton = racine.querySelector('.lc-power');
    const etat = racine.querySelector('.lc-etat');
    const pastilles = racine.querySelectorAll('.lc-pastille');

    let allume = false;
    let couleur = '#ffffff';

    function afficher() {
      racine.classList.toggle('lc-allume', allume);
      carte.setAttribute('aria-checked', String(allume));
      bouton.setAttribute('aria-label', allume ? 'Éteindre la lumière' : 'Allumer la lumière');
      etat.textContent = allume
        ? 'Lumière allumée, teinte ' + (noms[couleur] || 'personnalisée')
        : 'Lumière éteinte';
    }

    function basculer() {
      allume = !allume;
      afficher();

      bouton.classList.remove('lc-anim');
      void bouton.offsetWidth;
      bouton.classList.add('lc-anim');

      jouerSon(allume);
    }

    function changerCouleur(c) {
      couleur = c;
      racine.style.setProperty('--lc-glow', c);
      racine.style.setProperty('--lc-glow-soft', c + 'aa');
      racine.style.setProperty('--lc-glow-faint', c + '33');

      pastilles.forEach(function (p) {
        const choisie = p.dataset.couleur === c;
        p.classList.toggle('lc-choisie', choisie);
        p.setAttribute('aria-pressed', String(choisie));
      });
      afficher();
    }

    carte.addEventListener('click', basculer);
    bouton.addEventListener('click', basculer);

    carte.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        basculer();
      }
    });

    pastilles.forEach(function (p) {
      p.addEventListener('click', function () {
        changerCouleur(p.dataset.couleur);
        if (!allume) basculer();
      });
    });

    carte.addEventListener('mousemove', function (e) {
      const r = carte.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;

      carte.style.transform = 'rotateX(' + ((0.5 - y) * 12) + 'deg) rotateY(' + ((x - 0.5) * 14) + 'deg)';
      carte.style.setProperty('--mx', (x * 100) + '%');
      carte.style.setProperty('--my', (y * 100) + '%');
    });

    carte.addEventListener('mouseleave', function () {
      carte.style.transform = '';
    });

    changerCouleur('#ffffff');
  }

  function demarrer() {
    document.querySelectorAll('.lc').forEach(initialiserCarte);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }

})();