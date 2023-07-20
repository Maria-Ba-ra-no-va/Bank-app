import { el, setChildren } from 'redom';
import './history-balance.scss';
import arrow from './assets/images/arrow.svg';
import Chart from 'chart.js/auto';
import Navigo from 'navigo';

export function renderHistoryBalance() {
  let token = localStorage.getItem('token');
  let id = localStorage.getItem('id');
  const router = new Navigo('/');

  const historyBalance = el('div', { class: 'history-balance' });
  const historyBalanceTitle = el('h1', { class: 'history-balance__title' }, 'История баланса');
  const historyBalanceTitleNumber = el('h2', { class: 'history-balance__title-number' });
  const historyBalanceBtnBack = el('button', { class: 'btn-reset btn-blue history-balance__btn-back' }, [
    el('img', { src: arrow }),
    el('div', 'Вернуться назад'),
  ]);
  const historyBalanceInfo = el('div', { class: 'history__balance' });
  const historyBalanceText = el('div', { class: 'history__balance__text' }, 'Баланс');
  const historyBalanceValue = el('div', { class: 'history__balance__value' });
  setChildren(historyBalanceInfo, [historyBalanceText, historyBalanceValue]);

  const dynamics = el('div', { class: 'dynamics' });
  const dynamicsTitle = el('h3', { class: 'dynamics__title' }, 'Динамика баланса');
  const canvas = el('canvas', { id: 'acquisitions1' });
  setChildren(dynamics, dynamicsTitle, canvas);

  const ratio = el('div', { class: 'dynamics' });
  const ratioTitle = el('h3', { class: 'dynamics__title' }, 'Соотношение входящих исходящих транзакций');
  const canvas2 = el('canvas', { id: 'acquisitions2' });
  setChildren(ratio, ratioTitle, canvas2);

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


  async function getAccount(id, token) {
    return await fetch(`http://localhost:3000/account/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Basic ${token}`,
      },
    }).then((res) => res.json());
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

  getAccount(id, token).then(function (value) {
    let val = value.payload;
    console.log(val.transactions);

    historyBalanceTitleNumber.textContent = `№ ${id}`;
    historyBalanceValue.textContent = `${new Intl.NumberFormat().format(val.balance)} ₽`;

    let i = 0;
    let arrayTransactions = [];
    for (let transaction of val.transactions.slice().reverse()) {
      i++;
      if (i < 26) {
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

    let arrSum1 = [];
    function barChart1() {
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
        arrSum1.push(sum);
      }
    }

    function getBarChart1() {
      barChart1();

      let dataFirst = [];
      let data = [];
      i = 0;
      let month = ['июл', 'июн', 'май', 'апр', 'мар', 'фев', 'янв', 'дек', 'ноя', 'окт', 'сент', 'авг'];
      arrSum1.reverse();

      for (let sum of arrSum1) {
        dataFirst.push({ month: month[i], count: sum });
        i++;
      }

      data = dataFirst.reverse();
      let maxTicksEl = maxTicks(arrSum1.reverse());
      let minTicksEl = minTicks(arrSum1.reverse());

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
        document.getElementById('acquisitions1'),
        {
          type: 'bar',
          data: {
            labels: data.map(row => row.month),
            datasets: [
              {
                label: 'Eleven months statistics',
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
                beginAtZero: true,
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
              },
            }
          },
          plugins: [chartAreaBorder]
        }
      );
    }
    getBarChart1();

    let arrSum2 = [];

    function barChart2() {

      arrMonth.reverse();

      for (let arr of arrMonth.reverse()) {
        let sumPlus = 0;
        let sumMinus = 0;
        for (let transaction of val.transactions) {
          if (transaction.date.substr(0, 7) <= arr) {
            if (transaction.to === id) {
              sumPlus = sumPlus + transaction.amount;
            } else {
              sumMinus = sumMinus + transaction.amount;
            }
          }
        }
        arrSum2.push({ sumPlus, sumMinus });
      }
    }

    function getBarChart2() {
      barChart2();

      let dataFirst = [];
      let data = [];
      i = 0;
      let month = ['июл', 'июн', 'май', 'апр', 'мар', 'фев', 'янв', 'дек', 'ноя', 'окт', 'сент', 'авг'];
      arrSum2.reverse();

      for (let sum of arrSum2) {
        dataFirst.push({ month: month[i], count1: sum.sumPlus, count2: sum.sumMinus });
        i++;
      }

      data = dataFirst.reverse();

      let sumCount = [];
      arrSum2.forEach((element) => {
        sumCount.push(element.sumPlus + element.sumMinus);
      })

      let arrCountMinus = [];
      arrSum2.forEach((el) => {
        arrCountMinus.push(el.sumMinus);
      })

      let maxTicksEl = maxTicks(sumCount);
      let middleTicksEl = maxTicks(arrCountMinus);

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

      let dataPlus = {
        data: data.map(row => row.count1),
        backgroundColor: '#76CA66',
      };

      let dataMinus = {
        data: data.map(row => row.count2),
        backgroundColor: '#FD4E5D',
      };

      let r = [{ x: 0 }, { x: middleTicksEl }, { x: maxTicksEl }]

      new Chart(
        document.getElementById('acquisitions2'),
        {
          type: 'bar',
          data: {
            labels: data.map(row => row.month),
            datasets: [dataMinus, dataPlus]
          },
          options: {
            animation: false,
            responsive: true,
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
                stacked: true,
                position: 'right',
                grid: { display: false },
                beginAtZero: true,
                padding: 24,
                ticks: {
                  callback: function (value, index, values) {
                    values[0].value = 0;
                    values[1].value = middleTicksEl;
                    values[2].value = maxTicksEl;
                    return value
                  },
                  maxTicksLimit: 3,
                  color: 'black',
                  font: {
                    size: 20,
                    family: 'Work Sans',
                    style: 'normal',
                    weight: 500,
                  },
                },
                min: 0,
                max: maxTicksEl,
              },
              x: {
                stacked: true,
                grid: { display: false },
                beginAtZero: true,
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
              },
            }
          },
          plugins: [chartAreaBorder]
        }
      );
    }
    getBarChart2();

  })


  historyBalanceBtnBack.addEventListener('click', (event) => {
    event.preventDefault();
    router.navigate(`/account/${id}`);
    location.reload();
  })


  setChildren(historyBalance, [historyBalanceTitle, historyBalanceTitleNumber, historyBalanceBtnBack, historyBalanceInfo, dynamics, ratio, history]);

  return historyBalance
}
