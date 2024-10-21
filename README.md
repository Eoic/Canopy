# Rustle
Create and engage in discussions to grow the infinite virtual forest. 

## Installation and usage
### Client
1. Install dependencies:
   ```
   npm ci
   ```
2. Copy `.env.example` to `.env` and set the required environment variables.
3. Start the development server:
   ```
   npm run dev
   ```
4. By default, the client runs on [http://127.0.0.1:5137](http://127.0.0.1:5137).

See [package.json](./package.json) for linting and build commands.

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
   ./run.sh
   ```
4. By default, the server runs on [http://127.0.0.1:8000](http://127.0.0.1:8000).
