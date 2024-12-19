import {CustomDropdown} from "./custom-dropdown";

export const GhRandomRepository = (() => {
  const repoContainer = document.querySelector("#repo-container");
  const refreshButton = document.getElementById("refresh-button");
  refreshButton.textContent = "Refresh";
  refreshButton.style.display = "none"; // Initially hidden
  // repoContainer.after(refreshButton);

  let dropdown;
  let currentRepo;
  let apiKey;
  let GH_TOKEN;

  const init = async () => {
    dropdown = new CustomDropdown("#language-dropdown", {
      defaultValue: "Select a language",
      items: [],
    });

    // Escuchar el evento 'change' en el dropdown container:
    document
      .getElementById("language-dropdown")
      .addEventListener("change", (event) => {
        console.log("Language changed to:", event.detail.value); // Aquí haces lo que necesites con el nuevo lenguaje.
        fetchRandomRepo(); // Recargar repositorios al cambiar el lenguaje.
      });

    refreshButton.addEventListener("click", fetchRandomRepo);
    await getLanguages();

    if (typeof GH_TOKEN !== 'undefined') { // Verifica si GH_TOKEN está definido (deploy)
      apiKey = GH_TOKEN;
    } else if (process.env.GH_TOKEN) { // Local con .env
      apiKey = process.env.GH_TOKEN;
    } else{
      console.error("No se ha encontrado la API Key, revisa la configuración.");
      displayError("No se ha encontrado la API Key, revisa la configuración.");
      return;
    }
  };

  const getLanguages = async () => {
    const languageApiURL =
      "https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json";
    try {
      const response = await fetch(languageApiURL);
      const data = await response.json();

      dropdown.options.items = data
          .map((item, index) => (index !== 0 ? item.title : null))
          .filter(Boolean);
      dropdown.render();
    } catch (error) {
      console.error("Error fetching languages:", error);
      displayError("Error loading languages.");
    }
  };

  const fetchRandomRepo = async () => {
    const selectedLanguage =
      dropdown.input.value === dropdown.options.defaultValue
        ? "javascript"
        : `language:${dropdown.input.value}`; // Use "javascript" as default
    console.log({ selectedLanguage });
    const apiUrl = `https://api.github.com/search/repositories?q=${selectedLanguage}&sort=stars&order=desc`;

    displayLoading();

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${apiKey}`, // Add token to headers
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later."
          );
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.items.length === 0) {
        displayEmpty();
      } else {
        const randomIndex = Math.floor(Math.random() * data.items.length);
        currentRepo = data.items[randomIndex];
        displayRepo(currentRepo);
      }
    } catch (error) {
      console.error("Error fetching respository:", error);
      displayError(error.message); // Display the specific error message
    } finally {
      //hideLoading();
    }
  };

  const displayLoading = () => {
    repoContainer.innerHTML = "<p>Loading repository...</p>";
    refreshButton.style.display = "none";
  };

  const displayEmpty = () => {
    repoContainer.innerHTML = "<p>No repositories found for this language.</p>";
    refreshButton.style.display = "block";
  };

  const displayError = (message) => {
    repoContainer.innerHTML = `<p style="color: red;">${message}</p>`;
    refreshButton.style.display = "block";
  };

  const displayRepo = (repo) => {
    // Construct icon HTML based on language
    let iconHTML = "";
    if (repo.language) {
      iconHTML = `<i class="devicon-${repo.language.toLowerCase()}-plain"></i>`; // Use lowercase for consistency
    }

    repoContainer.innerHTML = `
    <h2><a href="${repo.html_url}" target="_blank">${repo.full_name}</a></h2>
    <p>${repo.description || "No description provided."}</p>
    <div class="repo-info">
      <small> ${iconHTML} ${repo.language || "Not specified"}</small>
       <small><i class="fa fa-star"></i> ${repo.stargazers_count}</small>
            <small><i class="fa fa-code-branch"></i> ${repo.forks_count}</small>
            <small><i class="fa fa-exclamation-circle"></i> ${
              repo.open_issues_count || "Not available"
            }</small>
  `;
    refreshButton.style.display = "block";
  };

  // const hideLoading = () => {
  //   repoContainer.innerHTML = ""; // Clear loading message
  // };

  return { init };
})();
