<template>
  <component :is="tag" v-bind="attrs">
    <slot :timeObj="timeObj" name="prev" />
    <slot :timeObj="timeObj" v-if="state === 'beforeStart'" name="before" />
    <slot :timeObj="timeObj" v-if="state === 'preheat'" name="preheat" />
    <slot :timeObj="timeObj" v-if="state === 'process' || state === 'stopped' || state === 'paused'" name="process" />
    <slot :timeObj="timeObj" v-if="state === 'finished'" name="finish" />
    <slot :timeObj="timeObj" name="default" />
  </component>
</template>
<script>
export default {
  name: 'vue-awesome-countdown-vue3',
  props: {
    startTime: {
      type: [String, Number, Date],
      default: null,
      validator: function(value) {
        return new Date(value).toString() !== 'Invalid Date'
      }
    },
    endTime: {
      type: [String, Number, Date],
      default: null,
      validator: function(value) {
        return new Date(value).toString() !== 'Invalid Date'
      }
    },
    leftTime: {
      type: Number,
      default: 0
    },
    autoStart: {
      type: Boolean,
      default: true
    },
    speed: {
      type: Number,
      default: 1000,
      validator: function(value) {
        return value >= 0
      }
    },
    tag: {
      type: String,
      default: 'span'
    }
  },
  computed: {
    thousandSpeed() {
      return this.speed > 0 && this.speed % 1000 === 0
    }
  },
  data: function() {
    return {
      state: 'beforeStart', //beforeStart, stopped, process, finished
      attrs: {},
      actualStartTime: null,
      actualEndTime: null,
      timeObj: {},
      countdownTimer: null,
      runTimes: 0,
      usedTime: 0,
      remainingTime: 0
    }
  },
  watch: {
    speed(curSpeed, oldSpeed) {
      const vm = this
      if (curSpeed < 0) {
        curSpeed = 0
      }
      if (curSpeed !== oldSpeed) {
        clearTimeout(vm.countdownTimer)
        const now = new Date().getTime()
        const runTimes = Math.floor((now - vm.actualStartTime) / curSpeed)
        const nextTime = now % curSpeed
        vm.runTimes = runTimes
        vm.$nextTick(() => {
          vm.countdownTimer = setTimeout(vm.doCountdown, nextTime)
        })
      }
    }
  },
  created() {
    const vm = this
    const startTime = (vm.startTime && new Date(vm.startTime).getTime()) || 0
    const firstTime = (startTime && startTime - new Date().getTime()) || 0
    if (vm.autoStart) {
      vm.state = 'preheat'
      setTimeout(() => {
        vm.startCountdown(true)
      }, firstTime)
    }
  },
  methods: {
    startCountdown(restart) {
      const vm = this
      if (vm.state !== 'beforeStart' && vm.state !== 'stopped' && vm.state !== 'paused' && !restart) {
        return
      }
      if (restart) {
        Object.assign(vm.$data, vm.$options.data.call(vm))
      }
      if (vm.state === 'stopped') {
        vm.remainingTime = vm.actualEndTime - new Date().getTime()
      }
      if (!vm.actualEndTime) {
        vm.actualEndTime = vm.endTime || (new Date().getTime() + (vm.remainingTime || vm.leftTime))
      }
      if (vm.state === 'paused') {
        vm.actualEndTime = new Date().getTime() + vm.remainingTime
      }
      vm.$emit('start', vm)
      vm.state = 'process'
      vm.doCountdown()
    },
    stopCountdown() {
      const vm = this
      if (vm.state !== 'process') {
        return
      }
      clearTimeout(vm.countdownTimer)
      vm.$emit('stop', vm)
      vm.state = 'stopped'
    },
    pauseCountdown() {
      const vm = this
      if (vm.state !== 'process') {
        return
      }
      clearTimeout(vm.countdownTimer)
      vm.remainingTime = vm.actualEndTime - new Date().getTime()
      vm.$emit('paused', vm)
      vm.state = 'paused'
    },
    switchCountdown() {
      const vm = this
      if (vm.state === 'stopped' || vm.state === 'beforeStart') {
        return vm.startCountdown()
      }
      if (vm.state === 'process') {
        return vm.stopCountdown()
      }
    },
    finishCountdown() {
      const vm = this
      vm.state = 'finished'
      vm.timeObj = {}
      vm.usedTime = new Date().getTime() - vm.actualStartTime
      vm.$emit('finish', vm)
    },
    doCountdown() {
      const vm = this
      if (vm.state !== 'process') {
        return
      }
      if (!vm.actualStartTime) {
        vm.actualStartTime = new Date().getTime()
      }
      let leftTime = new Date(vm.actualEndTime).getTime() - new Date().getTime()
      if (leftTime > 0) {
        const t = {}
        let leftSeconds = leftTime / 1000

        let ms = leftTime % 1000

        if (vm.thousandSpeed && ms > 990) {
          leftSeconds = Math.ceil(leftSeconds)
          ms = 0
        }

        const org = {
          d: leftSeconds / 60 / 60 / 24,
          h: (leftSeconds / 60 / 60) % 24,
          m: (leftSeconds / 60) % 60,
          s: leftSeconds % 60,
          ms: ms
        }

        const txt = {
          d: parseInt(org.d, 10).toString(),
          h: parseInt(org.h, 10)
            .toString()
            .padStart(2, 0),
          m: parseInt(org.m, 10)
            .toString()
            .padStart(2, 0),
          s: parseInt(org.s, 10)
            .toString()
            .padStart(2, 0),
          ms: org.ms.toString().padStart(3, 0)
        }

        const ceil = {
          d: parseInt(Math.ceil(leftSeconds / 60 / 60 / 24), 10),
          h: parseInt(Math.ceil(leftSeconds / 60 / 60), 10),
          m: parseInt(Math.ceil(leftSeconds / 60), 10),
          s: parseInt(Math.ceil(leftSeconds), 10)
        }

        t.endTime = vm.actualEndTime
        t.speed = vm.speed
        vm.usedTime = new Date().getTime() - vm.actualStartTime
        t.leftTime = leftTime
        vm.remainingTime = leftTime
        vm.timeObj = Object.assign({}, t, txt, {
          org,
          ceil
        })
        vm.timeObj.org = org
        vm.timeObj.ceil = ceil
        vm.$emit('process', vm)
      } else {
        vm.finishCountdown()
        return
      }

      let nextSpeed =
        vm.speed +
        (vm.actualStartTime + vm.runTimes++ * vm.speed - new Date().getTime())
      if (nextSpeed < 0) {
        nextSpeed = nextSpeed + vm.speed
      }
      if (leftTime < vm.speed) {
        nextSpeed = leftTime
      }
      vm.countdownTimer = setTimeout(vm.doCountdown, nextSpeed)
    }
  }
}
</script>