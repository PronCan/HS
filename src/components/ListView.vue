<script setup>
import { computed } from 'vue'

const props = defineProps({
  schedules: {
    type: Array,
    default: () => []
  }
})

// 날짜별로 그룹화하고 정렬
const groupedSchedules = computed(() => {
  const groups = {}
  
  props.schedules.forEach(schedule => {
    if (!groups[schedule.date]) {
      groups[schedule.date] = []
    }
    groups[schedule.date].push(schedule)
  })
  
  // 날짜순 정렬
  const sortedDates = Object.keys(groups).sort()
  
  return sortedDates.map(date => {
    // 시간순 정렬
    const sortedItems = groups[date].sort((a, b) => a.time.localeCompare(b.time))
    
    // 요일 구하기
    const dateObj = new Date(date)
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const dayOfWeek = days[dateObj.getDay()]
    
    // 월/일 포맷팅
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    
    return {
      date,
      displayDate: `${month}월 ${day}일 (${dayOfWeek})`,
      items: sortedItems
    }
  })
})

const getTypeLabel = (type) => {
  switch (type) {
    case 'musical': return '뮤지컬'
    case 'play': return '연극'
    case 'event': return '행사'
    default: return '기타'
  }
}

const getScheduleColor = (schedule) => {
  if (schedule.color) return schedule.color
  switch (schedule.type) {
    case 'musical': return '#aa3bff'
    case 'play': return '#3b82f6'
    case 'event': return '#10b981'
    default: return '#6b6375'
  }
}
</script>

<template>
  <div class="list-view">
    <div v-if="groupedSchedules.length === 0" class="empty-state">
      예정된 일정이 없습니다.
    </div>
    
    <div v-else class="schedule-list">
      <div v-for="group in groupedSchedules" :key="group.date" class="date-group">
        <div class="date-badge">
          <span class="dot" :style="{ backgroundColor: getScheduleColor(group.items[0]) }"></span>
          {{ group.displayDate }}
        </div>
        
        <div class="items-container">
          <div v-for="item in group.items" :key="item.id" class="ticket-card">
            <!-- 티켓 왼쪽 장식 (색상 띠) -->
            <div class="ticket-accent" :style="{ backgroundColor: getScheduleColor(item) }"></div>
            
            <div class="ticket-content">
              <div class="ticket-time">
                {{ item.time }}
              </div>
              
              <div class="ticket-divider"></div>
              
              <div class="ticket-info">
                <div class="header-row">
                  <span class="type-label" :style="{ color: getScheduleColor(item) }">[{{ getTypeLabel(item.type) }}]</span>
                  <span class="title">{{ item.title }}</span>
                </div>
                
                <div class="details">
                  <div class="detail-row">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {{ item.location }}
                  </div>
                  <div class="detail-row" v-if="item.casting">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {{ item.casting }}
                  </div>
                </div>
              </div>
              
              <!-- 티켓 오른쪽 포스터 (선택) -->
              <div class="ticket-poster" v-if="item.poster">
                <img :src="item.poster" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list-view {
  width: 100%;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text);
  background: var(--code-bg);
  border-radius: 8px;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  
  // 타임라인 선
  &::before {
    content: '';
    position: absolute;
    left: 11px;
    top: 10px;
    bottom: 0;
    width: 2px;
    background-color: var(--border);
    z-index: 0;
  }
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: bold;
  color: var(--text-h);
  background: var(--bg);
  padding-right: 16px;
  
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 3px solid var(--bg);
    box-shadow: 0 0 0 1px var(--border);
    margin-left: 6px;
  }
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 32px;
}

/* 티켓 스타일 카드 */
.ticket-card {
  display: flex;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  overflow: hidden;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
  }
}

.ticket-accent {
  width: 6px;
  flex-shrink: 0;
}

.ticket-content {
  flex: 1;
  display: flex;
  align-items: stretch;
  padding: 0;
}

.ticket-time {
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: var(--text-h);
  padding: 16px;
  flex-shrink: 0;
}

.ticket-divider {
  width: 0;
  border-left: 2px dashed var(--border);
  margin: 12px 0;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    left: -7px;
    width: 12px;
    height: 12px;
    background-color: var(--bg);
    border: 1px solid var(--border);
    border-radius: 50%;
  }
  
  &::before {
    top: -18px;
    border-top-color: transparent;
    border-left-color: transparent;
    transform: rotate(-45deg);
  }
  
  &::after {
    bottom: -18px;
    border-bottom-color: transparent;
    border-right-color: transparent;
    transform: rotate(-45deg);
  }
}

.ticket-info {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.type-label {
  font-size: 14px;
  font-weight: bold;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-h);
}

.details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text);
  
  .icon {
    opacity: 0.6;
    flex-shrink: 0;
  }
}

.ticket-poster {
  width: 70px;
  flex-shrink: 0;
  border-left: 1px solid var(--border);
  background: var(--code-bg);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

@media (max-width: 600px) {
  .schedule-list::before {
    left: 8px;
  }
  
  .date-badge .dot {
    margin-left: 3px;
  }
  
  .items-container {
    padding-left: 24px;
  }
  
  .ticket-content {
    flex-direction: column;
  }
  
  .ticket-time {
    width: 100%;
    padding: 12px 16px 4px;
    justify-content: flex-start;
    font-size: 16px;
  }
  
  .ticket-divider {
    width: auto;
    height: 0;
    border-left: none;
    border-top: 2px dashed var(--border);
    margin: 0 12px;
    
    &::before, &::after {
      display: none; // 모바일에서는 반원 장식 숨김
    }
  }
  
  .ticket-poster {
    display: none; // 모바일에서는 공간 확보를 위해 포스터 숨김
  }
}
</style>
