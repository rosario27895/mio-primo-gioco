let score = 0;

const scoreSpan = document.getElementById("score");
const button = document.getElementById("clickButton");

button.addEventListener("click", () => {
  score++;
  scoreSpan.textContent = score;
});
