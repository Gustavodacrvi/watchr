<template>
  <main>
    <div class="header-wrapper">
      <div class="header">
        <div class="main">
          <h1>
            <span class="imp">Eliminate</span> day-to-day <span class="imp">stress</span> and <span class="imp">achieve</span> your <span class="imp">goals!</span>
          </h1>
        </div>

        <h2 class="info mar">
          An <Info handle='Open Source'>Open source software is a type of computer software with source code that anyone can inspect, modify, and enhance.<br><br> And embrace principles of open exchange, collaborative participation, rapid prototyping, transparency, meritocracy, and community-oriented development.</Info> 
          <Info
            handle='PWA'
          >
            Progressive Web Apps (PWA) are native like Web Apps built using modern web technologies, PWAs are reliable, fast, engaging, and can be installed for offline use.<br><br>They can be installed using the + on the address bar.
          </Info>
           task manager software, built using Google's <Info handle="Firebase">Firebase is a backend service that allows you to create web applications without server-side programming, making development faster and easier.</Info> and inspired by the most popular todo apps. Capture, Organize and complete all of your tasks for only <span class="imp2">$5/year.</span>
        </h2>

        <div class="btn-wrapper mar">
          <button class="btn" @click="$store.dispatch('anonymousSignIn')"
          >Start Planning!</button>
        </div>
      </div>
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

.header-wrapper {
  display: flex;
  justify-content: center;
}

.imp {
  color: var(--red);
}

.imp2 {
  color: var(--green);
}

.info {
  font-size: 1.2em;
  font-weight: unset;
  color: var(--fade-light);
}

.mar {
  margin-top: 80px;
}

.header {
  margin-top: 6em;
  flex-basis: 750px;
}

.main {
  font-size: 1.65em;
}

.btn-wrapper {
  display: flex;
  justify-content: center;
}

.btn {
  background-color: var(--primary);
  display: inline-block;
  color: white;
  font-size: 1.3em;
  border-radius: 22px;
  padding: 16px 36px;
  position: relative;
  transition-duration: .15s;
}

.btn:hover {
  background-color: var(--primary-light);
}

</style>
