import React from 'react';
import ReactDOM from 'react-dom';
import SearchGame from './SearchGame';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<SearchGame />, document.getElementById('root'));
serviceWorker.unregister();
