import React from 'react';
import './SearchGame.css';

import { config } from './Constants'
import { types } from './Constants'
import { headers } from './Constants'

class SearchGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchterm: '',
      filters: [],
      results: [],
      num_results: 0,
      selected: '',
      asc_order: true,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  // Typehead and substring search.
  handleChange(event) {

    // Store state for search string.
    this.setState({ searchterm: event.target.value.toUpperCase() });

    // Empty resultset if search string is nil.
    if (event.target.value.length === 0) {
      this.setState({ results: [] });
      this.setState({ selected: '' });
      return;
    }

    // Search title for partial or complete match.
    this.select_title(event.target.value);
  }

  // Generic POST API request with filter.
  get_results(endpoint, type, filter) {

    // Allways set result limit to the configured value.
    filter['limit'] = config.RESPONSE_LIMIT;

    fetch(endpoint, { method: 'POST', headers: headers.POST, body: JSON.stringify({ filters: filter }) })
      .then(res => res.json()).then((data) => {

        // Store type (search or list) to filter.
        // Because of vote(), change_order() or change_page() functions.
        filter.type = type;
        this.setState({ filters: filter });

        // For debugging.
        //console.log(data);

        this.setState({ results: data['games'] })
        this.setState({ num_results: data['count'] })
      })
  }

  // Fetch Top Games list.
  get_top_games(filter) {

    // Selected is for search and select overview.
    this.setState({ selected: "Top Games" });

    this.get_results(config.API_ENDPOINT_TOP_GAMES, types.REQ_TYPE_TOP, filter);
  }

  // Do all other searches.
  search(filter) {
    this.get_results(config.API_ENDPOINT_SEARCH, types.REQ_TYPE_SEARCH, filter);
  }

  // Vote game +1 (once per IP addr)
  vote(game) {
    fetch(config.API_ENDPOINT_VOTE + game.id)
      .then(res => res.json()).then((data) => {
        let filter = this.state.filters;
        filter.type ? this.search(filter) : this.get_top_games(filter);
      })
  }

  // Flips state between ASC and DESC order.
  change_state() {
    let currentState = this.state.asc_order;

    // Change current state.
    currentState = !currentState;

    // Store new state.
    this.setState({ asc_order: currentState });

    return currentState;
  }

  // Uses column and asc/desc order state for order by.
  change_order(column) {

    let filter = this.state.filters;

    // Change order by column.
    filter.order_by = column;

    // When order is changed, start at page 0.
    filter.page = 0;

    // Add the order state to filter.
    this.change_state() ? filter.direction = 'ASC' : filter.direction = 'DESC';

    // Update data with the appropiate type.
    filter.type ? this.search(filter) : this.get_top_games(filter);
  }

  // Change page (results) with offset for previous and next.
  change_page(page) {

    let filter = this.state.filters;

    // Update page number with eather -1 and +1.
    filter.page += page;

    // Update data with the appropiate type.
    filter.type ? this.search(filter) : this.get_top_games(filter);
  }

  // New search on column title.
  select_title(string) {

    // Selected is for search and select overview.
    this.setState({ selected: string });

    // Set defualt values on new search.
    this.search({ title: string, order_by: 'title', direction: 'ASC', page: 0 });
  }

  // New search on column size.
  select_size(amount) {

    // Selected is for search and select overview.
    this.setState({ selected: Math.ceil(amount / 1024) + " kb" });

    // Set defualt values on new search.
    this.search({ size: amount, order_by: 'size', direction: 'ASC', page: 0 });
  }

  // New search on column producer.
  select_producer(string) {

    // Do not process null value.
    if (string) {

      // Selected is for search and select overview.
      this.setState({ selected: string });

      // Set defualt values on new search.
      this.search({ producer: string, order_by: 'producer', direction: 'ASC', page: 0 });
    }
  }

  // New search on column year.
  select_year(amount) {

    // Do not process null value.
    if (amount) {

      // Selected is for search and select overview.
      this.setState({ selected: amount });

      // Set defualt values on new search.
      this.search({ year: amount, order_by: 'year', direction: 'ASC', page: 0 });
    }
  }

  render() {
    let res = this.state.results.length;
    let num_pages = Math.ceil(this.state.num_results / config.RESPONSE_LIMIT);

    return (
      <div className={res ? "workspace" : "search"}>

        {/* Input search and get top games is allways available. */}
        <input type="text" placeholder="Search title..." value={this.state.searchterm} onChange={this.handleChange} autoFocus="autoFocus" />
        <button onClick={() => this.get_top_games({ page: 0, order_by: 'vote_count', direction: 'DESC' })} className="top-games">TOP GAMES</button>

        {/* This block stays hidden until results is available. */}
        <div className={res ? "" : "hidden"}>
          <h4>
            <span>search: "{this.state.selected}"</span>
            <span>results: {this.state.num_results}</span>
            <span>page: {this.state.filters.page + 1} / {num_pages}</span>
          </h4>

          <div className="align-left">
            <button className="black-votes" onClick={() => this.change_order("vote_count")}>Votes</button>
            <button className="black-title" onClick={() => this.change_order("title")}>Title</button>
            <button className="black-size" onClick={() => this.change_order("size")}>Size</button>
            <button className="black-producer" onClick={() => this.change_order("producer")}>Producer</button>
            <button className="black-year" onClick={() => this.change_order("year")}>Year</button>
            <button className="black-vote">+1</button>

            {this.state.results.map((game) => (
              <div key={game.id} className="search-result">
                <div class="bar"></div>
                <div class="mobile-description" onClick={() => this.change_order("vote_count")}>Votes</div>
                <button className="black">{game.vote_count ? game.vote_count : 0}</button>
                <div class="mobile-description" onClick={() => this.change_order("title")}>Title</div>
                <button className="slategrey" onClick={() => this.select_title(game.title)}>{game.title ? game.title : "NULL"}</button>
                <div class="mobile-description" onClick={() => this.change_order("size")}>Size</div>
                <button className="gray" onClick={() => this.select_size(game.size)}>{game.size ? Math.ceil(game.size / 1024) : "NULL"} kb</button>
                <div class="mobile-description" onClick={() => this.change_order("producer")}>Producer</div>
                <button className="seagreen" onClick={() => this.select_producer(game.producer)}>{game.producer ? game.producer : "NULL"}</button>
                <div class="mobile-description" onClick={() => this.change_order("year")}>Year</div>
                <button className="cyan" onClick={() => this.select_year(game.year)}>{game.year ? game.year : "NULL"}</button>
                <div class="white-space"></div>
                <button className="red" onClick={() => this.vote(game)}>+1</button>
              </div>
            ))}
          </div>


          <button onClick={() => this.change_page(+1)} className={this.state.filters.page + 1 < num_pages ? "change-page" : "hidden"}>NEXT</button>
          <button onClick={() => this.change_page(-1)} className={this.state.filters.page > 0 ? "change-page" : "hidden"}>PREV</button>
        </div >
      </div >
    );
  }
}

export default SearchGame;