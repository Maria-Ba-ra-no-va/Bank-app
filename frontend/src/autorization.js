import { el, setChildren } from 'redom';
import './autorization.scss';
import Navigo from 'navigo';

export function renderAutorization() {
  const form = el('form', { class: 'form-autorization', href: '/accounts' });
  const formTitle = el('h1', { class: 'form-autorization__title' }, 'Вход в аккаунт');
  const formDivLogin = el('div', { class: 'form-autorization__div' });
  const formLabelLogin = el('label', { class: 'form-autorization__label' }, 'Логин');
  const formInputLogin = el('input', { class: 'form-autorization__input form-autorization__input-login', id: 'username' }, { placeholder: 'Введите логин' });
  const formInputLoginError = el('div', { class: 'login-error' });
  setChildren(formDivLogin, formLabelLogin, formInputLogin, formInputLoginError)
  const formDivPassword = el('div', { class: 'form-autorization__div' });
  const formLabelPassword = el('label', { class: 'form-autorization__label' }, 'Пароль');
  const formInputPassword = el('input', { class: 'form-autorization__input form-autorization__input-password', id: 'password' }, { placeholder: 'Введите пароль' });
  const formInputPasswordError = el('div', { class: 'password-error' });
  setChildren(formDivPassword, formLabelPassword, formInputPassword, formInputPasswordError)
  const formBtn = el('button', { class: 'btn-reset form-autorization__btn' }, 'Войти');
  setChildren(form, formTitle, formDivLogin, formDivPassword, formBtn)

  async function autorization(login, password) {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      body: JSON.stringify({
        login,
        password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (data.error === 'No such user') {
      formInputLoginError.textContent = data.error;
      formInputLoginError.style.display = 'flex';
      formInputLogin.classList.add('is-invalid');
    }
    if (data.error === 'Invalid password') {
      formInputPasswordError.textContent = data.error;
      formInputPasswordError.style.display = 'flex';
      formInputPassword.classList.add('is-invalid');
    }
    if (data.error === '') { return data };
  }

  let data = null;
  let token = null;
  const router = new Navigo('/');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formInputLoginError.textContent = '';
    formInputLogin.classList.remove('is-invalid');
    formInputLoginError.style.display = 'none';
    formInputPasswordError.textContent = '';
    formInputPassword.classList.remove('is-invalid');
    formInputPasswordError.style.display = 'none';
    let login = formInputLogin.value;
    let password = formInputPassword.value;

    if (login.length >= 6 && !login.includes(' ') && password.length >= 6 && !password.includes(' ')) {
      data = autorization(login, password);
      data.then(function (value) {
        if (value != undefined) {
          token = value.payload.token;
          localStorage.setItem('token', token);
          if (token) {
            router.navigate(event.target.getAttribute('href'));
            location.reload();
          }
        }
      })
    }
    if (login.length < 6 || login.includes(' ')) {
      formInputLoginError.textContent = 'Некорректный логин';
      formInputLoginError.style.display = 'flex';
      formInputLogin.classList.add('is-invalid');
    }
    if (password.length < 6 || password.includes(' ')) {
      formInputPasswordError.textContent = 'Некорректный пароль';
      formInputPasswordError.style.display = 'flex';
      formInputPassword.classList.add('is-invalid');
    }
  }
  )
  return form
}
