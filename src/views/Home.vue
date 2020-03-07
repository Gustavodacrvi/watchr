<template>
  <main class="Home">
    
    <div class="main">
      <div class="hero-header-wrapper">
        <div class="hero-header">
          <div class="main-heading">
            <h1>Eliminate stress and achieve your goals!</h1>        
          </div>
          <div class="hero-paragraph">
            <p>
              An Open Source task manager software, built with Firebase and  inspired by the most popular todo apps. Capture, Organize and complete all of your tasks for only $5/year.
            </p>
          </div>
          <div class="hero-button">
            <button class="btn">Start planning!</button>
          </div>
        </div>
      </div>

      <img id='back' src="/svg/background.svg" alt="background">
    </div>
    
  </main>
</template>

<script>

import AuthButton from '@/components/Auth/Button.vue'
import Info from "@/components/Home/Info.vue"

export default {
  components: {
    AuthButton,
    Info,
  },
}

</script>

<style scoped>

#back {
  width: 100%;
  margin-top: 2em;
  z-index: -1;
}

.Home {
  display: flex;
  justify-content: center;
  font-size: 1em;
}

.hero-header-wrapper {
  margin-top: 7em;
  display: flex;
  justify-content: center;
}

.hero-header {
  flex-basis: 425px;
}

.main-heading {
  font-size: 1.5em;
  text-align: justify;
  text-justify: inter-word;
}

@media (max-width: 820px) {
  .Home {
    font-size: .95em;
  }

  .hero-header {
    flex-basis: 325px;
  }

  .main-heading {
    font-size: 1.25em;
  }
}

@media (max-width: 576px) {
  .Home {
    font-size: .85em;
  }

  .hero-header {
    flex-basis: 305px;
  }

  .main-heading {
    font-size: 1.35em;
  }
}

.hero-button {
  display: flex;
  justify-content: center;
}

.hero-button .btn {
  font-size: 1.2em;
  border-radius: 14px;
  padding: 10px 20px;
  background-color: var(--primary);
  color: white;
}

.hero-paragraph {
  margin: 40px 0px;
  line-height: 18px;
}

</style>
