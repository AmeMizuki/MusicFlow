<template>
  <div class="view-container about-view">
    <div class="about-hero glass-panel">
      <div class="hero-content">
        <div class="logo-large">
          <img src="/logo.svg" alt="MusicFlow Logo" />
        </div>
        <h1>{{ $t('about.title') }}</h1>
        <p class="subtitle">{{ $t('about.subtitle') }}</p>
        
        <div class="github-link-container">
          <a href="https://github.com/AmeMizuki/MusicFlow" target="_blank" class="github-btn">
            <i class="pi pi-github"></i>
            <span>{{ $t('about.github') }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="about-grid">
      <!-- Advantages Section -->
      <div class="about-section glass-panel">
        <div class="section-header">
          <i class="pi pi-sparkles"></i>
          <h3>{{ $t('about.features.title') }}</h3>
        </div>
        <div class="features-list">
          <div class="feature-card">
            <h4>{{ $t('about.features.p1_title') }}</h4>
            <p>{{ $t('about.features.p1_desc') }}</p>
          </div>
          <div class="feature-card">
            <h4>{{ $t('about.features.p2_title') }}</h4>
            <p>{{ $t('about.features.p2_desc') }}</p>
          </div>
          <div class="feature-card">
            <h4>{{ $t('about.features.p3_title') }}</h4>
            <p>{{ $t('about.features.p3_desc') }}</p>
          </div>
        </div>
      </div>

      <!-- Tech Stack Section -->
      <div class="about-section glass-panel">
        <div class="section-header">
          <i class="pi pi-code"></i>
          <h3>{{ $t('about.tech.title') }}</h3>
        </div>
        <div class="tech-stack">
          <div class="tech-item">
            <i class="pi pi-box"></i>
            <span>{{ $t('about.tech.stack') }}</span>
          </div>
          <div class="tech-item">
            <i class="pi pi-palette"></i>
            <span>{{ $t('about.tech.ui') }}</span>
          </div>
          <div class="tech-item">
            <i class="pi pi-globe"></i>
            <span>{{ $t('about.tech.i18n') }}</span>
          </div>
          <div class="tech-item">
            <i class="pi pi-image"></i>
            <span>{{ $t('about.tech.other') }}</span>
          </div>
        </div>
        
        <div class="about-footer-info">
          <p>{{ $t('about.description') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-view {
  padding: var(--spacing-xl) 0 100px;
  max-width: 1000px;
  margin: 0 auto;
}

.about-hero {
  padding: 60px 40px;
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid var(--glass-border);
}

.logo-large {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  filter: drop-shadow(0 10px 20px rgba(59, 130, 246, 0.4));
}

.logo-large img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.about-hero h1 {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 12px;
  background: var(--grad-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 32px;
}

.github-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #24292e;
  color: white;
  padding: 12px 28px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.github-btn:hover {
  transform: translateY(-4px);
  background: #333;
  box-shadow: 0 15px 30px rgba(0,0,0,0.4);
}

.github-btn i {
  font-size: 1.4rem;
}

.about-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 30px;
}

.about-section {
  padding: 32px;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.section-header i {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.section-header h3 {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-card h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--accent-primary);
}

.feature-card p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.tech-item i {
  color: var(--accent-secondary);
}

.tech-item span {
  font-size: 0.95rem;
  font-weight: 600;
}

.about-footer-info p {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  line-height: 1.8;
  font-style: italic;
}

@media (max-width: 900px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
}
</style>
