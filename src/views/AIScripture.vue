<template>
  <div class="ai-page">
    <Navbar />

    <section class="ai-hero">
      <div class="ai-hero-inner">
        <p class="eyebrow">AI & Scripture</p>
        <h2>How we use AI with care and reverence</h2>
        <p class="lede">
          Word of Life Answers uses modern technology to help people explore the Bible more thoughtfully and effectively. Because this includes the use of artificial intelligence (AI), we believe it’s important to be clear about how it is used—and how it is not.
        </p>
      </div>
    </section>

    <main class="ai-content">
      <section class="ai-card">
        <h3>How AI is used on this site</h3>
        <p>AI is used as a supportive tool to help:</p>
        <ul>
          <li>Organize and summarize information</li>
          <li>Surface relevant Scripture passages</li>
          <li>Explain biblical concepts in clear, readable language</li>
          <li>Assist with topical exploration and follow-up questions</li>
        </ul>
        <p>AI helps structure responses and highlight connections, but it does not replace Scripture or determine truth.</p>
      </section>

      <section class="ai-card">
        <h3>Scripture remains the authority</h3>
        <p>The Bible is the foundation of this site. All answers are intended to:</p>
        <ul>
          <li>Point users back to Scripture</li>
          <li>Encourage reading verses in context</li>
          <li>Support thoughtful study, not final conclusions</li>
        </ul>
        <p>Users are encouraged to examine Scripture directly, compare passages, and test every explanation against God’s Word.</p>
      </section>

      <section class="ai-card">
        <h3>AI is not infallible</h3>
        <p>While care is taken to provide accurate and respectful responses, AI-generated content can:</p>
        <ul>
          <li>Be incomplete or imperfect</li>
          <li>Reflect general interpretations rather than definitive answers</li>
          <li>Vary based on how questions are asked</li>
        </ul>
        <p>For this reason, Word of Life Answers should be used as a study aid, not as a substitute for personal Bible reading, prayer, or church teaching.</p>
      </section>

      <section class="ai-card">
        <h3>Discernment is encouraged</h3>
        <p>Scripture calls believers to wisdom and discernment. This site is designed to support that process, not replace it. Users are encouraged to:</p>
        <ul>
          <li>Ask follow-up questions</li>
          <li>Explore multiple passages</li>
          <li>Seek guidance through prayer and trusted Christian teaching</li>
        </ul>
        <p>Every answer is a starting point for deeper study.</p>
      </section>

      <section class="ai-card">
        <h3>A respectful approach to faith and technology</h3>
        <p>
          Word of Life Answers approaches both Scripture and technology with humility and care. AI is used intentionally and conservatively, with a focus on clarity, helpfulness, and respect for God’s Word.
        </p>
        <p>
          This site does not claim divine authority, inspiration, or special revelation. It exists to serve those who desire to learn, study, and grow in understanding.
        </p>
      </section>
    </main>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.ai-page {
  min-height: 100vh;
  background: linear-gradient(150deg, rgba(21, 47, 89, 0.12), rgba(32, 62, 117, 0.08));
  color: var(--text-main, #1f2a44);
  padding-top: 80px;
}

.ai-hero {
  padding: 1.5rem 1rem 1rem;
  display: flex;
  justify-content: center;
}

.ai-hero-inner {
  max-width: 940px;
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.15));
  border-radius: 24px;
  padding: 1rem;
  box-shadow: 0 24px 48px rgba(31, 50, 86, 0.16);
  text-align: center;
}

.eyebrow {
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary, #1f3b63);
  margin-bottom: 0;
  font-weight: 700;
}

.ai-hero h2 {
  font-size: clamp(1.6rem, 2.6vw, 2.2rem);
  margin: 0.2rem 0 0.35rem;
  color: var(--brand-primary, #1f3b63);
  font-weight: 700;
}

.lede {
  font-size: 1rem;
  margin: 0;
  color: var(--text-main, #2b3043);
  line-height: 1.6;
}

.ai-content {
  max-width: 940px;
  margin: 0 auto 4rem;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ai-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.15));
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 18px 38px rgba(31, 50, 86, 0.14);
}

.ai-card h2,
.ai-card h3 {
  margin: 0 0 0.6rem;
  color: var(--brand-primary, #1f3b63);
}

.ai-card p {
  margin: 0 0 0.75rem;
  line-height: 1.6;
  color: var(--text-main, #2b3043);
}

.ai-card ul {
  margin: 0 0 0.75rem 1.25rem;
  padding: 0;
  line-height: 1.6;
  color: var(--text-main, #2b3043);
}

.ai-card li {
  margin-bottom: 0.35rem;
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .ai-hero {
    padding: 3rem 1rem 1.5rem;
  }

  .ai-hero-inner {
    padding: 1.5rem;
  }
}
</style>
