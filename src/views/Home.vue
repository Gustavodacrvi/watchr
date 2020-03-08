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
              An Open Source PWA task manager software, built with Firebase and  inspired by the most popular todo apps. Capture, Organize and complete all of your tasks for only $5/year.
            </p>
          </div>
          <div class="hero-button">
            <button class="btn">Start planning!</button>
          </div>
        </div>
      </div>

      <div id="main-illustration-wrapper-wrapper">
        <div id="main-illustration-wrapper">
          <img id='main-illustration' src="/svg/main_illustration.svg" alt="background">
        </div>
      </div>

      <SectionVideo
        :cont="[
          {
            heading: 'Insert todos anywhere',
            name: 'magic_button',
            txt: 'You not only can tap the magic button to add tasks, you can drag and drop it anywhere to insert one exactly where it should be!',
          },
          {
            heading: 'Adding headings',
            txt: `Headings are used to organize and visually separate your stuff more easily, you can use the magic button to add a list heading anywhere.<br><br>
            Simply drop it to the left margin and type in its name, all of the tasks below the target will then be inside the created heading.`,
          },
          {
            heading: 'Add tags and lists',
            txt: `The magic button can also be used to add lists directly inside its folder, tags and subtags right on the sidebar.`,
          },
        ]"
      />
    </div>
  </main>
</template>

<script>

import SectionVideo from "@/components/Home/SectionVideo.vue"

export default {
  components: {
    SectionVideo,
  },
}

</script>

<style>

p {
  font-size: 1.125em;
  line-height: 19px;
  color: var(--dark-txt);
}

.Home {
  font-size: 1em;
}

</style>

<style scoped>

#main-illustration-wrapper-wrapper {
  display: flex;
  justify-content: center;
}

#main-illustration-wrapper {
  flex-basis: 85%;
}

#main-illustration {
  width: 100%;
  margin-top: 2em;
  z-index: -1;
}

.Home {
  display: flex;
  justify-content: center;
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
}

</style>
