/**
 * Animasi portofolio — Anime.js v4 (build UMD, global `anime`).
 *
 * Prinsip:
 * 1. Progressive enhancement: konten SELALU terlihat tanpa JS. Elemen baru
 *    disembunyikan bila <html> punya class `js-anim` (dipasang skrip di <head>).
 * 2. Hormati `prefers-reduced-motion`: bila aktif, tidak ada animasi sama sekali.
 * 3. Animasikan hanya `transform` dan `opacity` — murah bagi browser (tanpa reflow).
 */
(function () {
  const root = document.documentElement

  // Library gagal dimuat (CDN down / offline) atau pengguna minta gerakan minimal → tampilkan apa adanya.
  if (typeof window.anime === 'undefined' || !root.classList.contains('js-anim')) {
    root.classList.remove('js-anim')
    return
  }
  window.__animReady = true

  const { animate, createTimeline, stagger, onScroll, splitText, utils } = window.anime

  // Putar animasi SEKALI saat target masuk layar, lalu biarkan selesai.
  // Sengaja tidak memakai `autoplay: onScroll(...)` langsung: mode bawaannya menjeda
  // animasi ketika target keluar layar, sehingga bila pengguna scroll cepat,
  // counter bisa berhenti di tengah (misalnya 149, bukan 150).
  const playOnEnter = (animation, target) =>
    onScroll({ target, enter: 'bottom-=60 top', repeat: false, onEnter: () => animation.play() })

  /* ---------- 1. HERO: timeline masuk halaman ---------- */
  const heading = document.querySelector('.hero h1')
  // Pecah judul per kata; wrap 'clip' membungkus tiap kata dengan overflow:hidden
  // sehingga kata bisa "naik" dari bawah garis tanpa terlihat sebelum waktunya.
  const { words } = splitText(heading, { words: { wrap: 'clip' } })
  utils.set(heading, { visibility: 'visible' })

  createTimeline({ defaults: { ease: 'outExpo', duration: 900 } })
    .add('.hero-photo', { opacity: [0, 1], scale: [0.85, 1], duration: 1100, ease: 'outBack(1.4)' }, 0)
    .add('.hero .eyebrow', { opacity: [0, 1], y: [16, 0] }, 100)
    .add(words, { y: ['100%', '0%'], delay: stagger(70) }, '-=700')
    .add('.hero [data-anim="hero"]', { opacity: [0, 1], y: [20, 0], delay: stagger(90) }, '-=650')

  /* ---------- 2. COUNTER statistik ---------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count)
    const decimals = Number(el.dataset.decimals || 0)
    const prefix = el.dataset.prefix || ''
    const suffix = el.dataset.suffix || ''
    const format = (n) =>
      prefix + n.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix

    const counter = { value: 0 }
    el.textContent = format(0)

    const counting = animate(counter, {
      value: target,
      duration: 1800,
      delay: 600, // tunggu animasi hero berjalan dulu
      ease: 'outExpo',
      autoplay: false,
      onUpdate: () => { el.textContent = format(counter.value) },
      onComplete: () => { el.textContent = format(target) }, // pastikan angka akhir persis
    })
    playOnEnter(counting, el)
  })

  /* ---------- 3. REVEAL saat scroll ---------- */
  // Elemen tunggal: judul section, kartu proyek, kartu pendidikan, dll.
  document.querySelectorAll('[data-anim="reveal"]').forEach((el) => {
    const reveal = animate(el, {
      opacity: [0, 1],
      y: [32, 0],
      duration: 900,
      ease: 'outCubic',
      autoplay: false,
    })
    playOnEnter(reveal, el)
  })

  // Grup: anak-anak muncul berurutan (stagger) ketika grupnya masuk layar.
  document.querySelectorAll('[data-anim-group]').forEach((group) => {
    const items = group.querySelectorAll('[data-anim="item"]')
    const chips = group.querySelectorAll('.chip')

    const tl = createTimeline({ defaults: { ease: 'outCubic', duration: 700 }, autoplay: false })
      .add(items, { opacity: [0, 1], y: [24, 0], delay: stagger(90) })

    if (chips.length) {
      tl.add(chips, { opacity: [0, 1], scale: [0.8, 1], duration: 400, delay: stagger(18) }, '-=500')
    }
    playOnEnter(tl, group)
  })

  /* ---------- 4. GARIS TIMELINE mengikuti scroll ---------- */
  // sync: true → progres animasi = progres scroll di antara enter dan leave.
  document.querySelectorAll('.timeline-line').forEach((line) => {
    animate(line, {
      scaleY: [0, 1],
      ease: 'linear',
      autoplay: onScroll({ target: line.parentElement, enter: 'bottom-=120 top', leave: 'center bottom', sync: true }),
    })
  })
})()
