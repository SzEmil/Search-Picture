'use strict';

import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('#photo-gallery');
const loadMoreBtn = document.querySelector('.load-more');

var lightbox = new SimpleLightbox('.gallery .gallery__item', {
  /* options */
  captions: true,
  captionSelector: 'img',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  enableKeyboard: true,
});

loadMoreBtn.style.display = 'none';

let photoNumber = 0;
let totalHitsApi = 0;
let formWords = '';

let scrollPosition = 0;
let buttonPosition = 0;
const axios = require('axios');
//max 13 stron dla cat
let pageNumber = 1;
const fetchPhotos = async (search, pageNumber) => {
  const response = await fetch(
    `https://pixabay.com/api/?key=31998219-af28b4c3092b69ebd942adff0&q=${search}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageNumber}`
  );
  const photos = await response.json();

  return photos;
};

const searchPhotos = async event => {
  try {
    event.preventDefault();
    loadMoreBtn.style.display = 'none';
    const {
      elements: { searchQuery },
    } = form;
    const formSearch = searchQuery.value;
    formWords = formSearch;

    if (formSearch === '') {
      Notiflix.Notify.info('Search field cannot be empty');
    } else {
      const allPhotosCards = document.querySelectorAll('.photoCard');
      allPhotosCards.forEach(photoCard => photoCard.remove());

      const photos = await fetchPhotos(formSearch, pageNumber);
      if (photos.total === 0) {
        Notiflix.Notify.failure(
          'Sorry, no photos were found for the phrase you are looking for'
        );
      } else {
        Notiflix.Notify.success(`Hooray! We found ${photos.totalHits} images.`);
        const photosArray = photos.hits;
        console.log(photosArray);

        totalHitsApi = photos.totalHits;

        createCard(photosArray);
        lightbox.refresh();

        loadMoreBtn.style.display = 'block';
      }
    }
  } catch (error) {
    console.error(error);
  }
};

function createCard(photosArray) {
  photosArray.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      const photoCard = document.createElement('div');
      photoCard.classList.add('photoCard');
      photoCard.innerHTML = `<div class="photo-card">
  <a class="gallery__item" href="${largeImageURL}"><img class ="photoCard__img" src="${webformatURL}" alt="" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes <span class="info-team-data">${likes}</span></b>
    </p>
    <p class="info-item">
      <b>Views <span class="info-team-data">${views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments <span class="info-team-data">${comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads <span class="info-team-data">${downloads}</span></b>
    </p>
  </div>
</div>`;
      photoNumber++;
      gallery.appendChild(photoCard);
    }
  );
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

const loadMorePhotos = async () => {
  try {
    pageNumber++;
    if (photoNumber >= totalHitsApi) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      const photos = await fetchPhotos(formWords, pageNumber);
      const photosArray = photos.hits;
      console.log(photosArray);

      createCard(photosArray);
      lightbox.refresh();
    }
  } catch (error) {
    console.error(error);
  }
};

form.addEventListener('submit', searchPhotos);

window.onscroll = throttle(function () {
  console.log('pozycja scrolla', scrollPosition);
  console.log('pozycja BUTTONA', buttonPosition);
  scrollPosition = window.pageYOffset;
  buttonPosition = loadMoreBtn.offsetTop;
  if (scrollPosition > buttonPosition - 950) {
    loadMorePhotos();
  }
}, 1000);
loadMoreBtn.addEventListener('click', loadMorePhotos);
