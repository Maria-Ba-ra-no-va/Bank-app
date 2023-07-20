import { el, setChildren } from 'redom';
import './currency.scss';
import Navigo from 'navigo';
import Choices from 'choices.js';


export function renderCurrency() {
  let token = localStorage.getItem('token');
  let id = localStorage.getItem('id');
  const router = new Navigo('/');

  const currency = el('div', { class: 'currency' });
  const currencyTitle = el('h1', { class: 'currency__title' }, 'Валютный обмен');
  const currencyContent = el('div', { class: 'currency__content' });
  const currencyAccount = el('div', { class: 'currency__account' });
  const exchangeRates = el('div', { class: 'currency__exchange-rates' });
  const currencyExchange = el('div', { class: 'currency__exchange' });

  const currencyAccountTitle = el('h2', { class: 'currency__h2' }, 'Ваши валюты');
  const currencyAccountList = el('ul', { class: 'currency__account-list list list-reset' });
  setChildren(currencyAccount, [currencyAccountTitle, currencyAccountList]);

  const exchangeRatesTitle = el('h2', { class: 'currency__h2' }, 'Изменение курсов в реальном времени');
  const exchangeRatesList = el('ul', { class: 'list-reset list currency__exchange-rates-list' });
  setChildren(exchangeRates, [exchangeRatesTitle, exchangeRatesList]);

  const currencyExchangeTitle = el('h2', { class: 'currency__h2' }, 'Обмен валюты');
  const currencyExchangeForm = el('form', { class: 'currency__exchange__form' });
  const currencyExchangeDivLeft = el('div', { class: 'currency__exchange__div-left' });
  const currencyExchangeDivTop = el('div', { class: 'currency__exchange__div-top' });
  const currencyExchangeFrom = el('label', 'Из');
  const currencyExchangeSelectFrom = el('select', { class: 'currency__exchange__select-from js-choices choices' });
  const currencyExchangeIn = el('label', 'в');
  const currencyExchangeSelectIn = el('select', { class: 'currency__exchange__select-in js-choices choices' });
  const currencyExchangeDivBottom = el('div', { class: 'currency__exchange__div-bottom' });
  const currencyExchangeSum = el('label', 'Сумма');
  const currencyExchangeInput = el('input', { class: 'currency__exchange__input' });
  const currencyExchangeBtn = el('button', { class: 'btn-reset btn-blue' }, 'Обменять');
  const formError = el('div', { class: 'currency__exchange-error' });
  setChildren(currencyExchangeDivTop, [currencyExchangeFrom, currencyExchangeSelectFrom, currencyExchangeIn, currencyExchangeSelectIn]);
  setChildren(currencyExchangeDivBottom, [currencyExchangeSum, currencyExchangeInput]);
  setChildren(currencyExchangeDivLeft, [currencyExchangeDivTop, currencyExchangeDivBottom]);
  setChildren(currencyExchangeForm, [currencyExchangeDivLeft, currencyExchangeBtn, formError])
  setChildren(currencyExchange, [currencyExchangeTitle, currencyExchangeForm]);

  setChildren(currency, [currencyTitle, currencyContent]);
  setChildren(currencyContent, [currencyAccount, exchangeRates, currencyExchange]);

  async function getCurrencyAccounts(token) {
    return await fetch('http://localhost:3000/currencies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    }).then((data) => data.json());
  }

  async function getKnownCurrwncies() {
    return await fetch('http://localhost:3000/all-currencies').then((data) =>
      data.json()
    );
  }

  async function exchangeCurrency(from, to, amount, token) {
    const response = await fetch('http://localhost:3000/currency-buy', {
      method: 'POST',
      body: JSON.stringify({
        from,
        to,
        amount,
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    });
    const data = await response.json();

    if (data.error === 'Unknown currency code' || data.error === 'Invalid amount' || data.error === 'Not enough currency' || data.error === 'Overdraft prevented') {
      formError.textContent = data.error;
      formError.style.display = 'flex';
      currencyExchangeInput.classList.add('is-invalid');
    }

    if (data.error === '') { return data };

  }

  let arrayCurrencyAccount = [];
  getCurrencyAccounts(token).then(function (value) {
    let val = value.payload;
    Object.entries(val).forEach(([key, value]) => {
      if (value != 0) {
        arrayCurrencyAccount.push({ key, value });
      }
    });

    setChildren(currencyAccountList, arrayCurrencyAccount.map((element) =>
      el(
        'li', { class: 'list__item item' },
        el('div', { class: 'item__name' }, element.value.code),
        el('div', { class: 'item__dashed' },),
        el('div', { class: 'item__amount' },
          new Intl.NumberFormat().format(element.value.amount).replace(/,/, '.')),
      )
    ));

    setChildren(currencyExchangeSelectFrom, arrayCurrencyAccount.map((element) =>
      el(
        'option', { class: 'currency__exchange__select-from-option', value: element.key }, element.key)
    ));
    new Choices(currencyExchangeSelectFrom, {
      searchEnabled: false,
      itemSelectText: '',
      shouldSort: true,
      position: 'bottom',
    });

  })

  getKnownCurrwncies().then(function (value) {
    setChildren(currencyExchangeSelectIn, value.payload.map((element) =>
      el(
        'option', { class: 'currency__exchange__select-in-option', value: element }, element)
    ));
    new Choices(currencyExchangeSelectIn, {
      searchEnabled: false,
      itemSelectText: '',
      shouldSort: true,
      position: 'bottom',
    });
  })

  let data = null;

  currencyExchangeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formError.textContent = '';
    currencyExchangeInput.classList.remove('is-invalid');
    formError.style.display = 'none';
    let sum = currencyExchangeInput.value;

    if (sum > 0) {
      let from = currencyExchangeSelectFrom.value;
      let to = currencyExchangeSelectIn.value;
      data = exchangeCurrency(from, to, sum, token);
      data.then(function (value) {
        if (value != undefined) {
          location.reload();
        }
      })
    } else {
      formError.textContent = 'Введена некорректная сумма';
      formError.style.display = 'flex';
      currencyExchangeInput.classList.add('is-invalid');
    }
  })

  let socket = new WebSocket('ws://localhost:3000/currency-feed');
  let socketArr = [];
  socket.onmessage = function (e) {
    if (socketArr.length = 21) {
      socketArr.shift();
    }

    let strData = String(e.data);
    let indexType = strData.indexOf(`"type":`);
    let indexTypeEnd = strData.indexOf(`,"from":`);
    let indexFromEnd = strData.indexOf(`,"to":`);
    let indexToEnd = strData.indexOf(`,"rate":`);
    let indexRateEnd = strData.indexOf(`,"change":`);
    let type = strData.substring(indexType + 8, indexTypeEnd - indexType);
    let from = strData.substring(indexTypeEnd + 9, indexFromEnd - 1);
    let to = strData.substring(indexFromEnd + 7, indexToEnd - 1);
    let rate = strData.substring(indexToEnd + 8, indexRateEnd - 1);
    let change = strData.substring(indexRateEnd + 10, strData.length - 1);

    socketArr.push({ type: type, from: from, to: to, rate: rate, change: change });

    setChildren(exchangeRatesList, socketArr.map((element) =>
      el('li', { class: 'list__item item' },
        el('div', { class: 'item__code' }, `${element.from}/${element.to}`),
        el('div', { class: `item__dashed ${getClassDashed(element.change)}` },),
        el('div', { class: `item__amount ${getClassArrow(element.change)}` }, element.rate),
      )
    ))

    function getClassDashed(change) {
      if (change == 1) {
        let color = 'green-dashed';
        return color;
      } else if (change == -1) {
        let color = 'red-dashed';
        return color;
      }
    }

    function getClassArrow(change) {
      if (change == 1) {
        let color = 'green-arrow';
        return color;
      } else if (change == -1) {
        let color = 'red-arrow';
        return color;
      }
    }
  }

  socket.onerror = function (error) {
    console.log(`[error]`);
  };

  return currency;
}
