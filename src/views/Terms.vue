<template>
  <div class="terms-page">
    <Navbar />

    <main class="terms-content">
      <header class="terms-hero">
        <p class="eyebrow">Terms of Use</p>
        <h1>Guidelines for using Word of Life Answers</h1>
        <p class="lede">Effective Date: December 1, 2025</p>
      </header>

      <section class="terms-card">
        <h2>Purpose of the Site</h2>
        <p>
          Word of Life Answers is provided as a Bible study and exploration resource to help users ask questions, explore Scripture, follow reading plans, and engage thoughtfully with biblical content. The site is offered for informational and educational purposes only.
        </p>
      </section>

      <section class="terms-grid">
        <article class="terms-card">
          <h3>Use of Content</h3>
          <p>All content on this site—including AI-generated responses, reading plans, and study materials—is intended to support personal study and reflection. You agree to:</p>
          <ul>
            <li>Use the site respectfully and lawfully</li>
            <li>Not misuse or attempt to disrupt the site or its services</li>
            <li>Not rely on site content as a substitute for personal Bible reading, prayer, or church teaching</li>
          </ul>
          <p class="note">Scripture remains the authority, and users are encouraged to examine passages directly and in context.</p>
        </article>

        <article class="terms-card">
          <h3>AI-Generated Content Disclaimer</h3>
          <p>Some responses and features on this site are generated or assisted by artificial intelligence (AI). While care is taken to provide helpful and respectful content:</p>
          <ul>
            <li>AI-generated responses may be incomplete or imperfect</li>
            <li>Interpretations may vary</li>
            <li>Content should not be considered authoritative, inspired, or definitive</li>
          </ul>
          <p class="note">Word of Life Answers does not claim divine authority, special revelation, or theological infallibility.</p>
        </article>
      </section>

      <section class="terms-grid">
        <article class="terms-card">
          <h3>Accounts and Saved Content</h3>
          <p>Creating an account allows users to save answers, track reading plans, and retain study progress. You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your account</li>
            <li>Any activity that occurs under your account</li>
          </ul>
          <p>You may request deletion of your account and associated data at any time.</p>
        </article>

        <article class="terms-card">
          <h3>Intellectual Property</h3>
          <p>
            The design, structure, and original content of Word of Life Answers are the property of the site owner unless otherwise stated. Bible translations remain the property of their respective copyright holders and are used in accordance with applicable permissions and licenses.
          </p>
          <p>You may not reproduce, redistribute, or republish site content for commercial purposes without permission.</p>
        </article>
      </section>

      <section class="terms-grid">
        <article class="terms-card">
          <h3>Availability and Changes</h3>
          <p>Word of Life Answers is provided “as is” and “as available.” We reserve the right to:</p>
          <ul>
            <li>Modify or discontinue features</li>
            <li>Update content</li>
            <li>Change these Terms of Use at any time</li>
          </ul>
          <p>Continued use of the site after changes constitutes acceptance of the updated terms.</p>
        </article>

        <article class="terms-card">
          <h3>Limitation of Liability</h3>
          <p>Word of Life Answers is not responsible for:</p>
          <ul>
            <li>Errors or omissions in content</li>
            <li>Decisions made based on site content</li>
            <li>Interruptions or technical issues</li>
          </ul>
          <p>Use of the site is at your own discretion and responsibility.</p>
        </article>
      </section>

      <section class="terms-grid">
        <article class="terms-card">
          <h3>Children’s Use</h3>
          <p>The site offers kid-friendly experiences, but accounts should be created by adults or with parental guidance. We do not knowingly collect personal information from children without appropriate oversight.</p>
        </article>

        <article class="terms-card">
          <h3>Governing Principles</h3>
          <p>These Terms of Use are intended to encourage respectful, thoughtful engagement with Scripture and with others who use the site.</p>
        </article>
      </section>
    </main>

    <FooterSimple />
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import FooterSimple from '../components/FooterSimple.vue'
</script>

<style scoped>
.terms-page {
  min-height: 100vh;
  background: linear-gradient(150deg, rgba(21, 47, 89, 0.12), rgba(32, 62, 117, 0.08));
  color: var(--text-main, #1f2a44);
  padding-top: 80px;
}

.terms-content {
  max-width: 1100px;
  margin: 0 auto 1.5rem;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.terms-hero {
  text-align: center;
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.15));
  border-radius: 20px;
  padding: 1.5rem 1.25rem;
  box-shadow: 0 24px 48px rgba(31, 50, 86, 0.16);
}

.eyebrow {
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary, #1f3b63);
  margin-bottom: 0.35rem;
  font-weight: 700;
}

.terms-hero h1 {
  margin: 0 0 0.35rem;
  color: var(--brand-primary, #1f3b63);
  font-size: clamp(1.9rem, 3vw, 2.6rem);
}

.lede {
  margin: 0;
  color: var(--text-main, #2b3043);
  font-weight: 600;
}

.terms-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.15));
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 16px 32px rgba(31, 50, 86, 0.14);
}

.terms-card h2,
.terms-card h3 {
  margin: 0 0 0.5rem;
  color: var(--brand-primary, #1f3b63);
}

.terms-card p {
  margin: 0 0 0.75rem;
  color: var(--text-main, #2b3043);
  line-height: 1.6;
}

.terms-card ul {
  margin: 0 0 0.75rem 1.2rem;
  color: var(--text-main, #2b3043);
  line-height: 1.6;
}

.terms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.note {
  background: rgba(32, 62, 117, 0.08);
  border-left: 4px solid var(--color-primary, #1f3b63);
  padding: 0.65rem 1rem;
  border-radius: 12px;
  margin: 0;
  color: var(--text-main, #2b3043);
}

@media (max-width: 768px) {
  .terms-hero {
    padding: 1.25rem 1rem;
  }
}
</style>
