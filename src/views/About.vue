<template>
  <div class="about-page">
    <Navbar />

    <section class="about-hero">
      <div class="about-hero-inner">
        <p class="eyebrow">About Word of Life Answers</p>
        <h2>Study Scripture with care and confidence</h2>
        <p class="lede">
          Word of Life Answers was created to help people explore Scripture thoughtfully, ask meaningful questions,
          and grow in their understanding of God’s Word.
        </p>
      </div>
    </section>

    <main class="about-content">
      <section class="about-card">
        <h2>Why this site exists</h2>
        <p>
          The Bible is rich, deep, and sometimes challenging to understand—especially when studied outside of historical,
          cultural, and theological context. This site exists as a study companion, designed to support personal reflection,
          learning, and curiosity about Scripture.
        </p>
      </section>

      <section class="about-grid">
        <article class="about-card">
          <h3>A tool for study and exploration</h3>
          <p>Word of Life Answers allows you to:</p>
          <ul>
            <li>Ask thoughtful questions about the Bible</li>
            <li>Explore Scripture by topic or theme</li>
            <li>Discover related verses and biblical insights</li>
            <li>Save and revisit answers as part of your personal study</li>
          </ul>
          <p class="note">The goal is not quick or shallow responses, but deeper engagement and thoughtful follow-up.</p>
        </article>

        <article class="about-card">
          <h3>Guided Bible reading plans</h3>
          <p>In addition to question-based study, Word of Life Answers offers guided Bible reading plans designed to help you stay consistent and intentional.</p>
          <ul>
            <li>Annual Bible reading plans for journeying through Scripture over time</li>
            <li>Topical reading plans focused on specific themes or subjects</li>
          </ul>
          <p>Track your progress, save your place, and return at any time so steady reading becomes easier.</p>
        </article>
      </section>

      <section class="about-grid">
        <article class="about-card">
          <h3>Scripture comes first</h3>
          <p>This site is not intended to replace:</p>
          <ul>
            <li>Reading the Bible itself</li>
            <li>Prayer and personal reflection</li>
            <li>Church teaching or community</li>
          </ul>
          <p>Instead, it is designed to point you back to Scripture, encouraging you to read passages directly and examine them in context.</p>
          <p class="note">All Scripture on this site comes from the King James Version (KJV) unless otherwise noted.</p>
        </article>

        <article class="about-card">
          <h3>Thoughtful use of technology</h3>
          <p>
            Word of Life Answers uses modern technology to organize information, surface relevant passages, and provide structured explanations. Every effort is made to keep Scripture central and to present insights in a respectful, study-focused way.
          </p>
          <p>Users are encouraged to compare responses with the Bible itself and approach every answer with discernment.</p>
          <p>
            For more information on how technology and AI are used on this site, please see our
            <router-link to="/ai-scripture" class="inline-link">AI & Scripture</router-link>
            page.
          </p>
        </article>
      </section>

      <section class="about-card">
        <h2>Created with care</h2>
        <p>
          Word of Life Answers was built by a Christian developer with a passion for Scripture, learning, and thoughtful study. This site is offered as a free resource for anyone seeking to grow in biblical understanding—whether you are new to the Bible or have studied it for many years.
        </p>
        <div class="cta-row">
          <router-link to="/adults" class="primary-btn">Ask a Bible question</router-link>
          <router-link to="/adults?tab=study" class="ghost-btn">Explore study plans</router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(150deg, rgba(21, 47, 89, 0.12), rgba(32, 62, 117, 0.08));
  color: var(--text-main, #1f2a44);
  padding-top: 80px;
}

.about-hero {
  padding: 1rem 1rem 1rem;
  display: flex;
  justify-content: center;
}

.about-hero-inner {
  max-width: 1100px;
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.15));
  border-radius: 24px;
  padding: 0.5rem;
  box-shadow: 0 24px 48px rgba(31, 50, 86, 0.16);
  text-align: center;
}

.eyebrow {
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary, #1f3b63);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.about-hero h1 {
  font-size: clamp(2rem, 3vw, 2.75rem);
  margin: 0.25rem 0 0.75rem;
  color: var(--brand-primary, #1f3b63);
}

.lede {
  font-size: 1.1rem;
  margin: 0;
  color: var(--text-main, #2b3043);
  line-height: 1.6;
}


.about-content {
  max-width: 1100px;
  margin: 0 auto 4rem;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.15));
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 18px 38px rgba(31, 50, 86, 0.14);
}

.about-card h2,
.about-card h3 {
  margin: 0 0 0.6rem;
  color: var(--brand-primary, #1f3b63);
}

.about-card p {
  margin: 0 0 0.75rem;
  line-height: 1.65;
  color: var(--text-main, #2b3043);
}

.about-card ul {
  margin: 0 0 0.75rem 1.25rem;
  padding: 0;
  line-height: 1.6;
  color: var(--text-main, #2b3043);
}

.about-card li {
  margin-bottom: 0.35rem;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.note {
  background: rgba(32, 62, 117, 0.08);
  border-left: 4px solid var(--color-primary, #1f3b63);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin: 0;
  color: var(--text-main, #2b3043);
}

.cta-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  justify-content: center;
}

.primary-btn,
.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.4rem;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid var(--color-primary, #2e4c84);
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, var(--color-primary, #1f3b63), var(--color-primary-light, #2e5aa7));
  color: #fff;
  box-shadow: 0 14px 28px rgba(47, 74, 126, 0.25);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(47, 74, 126, 0.3);
}

.ghost-btn {
  background: transparent;
  color: var(--color-primary, #1f3b63);
  border-color: rgba(47, 74, 126, 0.4);
}

.ghost-btn:hover {
  background: rgba(47, 74, 126, 0.08);
  transform: translateY(-1px);
}

.inline-link {
  color: var(--color-primary, #1f3b63);
  font-weight: 700;
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .about-hero {
    padding: 3rem 1rem 1.5rem;
  }

  .about-hero-inner {
    padding: 2rem 1.5rem;
  }
}
</style>
