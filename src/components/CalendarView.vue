<script setup>
import { computed } from 'vue'

const props = defineProps({
  schedules: {
    type: Array,
    default: () => []
  },
  currentDate: {
    type: Date,
    default: () => new Date()
  },
  selectedDate: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['select-date'])

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

const calendarDays = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const totalDays = lastDayOfMonth.getDate()
  
  const days = []
  
  // 이전 달의 빈 날짜 채우기
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ date: null, schedules: [] })
  }
  
  // 현재 달의 날짜 채우기
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const daySchedules = props.schedules.filter(s => s.date === dateStr)
    
    days.push({
      date: i,
      fullDate: dateStr,
      schedules: daySchedules
    })
  }
  
  return days
})

const getScheduleColor = (schedule) => {
  if (schedule.color) return schedule.color
  switch (schedule.type) {
    case 'musical': return '#aa3bff'
    case 'play': return '#3b82f6'
    case 'event': return '#10b981'
    default: return '#6b6375'
  }
}

const handleDateClick = (day) => {
  if (day.date) {
    emit('select-date', day.fullDate)
  }
}
</script>

<template>
  <div class="calendar-view">
    <div class="weekdays">
      <div v-for="day in daysOfWeek" :key="day" class="weekday" :class="{ 'sunday': day === '일', 'saturday': day === '토' }">
        {{ day }}
      </div>
    </div>
    <div class="days-grid">
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index" 
        class="day-cell" 
        :class="{ 
          'empty': !day.date, 
          'is-selected': day.fullDate === selectedDate,
          'has-schedule': day.schedules.length > 0
        }"
        @click="handleDateClick(day)"
      >
        <template v-if="day.date">
          <div class="date-number">
            {{ day.date }}
          </div>
          <div class="schedules-markers">
            <div 
              v-for="(schedule, sIdx) in day.schedules" 
              :key="sIdx" 
              class="marker" 
              :style="{ backgroundColor: getScheduleColor(schedule) }"
            ></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.calendar-view {
  width: 100%;
  background: #999999;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(0, 0, 0, 0.2); /* 배경색(#999999)과 어울리도록 반투명 검정 사용 */
  border-bottom: 1px solid var(--border);
}

.weekday {
  padding: 12px 0;
  text-align: center;
  font-weight: bold;
  font-size: 13px;
  color: #ffffff; /* 가독성을 위해 흰색으로 변경 */
  
  &.sunday {
    color: #ffb3b3; /* 일요일은 연한 빨간색 */
  }
  &.saturday {
    color: #b3d9ff; /* 토요일은 연한 파란색 */
  }
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(80px, auto);
}

.day-cell {
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:nth-child(7n) {
    border-right: none;
  }
  
  &.empty {
    background-color: rgba(255, 255, 255, 0.02);
    cursor: default;
  }
  
  &:not(.empty):hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  &.is-selected {
    background-color: var(--accent-bg);
    
    .date-number {
      background-color: var(--accent);
      color: white;
      font-weight: bold;
    }
  }
}

.date-number {
  font-size: 14px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  color: #ffffff; /* 날짜 숫자 가독성을 위해 흰색으로 변경 */
}

.schedules-markers {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin-top: auto;
  padding-top: 8px;
}

.marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
