// Fetch the music data from the JSON file
fetch('data/musicData.json')
  .then(response => response.json())
  .then(data => {
    const playButton = document.getElementById('playButton');
    playButton.addEventListener('click', function () {
      const videoElement = document.getElementById('video');
      const randomIndex = Math.floor(Math.random() * data.length);
      const randomMusic = data[randomIndex];
      const randomStartTimeEnabled = document.getElementById('randomStartTime').checked;
      let startTime;
      if (randomStartTimeEnabled) {
        const startSeconds = randomMusic.start.split(':').reduce((acc, time) => acc * 60 + +time, 0);
        const endSeconds = randomMusic.end.split(':').reduce((acc, time) => acc * 60 + +time, 0) - 10;
        const randomSeconds = startSeconds + Math.random() * (endSeconds - startSeconds);
        startTime = randomSeconds;
      } else {
        startTime = randomMusic.start.split(':').reduce((acc, time) => acc * 60 + +time, 0);
      }
      startTime = Math.round(startTime);
      videoElement.src = randomMusic.url + `&watchHistory=false&playerAutoPlay=true&listen=true&autoplay=false&t=${startTime}`;
      const playingInfo = document.getElementById('playingInfo');
      playingInfo.innerText = "Betöltés...";
      const answerElement = document.getElementById('answer');
      answerElement.innerHTML = '';
      function revealAnswer() {
        const answerElement = document.getElementById('answer');
        answerElement.innerHTML = '';
        const table = document.createElement('table');
        const tableBody = document.createElement('tbody');

        // Iterate over the music data keys
        for (const key in data[randomIndex]) {
          if (key !== 'url' && key !== 'start' && key !== 'end') {
            const row = document.createElement('tr');
            const keyCell = document.createElement('td');
            const valueCell = document.createElement('td');

            keyCell.textContent = key;
            valueCell.textContent = data[randomIndex][key];

            row.appendChild(keyCell);
            row.appendChild(valueCell);
            tableBody.appendChild(row);
          }
        }

        table.appendChild(tableBody);
        answerElement.appendChild(table);
      }
  
      // Add event listener to the reveal button
      const revealButton = document.getElementById('revealButton');
      revealButton.addEventListener('click', revealAnswer);
    });
  })
  .catch(error => {
    console.error('Error fetching music data:', error);
  });

document.addEventListener('DOMContentLoaded', function() {
  // Add event listener to the showPlayer button
  const showPlayerButton = document.getElementById('showPlayer');
  showPlayerButton.addEventListener('click', function() {
    // Get the iframe
    const iframe = document.getElementById('video');

    // Make the iframe visible
    if (iframe.style.visibility === 'visible') {
      iframe.style.visibility = 'hidden';
      showPlayerButton.textContent = 'Lejátszó megjelenítése';
      return;
    }
    iframe.style.visibility = 'visible';
    showPlayerButton.textContent = 'Lejátszó elrejtése';
  });

  // Add event listener to the iframe load event
  const iframe = document.getElementById('video');
  iframe.addEventListener('load', function() {
    const playingInfo = document.getElementById('playingInfo');
    playingInfo.innerText = "Lejátszás...";
  });
});
