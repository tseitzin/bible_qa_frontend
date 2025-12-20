<template>
  <footer class="footer">
    <div class="footer-container">
      <p class="footer-brand">© 2025 Word of Life Answers</p>
      <nav class="footer-links" aria-label="Footer">
        <router-link to="/about">About</router-link>
        <router-link to="/ai-scripture">AI &amp; Scripture</router-link>
        <router-link to="/privacy">Privacy</router-link>
        <router-link to="/terms">Terms</router-link>
        <router-link to="/contact">Contact</router-link>
      </nav>
    </div>
  </footer>
</template>

<script setup>
// Simple shared footer
</script>

<style scoped>
.footer {
  margin-top: 0;
  padding: 1rem 1rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-main, #1f2a44);
}

.footer-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  text-align: center;
}

.footer-brand {
  margin: 0;
  font-weight: 700;
  font-size: 0.78rem;
}

.footer-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  font-weight: 600;
  font-size: 0.95rem;
}

.footer-links a {
  color: var(--color-primary, #1f3b63);
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}
</style>
