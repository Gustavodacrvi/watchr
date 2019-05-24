<template>
  <transition name='fade-transition' mode='out-in'>
    <div key='inbox-task-adder-msg' class='msg' v-if='!active'>
      <icon @click='active = true' ico='plus' sz='medium'></icon>
      <span @click='active = true' class='msg'>{{ msg }}</span>
    </div>
    <div key='inbox-task-adder-adder' class='adder'>
      <div>
        <input :class='$store.state.theme.style' class='input card' name='input' placeholder='Do something @interval #label $project %calendar_tag' autocomplete='off' v-model='value'/>
      </div>
      <div class='options'>
        <btn class='style-2'>{{ btnMsg }}</btn>
        <alert class='pointer' @click='active = false' type='error'>Cancel</alert>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';
import Button from '@/components/generalComponents/Button.vue';
import Alert from '@/components/generalComponents/Alert.vue';

export default Vue.extend({
  props: {
    msg: String,
    btnMsg: String,
  },
  components: {
    icon: Icon,
    btn: Button,
    alert: Alert,
  },
  data() {
    return {
      active: false,
      value: '',
    };
  },
});
</script>

<style scoped>

.msg {
  margin: 16px 0;
  height: 30px;
  display: flex;
  align-items: center;
}

.icon {
  color: #A97CFC;
  cursor: pointer;
}

.msg {
  color: #A97CFC;
  cursor: pointer;
  margin-left: 10px
}

.input {
  border: none;
  padding: 8px 12px;
  border-radius: 100px;
  font-family: 'Work Sans';
  outline: none;
  color: #999999;
  font-size: 1em;
  width: 100%;
  box-sizing: border-box;
}

.options {
  margin-top: 6px;
}

.adder {
  display: flex;
  flex-direction: column;
}

.alert {
  margin: 6px;
}

</style>

