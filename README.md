# Canopy

Create and engage in real-time discussions to grow infinite virtual forests.

## About
### What is this?

It's spatial, community-driven forum where conversations grow like forests. Instead of linear threads, you plant virtual trees on an infinite, shared grid - each tree representing a message, idea, or reply. Over time, clusters of trees form a virtual forest.

### How it works?

1. Any user can plant a tree anywhere in the grid. Each tree represents a single comment, question or idea.
2. To reply, users plant a new tree linked the original. This creates a spatial "reply" relationship that mirrors real conversation flow in the layout of the forest.
3. Trees grow in stages based on interaction such as new replies and upvotes. Each interaction contributes to a tree's growth percentage - once reaches 100%, the tree advances to the next growth stage.
4. Tree type depends on the intention - different species of trees represent different types of posts. There are questions, opinions, ideas, and news.
5. Selecting a tree opens a side panel with a traditional view of the thread.

## Development

### Client

1. Install dependencies:
   ```
   npm ci
   ```
2. Copy `.env.example` to `.env` and set the required environment variables.
3. Start the development server:
   ```
   npm run client
   ```
4. By default, the client runs on [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

See [package.json](./package.json) for linting, formatting and other build commands.

### Server

1. Change the directory to `server/`.
2. Create a virtual environment and install dependencies:
   ```
   python -m venv .venv
   . .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Run the server:
   ```
   cd ../ && npm run server
   ```
4. By default, the server runs on [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

