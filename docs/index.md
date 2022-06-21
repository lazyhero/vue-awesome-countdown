<script setup>
  const timeObj = {
    ceil: {
      s: 0
    }
  }
</script>

# 示例

## 基础用法

设置一个剩余时间为1000秒的倒计时：
<countdown :left-time="1000000">
  <template v-slot:process="{ timeObj }">
    <span>
      {{ timeObj.ceil.s }}
    </span>
  </template>
  <template v-slot:finish>Done!</template>
</countdown>

```vue
  <countdown :left-time="1000000">
    <template v-slot:process="{ timeObj }">
      <span>
        {{ timeObj.ceil.s }}
      </span>
    </template>
    <template v-slot:finish>Done!</template>
  </countdown>
```
