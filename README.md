## Image Grid Layout

Roadmap project link: https://roadmap.sh/projects/reddit-client/solutions?u=64b1bc4d5f038d81eeb4b894

Roadmap project: https://roadmap.sh/projects/reddit-client

Github link: https://github.com/axlwolf/RedditClient

Github pages link: https://axlwolf.github.io/RedditClient/

You are required to create a browser-based Reddit client that displays multiple subreddits in separate, customizable lanes. You'll work with the Reddit JSON feed to fetch posts from different subreddits and display them in a dynamic, responsive layout.

The application will allow users to add new subreddit lanes by entering a subreddit name. It will verify the existence of the subreddit, fetch its posts, and display them in a new lane. Each lane will show the subreddit's posts, including titles, authors, and vote counts.

[![Multi-Lane Reddit Client](https://assets.roadmap.sh/guest/reddit-client-o876k.png)](https://assets.roadmap.sh/guest/reddit-client-o876k.png)

To fetch data from reddit, you can use the JSON feed available at the following URL. You can also use the Reddit API to fetch more details about the posts, such as comments, upvotes, and more.

```plaintext
https://www.reddit.com/r/{subreddit}.json
```

The application should handle loading states while fetching data, display error messages for invalid subreddits or API issues, and provide a smooth user experience when adding or removing lanes. You can use local storage to save the user's custom lanes and restore them when the application is reloaded.

This project will help you practice API integration, state management, asynchronous programming, and creating a responsive, dynamic user interface. It's an excellent opportunity to enhance your skills in frontend development and working with real-time data.

### Get started

```
  git clone https://github.com/axlwolf/RedditClient.git my_project
  cd my_project
  npm i
  npm start
```

### Put your files into /src folder.

Don't forget add to index.html this line:
```
  <script type="text/javascript" src="../build/app.js"></script>
```

### For build

```
  npm run build
```

### Features

- Lightweight, fast opened.
- Webpack livereload separated config
- Html5/Css3/JS(es6/vanilla)/images(png, jpg, gif, svg) optimization/minify.
- Include 5 pure css media queries points and best normalize css practices.
- Include all you needed html meta tags.
- ES6 and browserify syntax support. (require, arrow func, let const etc...).
