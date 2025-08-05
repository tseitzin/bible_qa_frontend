<template>
  <div class="app">
    <!-- Background Elements -->
    <div class="app-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element floating-element--1"></div>
        <div class="floating-element floating-element--2"></div>
        <div class="floating-element floating-element--3"></div>
      </div>
    </div>
    
    <div class="app-container">
      <!-- Header Section -->
      <header class="app-header animate-fade-in">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-wrapper">
              <div class="logo-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <div class="logo-text">
                <h1 class="app-title">Bible Q&A</h1>
                <div class="app-tagline">Scripture • Wisdom • Truth</div>
              </div>
            </div>
            <p class="app-subtitle">
              Discover biblical wisdom through AI-powered Scripture exploration. 
              Ask questions about faith, theology, and biblical teachings to receive 
              thoughtful, scripture-based answers.
            </p>
          </div>
          
          <!-- Feature highlights -->
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <span>Scripture-Based</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Accurate Answers</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="app-main">
        <div class="content-wrapper animate-slide-in">
          <QuestionForm
            v-model:question="question"
            :loading="loading"
            @submit="handleQuestionSubmit"
            class="question-section"
          />
          
          <AnswerDisplay 
            :answer="answer" 
            class="answer-section"
          />
          
          <ErrorMessage 
            :error="error" 
            @dismiss="clearError"
            class="error-section"
          />
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <div class="footer-main">
            <div class="footer-logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              <span>Bible Q&A</span>
            </div>
            <p class="footer-description">
              Powered by advanced AI technology to provide thoughtful, scripture-based answers 
              to your biblical questions.
            </p>
          </div>
          
          <div class="footer-disclaimer">
            <div class="disclaimer-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <p>
              <strong>Important:</strong> Always verify answers with Scripture and consult trusted biblical sources, 
              pastors, or theologians for important spiritual matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import QuestionForm from './components/QuestionForm.vue'
import AnswerDisplay from './components/AnswerDisplay.vue'
import ErrorMessage from './components/ErrorMessage.vue'
import { useBibleQA } from './composables/useBibleQA.js'

const {
  question,
  answer,
  loading,
  error,
  askQuestion,
  clearError
} = useBibleQA()

const handleQuestionSubmit = (questionText) => {
  askQuestion(questionText)
}
</script>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  opacity: 0.1;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
  background-size: 800px 800px, 600px 600px, 400px 400px;
  animation: float 20s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  animation: float 15s ease-in-out infinite;
}

.floating-element--1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.floating-element--2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: -5s;
}

.floating-element--3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.app-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.header-content {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.header-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.logo-section {
  margin-bottom: var(--spacing-2xl);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-lg);
  position: relative;
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  z-index: -1;
  opacity: 0.3;
  filter: blur(8px);
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.logo-text {
  text-align: left;
}

.app-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.app-tagline {
  font-size: var(--font-size-sm);
  color: var(--color-text-accent);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

.app-subtitle {
  font-size: var(--font-size-lg);
  color: #1a202c;
  margin: 0;
  line-height: var(--line-height-relaxed);
  max-width: 600px;
  margin: 0 auto;
  font-weight: var(--font-weight-semibold);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all var(--transition-normal);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.feature-icon svg {
  width: 100%;
  height: 100%;
}

.feature-item span {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #1a202c;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  flex: 1;
}

.question-section,
.answer-section,
.error-section {
  animation-delay: 0.2s;
}

.app-footer {
  margin-top: var(--spacing-3xl);
  padding-top: var(--spacing-2xl);
}

.footer-content {
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-main {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.footer-logo svg {
  width: 24px;
  height: 24px;
}

.footer-description {
  font-size: var(--font-size-sm);
  color: #1a202c;
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
  font-weight: var(--font-weight-semibold);
}

.footer-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
}

.disclaimer-icon {
  width: 20px;
  height: 20px;
  color: var(--color-secondary);
  flex-shrink: 0;
  margin-top: 2px;
}

.disclaimer-icon svg {
  width: 100%;
  height: 100%;
}

.footer-disclaimer p {
  margin: 0;
  color: #1a202c;
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-semibold);
}

.footer-disclaimer strong {
  color: var(--color-secondary-dark);
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-container {
    padding: var(--spacing-lg);
  }
  
  .header-content {
    padding: var(--spacing-2xl);
  }
  
  .logo-wrapper {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .logo-text {
    text-align: center;
  }
  
  .app-title {
    font-size: var(--font-size-4xl);
  }
  
  .app-subtitle {
    font-size: var(--font-size-base);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .footer-disclaimer {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: var(--spacing-md);
  }
  
  .header-content {
    padding: var(--spacing-xl);
  }
  
  .app-title {
    font-size: var(--font-size-3xl);
  }
  
  .logo-icon {
    width: 50px;
    height: 50px;
  }
  
  .logo-icon svg {
    width: 28px;
    height: 28px;
  }
}
</style>