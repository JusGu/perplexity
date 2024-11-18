### Project Details
A simple clone of [perplexity](https://en.wikipedia.org/wiki/Perplexity_AI), written in two hours for a technical interview.

On a high level it does the following:
1. Sends a request to the server with your search query
2. Refines your search query into multiple search engine friendly queries
3. Grabs google results for each query
4. Summarizes findings with sources
5. Streams response back to frontend with SSE

All previous chats are stored in a local SQLite db via Prisma.

[Video Demo](https://www.loom.com/share/2f5b5438549a42449e266e41bf545bd2)


### Quick Setup
1. A `.env.example` is provided to help setup `.env` with your Serp API and Open AI API key. 
> [!WARNING]
> **This project burns through your Open AI API keys (upwards of $1 per query if not more). Since this was made in 2 hours, no attempts at optimization were made.**
2. Run `npm run dev`

### Screenshots
Home Page
<br/>

<img width="485" alt="image" src="https://github.com/user-attachments/assets/18946676-3653-4634-a2de-bab05b172dc7">
<br/>
Search Page
<br/>

<img width="485" alt="image" src="https://github.com/user-attachments/assets/a9b73c41-317e-49c1-a634-8a0fec5d1b20">
