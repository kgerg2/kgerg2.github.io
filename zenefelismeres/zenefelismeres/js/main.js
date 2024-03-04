// Fetch the music data from the JSON file
fetch('data/musicData.json')
  .then(response => response.json())
  .then(data => {
    // Get a random music item from the data
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomMusic = data[randomIndex];

    // Create the YouTube player
    const player = new YT.Player('player', {
      height: '360',
      width: '640',
      videoId: randomMusic.url,
      playerVars: {
        start: randomMusic.start,
        end: randomMusic.end,
      },
      events: {
        onReady: onPlayerReady,
      },
    });

    // Function to handle when the player is ready
    function onPlayerReady(event) {
      // Play the music
      event.target.playVideo();
    }

    // Function to reveal the answer
    function revealAnswer() {
      const answerElement = document.getElementById('answer');
      answerElement.textContent = randomMusic.title;
    }

    // Add event listener to the reveal button
    const revealButton = document.getElementById('revealButton');
    revealButton.addEventListener('click', revealAnswer);
  })
  .catch(error => {
    console.error('Error fetching music data:', error);
  });