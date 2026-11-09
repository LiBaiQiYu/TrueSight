<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import {
  config,
  PROVIDERS,
  PROVIDER_LIST,
  setProvider,
  type ProviderId
} from '../lib/config'
import { hasApiKey, modelState, refreshModels } from '../lib/models'

const emit = defineEmits<{ (e: 'back'): void }>()

const revealKey = ref(false)
const revealStratz = ref(false)
const canMask =
  typeof CSS !== 'undefined' && CSS.supports('-webkit-text-security', 'disc')

const provider = computed(() => PROVIDERS[config.provider])
const apiKey = computed({
  get: () => config.keys[config.provider] ?? '',
  set: (value: string) => {
    config.keys[config.provider] = value
  }
})
const baseUrl = computed({
  get: () => config.baseUrls[config.provider] || PROVIDERS[config.provider].defaultBaseUrl,
  set: (value: string) => {
    config.baseUrls[config.provider] = value
  }
})

function chooseProvider(id: ProviderId): void {
  if (id === config.provider) return
  revealKey.value = false
  setProvider(id)
  if (hasApiKey.value) void refreshModels()
}

function setBaseUrl(url: string): void {
  baseUrl.value = url
}

const themes = [
  { id: 'standard', label: '标准', desc: '中性灰 · 蓝色强调 · 亚克力' },
  { id: 'truesight', label: 'TrueSight', desc: '祖母绿 · 棱面宝石' }
] as const

const modes = [
  { id: 'light', label: '浅色' },
  { id: 'dark', label: '深色' }
] as const

const statusText = computed(() => {
  if (!hasApiKey.value) return `未填写 ${provider.value.name} API Key`
  if (modelState.loading) return '正在获取模型…'
  if (modelState.error) return modelState.error
  if (provider.value.models.length) {
    return `已配置 · ${provider.value.name} · 内置模型 ${modelState.list.length} 个`
  }
  return `已连接 · ${provider.value.name} · 可用模型 ${modelState.list.length} 个`
})
</script>

<template>
  <section class="settings">
    <header class="head">
      <div>
        <h2>设置</h2>
        <p>密钥只保存在当前浏览器，本地服务只做转发，不会落盘。</p>
      </div>
      <button class="btn btn-ghost" type="button" @click="emit('back')">
        <AppIcon name="chevronRight" :size="14" class="back-icon" />
        返回分析
      </button>
    </header>

    <div class="card block">
      <h3><AppIcon name="key" :size="16" /> 模型服务</h3>

      <div class="providers" role="group" aria-label="模型服务商">
        <button
          v-for="p in PROVIDER_LIST"
          :key="p.id"
          type="button"
          class="provider"
          :class="{ on: config.provider === p.id }"
          @click="chooseProvider(p.id)"
        >
          {{ p.name }}
        </button>
      </div>
      <p class="provider-desc">
        {{ provider.desc }}
        <a v-if="provider.siteUrl" :href="provider.siteUrl" target="_blank" rel="noopener">获取 API Key</a>
      </p>

      <label class="field-label" for="settings-key">{{ provider.name }} API Key</label>
      <div class="input-wrap">
        <input
          id="settings-key"
          v-model="apiKey"
          class="field"
          :class="{ masked: !revealKey && canMask }"
          :type="!revealKey && !canMask ? 'password' : 'text'"
          :autocomplete="!revealKey && !canMask ? 'new-password' : 'off'"
          :name="'truesight-' + config.provider + '-key'"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          :placeholder="provider.keyHint"
        />
        <button class="reveal" type="button" @click="revealKey = !revealKey">
          <AppIcon :name="revealKey ? 'eyeOff' : 'eye'" :size="16" />
        </button>
      </div>
      <p v-if="provider.allowEmptyKey" class="note key-note">
        本地 Ollama / LM Studio 可以留空；远程服务请填写 Key。
      </p>

      <template v-if="provider.requiresModel">
        <label class="field-label" for="settings-model">模型名称</label>
        <input
          id="settings-model"
          v-model="config.customModel"
          class="field mono"
          spellcheck="false"
          autocomplete="off"
          placeholder="例如：qwen2.5-72b-instruct"
        />
      </template>

      <label class="field-label" for="settings-base">接口地址</label>
      <input
        id="settings-base"
        v-model="baseUrl"
        class="field mono"
        spellcheck="false"
        autocomplete="off"
        :placeholder="provider.defaultBaseUrl || 'https://your-endpoint/v1'"
      />

      <div v-if="provider.altBaseUrl" class="line-row">
        <span class="line-label">线路</span>
        <button
          type="button"
          class="line-btn"
          :class="{ on: baseUrl === provider.defaultBaseUrl }"
          @click="setBaseUrl(provider.defaultBaseUrl)"
        >
          国内
        </button>
        <button
          type="button"
          class="line-btn"
          :class="{ on: baseUrl === provider.altBaseUrl }"
          @click="setBaseUrl(provider.altBaseUrl)"
        >
          {{ provider.altBaseLabel }}
        </button>
      </div>

      <div class="status-line">
        <span class="dot" :class="{ ok: hasApiKey && !modelState.error, bad: !!modelState.error }" />
        <span>{{ statusText }}</span>
        <button
          class="btn btn-ghost small"
          type="button"
          :disabled="modelState.loading || !hasApiKey"
          @click="refreshModels"
        >
          <AppIcon name="refresh" :size="13" :class="{ spin: modelState.loading }" />
          重新获取模型
        </button>
      </div>
    </div>

    <div class="card block">
      <h3><AppIcon name="sliders" :size="16" /> STRATZ（可选）</h3>
      <p class="note">
        用于高级分析或手动选择 STRATZ 数据源。在 stratz.com/api 生成 Token。
      </p>

      <label class="field-label" for="settings-stratz">STRATZ Token</label>
      <div class="input-wrap">
        <input
          id="settings-stratz"
          v-model="config.stratzToken"
          class="field"
          :class="{ masked: !revealStratz && canMask }"
          :type="!revealStratz && !canMask ? 'password' : 'text'"
          :autocomplete="!revealStratz && !canMask ? 'new-password' : 'off'"
          name="truesight-stratz-token"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          placeholder="eyJhbGciOi..."
        />
        <button class="reveal" type="button" @click="revealStratz = !revealStratz">
          <AppIcon :name="revealStratz ? 'eyeOff' : 'eye'" :size="16" />
        </button>
      </div>
    </div>

    <div class="card block">
      <h3><AppIcon name="moon" :size="16" /> 外观</h3>
      <div class="themes">
        <button
          v-for="t in themes"
          :key="t.id"
          type="button"
          class="theme-option"
          :class="{ on: config.theme === t.id }"
          @click="config.theme = t.id"
        >
          <span class="swatch" :class="t.id" />
          <span class="theme-name">{{ t.label }}</span>
          <span class="theme-desc">{{ t.desc }}</span>
        </button>
      </div>

      <div class="mode-row">
        <span class="mode-label">明暗模式</span>
        <div class="mode-options">
          <button
            v-for="m in modes"
            :key="m.id"
            type="button"
            class="mode-option"
            :class="{ on: config.mode === m.id }"
            @click="config.mode = m.id"
          >
            {{ m.label }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding-bottom: 24px;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.head h2 {
  font-size: 20px;
  font-weight: 700;
}

.head p {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-mute);
}

.back-icon {
  transform: rotate(180deg);
}

.block {
  padding: 18px 20px 20px;
  margin-bottom: 14px;
}

.block h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 650;
  margin-bottom: 14px;
}

.field-label {
  display: block;
  margin: 12px 0 6px;
  font-size: 12px;
  color: var(--text-dim);
}

.input-wrap {
  position: relative;
}

.input-wrap .field {
  padding-right: 42px;
}

.reveal {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: var(--text-mute);
}

.reveal:hover {
  color: var(--text);
  background: var(--hover);
}

.mono {
  font-family: var(--mono);
  font-size: 12px;
}

.status-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-dim);
  flex-wrap: wrap;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-mute);
}

.dot.ok {
  background: var(--radiant);
  box-shadow: 0 0 8px rgba(95, 208, 138, 0.7);
}

.dot.bad {
  background: var(--dire);
  box-shadow: 0 0 8px rgba(242, 109, 109, 0.6);
}

.small {
  height: 30px;
  font-size: 12px;
  margin-left: auto;
}

.note {
  font-size: 12px;
  color: var(--text-mute);
  margin: -4px 0 8px;
}

.key-note {
  margin: 7px 0 0;
  font-size: 10.5px;
}

.providers {
  display: inline-flex;
  flex-wrap: wrap;
  max-width: 100%;
  gap: 3px;
  padding: 3px;
  border-radius: 9px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.provider {
  height: 30px;
  padding: 0 18px;
  border-radius: 7px;
  font-size: 12.5px;
  color: var(--text-dim);
  transition: background 0.16s, color 0.16s;
}

.provider:hover {
  color: var(--text);
}

.provider.on {
  color: var(--seg-text);
  background: var(--seg-grad);
  box-shadow: var(--seg-shadow);
}

.provider-desc {
  margin-top: 9px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--text-mute);
}

.provider-desc a {
  margin-left: 4px;
  color: var(--accent-text);
}

.provider-desc a:hover {
  text-decoration: underline;
}

.line-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: 11.5px;
  color: var(--text-mute);
}

.line-label {
  color: var(--text-dim);
}

.line-btn {
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--input-bg);
  font-size: 11.5px;
  color: var(--text-dim);
  transition: border-color 0.16s, background 0.16s, color 0.16s;
}

.line-btn:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.line-btn.on {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.line-hint {
  font-family: var(--mono);
  font-size: 10.5px;
  opacity: 0.7;
}

.themes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--input-bg);
  text-align: left;
  transition: border-color 0.16s, background 0.16s, box-shadow 0.16s;
}

.theme-option:hover {
  border-color: var(--line-strong);
}

.theme-option.on {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

.swatch {
  width: 100%;
  height: 30px;
  border-radius: 7px;
  border: 1px solid var(--line);
  margin-bottom: 2px;
}

.swatch.standard {
  background: linear-gradient(120deg, #f7f8fa 0 55%, #4da3ff 55% 78%, #0a84ff 78%);
}

.swatch.truesight {
  background: linear-gradient(120deg, #0c2018 0 55%, #22c55e 55% 78%, #86efac 78%);
}

.mode-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.mode-label {
  font-size: 12px;
  color: var(--text-dim);
}

.mode-options {
  display: inline-flex;
  padding: 3px;
  border-radius: 9px;
  background: var(--input-bg);
  border: 1px solid var(--line);
}

.mode-option {
  height: 28px;
  padding: 0 14px;
  border-radius: 7px;
  font-size: 12px;
  color: var(--text-dim);
  transition: background 0.16s, color 0.16s;
}

.mode-option:hover {
  color: var(--text);
}

.mode-option.on {
  color: var(--seg-text);
  background: var(--seg-grad);
  box-shadow: var(--seg-shadow);
}

.theme-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
}

.theme-desc {
  font-size: 10.5px;
  color: var(--text-mute);
  line-height: 1.5;
}

@media (max-width: 640px) {
  .themes {
    grid-template-columns: minmax(0, 1fr);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.field.masked {
  -webkit-text-security: disc;
  letter-spacing: 0.08em;
}
</style>
