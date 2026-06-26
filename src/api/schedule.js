/**
 * 특정 연월에 해당하는 일정만 필터링하는 함수
 */
function filterByMonth(schedules, yearMonth) {
  if (yearMonth) {
    return schedules.filter(s => s.date.startsWith(yearMonth));
  }
  return schedules;
}

/**
 * 일정 목록을 가져오는 함수
 * public/data/schedules.json 파일에서 데이터를 불러옵니다.
 * @param {string} yearMonth - 조회할 연월 (예: '2026-07')
 * @returns {Promise<Array>}
 */
export const fetchSchedules = async (yearMonth) => {
  try {
    // public 폴더에 있는 JSON 파일을 가져옵니다.
    // 배포 환경에서도 이 경로를 통해 정적 파일로 접근 가능합니다.
    const response = await fetch('/data/schedules.json');
    
    if (!response.ok) {
      throw new Error('데이터를 불러오는데 실패했습니다.');
    }
    
    const data = await response.json();
    return filterByMonth(data, yearMonth);
    
  } catch (error) {
    console.error('일정 데이터를 가져오는데 실패했습니다:', error);
    return [];
  }
};
