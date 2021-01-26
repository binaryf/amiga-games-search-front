// Constants.js

export const config = {
    // API endpoints.
    API_ENDPOINT_SEARCH: 'https://api.68k.no/games/search',
    API_ENDPOINT_TOP_GAMES: 'https://api.68k.no/games/top',
    API_ENDPOINT_VOTE: 'https://api.68k.no/games/vote/',

    // Backend response limit.
    RESPONSE_LIMIT: 10,
}

export const types = {
    // Defined types.
    REQ_TYPE_TOP: 0,
    REQ_TYPE_SEARCH: 1,
}

export const headers = {
    // A Collection of used headers.
    POST: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
}
