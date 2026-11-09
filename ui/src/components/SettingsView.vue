<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import {
  config,
  PROVIDERS,
  PROVIDER_LIST,
  providerName,
  setProvider,
  type ProviderId
} from '../lib/config'
import { fetchCustomCatalog, hasApiKey, modelState, refreshModels } from '../lib/models'

const emit = defineEmits<{ (e: 'back'): void }>()

const revealKey = ref(false)
const revealStratz = ref(false)
const customCatalogLoading = ref(false)
const customCatalogError = ref('')
const customCatalogNote = ref('')
const canMask =
  typeof CSS !== 'undefined' && CSS.supports('-webkit-text-security', 'disc')

const provider = computed(() => PROVIDERS[config.provider])
const providerLabel = computed(() => providerName())
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
const catalogText = computed({
  get: () => config.customCatalog.join('\n'),
  set: (value: string) => {
    config.customCatalog = value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item, index, list) => item.length > 0 && list.indexOf(item) === index)
  }
})
const effortInput = ref('')
const effortPresets = ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'] as const

function addEfforts(raw: string): void {
  const additions = raw
    .split(/[\s,，]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  for (const level of additions) {
    if (!config.customEfforts.includes(level)) config.customEfforts.push(level)
  }
}

function commitEffortInput(): void {
  addEfforts(effortInput.value)
  effortInput.value = ''
}

function removeEffort(level: string): void {
  const index = config.customEfforts.indexOf(level)
  if (index >= 0) config.customEfforts.splice(index, 1)
}

function toggleEffort(level: string): void {
  if (config.customEfforts.includes(level)) removeEffort(level)
  else addEfforts(level)
}

function onEffortKeydown(event: KeyboardEvent): void {
  if (event.isComposing) return
  if (event.key === 'Enter' || event.key === ',' || event.key === '，') {
    event.preventDefault()
    commitEffortInput()
    return
  }
  if (event.key === 'Backspace' && !effortInput.value && config.customEfforts.length) {
    config.customEfforts.pop()
  }
}
const effortText = computed({
  get: () => config.customEfforts.join(', '),
  set: (value: string) => {
    config.customEfforts = value
      .split(/[\s,]+/)
      .map((item) => item.trim().toLowerCase())
      .filter((item, index, list) => item.length > 0 && list.indexOf(item) === index)
  }
})

const protocolOptions = [
  { id: 'chat', label: 'OpenAI Chat Completions' },
  { id: 'responses', label: 'OpenAI Responses' },
  { id: 'anthropic', label: 'Anthropic Messages' }
] as const

async function loadCustomCatalog(): Promise<void> {
  customCatalogLoading.value = true
  customCatalogError.value = ''
  customCatalogNote.value = ''
  try {
    const result = await fetchCustomCatalog()
    config.customCatalog = result.models
    if (result.efforts.length) {
      if (!config.customEfforts.length) config.customEfforts = result.efforts
      customCatalogNote.value = '模型接口返回的思考档位：' + result.efforts.join(' / ')
    } else {
      customCatalogNote.value = '该接口没有返回思考档位，可在上方手动填写'
    }
    if (!result.models.length) {
      customCatalogError.value = '接口没有返回可用模型，仍可直接填写模型 ID'
    } else if (!config.customModel.trim()) {
      config.customModel = result.models[0]
    }
    await refreshModels()
  } catch (error) {
    customCatalogError.value = error instanceof Error ? error.message : String(error)
  } finally {
    customCatalogLoading.value = false
  }
}

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
  if (!hasApiKey.value) return `未填写 ${providerLabel.value} API Key`
  if (modelState.loading) return '正在获取模型…'
  if (modelState.error) return modelState.error
  if (provider.value.models.length) {
    return `已配置 · ${providerLabel.value} · 内置模型 ${modelState.list.length} 个`
  }
  return `已连接 · ${providerLabel.value} · 可用模型 ${modelState.list.length} 个`
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
          {{ p.id === 'custom' ? (config.customName.trim() || '自定义') : p.name }}
        </button>
      </div>
      <p class="provider-desc">
        {{ provider.desc }}
        <a v-if="provider.siteUrl" :href="provider.siteUrl" target="_blank" rel="noopener">获取 API Key</a>
      </p>

      <template v-if="provider.id === 'custom'">
        <div class="custom-identity">
          <div>
            <label class="field-label" for="settings-custom-id">Provider ID</label>
            <input
              id="settings-custom-id"
              v-model="config.customId"
              class="field mono"
              spellcheck="false"
              autocomplete="off"
              placeholder="acme-gateway"
            />
            <p class="note field-note">小写字母开头，用于标识该提供商。</p>
          </div>
          <div>
            <label class="field-label" for="settings-custom-name">显示名称</label>
            <input
              id="settings-custom-name"
              v-model="config.customName"
              class="field"
              spellcheck="false"
              autocomplete="off"
              placeholder="显示名称"
            />
          </div>
        </div>

        <label class="field-label" for="settings-base">API 地址</label>
        <input
          id="settings-base"
          v-model="baseUrl"
          class="field mono"
          spellcheck="false"
          autocomplete="off"
          placeholder="https://gateway.example/v1"
        />

        <label class="field-label" for="settings-protocol">API 协议</label>
        <select id="settings-protocol" v-model="config.customProtocol" class="field">
          <option v-for="p in protocolOptions" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>

        <label class="field-label" for="settings-efforts">推理档位</label>
        <div class="effort-editor">
          <div class="effort-tags">
            <span v-for="level in config.customEfforts" :key="level" class="effort-tag">
              {{ level }}
              <button
                type="button"
                class="effort-remove"
                :aria-label="'移除 ' + level"
                @click="removeEffort(level)"
              >
                ×
              </button>
            </span>
            <input
              id="settings-efforts"
              v-model="effortInput"
              class="effort-entry"
              spellcheck="false"
              autocomplete="off"
              placeholder="输入档位，逗号或回车生成标签"
              @keydown="onEffortKeydown"
              @blur="commitEffortInput"
            />
          </div>
          <div class="effort-presets">
            <span class="preset-label">快捷</span>
            <button
              v-for="preset in effortPresets"
              :key="preset"
              type="button"
              class="preset-btn"
              :class="{ on: config.customEfforts.includes(preset) }"
              :aria-pressed="config.customEfforts.includes(preset)"
              @click="toggleEffort(preset)"
            >
              {{ preset }}
            </button>
          </div>
        </div>
        <p class="note field-note">输入逗号或回车生成标签，点 × 移除；留空则不发送档位。</p>

        <label class="field-label" for="settings-custom-key">API 密钥</label>
        <div class="input-wrap">
          <input
            id="settings-custom-key"
            v-model="apiKey"
            class="field"
            :class="{ masked: !revealKey && canMask }"
            :type="!revealKey && !canMask ? 'password' : 'text'"
            :autocomplete="!revealKey && !canMask ? 'new-password' : 'off'"
            name="truesight-custom-key"
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
        <p class="note key-note">本地 Ollama / LM Studio 可以留空；远程服务请填写 Key。</p>

        <label class="field-label" for="settings-model">模型 ID</label>
        <input
          id="settings-model"
          v-model="config.customModel"
          class="field mono"
          spellcheck="false"
          autocomplete="off"
          placeholder="例如：gpt-5.1 或 mimo-v2.6-flash"
        />
        <p class="note field-note">目录为空时，模型选择器不显示模型；此 ID 仍会直接发送。</p>

        <label class="field-label" for="settings-catalog">模型目录</label>
        <textarea
          id="settings-catalog"
          v-model="catalogText"
          class="field catalog-field"
          spellcheck="false"
          rows="3"
          placeholder="每行一个模型 ID，可留空"
        />
        <div class="catalog-line">
          <button
            class="btn btn-ghost small"
            type="button"
            :disabled="customCatalogLoading"
            @click="loadCustomCatalog"
          >
            <AppIcon name="refresh" :size="13" :class="{ spin: customCatalogLoading }" />
            获取可用模型
          </button>
          <span v-if="customCatalogError" class="catalog-error">{{ customCatalogError }}</span>
        </div>
        <p v-if="customCatalogNote" class="note field-note">{{ customCatalogNote }}</p>
      </template>

      <template v-else>
        <label class="field-label" for="settings-key">{{ providerLabel }} API Key</label>
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

        <label class="field-label" for="settings-base">接口地址</label>
        <input
          id="settings-base"
          v-model="baseUrl"
          class="field mono"
          spellcheck="false"
          autocomplete="off"
          :placeholder="provider.defaultBaseUrl || 'https://your-endpoint/v1'"
        />
      </template>

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

.custom-identity {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}

.custom-identity .field-label {
  margin-top: 12px;
}

.field-note {
  margin: 6px 0 0;
  font-size: 10.5px;
  line-height: 1.5;
}

.effort-editor {
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--input-bg);
  transition: border-color 0.16s, box-shadow 0.16s;
}

.effort-editor:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.effort-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 26px;
}

.effort-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 3px 2px 7px;
  border-radius: 6px;
  border: 1px solid var(--accent-line);
  background: var(--accent-soft);
  color: var(--accent-text);
  font-family: var(--mono);
  font-size: 11px;
}

.effort-remove {
  width: 17px;
  height: 17px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  color: var(--accent-text);
  opacity: 0.7;
  font-size: 14px;
  line-height: 1;
}

.effort-remove:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.effort-entry {
  flex: 1;
  min-width: 150px;
  height: 26px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-family: var(--mono);
  font-size: 11.5px;
}

.effort-entry::placeholder {
  color: var(--text-mute);
  font-family: inherit;
}

.effort-presets {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--line);
}

.preset-label {
  margin-right: 2px;
  color: var(--text-mute);
  font-size: 10.5px;
}

.preset-btn {
  height: 22px;
  padding: 0 8px;
  border-radius: 5px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-dim);
  font-family: var(--mono);
  font-size: 10.5px;
  transition: color 0.16s, border-color 0.16s, background 0.16s;
}

.preset-btn:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.preset-btn.on {
  color: var(--accent-text);
  border-color: var(--accent-line);
  background: var(--accent-soft);
}

.catalog-field {
  min-height: 72px;
  resize: vertical;
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.55;
}

.catalog-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.catalog-line .small {
  margin-left: 0;
}

.catalog-error {
  font-size: 11px;
  color: var(--dire);
  line-height: 1.5;
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

  .custom-identity {
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
