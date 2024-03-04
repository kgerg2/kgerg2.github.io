# Zenefelismeres

This project is a webpage that allows you to play random music and guess the song. It uses YouTube videos as the source of music. When you press a button, a random music video will start playing, and you can try to guess the song. There is also an option to reveal the answer.

## Project Structure

The project has the following file structure:

- `index.html`: The main HTML file for the webpage.
- `js/main.js`: The main JavaScript file for the webpage.
- `js/musicData.json`: A JSON file that stores the YouTube URLs and properties of the music.
- `css/styles.css`: The CSS file for styling the webpage.
- `README.md`: This documentation file.

## Getting Started

To set up the project, follow these steps:

1. Clone the repository.
2. Open the `index.html` file in a web browser.
3. Press the button to play a random music video.
4. Guess the song.
5. Click the "Reveal Answer" button to see the correct answer.

## Music Data

The `musicData.json` file contains an array of objects, where each object represents a music item. Each music item includes the following properties:

- `url`: The YouTube URL of the music video.
- `title`: The title of the song.
- `start`: The start time of the song in the video.
- `end`: The end time of the song in the video.

The `main.js` file fetches the music data from the `musicData.json` file and uses it to play random music videos.

## Styling

The `styles.css` file contains the CSS styles for the webpage. It defines the layout, buttons, and other elements of the webpage.

Feel free to customize the styles in the `styles.css` file to match your preferences.

That's it! You now have a webpage where you can play random music and guess the song. Have fun!