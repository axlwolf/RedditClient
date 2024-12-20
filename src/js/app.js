import { RedditClient } from "./redit-client";
import "../css/app.css";
import "../scss/reset.scss";
import "../scss/drowndown.scss";
import "../scss/style.scss";

/********** Paste your code here! ************/

// window.onload = () => {
//   console.log("Paste your code here!");
//   GhRandomRepository.init();
// };

document.addEventListener("DOMContentLoaded", () => {
  RedditClient.init();
});
