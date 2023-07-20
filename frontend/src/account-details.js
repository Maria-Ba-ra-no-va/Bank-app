import { el, setChildren } from 'redom';
import './account-details.scss';
import arrow from './assets/images/arrow.svg';
import mail from './assets/images/mail.svg';
import Chart from 'chart.js/auto';
import Navigo from 'navigo';

export function renderAccountDetails() {
  const accountDetails = el('div', { class: 'account-details' });
  const router = new Navigo('/');
  let token = localStorage.getItem('token');
  let id = localStorage.getItem('id');
  let accounts = [];
  if (JSON.parse(localStorage.getItem('accounts')) != null) {
    JSON.parse(localStorage.getItem('accounts')).map(element => {
      accounts.push(element);
    });
  }

  const accountDetailsTitle = el('h1', { class: 'account-details__title' }, 'Просмотр счёта ');
  const accountDetailsTitleNumber = el('h2', { class: 'account-details__title-number' });
  const accountDetailsBtnBack = el('button', { class: 'btn-reset btn-blue account-details__btn-back' }, [
    el('img', { src: arrow }),
    el('div', 'Вернуться назад'),
  ]);
  const accountDetailsBalance = el('div', { class: 'account-details__balance' });
  const accountDetailsBalanceText = el('div', { class: 'account-details__balance__text' }, 'Баланс');
  const accountDetailsBalanceValue = el('div', { class: 'account-details__balance__value' });
  setChildren(accountDetailsBalance, [accountDetailsBalanceText, accountDetailsBalanceValue]);

  const accountDetailsContent = el('div', { class: 'account-details__content' });
  const form = el('form', { class: 'form-translation' });
  const formTitle = el('h3', { class: 'form-translation__title' }, 'Новый перевод');
  const formDivAccount = el('div', { class: 'form-translation__div' });
  const formLabelAccount = el('label', { class: 'form-translation__label' }, 'Номер счёта получателя');
  const formInputAccount = el('input', { class: 'form-translation__input form-translation__input-account', autocomplete: 'on' }, { placeholder: 'Введите номер счета' });
  const formInputAccountError = el('div', { class: 'input-account-error' });
  setChildren(formDivAccount, [formLabelAccount, formInputAccount, formInputAccountError])
  const formDivSum = el('div', { class: 'form-translation__div' });
  const formLabelSum = el('label', { class: 'form-translation__label' }, 'Сумма перевода');
  const formInputSum = el('input', { class: 'form-translation__input form-translation__input-sum' }, { placeholder: 'Введите сумму' });
  const formInputSumError = el('div', { class: 'input-sum-error' });
  setChildren(formDivSum, [formLabelSum, formInputSum, formInputSumError]);
  const accountDetailsBtnSend = el('button', { class: 'btn-reset btn-blue account-details__btn-send' }, [
    el('img', { src: mail }),
    el('div', 'Отправить'),
  ]);;
  setChildren(form, formTitle, formDivAccount, formDivSum, accountDetailsBtnSend)

  const dynamics = el('div', { class: 'dynamics' });
  const dynamicsTitle = el('h3', { class: 'dynamics__title' }, 'Динамика баланса');
  const canvas = el('canvas', { id: 'acquisitions' });
  setChildren(dynamics, dynamicsTitle, canvas);

  const history = el('div', { class: 'history' });
  const historyTitle = el('h3', { class: 'history__title' }, 'История переводов');
  const table = el('table', { class: 'table' });
  const tableThead = el('thead', { class: 'table__thead' });
  const tableTbody = el('tbody', { class: 'table__tbody' });
  const tableTheadTr = el('tr');
  const senderTheadTd = el('td', 'Счёт отправителя');
  const recipientTheadTd = el('td', 'Счёт получателя');
  const sumTheadTd = el('td', 'Сумма');
  const dateTheadTd = el('td', 'Дата');
  setChildren(tableTheadTr, [senderTheadTd, recipientTheadTd, sumTheadTd, dateTheadTd]);
  setChildren(tableThead, tableTheadTr);
  setChildren(table, [tableThead, tableTbody]);
  setChildren(history, [historyTitle, table]);
  setChildren(accountDetailsContent, [form, dynamics, history]);
  setChildren(accountDetails, [accountDetailsTitle, accountDetailsTitleNumber, accountDetailsBtnBack, accountDetailsBalance, accountDetailsContent]);


  async function getAccount(id, token) {
    return await fetch(`http://localhost:3000/account/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    }).then((res) => res.json())
  }

  function getDate(date) {
    let fullDate = `${date.substr(8, 2)}.${date.substr(5, 2)}.${date.substr(0, 4)}`;
    return fullDate;
  }

  function getSum(amount, to) {
    if (to === id) {
      let sum = `+ ${new Intl.NumberFormat().format(amount)} ₽`;
      return sum;
    } else {
      let sum = `- ${new Intl.NumberFormat().format(amount)} ₽`;
      return sum;
    }
  }

  function getClass(to) {
    if (to === id) {
      let color = 'color-sum-green';
      return color;
    } else {
      let color = 'color-sum-red';
      return color;
    }
  }

  async function transferFunds(from, to, amount, token) {
    const response = await fetch('http://localhost:3000/transfer-funds', {
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
    if (data.error === 'Invalid account from' || data.error === 'Invalid account to') {
      formInputAccountError.textContent = data.error;
      formInputAccountError.style.display = 'flex';
      formInputAccount.classList.add('is-invalid');
    }
    if (data.error === 'Invalid amount' || data.error === 'Overdraft prevented') {
      formInputSumError.textContent = data.error;
      formInputSumError.style.display = 'flex';
      formInputSum.classList.add('is-invalid');
    }
    if (data.error === '') { return data };
  }

  getAccount(id, token).then(function (value) {
    let val = value.payload;
    console.log(value.payload);
    accountDetailsTitleNumber.textContent = `№ ${id}`;
    accountDetailsBalanceValue.textContent = `${new Intl.NumberFormat().format(val.balance)} ₽`;

    let i = 0;
    let arrayTransactions = [];
    for (let transaction of val.transactions.slice().reverse()) {
      i++;
      if (i < 11) {
        arrayTransactions.push(transaction);
      }
    }

    setChildren(tableTbody, arrayTransactions.map((transaction) =>
      el('tr',
        el('td', transaction.from),
        el('td', transaction.to),
        el('td', { class: getClass(transaction.to) }, getSum(transaction.amount, transaction.to)),
        el('td', getDate(transaction.date)),
      )
    ))

    let arrSum = [];

    function barChart() {
      let arrMonth = [];
      for (let i = -1; i < 11; i++) {
        let date = new Date();
        let d = date.setMonth(date.getMonth() - i);
        let dateMonth = date.getMonth();
        let dateYear = date.getFullYear();
        if (dateMonth === 0) {
          dateMonth = 12;
          dateYear = '2022';
        } else if (dateMonth < 10) {
          dateMonth = '0' + dateMonth;
        }
        arrMonth.push(`${dateYear}-${dateMonth}`);
      }

      for (let arr of arrMonth.reverse()) {
        let sum = 0;
        for (let transaction of val.transactions) {
          if (transaction.date.substr(0, 7) <= arr) {
            if (transaction.to === id) {
              sum = sum + transaction.amount;
            } else {
              sum = sum - transaction.amount;
            }
          }
        }
        arrSum.push(sum);
      }
    }

    function maxTicks(array) {
      let max = 0;
      for (let arr of array) {
        if (arr > max) {
          max = arr;
        }
      }
      return max
    }

    function minTicks(array) {
      let min = 0;
      for (let arr of array) {
        if (arr < min) {
          min = arr;
        }
      }
      return min
    }

    function getBarChart() {
      barChart();

      let dataFirst = [];
      let data = [];
      i = 0;
      let month = ['июл', 'июн', 'май', 'апр', 'мар', 'фев'];
      arrSum.reverse();

      for (let sum of arrSum) {
        dataFirst.push({ month: month[i], count: sum });
        i++;
      }

      data = dataFirst.slice(0, 6).reverse();
      let maxTicksEl = maxTicks(arrSum.slice(0, 6).reverse());
      let minTicksEl = minTicks(arrSum.slice(0, 6).reverse());

      const chartAreaBorder = {
        id: 'chartAreaBorder',
        beforeDraw(chart, args, options) {
          const { ctx, chartArea: { left, top, width, height } } = chart;
          ctx.save();
          ctx.strokeStyle = options.borderColor;
          ctx.lineWidth = options.borderWidth;
          ctx.setLineDash(options.borderDash || []);
          ctx.lineDashOffset = options.borderDashOffset;
          ctx.strokeRect(left, top, width, height);
          ctx.restore();
        }
      };

      new Chart(
        document.getElementById('acquisitions'),
        {
          type: 'bar',
          data: {
            labels: data.map(row => row.month),
            datasets: [
              {
                label: 'Six months statistics',
                data: data.map(row => row.count),
                backgroundColor: '#116ACC',
              }
            ]
          },
          options: {
            animation: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              },
              chartAreaBorder: {
                borderColor: 'black',
                borderWidth: 1,
              }
            },
            scales: {
              y: {
                position: 'right',
                grid: { display: false },
                beginAtZero: true,
                padding: 24,
                ticks: {
                  maxTicksLimit: 2,
                  color: 'black',
                  font: {
                    size: 20,
                    family: 'Work Sans',
                    style: 'normal',
                    weight: 500,
                  },
                },
                min: minTicksEl,
                max: maxTicksEl,
              },
              x: {
                grid: { display: false },
                padding: 8,
                ticks: {
                  color: 'black',
                  font: {
                    size: 20,
                    family: 'Work Sans',
                    style: 'normal',
                    weight: 700,
                  },
                }
              }
            }
          },
          plugins: [chartAreaBorder]
        }
      );
    }
    getBarChart();
  })

  let dataTransfer = null;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formInputAccountError.textContent = '';
    formInputAccount.classList.remove('is-invalid');
    formInputAccountError.style.display = 'none';
    formInputSumError.textContent = '';
    formInputSum.classList.remove('is-invalid');
    formInputSumError.style.display = 'none';
    if (formInputAccount.value.length === 26 && formInputSum.value > 0 && !isNaN(formInputAccount.value) && !isNaN(formInputSum.value)) {

      dataTransfer = transferFunds(id, formInputAccount.value, formInputSum.value, token);
      dataTransfer.then(function (value) {
        if (value != undefined) {
          accounts.push(formInputAccount.value);
          localStorage.setItem('accounts', JSON.stringify(accounts));
          location.reload();
        }
      })
    }

    if (formInputSum.value <= 0 || isNaN(formInputSum.value)) {
      formInputSumError.textContent = 'Некорректная сумма';
      formInputSum.classList.add('is-invalid');
      formInputSumError.style.display = 'flex';
    }
    if (formInputAccount.value.length != 26 || isNaN(formInputAccount.value)) {
      formInputAccountError.textContent = 'Некорректный номер счета';
      formInputAccount.classList.add('is-invalid');
      formInputAccountError.style.display = 'flex';
    }
  })

  formInputAccount.onchange = function () {
    let inputData = formInputAccount.value;
    let arrDataAccontsLS = JSON.parse(localStorage.getItem('accounts'));
    if (arrDataAccontsLS != null) {
      for (let element of arrDataAccontsLS) {
        if (element.startsWith(inputData)) {
          formInputAccount.value = element;
        };
      }
    }
  };

  accountDetailsBtnBack.addEventListener('click', (event) => {
    event.preventDefault();
    router.navigate('/accounts');
    location.reload();
  });

  canvas.addEventListener('click', (event) => {
    event.preventDefault();
    router.navigate(`/history/${id}`);
    location.reload();
  });

  table.addEventListener('click', (event) => {
    event.preventDefault();
    router.navigate(`/history/${id}`);
    location.reload();
  });

  return accountDetails
}
