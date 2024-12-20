import { fromEvent, BehaviorSubject, forkJoin } from "rxjs";
import { tap } from "rxjs/operators";

export const RedditClient = (() => {
  // DOM references
  const $redditName = document.querySelector(".header p");
  const $icon = document.querySelector(".header img");
  const $lanesContainers = document.querySelector(".reddit-lane");
  const $deleteReddit = document.querySelector(".delete-reddit");
  const $refreshReddit = document.querySelector(".refresh-reddit");
  const $modal = document.getElementById("subredditModal");
  const $subredditList = document.getElementById("subreddit-list");
  const $closeModal = $modal.querySelector(".close");
  const $addSubredditBtn = document.getElementById("add-subreddit");
  const $loadMoreButton = document.createElement("button"); // Botón para cargar más posts

  // State Management
  let subreddits = JSON.parse(localStorage.getItem("subreddits")) || [
    "javascript",
  ];
  const redditsSubject = new BehaviorSubject({});
  const currentSubredditSubject = new BehaviorSubject(subreddits[0] || "");

  const init = async () => {
    console.log("Reddit Client Initialized");
    $modal.style.display = "none";
    $loadMoreButton.textContent = "Load More";
    $loadMoreButton.classList.add("load-more-button"); // Add styling class
    await loadInitialSubreddits();
    eventListeners();
  };

  const loadInitialSubreddits = async () => {
    currentSubredditSubject.next(subreddits[0]);
    renderSubredditList();

    if (subreddits.length > 0) {
      // Cargar los posts del subreddit actual
      fetchRedditPosts(subreddits[0]);
    } else {
      renderEmptyState();
    }
  };

  const eventListeners = () => {
    fromEvent($icon, "click").subscribe((e) => {
      e.preventDefault();
      renderSubredditList();
      toggleModalVisibility(true);
    });

    fromEvent($deleteReddit, "click").subscribe(() => {
      handleDeleteSubreddit();
    });

    fromEvent($refreshReddit, "click").subscribe(async () => {
      console.log("Refresh Reddit");
      await refreshCurrentSubreddit();
    });

    fromEvent($closeModal, "click").subscribe(() => {
      toggleModalVisibility(false);
    });

    fromEvent(window, "click").subscribe((e) => {
      if (e.target === $modal) {
        toggleModalVisibility(false);
      }
    });

    fromEvent($addSubredditBtn, "click").subscribe(async () => {
      await handleAddSubreddit();
    });

    fromEvent($loadMoreButton, "click").subscribe(() => {
      handleLoadMore();
    });
  };

  const handleDeleteSubreddit = () => {
    const currentSub = currentSubredditSubject.value;
    const index = subreddits.indexOf(currentSub);
    if (index > -1) {
      subreddits.splice(index, 1);
      localStorage.setItem("subreddits", JSON.stringify(subreddits));

      const currentState = redditsSubject.value;
      delete currentState[currentSub];
      redditsSubject.next(currentState);

      if (subreddits.length > 0) {
        const newIndex = Math.max(0, index - 1);
        currentSubredditSubject.next(subreddits[newIndex]);
        fetchRedditPosts(subreddits[newIndex]);
      } else {
        currentSubredditSubject.next("");
        renderEmptyState();
      }
      renderSubredditList();
    }
  };

  const refreshCurrentSubreddit = async () => {
    const currentSub = currentSubredditSubject.value;
    if (currentSub) {
      showGlobalLoading();
      // Reiniciar before_cursor para recargar desde el inicio
      const posts = redditsSubject.value[currentSub].posts || [];
      await fetchRedditPosts(currentSub, null);
      hideGlobalLoading();
    }
  };

  const handleAddSubreddit = async () => {
    const subredditNameInput = document.getElementById("subreddit-name");
    const newSubreddit = subredditNameInput.value.trim();
    if (newSubreddit && !subreddits.includes(newSubreddit)) {
      const exists = await checkSubredditExists(newSubreddit);
      if (exists) {
        subreddits.push(newSubreddit);
        localStorage.setItem("subreddits", JSON.stringify(subreddits));
        currentSubredditSubject.next(newSubreddit);
        await fetchRedditPosts(newSubreddit);
        toggleModalVisibility(false);
        subredditNameInput.value = "";
        renderSubredditList();
      } else {
        alert("Subreddit does not exist!");
      }
    } else {
      alert("Subreddit already added or invalid name!");
    }
  };

  const handleLoadMore = async () => {
    const currentSub = currentSubredditSubject.value;
    if (currentSub) {
      const currentState = redditsSubject.value;
      const before = currentState[currentSub].before; // Obtener el before cursor actual
      console.log(before);
      if (before === null || before === undefined) return; // No hay más posts que cargar
      await fetchRedditPosts(currentSub, before);
    }
  };

  // Se modificó fetchRedditPosts para aceptar un parámetro `before`
  const fetchRedditPosts = async (subreddit, before = null) => {
    setLoadingState(subreddit, true);
    try {
      let url = `https://www.reddit.com/r/${subreddit}.json`;
      if (before) {
        url += `?after=${before}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      const newPosts = data.data.children.map((post) => post.data);
      const beforeCursor = data.data.before; // Guardar el before cursor
      console.log(data.data.before);

      const currentState = redditsSubject.value;
      const currentPosts = currentState[subreddit].posts || [];
      // Combinar posts existentes con nuevos posts
      const updatedPosts = before ? [...currentPosts, ...newPosts] : newPosts;

      updateRedditPosts(subreddit, updatedPosts, false, beforeCursor);
    } catch (error) {
      console.error("Error fetching Reddit posts:", error);
      updateRedditPosts(subreddit, [], true);
    }
    setLoadingState(subreddit, false);
  };

  const checkSubredditExists = async (subreddit) => {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}.json`
      );
      return response.ok;
    } catch (error) {
      console.error("Error checking subreddit:", error);
      return false;
    }
  };

  const setLoadingState = (subreddit, isLoading) => {
    const currentState = redditsSubject.value;
    currentState[subreddit] = {
      ...(currentState[subreddit] || {}),
      isLoading,
    };
    redditsSubject.next(currentState);
  };

  const updateRedditPosts = (
    subreddit,
    posts,
    error = false,
    before = null
  ) => {
    const currentState = redditsSubject.value;
    currentState[subreddit] = { posts, isLoading: false, error, before };
    redditsSubject.next(currentState);
  };

  const renderSubredditList = () => {
    $subredditList.innerHTML = "";
    if (subreddits.length > 0) {
      subreddits.forEach((subreddit) => {
        const $li = document.createElement("li");
        $li.textContent = `/r/${subreddit}`;
        $li.addEventListener("click", () => {
          currentSubredditSubject.next(subreddit);
          fetchRedditPosts(subreddit);
          toggleModalVisibility(false);
        });
        $subredditList.appendChild($li);
      });
    } else {
      $subredditList.innerHTML = "<p>No subreddits added yet.</p>";
    }
  };

  const renderRedditPosts = (data) => {
    const currentSub = currentSubredditSubject.value;
    const laneData = data[currentSub];

    // Si no hay datos para el subreddit actual, no renderizar nada
    if (!laneData) return;

    const { posts, isLoading, error } = laneData;
    $lanesContainers.innerHTML = "";

    if (isLoading && (!posts || posts.length === 0)) {
      $lanesContainers.innerHTML = "<p>Loading...</p>";
      return;
    }

    if (error) {
      $lanesContainers.innerHTML =
        "<p>Error loading data. Please check your connection or try refreshing.</p>";
      return;
    }

    // Si no hay posts y no está cargando ni hay error, mostrar mensaje
    if (!isLoading && !error && (!posts || posts.length === 0)) {
      $lanesContainers.innerHTML =
        "<p>No posts available for this subreddit.</p>";
      return;
    }

    const $lane = document.createElement("div");
    $lane.classList.add("reddit-lane");
    $lane.innerHTML = `
      <div class="lane-header">
        <h2>/r/${currentSub}</h2>
      </div>
      <div class="lane-posts">
        ${posts.map(createPostElement).join("")}
      </div>
    `;
    $lanesContainers.appendChild($lane);

    // Añadir el botón "Load More" al final del lane
    if (laneData.before !== null) {
      $lane.appendChild($loadMoreButton);
    } else {
      // Si ya no hay más posts, quitar el botón si existe
      if ($lanesContainers.contains($loadMoreButton)) {
        $lanesContainers.removeChild($loadMoreButton);
      }
    }
  };

  const createPostElement = (post) => {
    return `
      <div class="flex w-[90vw] flex-col gap-y-3 rounded-lg bg-[rgba(29,29,41,0.8)] px-6 py-5">
        <div class="flex gap-x-4">
          <p class="text-sm">
            Posted on ${new Date(post.created_utc * 1000).toLocaleString()} by
            <span class="hover:cursor-pointer hover:text-[#FF5700]">
              <a href="https://www.reddit.com/user/${
                post.author
              }" target="_blank">${post.author}</a>
            </span>
          </p>
          <img src="./images/pin.svg" />
        </div>
        <p class="mb-3 text-lg font-semibold">
          <a href="https://www.reddit.com${post.permalink}" target="_blank">${
      post.title
    }</a>
        </p>
        <div class="flex gap-x-6">
          <a href="https://www.reddit.com${post.permalink}" target="_blank">
            <div class="flex h-12 items-center gap-x-1.5 rounded-lg bg-[rgb(0,0,28)] p-2.5">
              <img src="./images/comment.svg" />
              <p class="text-sm font-semibold">${post.num_comments}</p>
            </div>
          </a>
          <a href="https://www.reddit.com${post.permalink}" target="_blank">
            <div class="flex h-12 items-center gap-x-2 rounded-lg bg-[rgb(0,0,28)] p-2.5">
              <img src="./images/arrow.svg" />
              <p class="text-sm font-semibold">${post.ups}</p>
              <img class="rotate-180" src="./images/arrow.svg" />
            </div>
          </a>
        </div>
      </div>
    `;
  };

  const renderEmptyState = () => {
    $lanesContainers.innerHTML = "<p>No subreddits added yet. Add one!</p>";
  };

  const showGlobalLoading = () => {
    $lanesContainers.innerHTML = "<p>Loading...</p>";
  };

  const hideGlobalLoading = () => {
    renderRedditPosts(redditsSubject.value);
  };

  const toggleModalVisibility = (visible) => {
    $modal.style.display = visible ? "block" : "none";
  };

  // Suscribirse a los cambios del subreddit actual
  currentSubredditSubject
    .pipe(tap((subreddit) => ($redditName.innerHTML = `/r/${subreddit}`)))
    .subscribe();

  redditsSubject.pipe(tap((data) => renderRedditPosts(data))).subscribe();

  return { init };
})();
