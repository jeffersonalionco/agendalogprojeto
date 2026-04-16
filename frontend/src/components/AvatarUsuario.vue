<template>
  <div class="avatar-usuario" :class="[sizeClass, { 'avatar-usuario--placeholder': !src }]" :style="sizeStyle">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="avatar-usuario__img"
    />
    <div v-else class="avatar-usuario__placeholder" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0066FF" />
            <stop offset="100%" stop-color="#3385FF" />
          </linearGradient>
          <linearGradient id="avatarGradInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.25)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#avatarGrad)" />
        <circle cx="32" cy="32" r="32" fill="url(#avatarGradInner)" />
        <circle cx="32" cy="24" r="10" fill="white" fill-opacity="0.95" />
        <path
          d="M16 56c0-8.8 7.2-16 16-16s16 7.2 16 16"
          stroke="white"
          stroke-opacity="0.95"
          stroke-width="4"
          stroke-linecap="round"
          fill="none"
        />
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AvatarUsuario',
  props: {
    src: { type: String, default: null },
    alt: { type: String, default: 'Usuário' },
    size: { type: String, default: 'medium' }, // 'small' | 'medium' | 'large' ou numero em px, tipo "40"
  },
  computed: {
    sizeClass() {
      if (this.size === 'small' || this.size === 'medium' || this.size === 'large') {
        return `avatar-usuario--${this.size}`
      }
      return ''
    },
    sizeStyle() {
      const n = parseInt(this.size, 10)
      if (!isNaN(n) && n > 0) {
        return { width: `${n}px`, height: `${n}px` }
      }
      return {}
    },
  },
}
</script>

<style scoped>
.avatar-usuario {
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
}

.avatar-usuario--small {
  width: 32px;
  height: 32px;
}

.avatar-usuario--medium {
  width: 40px;
  height: 40px;
}

.avatar-usuario--large {
  width: 150px;
  height: 150px;
}

.avatar-usuario__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-usuario__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-usuario__placeholder svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
