import { el, setChildren } from 'redom';
import './accounts.scss';
import plus from './assets/images/plus.svg';
import dateFormat, { masks } from 'dateformat';
import Choices from 'choices.js';
import Navigo from 'navigo';
import spinnerImg from './assets/images/spinner.svg';

import { i18n } from "dateformat";
i18n.monthNames = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function renderAccounts() {

  const accounts = el('div', { class: 'accounts' });
  const accountsTitle = el('h1', { class: 'accounts__title' }, 'Ваши счета');
  const accountsSortDiv = el('div', { class: 'accounts__sort-div' });
  const accountsSort = el('select', { class: 'accounts__sort js-choices choices', id: 'select' });
  const accountsSortOptionTitle = el('option', { class: 'accounts__sort-option' }, { value: '' }, 'Сортировка');
  const accountsSortOptionNumber = el('option', { class: 'accounts__sort-option' }, { value: 'number' }, 'По номеру');
  const accountsSortOptionBalance = el('option', { class: 'accounts__sort-option' }, { value: 'balance' }, 'По балансу');
  const accountsSortOntionTransaction = el('option', { class: 'accounts__sort-option' }, { value: 'trans' }, 'По последней транзакции');
  setChildren(accountsSortDiv, accountsSort)
  setChildren(accountsSort, accountsSortOptionTitle, accountsSortOptionNumber, accountsSortOptionBalance, accountsSortOntionTransaction);

  const accountsBtnAddAccount = el('button', { class: 'btn-reset btn-blue accounts__btn-add-account' }, [
    el('img', { src: plus }),
    el('div', 'Создать новый счёт'),
  ]);
  const accountsCard = el('div', { class: 'accounts__cards', id: 'accounts__card' });
  const spinner = el('img', { src: spinnerImg, class: 'spinner' });
  setChildren(accounts, accountsTitle, accountsSortDiv, accountsBtnAddAccount, accountsCard)
  spinner.style.display = 'flex';

  async function getAccounts(token) {
    return await fetch('http://localhost:3000/accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
      }
    }).then((res) => res.json())
  }

  async function createAccount(token) {
    return await fetch('http://localhost:3000/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
      }
    }).then((res) => res.json())
  }

  let token = localStorage.getItem('token');
  const router = new Navigo('/');

  let sortObj = '',
    sortDir = true;

  function getDate(date) {
    let fullDate = '';
    if (date === undefined) {
      fullDate = '';
    } else {
      fullDate = dateFormat(date, 'dd mmmm yyyy');
    }
    return fullDate;
  }

  function returnUndefined(x) {
    if (x === '01 января 1900') {
      x = undefined
    }
    return x
  }

  function getDateForNewArray(arrayTransactions) {
    let date = '';
    if (arrayTransactions === undefined) {
      date = undefined;
    } else {
      date = arrayTransactions.date.substr(0, 10);
    }
    return date
  }

  function renderAccountsList() {
    accountsCard.innerHTML = '';
    let newArray = [];
    setChildren(accountsCard, spinner);
    setTimeout(() => {
      getAccounts(token).then(function (value) {
        if (value.payload) {
          for (let v of Object.entries(value.payload)) {
            newArray.push({ 'account': v[1].account, 'balance': v[1].balance, 'date': getDateForNewArray(v[1].transactions[0]) });
          }
        };

        newArray.sort(function (a, b) {
          if (sortObj === 'date') {
            if (a[sortObj] === undefined) {
              a[sortObj] = '1900-01-01';
            }
            if (b[sortObj] === undefined) {
              b[sortObj] = '1900-01-01';
            }
          }
          let sort = a[sortObj] < b[sortObj]
          if (sortDir === false) sort = a[sortObj] > b[sortObj]
          return sort ? -1 : 1
        })

        accountsSort.addEventListener('change', () => {
          if (accountsSort.value === 'number') {
            sortObj = 'account'
            renderAccountsList();
          }
          if (accountsSort.value === 'balance') {
            sortObj = 'balance'
            renderAccountsList();
          }
          if (accountsSort.value === 'trans') {
            sortObj = 'date';
            renderAccountsList();
          }
        })

        setChildren(accountsCard, newArray.map((card) =>
          el(
            'div', { class: 'account' },
            el('div', { class: 'account__number', id: 'account__number' }, card.account),
            el('div', { class: 'account__balance' }, `${new Intl.NumberFormat().format(card.balance)} ₽`),
            el('div', { class: 'account__text' }, 'Последняя транзакция:'),
            el('div', { class: 'account__date', id: 'account__date' }, returnUndefined(getDate(card.date))),
            el('button', {
              class: 'btn-reset btn-blue btn-open',
              href: `/account/${card.account}`,
              onclick(event) {
                event.preventDefault();
                localStorage.setItem('id', card.account);
                router.navigate(event.target.getAttribute('href'));
                location.reload();
              }
            }, 'Открыть'),
          )
        ));
        spinner.style.display = 'none';
      });
    }, 5000)

  }

  renderAccountsList();

  accountsBtnAddAccount.addEventListener('click', (event) => {
    event.preventDefault();
    createAccount(token);
    getAccounts(token);
    renderAccountsList();
  });

  new Choices(accountsSort, {
    searchEnabled: false,
    itemSelectText: '',
    shouldSort: true,
    position: 'bottom',
  });

  return accounts;
}



