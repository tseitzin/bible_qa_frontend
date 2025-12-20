<template>
  <div class="contact-page">
    <Navbar />

    <main class="contact-content">
      <header class="contact-hero">
        <p class="eyebrow">Contact</p>
        <h1>We welcome questions, feedback, and suggestions</h1>
        <p class="lede">We read every message and appreciate your input.</p>
      </header>

      <section class="contact-card">
        <h2>How to reach us</h2>
        <p>
          If you have thoughts about the site, notice an issue, or would like to share feedback, please feel free to reach out.
        </p>
      </section>

      <section class="contact-grid">
        <article class="contact-card">
          <h3>Email</h3>
          <p>You can contact us at:</p>
          <p class="note">contact@wordoflifeanswers.com</p>
          <p>For general feedback or suggestions, you may also use:</p>
          <p class="note">feedback@wordoflifeanswers.com</p>
        </article>

        <article class="contact-card">
          <h3>A note about responses</h3>
          <p>
            Word of Life Answers is a thoughtfully maintained project. While every message may not receive an immediate reply, all messages are read and considered with care.
          </p>
          <p>
            Thank you for being part of a community that values thoughtful engagement with Scripture. Your feedback helps improve this site for everyone.
          </p>
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
.contact-page {
  min-height: 100vh;
  background: linear-gradient(150deg, rgba(21, 47, 89, 0.12), rgba(32, 62, 117, 0.08));
  color: var(--text-main, #1f2a44);
  padding-top: 80px;
}

.contact-content {
  max-width: 1100px;
  margin: 0 auto 1.5rem;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-hero {
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

.contact-hero h1 {
  margin: 0 0 0.35rem;
  color: var(--brand-primary, #1f3b63);
  font-size: clamp(1.9rem, 3vw, 2.5rem);
}

.lede {
  margin: 0;
  color: var(--text-main, #2b3043);
  font-weight: 600;
}

.contact-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.15));
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 16px 32px rgba(31, 50, 86, 0.14);
}

.contact-card h2,
.contact-card h3 {
  margin: 0 0 0.5rem;
  color: var(--brand-primary, #1f3b63);
}

.contact-card p {
  margin: 0 0 0.75rem;
  color: var(--text-main, #2b3043);
  line-height: 1.6;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.note {
  background: rgba(32, 62, 117, 0.08);
  border-left: 4px solid var(--color-primary, #1f3b63);
  padding: 0.65rem 1rem;
  border-radius: 12px;
  margin: 0 0 0.75rem;
  color: var(--text-main, #2b3043);
}

@media (max-width: 768px) {
  .contact-hero {
    padding: 1.25rem 1rem;
  }
}
</style>
