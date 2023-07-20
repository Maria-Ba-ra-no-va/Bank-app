import { el, setChildren } from 'redom';
import logo from './assets/images/Logo.svg'
import './header.scss';
import Navigo from 'navigo';

export function renderHeader() {
  const header = el('header', { class: 'header' });
  const headerLogo = el('img', { class: 'header__logo', src: logo });
  const headerDiv = el('div', { class: 'header__div' });
  setChildren(header, [headerLogo, headerDiv]);
  const btnBanks = el('button', { class: 'btn-reset header__button header__button-banks', href: '/maps' }, 'Банкоматы');
  const btnAccounts = el('button', { class: 'btn-reset header__button', href: '/accounts' }, 'Счета');
  const btnСurrency = el('button', { class: 'btn-reset header__button', href: '/currency' }, 'Валюта');
  const btnExit = el('button', { class: 'btn-reset header__button', href: '/' }, 'Выйти');
  setChildren(headerDiv, [btnBanks, btnAccounts, btnСurrency, btnExit]);

  const router = new Navigo('/');
  const btns = [btnBanks, btnAccounts, btnСurrency, btnExit];
  btns.forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      router.navigate(event.target.getAttribute('href'));
      location.reload();
    })
  })

  return header
}
