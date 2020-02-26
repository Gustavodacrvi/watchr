<template>
  <main class="Home">

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
           task manager software, built with <Info handle="Firebase">Firebase is a backend service that allows you to create web applications without server-side programming, making development faster and easier.</Info> and inspired by the most popular todo apps. Capture, Organize and complete all of your tasks for only $5/year.
        </h2>

        <div class="btn-wrapper mar">
          <button class="btn" @click="$store.dispatch('anonymousSignIn')"
          >Start Planning!</button>
        </div>
      </div>
    </div>

    <img id='firebase-commet' src="/svg/commet.svg" alt="firebase">

    <div class="section">
      <div class="title-wrapper title">
        <div class="floating-btn">
          <Icon id='plus'
            icon='plus'
            width='28px'
          />
        </div>
        <h3>Magic Floating Button</h3>
      </div>
      <div class="sect-cont">
        <div class="side">
          <h4 class="title">Add tasks and headings</h4>
          <p class="para_margin">Tap the button to add a task directly on Inbox, or drag and drop it at the right place in your list. When inside projects, you can drag it right to the left margin to create headings.</p>
          <h4 class="title">Add projects</h4>
          <p class="para_margin">Drag the button to create a new project right on the sidebar, or to create tags in the tags sidebar section.</p>
        </div>
        <div class="side"></div>
      </div>
      <img class='back_layer' src="/svg/back_layer.svg" alt="background_faded_layer">
      
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

.sect-cont {
  flex-basis: 1250px;
  display: flex;
  line-height: 28px;
}

.side {
  margin-top: 100px;
  flex-basis: 100%;
  font-size: 1.2em;
}

.para_margin {
  margin: 40px 0;
}

#firebase-commet {
  position: absolute;
  right: 175px;
  top: 75px;
}

.title {
  font-size: 1.6em;
}

.title-wrapper {
  position: absolute;
  width: 100%;
  font-size: 1.6em;
  display: flex;
  justify-content: center;
}

.floating-btn {
  margin-right: 8px;
  width: 50px;
  transform: translate(-10px, -10px);
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 1000px;
  background-color: var(--primary);
}

#plus {
  transform: translateY(2.5px);
}

.background {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  z-index: -1;
}

.back_layer {
  width: 100%;
  position: absolute;
  z-index: -1;
}

.section {
  padding: 0 16px;
  margin-top: 275px;
  padding: 30px 0;
  position: relative;
  display: flex;
  justify-content: center;
}

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
  font-size: 1.3em;
  font-weight: unset;
  line-height: 1.8em;
  color: var(--fade-light);
}

.mar {
  margin-top: 80px;
}

.header {
  margin-top: 7em;
  flex-basis: 750px;
}

.main {
  font-size: 1.4em;
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
