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
    if (meta) meta.setAttribute('content', theme === 'standard' ? '#000000' : '#0a0a0c')
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
      // 保持在黑色 Hero 上时导航保持深色；离开 Hero 后才切换为浅色玻璃
      var limit = 24
      if (hero) limit = hero.offsetTop + hero.offsetHeight - 56
      var scrolled = window.scrollY > limit
      nav.classList.toggle('is-scrolled', scrolled)

      if (!scrolled) {
        nav.classList.remove('is-dark')
        return
      }
      // 黑色区块上使用深色玻璃，避免白条压在战斗节点上
      var stack = document.elementsFromPoint(window.innerWidth / 2, 24) || []
      var dark = false
      for (var i = 0; i < stack.length; i += 1) {
        var element = stack[i]
        if (!element || !element.closest) continue
        if (element.closest('.hero')) {
          dark = true
          break
        }
        var section = element.closest('.section')
        if (section) {
          dark = section.classList.contains('section-dark')
          break
        }
      }
      nav.classList.toggle('is-dark', dark)
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
