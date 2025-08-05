<template>
  <div class="app">
    <div class="app-background">
      <div class="bg-pattern"></div>
    </div>
    
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/167/167756.png" 
              alt="Bible" 
              class="logo-icon"
            />
            <h1 class="app-title">Bible Q&A</h1>
          </div>
          <p class="app-subtitle">Ask questions about Scripture and receive thoughtful, biblical answers</p>
        </div>
      </header>
      
      <main class="app-main">
        <div class="content-wrapper">
          <QuestionForm
            v-model:question="question"
            :loading="loading"
            @submit="handleQuestionSubmit"
          />
          
          <AnswerDisplay :answer="answer" />
          
          <ErrorMessage 
            :error="error" 
            @dismiss="clearError"
          />
        </div>
      </main>
      
      <footer class="app-footer">
        <p class="footer-text">
          Powered by AI • Always verify answers with Scripture and trusted biblical sources
        </p>
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
  background: #d6d4d4df;
  background-attachment: fixed;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(139, 69, 69, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(127, 29, 29, 0.03) 0%, transparent 50%);
  background-size: 600px 600px;
}

.app-container {
  max-width: 800px;
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
  margin-bottom: var(--spacing-xl);
}

.header-content {
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(220, 200, 200, 0.6);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: var(--color-primary);
}

.app-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.app-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
}

.app-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(220, 200, 200, 0.4);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .app-container {
    padding: var(--spacing-lg);
  }
  
  .header-content {
    padding: var(--spacing-xl);
  }
  
  .app-title {
    font-size: var(--font-size-3xl);
  }
  
  .app-subtitle {
    font-size: var(--font-size-base);
  }
  
  .logo {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .app-header {
    margin-bottom: var(--spacing-2xl);
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: var(--spacing-md);
  }
  
  .header-content {
    padding: var(--spacing-lg);
  }
  
  .app-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
