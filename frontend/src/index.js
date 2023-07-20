import 'babel-polyfill';
import { el, setChildren } from 'redom';
import Navigo from 'navigo';
import './settings.scss';
import { renderHeader } from './header.js';
import { renderAutorization } from './autorization.js';
import { renderAccounts } from './accounts.js';
import { renderMap } from './maps.js';
import { renderAccountDetails } from './account-details';
import { renderHistoryBalance } from './history-balance';
import { renderCurrency } from './currency';

const router = new Navigo('/');
const main = el('main', { class: 'main' });

const link = document.createElement('link');
let src1 = 'https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css';
function linkСonnect(src) {
  link.rel = 'stylesheet';
  link.href = src;
  document.head.append(link);
}
linkСonnect(src1);



setChildren(window.document.body, [
  renderHeader(),
  main,
]);

router.on('/', () => {
  setChildren(main, [
    renderAutorization(),
  ])
});

router.on('/accounts', () => {
  setChildren(main, [
    renderAccounts(),
  ])
});

let id = localStorage.getItem('id');
console.log(id);

router.on(`/account/${id}`, () => {
  setChildren(main, [
    renderAccountDetails(),
  ])
});

router.on(`/history/${id}`, () => {
  setChildren(main, [
    renderHistoryBalance(),
  ])
});

router.on(`/currency`, () => {
  setChildren(main, [
    renderCurrency(),
  ])
});

router.on('/maps', () => {
  setChildren(main, [
    renderMap(),
  ])
});

router.resolve();


