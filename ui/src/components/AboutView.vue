<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import BrandMark from './BrandMark.vue'
import { ACKNOWLEDGMENTS, APP_VERSION, CHANGELOG, SECURITY_NOTES } from '../lib/about'

const emit = defineEmits<{ (e: 'back'): void }>()
const showLog = ref(false)
</script>

<template>
  <section class="about">
    <header class="hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="hero-main">
        <BrandMark :size="58" />
        <div class="hero-copy">
          <span class="eyebrow">ABOUT TRUESIGHT</span>
          <h1>TrueSight</h1>
          <p>Dota 2 对局分析工具 · 本地优先 · 数据可控</p>
        </div>
      </div>
      <div class="hero-side">
        <span class="version">v{{ APP_VERSION }}</span>
        <div class="hero-actions">
          <button class="btn btn-primary small" type="button" @click="showLog = true">
            <AppIcon name="doc" :size="14" />
            更新日志
          </button>
          <button class="btn btn-ghost small" type="button" @click="emit('back')">
            <AppIcon name="chevronRight" :size="14" class="flip" />
            返回
          </button>
        </div>
      </div>
    </header>

    <section class="panel">
      <div class="panel-head">
        <span class="panel-icon"><AppIcon name="heart" :size="15" /></span>
        <div>
          <h2>开源鸣谢</h2>
          <p>TrueSight 建立在这些开源项目与公开数据服务之上。</p>
        </div>
      </div>
      <ul class="acks">
        <li v-for="item in ACKNOWLEDGMENTS" :key="item.name">
          <a :href="item.url" target="_blank" rel="noreferrer">
            {{ item.name }}
            <AppIcon name="external" :size="11" />
          </a>
          <span>{{ item.note }}</span>
        </li>
      </ul>
    </section>

    <section class="panel">
      <div class="panel-head">
        <span class="panel-icon"><AppIcon name="key" :size="15" /></span>
        <div>
          <h2>保密性与安全</h2>
          <p>Key 只在本机使用，第三方只能看到完成请求所必需的内容。</p>
        </div>
      </div>
      <div class="security">
        <article v-for="(note, index) in SECURITY_NOTES" :key="note.title">
          <span class="num">{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <strong>{{ note.title }}</strong>
            <p>{{ note.body }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="panel links-panel">
      <div class="panel-head">
        <span class="panel-icon"><AppIcon name="external" :size="15" /></span>
        <div>
          <h2>链接</h2>
          <p>源码、问题反馈与官网。</p>
        </div>
      </div>
      <div class="links">
        <a href="https://github.com/LiBaiQiYu/TrueSight" target="_blank" rel="noreferrer">GitHub 仓库</a>
        <a href="https://github.com/LiBaiQiYu/TrueSight/issues" target="_blank" rel="noreferrer">问题反馈</a>
        <a href="https://truesight.carloswhitea1e.workers.dev/" target="_blank" rel="noreferrer">官网</a>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="showLog" class="log-overlay" @click.self="showLog = false">
        <div class="log-modal" role="dialog" aria-modal="true" aria-label="更新日志">
          <header class="log-head">
            <div>
              <strong>更新日志</strong>
              <small>当前版本 v{{ APP_VERSION }}</small>
            </div>
            <button class="close" type="button" aria-label="关闭" @click="showLog = false">
              <AppIcon name="close" :size="18" />
            </button>
          </header>
          <div class="log-body">
            <article v-for="(entry, index) in CHANGELOG" :key="`${entry.date}-${index}`" class="log-entry">
              <div class="log-meta">
                <span class="log-version">v{{ entry.version }}</span>
                <span>{{ entry.date }}</span>
              </div>
              <ul>
                <li v-for="(item, i) in entry.items" :key="i">{{ item }}</li>
              </ul>
            </article>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.about {
  width: 100%;
  max-width: 940px;
  margin: 0 auto;
  padding-bottom: 30px;
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 26px;
  margin-bottom: 14px;
  border: 1px solid var(--accent-line);
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(120% 180% at 100% 0%, rgba(16, 185, 129, 0.18), transparent 55%),
    linear-gradient(150deg, rgba(16, 185, 129, 0.12), rgba(255, 255, 255, 0.015));
}

.hero-glow {
  position: absolute;
  right: -60px;
  bottom: -90px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.2), transparent 65%);
  pointer-events: none;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.eyebrow {
  display: block;
  color: var(--accent-text);
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.18em;
}

.hero-copy h1 {
  margin: 3px 0 4px;
  font-size: 30px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-copy p {
  margin: 0;
  color: var(--text-mute);
  font-size: 12.5px;
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.version {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--accent-line);
  background: var(--accent-soft);
  color: var(--accent-text);
  font-size: 12px;
  font-weight: 650;
}

.hero-actions {
  display: flex;
  gap: 8px;
}

.flip {
  transform: rotate(180deg);
}

.panel {
  padding: 18px 20px;
  margin-bottom: 12px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--card-bg);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}

.panel-icon {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex: none;
  border-radius: 8px;
  color: var(--accent-text);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
}

.panel-head h2 {
  margin: 0;
  font-size: 14.5px;
}

.panel-head p {
  margin: 3px 0 0;
  color: var(--text-mute);
  font-size: 11.5px;
}

.acks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.acks li {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 7px 9px;
  border-radius: 9px;
  background: var(--card-bg);
  border: 1px solid transparent;
}

.acks li:hover {
  border-color: var(--line-strong);
}

.acks a {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--accent-text);
  font-size: 12.5px;
  font-weight: 550;
}

.acks span {
  color: var(--text-mute);
  font-size: 10.5px;
}

.security {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px 22px;
}

.security article {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.num {
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  color: var(--accent-text);
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
  font-family: var(--mono);
  font-size: 10px;
}

.security strong {
  display: block;
  margin-bottom: 3px;
  font-size: 12.5px;
}

.security p {
  margin: 0;
  color: var(--text-dim);
  font-size: 11.5px;
  line-height: 1.7;
}

.links-panel {
  margin-bottom: 0;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.links a {
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid var(--line);
  color: var(--text-dim);
  font-size: 11.5px;
}

.links a:hover {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.log-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}

.log-modal {
  width: min(720px, 94vw);
  max-height: min(760px, 88vh);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid var(--line-strong);
  background: var(--card-solid);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.log-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.log-head strong {
  display: block;
  font-size: 15px;
}

.log-head small {
  color: var(--text-mute);
  font-size: 11px;
}

.log-head .close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-dim);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.log-body {
  overflow-y: auto;
  padding: 14px 18px 20px;
}

.log-entry + .log-entry {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-mute);
  font-size: 11px;
}

.log-version {
  color: var(--accent-text);
  font-weight: 600;
}

.log-entry ul {
  margin: 7px 0 0;
  padding-left: 18px;
  color: var(--text-dim);
  font-size: 12.5px;
  line-height: 1.75;
}

@media (max-width: 720px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-side {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
