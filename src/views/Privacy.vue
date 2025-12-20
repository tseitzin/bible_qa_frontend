<template>
  <div class="privacy-page">
    <Navbar />

    <main class="privacy-content">
      <header class="privacy-hero">
        <p class="eyebrow">Privacy Policy</p>
        <h1>Committed to protecting your privacy</h1>
        <p class="lede">Effective Date: December 1, 2025</p>
      </header>

      <section class="privacy-card">
        <h2>Overview</h2>
        <p>
          Word of Life Answers respects your privacy and is committed to protecting it. This policy explains what information we collect, how it is used, and the choices you have regarding your data.
        </p>
      </section>

      <section class="privacy-grid">
        <article class="privacy-card">
          <h3>Information We Collect</h3>
          <p>We collect only the information necessary to operate and improve the site. This may include:</p>
          <ul>
            <li>Information you provide when creating an account (such as an email address)</li>
            <li>Questions you ask and content you choose to save</li>
            <li>Reading plan progress and saved study data</li>
            <li>Basic usage data to help improve site performance and reliability</li>
          </ul>
          <p class="note">We do not collect sensitive personal information such as payment details, government identification, or precise location data.</p>
        </article>

        <article class="privacy-card">
          <h3>How Your Information Is Used</h3>
          <p>Your information is used to:</p>
          <ul>
            <li>Provide core site functionality (saving answers, tracking reading plans)</li>
            <li>Improve the quality and reliability of the site</li>
            <li>Maintain account security</li>
            <li>Respond to questions or feedback you send to us</li>
          </ul>
          <p class="note">Your data is never sold to third parties.</p>
        </article>
      </section>

      <section class="privacy-grid">
        <article class="privacy-card">
          <h3>Use of AI and Technology</h3>
          <p>
            Word of Life Answers uses technology, including AI-assisted tools, to help generate responses and organize content. User questions may be processed by these systems in order to provide answers.
          </p>
          <p>
            We take care to use technology responsibly and to keep Scripture central. AI-generated content is intended to support study and exploration, not to replace Scripture, prayer, or church teaching.
          </p>
        </article>

        <article class="privacy-card">
          <h3>Data Sharing</h3>
          <p>We do not share your personal information with third parties except:</p>
          <ul>
            <li>When required by law</li>
            <li>To protect the security or integrity of the site</li>
            <li>To operate essential services (such as hosting or database providers), under strict confidentiality and security standards</li>
          </ul>
        </article>
      </section>

      <section class="privacy-grid">
        <article class="privacy-card">
          <h3>Cookies and Analytics</h3>
          <p>Word of Life Answers may use basic cookies or analytics tools to:</p>
          <ul>
            <li>Understand how the site is used</li>
            <li>Improve performance and usability</li>
          </ul>
          <p class="note">These tools do not identify you personally and are used only to improve the site experience.</p>
        </article>

        <article class="privacy-card">
          <h3>Your Choices</h3>
          <p>You may:</p>
          <ul>
            <li>Use much of the site without creating an account</li>
            <li>Request deletion of your account and associated data</li>
            <li>Contact us with questions or concerns about your information</li>
          </ul>
          <p>We strive to honor reasonable requests in a timely manner.</p>
        </article>
      </section>

      <section class="privacy-grid">
        <article class="privacy-card">
          <h3>Data Security</h3>
          <p>Reasonable technical and organizational measures are used to protect your information. While no system can guarantee absolute security, care is taken to safeguard user data.</p>
        </article>

        <article class="privacy-card">
          <h3>Children’s Use</h3>
          <p>Word of Life Answers offers kid-friendly experiences, but accounts should be created by adults or with parental guidance. We do not knowingly collect personal information from children without appropriate oversight.</p>
        </article>
      </section>

      <section class="privacy-card">
        <h3>Changes to This Policy</h3>
        <p>This Privacy Policy may be updated as the site evolves. Any significant changes will be reflected on this page with an updated effective date.</p>
      </section>

      <section class="privacy-card">
        <h3>Contact</h3>
        <p>If you have questions about this Privacy Policy or how your data is handled, you may contact us at:</p>
        <p class="note">contact@wordoflifeanswers.com</p>
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
.privacy-page {
  min-height: 100vh;
  background: linear-gradient(150deg, rgba(21, 47, 89, 0.12), rgba(32, 62, 117, 0.08));
  color: var(--text-main, #1f2a44);
  padding-top: 80px;
}

.privacy-content {
  max-width: 1100px;
  margin: 0 auto 1.5rem;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.privacy-hero {
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

.privacy-hero h1 {
  margin: 0 0 0.35rem;
  color: var(--brand-primary, #1f3b63);
  font-size: clamp(1.9rem, 3vw, 2.6rem);
}

.lede {
  margin: 0;
  color: var(--text-main, #2b3043);
  font-weight: 600;
}

.privacy-card {
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--border-soft, rgba(47, 74, 126, 0.15));
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 16px 32px rgba(31, 50, 86, 0.14);
}

.privacy-card h2,
.privacy-card h3 {
  margin: 0 0 0.5rem;
  color: var(--brand-primary, #1f3b63);
}

.privacy-card p {
  margin: 0 0 0.75rem;
  color: var(--text-main, #2b3043);
  line-height: 1.6;
}

.privacy-card ul {
  margin: 0 0 0.75rem 1.2rem;
  color: var(--text-main, #2b3043);
  line-height: 1.6;
}

.privacy-grid {
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
  .privacy-hero {
    padding: 1.25rem 1rem;
  }
}
</style>
