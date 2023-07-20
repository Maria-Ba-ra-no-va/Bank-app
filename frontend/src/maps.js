import { el, setChildren } from 'redom';
import './maps.scss';
import { Loader } from '@googlemaps/js-api-loader';
import spinnerImg from './assets/images/spinner.svg';

export function renderMap() {
  const maps = el('div', { class: 'maps' });
  const spinner = el('img', { src: spinnerImg, class: 'spinner' });
  const mapTitle = el('h1', { class: 'map__title' }, 'Карта банкоматов');
  const mapContent = el('div', { class: 'map__content', id: 'map' });
  setChildren(maps, [mapTitle, spinner, mapContent]);
  spinner.style.display = 'flex';

  async function getBanks() {
    return await fetch('http://localhost:3000/banks')
      .then((data) => data.json())
  }

  const mapOptions = {
    center: {
      lat: 55.7540471,
      lng: 37.620405,
    },
    zoom: 11,
  };

  const loader = new Loader({
    apiKey: "",
    version: "weekly",
    libraries: ["places"],
  });

  loader
    .load()
    .then((google) => {
      setTimeout(() => {
        const map = new google.maps.Map(document.getElementById("map"), mapOptions);
        getBanks().then(function (value) {
          let val = value.payload;
          let newVal = [];
          val.forEach((element) => {
            newVal.push({ lat: element.lat, lng: element.lon });
          })
          newVal.forEach((element) => {
            new google.maps.Marker({ map, position: element });
          })
        })
        spinner.style.display = 'none';
      }, 5000)
    })
    .catch(() => {
      //  do something
    })

  return maps;
}




