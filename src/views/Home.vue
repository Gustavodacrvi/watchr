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
            name: 'magic_button',
            txt: 'You not only can tap the magic button to add tasks you can also drag and drop it anywhere to insert one exactly where it should be!',
          },
          {
            heading: 'Adding headings',
            name: 'magic_button_heading_add',
            txt: `Headings are used for organizing and to visually group your stuff more easily, you can use the magic button to add a list heading anywhere.<br><br>
            Simply drop it to the left margin and type in its name, all of the tasks below the target will then be inside the created heading.`,
          },
          {
            heading: 'Add tags and lists',
            name: 'magic_button_sidebar',
            txt: `The magic button can also be used to add lists directly inside folders or subtags right on the sidebar.`,
          },
        ]"
      >
        <div class="section-title-wrapper">
          <div class="section-icon magic-button">
            <Icon class="magic-btn-icon" color='white' icon='plus' width='16px'/>
          </div>
          <h2>Magic Button</h2>
        </div>
      </SectionVideo>

      <SectionVideo
        :invert='true'
        :cont="[
          {
            heading: 'Batch edit items',
            name: 'batch_edit_upcoming',
            txt: `You can select multiple items using the <strong>Control</strong> key or the keyboard, once selected, sort, edit, delete, move or even assign them to other people with ease.`,
          },
          {
            heading: 'Sidebar Drag and Drop',
            name: 'magic_button_heading_add',
            txt: `Watchr has many advanced drag-and-drop capabilities, you can drag the selected items to the sidebar to move them into another list, or to move them to 'Tomorrow' or the 'Logbook', don't forget to organize your lists using folders!<br><br>
            You can also drag the selected items into the 'Tags' sidebar section for batch tag adding.
            `,
          },
          {
            heading: 'Between Windows Drag and Drop',
            txt: `
              Watchr has support for multiple windows, just open as many tabs as you want, then drag and drop any item between them, this way, you can take your planning into another level!<br><br>
              This way, you could have one window on the 'Inbox' view, and another one to empty your inbox with ease, or one window on the 'Upcoming' for week planning, simply grab them and it's done!
            `,
          },
        ]"
      >
        <h2>Batch Edit and Multiple Windows</h2>
      </SectionVideo>

      <div class="section-main-heading">
        <div class="section-title-wrapper">
          <Icon class="section-icon" color='var(--primary)' icon='inbox' width='40px'/>
          <h2>Many Smart Views</h2>
        </div>
      </div>
      <div class="section-wrapper">
        <div class="section">
          <p>
            Smart views are basically smart lists that show you only what you need to see, there are many smart views available, you can choose the ones you want to attach to the sidebar, the hided ones can still be found using the Quick Search.
          </p>
          <SmartViewsSelector/>
        </div>
      </div>

      <div class="section-main-heading">
        <div class="section-title-wrapper">
          <Icon class="section-icon" color='var(--orange)' icon='group' width='40px'/>
          <h2>Sharing Tasks and Lists</h2>
        </div>
      </div>
      <div class="section-wrapper">
        <div class="section">
        </div>
      </div>


      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
      <p>a</p>
    </div>
  </main>
</template>

<script>

import SectionVideo from "@/components/Home/SectionVideo.vue"
import SmartViewsSelector from "@/components/View/RenderComponents/SmartViewsSelector.vue"

export default {
  components: {
    SectionVideo,
    SmartViewsSelector,
  },
}

</script>

<style>

.Home p {
  font-size: 1.125em;
  line-height: 19px;
  color: var(--dark-txt);
}

.Home {
  font-size: 1em;
}

.Home .section-main-heading {
  font-size: 1.35em;
  margin: 3.5em 0;
  text-align: center;
}

.Home .section {
  flex-basis: 1000px;
  margin: 0 12px;
}

.Home .section-wrapper {
  display: flex;
  margin-top: 7em;
  justify-content: center;
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

.section-icon {

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

.section-title-wrapper {
  display: inline-flex;
}

.section-icon {
  transform: translateY(-3px);
  margin-right: 10px;
}

.magic-button {
  border-radius: 500px;
  width: 2.2em;
  height: 2.2em;
  background-color: var(--primary);
  display: flex;
  justify-content: center;
  align-items: center;
}

.magic-btn-icon {
  transform: translateY(2px);
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
