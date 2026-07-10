const fs = require('fs');

fetch('https://docs.google.com/spreadsheets/d/1HYsYg9AnuU3G1P02_l_ySCwtRIepoaYNMYmOdLjUoT8/export?format=csv&gid=0')
  .then(r => r.text())
  .then(csv => {
    const lines = csv.split('\n');
    const data = [];
    let id = 1;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const row = [];
      let inQuote = false;
      let current = '';
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          row.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current);
      
      if (row.length < 5 || !row[0]) continue;
      
      const year = row[0];
      const playName = row[1];
      const dateStr = row[2];
      const time = row[3];
      const casting = row[4];
      const event = row[5] ? row[5].replace('\r', '') : '';
      
      const dateMatch = dateStr.match(/(\d+)월\s*(\d+)일/);
      if (!dateMatch) continue;
      const month = dateMatch[1].padStart(2, '0');
      const day = dateMatch[2].padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      let title = playName === '웨스턴스토리' ? '뮤지컬 <웨스턴 스토리>' : 
                  playName === '헤르츠클란' ? '연극 <헤르츠클란>' : '연극 <언체인>';
      if (event) title += ` (${event})`;
      
      const location = playName === '웨스턴스토리' ? 'NOL 유니플렉스 1관' : 
                       playName === '헤르츠클란' ? '링크아트센터 벅스홀' : '링크아트센터 벅스홀';
      const type = playName === '웨스턴스토리' ? 'musical' : 'play';
      const color = playName === '웨스턴스토리' ? '#600305' : 
                    playName === '헤르츠클란' ? '#ff9f43' : '#349be1';
      const poster = playName === '웨스턴스토리' 
        ? 'https://via.placeholder.com/150x210/600305/ffffff?text=Western+Story' 
        : playName === '헤르츠클란'
        ? 'https://via.placeholder.com/150x210/ff9f43/ffffff?text=Hertzklan'
        : 'https://via.placeholder.com/150x210/349be1/ffffff?text=Unchain';
        
      data.push({
        id: id++,
        title,
        date: formattedDate,
        time,
        location,
        type,
        color,
        poster,
        casting
      });
    }
    
    data.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
    
    data.forEach((item, index) => item.id = index + 1);
    
    fs.writeFileSync('public/data/schedules.json', JSON.stringify(data, null, 2));
    console.log('Updated schedules.json with ' + data.length + ' items.');
  });