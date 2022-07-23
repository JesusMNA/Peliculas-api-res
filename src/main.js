const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': API_KEY
    }
});

function likedMoviesList() {
    const item = JSON.parse(localStorage.getItem("liked_movies"));
    let movies;

    if (item) {
        movies = item;
    }
    else {
        movies = {};
    }

    return movies;
}

function likeMovie(movie) {

    const likedMovies = likedMoviesList()

    if (likedMovies[movie.id]) {
        likedMovies[movie.id] = undefined;
    }
    else {
        likedMovies[movie.id] = movie
    }

    localStorage.setItem('liked_movies',JSON.stringify(likedMovies))
}

async function getTrendigMoviesPreview() {
    const { data } = await api('trending/movie/day');

    const movies = data.results;
    printMovies(movies, trendingMoviesPreviewList, { lazyLoad: true });
}

async function getCategoriesPreview() {
    const { data } = await api('genre/movie/list');

    const categories = data.genres;
    createCategorires(categories, categoriesPreviewList);
}

async function getMoviesByCategory(id, categoryName) {
    page = 1;
    const { data } = await api('discover/movie', {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;
    headerCategoryTitle.innerHTML = categoryName;
    printMovies(movies, genericSection, { lazyLoad: true, clean: true});
}

function getPaginatedMoviesByCategory(id) {
    return async function() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollIsBottom = ((scrollTop + clientHeight) >= (scrollHeight - 15));
        const pageIsNotMax = page < maxPage;
        if (scrollIsBottom && pageIsNotMax) {
            page++;
            const { data } = await api('discover/movie', {
                params: {
                    with_genres: id,
                    page
                },
            });
            const movies = data.results;
            printMovies(movies, genericSection, { lazyLoad: true, clean: false});
        }
    }
}

async function getMoviesBySearch(query) {
    page = 1;
    const { data } = await api('search/movie', {
        params: {
            query: query,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;
    printMovies(movies, genericSection, { lazyLoad: true, clean: true });
}

function getPaginatedSearchMovies(query) {
    return async function () {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollIsBottom = ((scrollTop + clientHeight) >= (scrollHeight - 15));
        const pageIsNotMax = page < maxPage;
        if (scrollIsBottom && pageIsNotMax) {
            page++;
            const { data } = await api('search/movie', {
                params: {
                    query: query,
                    page: page
                },
            });
            const movies = data.results;
            printMovies(movies, genericSection, { lazyLoad: true, clean: false });
        }
    }
}

async function getTrendigMovies() {
    page = 1;
    const { data } = await api('trending/movie/day');
    const movies = data.results;
    maxPage = data.total_pages;
    
    printMovies(movies, genericSection, { lazyLoad: true, clean: true });

    // const btnLoadMore = document.createElement("button");
    // btnLoadMore.innerText = "Cargar mas";
    // btnLoadMore.addEventListener("click", getPaginatedTrendingMovies)
    // genericSection.appendChild(btnLoadMore)
}

async function getPaginatedTrendingMovies() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const scrollIsBottom = ((scrollTop + clientHeight) >= (scrollHeight - 15));
    const pageIsNotMax = page < maxPage;
    if (scrollIsBottom && pageIsNotMax) {
        page++;
        const { data } = await api('trending/movie/day', {
            params: {
                page: page
            }
        });
        const movies = data.results;
    
        printMovies(movies, genericSection, { clean: false });   
    }

    // const btnLoadMore = document.createElement("button");
    // btnLoadMore.innerText = "Cargar mas";
    // btnLoadMore.addEventListener("click", getPaginatedTrendingMovies)
    // genericSection.appendChild(btnLoadMore)
}

async function getMovieById(id) {
    const { data: movie } = await api(`movie/${id}`);

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    headerSection.style.backgroundImage = `url("${movieImgUrl}")`;

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    createCategorires(movie.genres, movieDetailCategoriesList);
    getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
    page = 1;
    const { data } = await api(`movie/${id}/similar`);
    const movie = data.results;
    maxPage = data.total_pages;
    printMovies(movie, relatedMoviesContainer, {clean: true, lazyLoad: true})
}

function getPaginatedRelatedMovies(id) {
    return async function() {
        const scrollWidthScreen = document.documentElement.scrollWidth;
        const { scrollLeft, scrollWidth } = relatedMoviesContainer;
        const scrollIsEnd = ((scrollWidth + scrollLeft) >= (scrollWidthScreen - 100));
        const pageIsNotMax = page < maxPage;
        if (scrollIsEnd && pageIsNotMax) {
            page++;
            const { data } = await api(`movie/${id}/similar`, {
                params: {
                    page
                }
            });
            const movie = data.results;
            printMovies(movie, relatedMoviesContainer, {clean: false, lazyLoad: true})
        }
    }
}

// Helpers

function printMovies(
    movies, 
    place, 
    { 
        lazyLoad = false, 
        clean = true 
    } = {}
    ) {
    if (clean) {
        place.innerHTML = "";
    }
    movies.forEach(movie => {

        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');

        const movieImg = document.createElement('img');
        movieImg.addEventListener("click", () => {
            location.hash = '#movie=' + movie.id;
        })
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src', 
            'https://image.tmdb.org/t/p/w300' + movie.poster_path
        );
        movieImg.addEventListener("error", () =>{
            movieImg.setAttribute(
                'src',
                'https://image.tmdb.org/t/p/w300/vd7GyPkDvDDfvcxgWAfkGpKiAkH.jpg'
            );
        })

        const movieBtn = document.createElement("button");
        movieBtn.classList.add("movie-btn");

        const likedMovie = likedMoviesList();
        if(likedMovie[movie.id]) {
            movieBtn.classList.add("movie-btn--liked")
        }

        movieBtn.addEventListener("click", () => {
            movieBtn.classList.toggle('movie-btn--liked');
            likeMovie(movie);
            if(location.hash == '') {
                getLikedMovies();
                getTrendigMoviesPreview();
            }
        });

        if(lazyLoad) {
            observer.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
        place.appendChild(movieContainer);
    });
}

function createCategorires(categories, place) {
    place.innerHTML = "";
    categories.forEach(category => {

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id);
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        })
        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        place.appendChild(categoryContainer);
    });
}

function getLikedMovies() {
    const likedMovies = likedMoviesList();
    const moviesArray = Object.values(likedMovies);

    printMovies(moviesArray, clikedMoviesList, { lazyLoad: true, clean: true });
}

//Intersection Observer

const callback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-img');
            entry.target.setAttribute('src', url);
        }
    })
}

let observer = new IntersectionObserver(callback);