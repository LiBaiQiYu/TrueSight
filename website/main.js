(function () {
  'use strict'

  var root = document.documentElement
  var THEME_KEY = 'truesight.site.theme'
  var THEMES = ['standard', 'truesight']

  function savedTheme() {
    try {
      var value = localStorage.getItem(THEME_KEY)
      return THEMES.indexOf(value) >= 0 ? value : 'standard'
    } catch (error) {
      return 'standard'
    }
  }

  function applyShots(theme) {
    var images = document.querySelectorAll('img[data-light][data-dark]')
    for (var i = 0; i < images.length; i += 1) {
      var image = images[i]
      var next = theme === 'truesight' ? image.dataset.dark : image.dataset.light
      if (next && image.getAttribute('src') !== next) image.src = next
    }
  }

  function applyTheme(theme) {
    root.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (error) {
      /* 隐私模式下忽略 */
    }
    var toggle = document.getElementById('theme-toggle')
    if (toggle) {
      var next = theme === 'standard' ? '深色（TrueSight）' : '浅色（标准）'
      toggle.setAttribute('aria-label', '切换到' + next)
      toggle.setAttribute('title', '切换到' + next)
    }
    var meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'standard' ? '#f5f5f7' : '#0a0a0c')
    applyShots(theme)
  }

  applyTheme(savedTheme())

  function init() {
    applyTheme(savedTheme())

    var nav = document.getElementById('nav')
    var hero = document.querySelector('.hero')
    var menuBtn = document.getElementById('menu-btn')
    var themeBtn = document.getElementById('theme-toggle')
    var navLinks = document.getElementById('nav-links')

    function onScroll() {
      if (!nav) return
      // 离开 Hero 后导航才切换为玻璃背景，避免在首屏压住大标题
      var limit = 24
      if (hero) limit = hero.offsetTop + hero.offsetHeight - 56
      nav.classList.toggle('is-scrolled', window.scrollY > limit)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var current = root.dataset.theme === 'truesight' ? 'truesight' : 'standard'
        applyTheme(current === 'standard' ? 'truesight' : 'standard')
      })
    }

    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open')
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false')
      })
    }

    if (navLinks) {
      navLinks.addEventListener('click', function (event) {
        if (event.target.closest('a')) {
          document.body.classList.remove('nav-open')
          if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false')
        }
      })
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        document.body.classList.remove('nav-open')
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false')
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
