<script setup>
import { ref, onMounted, computed } from 'vue'
import CalendarView from './CalendarView.vue'
import ListView from './ListView.vue'
import { fetchSchedules } from '../api/schedule'

const viewMode = ref('calendar') // 'calendar' or 'list'
const schedules = ref([])
const isLoading = ref(true)
const currentDate = ref(new Date())
const selectedDate = ref(null)

const loadSchedules = async () => {
  isLoading.value = true
  try {
    const data = await fetchSchedules()
    schedules.value = data
    
    // 오늘 날짜로 초기 선택 (일정이 있는 경우에만 선택하게 할 수도 있음)
    const todayStr = `${currentDate.value.getFullYear()}-${String(currentDate.value.getMonth() + 1).padStart(2, '0')}-${String(currentDate.value.getDate()).padStart(2, '0')}`
    selectedDate.value = todayStr
  } catch (error) {
    console.error('일정을 불러오는데 실패했습니다.', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadSchedules()
})

const toggleView = (mode) => {
  viewMode.value = mode
}

const prevMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const handleDateSelect = (dateStr) => {
  selectedDate.value = dateStr
}

// 선택된 날짜의 일정 필터링
const selectedSchedules = computed(() => {
  if (!selectedDate.value) return []
  return schedules.value.filter(s => s.date === selectedDate.value).sort((a, b) => a.time.localeCompare(b.time))
})

const getTypeLabel = (type) => {
  switch (type) {
    case 'musical': return '뮤지컬'
    case 'play': return '연극'
    case 'event': return '행사'
    default: return '기타'
  }
}

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  const dateObj = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const month = dateObj.getMonth() + 1
  const date = dateObj.getDate()
  const day = days[dateObj.getDay()]
  return `${month}월 ${date}일 (${day})`
}
</script>

<template>
  <div class="schedule-container">
    <header class="header">
      <h1>일정</h1>
      
      <div class="controls">
        <div class="month-nav" v-if="viewMode === 'calendar'">
          <button @click="prevMonth" class="nav-btn">&lt;</button>
          <h2>{{ currentDate.getFullYear() }}년 {{ currentDate.getMonth() + 1 }}월</h2>
          <button @click="nextMonth" class="nav-btn">&gt;</button>
        </div>
        <div class="month-nav" v-else>
          <h2>전체 일정</h2>
        </div>
        
        <div class="view-toggle">
          <button 
            :class="{ active: viewMode === 'calendar' }" 
            @click="toggleView('calendar')"
          >
            달력 보기
          </button>
          <button 
            :class="{ active: viewMode === 'list' }" 
            @click="toggleView('list')"
          >
            목록 보기
          </button>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="loading">
      일정을 불러오는 중입니다...
    </div>
    
    <div v-else class="content">
      <template v-if="viewMode === 'calendar'">
        <CalendarView 
          :schedules="schedules" 
          :currentDate="currentDate"
          :selectedDate="selectedDate"
          @select-date="handleDateSelect"
        />
        
        <!-- 하단 상세 일정 패널 (플앱 스타일) -->
        <div class="detail-panel" v-if="selectedDate">
          <h3 class="detail-date">{{ formatDisplayDate(selectedDate) }}</h3>
          
          <div v-if="selectedSchedules.length === 0" class="empty-detail">
            일정이 없습니다.
          </div>
          
          <div v-else class="detail-list">
            <div v-for="item in selectedSchedules" :key="item.id" class="detail-card">
              <div class="poster">
                <img :src="item.poster" :alt="item.title" />
              </div>
              <div class="info">
                <div class="type-badge" :class="`type-${item.type}`">{{ getTypeLabel(item.type) }}</div>
                <h4 class="title">{{ item.title }}</h4>
                <div class="meta">
                  <div class="meta-item">
                    <span class="label">시간</span>
                    <span class="value time">{{ item.time }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="label">장소</span>
                    <span class="value">{{ item.location }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="label">캐스팅</span>
                    <span class="value">{{ item.casting }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <ListView 
        v-else 
        :schedules="schedules" 
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  h1 {
    font-size: 28px;
    text-align: center;
    margin: 0;
  }
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
  }
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  
  h2 {
    font-size: 20px;
    margin: 0;
    min-width: 120px;
    text-align: center;
  }
  
  .nav-btn {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-h);
    font-weight: bold;
    
    &:hover {
      background: var(--border);
    }
  }
}

.view-toggle {
  display: flex;
  background: var(--code-bg);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid var(--border);
  
  button {
    background: transparent;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    transition: all 0.2s;
    
    &.active {
      background: var(--bg);
      color: var(--accent);
      box-shadow: var(--shadow);
    }
  }
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text);
  background: var(--code-bg);
  border-radius: 8px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 하단 상세 패널 스타일 */
.detail-panel {
  background: var(--code-bg);
  border-radius: 12px;
  padding: 20px;
  margin-top: 8px;
}

.detail-date {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--text-h);
  border-bottom: 2px solid var(--border);
  padding-bottom: 8px;
}

.empty-detail {
  text-align: center;
  padding: 24px;
  color: var(--text);
  font-size: 15px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card {
  display: flex;
  gap: 16px;
  background: var(--bg);
  padding: 16px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  
  .poster {
    width: 80px;
    height: 112px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--border);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .type-badge {
    align-self: flex-start;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    margin-bottom: 6px;
    
    &.type-musical { background-color: rgba(170, 59, 255, 0.1); color: #aa3bff; }
    &.type-play { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    &.type-event { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
  }
  
  .title {
    font-size: 18px;
    margin-bottom: 12px;
    color: var(--text-h);
  }
  
  .meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    
    .meta-item {
      display: flex;
      gap: 8px;
      
      .label {
        color: var(--text);
        width: 40px;
      }
      
      .value {
        color: var(--text-h);
        font-weight: 500;
        
        &.time {
          color: var(--accent);
          font-weight: bold;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .detail-card {
    .poster {
      width: 60px;
      height: 84px;
    }
    
    .title {
      font-size: 16px;
      margin-bottom: 8px;
    }
  }
}
</style>
