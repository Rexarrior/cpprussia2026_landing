/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import App from './App';
import ServicePage from './pages/ServicePage';
import './index.css';

const root = document.getElementById('root');

render(
  () => (
    <Router>
      <Route path="/" component={App} />
      <Route path="/service/:service" component={ServicePage} />
    </Router>
  ),
  root
);
