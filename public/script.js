const textElement = document.getElementById("changing-text");
const phrases = ["Crafting Moments", "Shaping Memories", "Celebrating Life Tapestry"];
let currentIndex = 0;


function changeText() {
  textElement.style.opacity = 0;
  setTimeout(() => {
    textElement.textContent = phrases[currentIndex];
    textElement.style.opacity = 1;
    currentIndex = (currentIndex + 1) % phrases.length; //% to make the value 0 again
  }, 500);
}

changeText();
setInterval(changeText, 2500);

// Fetch username from server and display it
fetch('/get-username')
  .then(response => response.json())
  .then(data => {
    const usernameSpan = document.getElementById('username');
    usernameSpan.textContent = data.username;
  })
  .catch(error => console.error('Error fetching username:', error));


