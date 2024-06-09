import React, { useState, useEffect } from 'react';
import { useFirebase } from "../context/firebase";
import Navbar from '../Components/Navbar';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const Home = () => {
  const firebase = useFirebase();
  const [allMovies, setAllMovies] = useState([]);
  const [posterPaths, setPosterPaths] = useState({});

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("/Login")
    }
  });

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  }

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const movies = await firebase.fetchAllMovies();
        setAllMovies(movies);
        // Fetch poster paths for all movies
        const paths = await Promise.all(movies.map(movie => firebase.fetchMoviePoster(movie.movieId)));
        // Create an object with movie IDs as keys and poster paths as values
        const posterPathsObj = {};
        movies.forEach((movie, index) => {
          posterPathsObj[movie.movieId] = paths[index];
        });
        setPosterPaths(posterPathsObj);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  return (
    <>
      <Navbar />

      <div className="poster-container">
        {allMovies.map((movie, index) => {
          const { movieReleaseDate, movieTitle, movieGenre, movieId } = movie;
          const posterPath = posterPaths[movie.movieId];
          return (
            <Link to={"/MovieDetails/" + movieId} key={index}>
              <div className="poster">
                <div class="placeholder shimmer" style={{ width: '222px', height: '340px' }}>
                  <style>
                      {`
                      .shimmer::before {
                        content: "";
                        position: absolute;
                        background: linear-gradient(
                          90deg,
                          rgba(255, 255, 255, 0) 0%,
                          rgba(255, 255, 255, 0.4) 50%,
                          rgba(255, 255, 255, 0) 100%
                        );
                        height: 100%;
                        width: 100%;
                        animation: shimmer 1s infinite;
                        ${isImageLoaded ? 'z-index: -1;' : ''}
                       }
                     `}
                  </style>
                  <div class="faux-image-wrapper">
                    <div class="faux-image">
                      <img src={posterPath}
                        onLoad={handleImageLoad} />
                    </div>
                  </div>
                </div>
                <div className="timestamp myt-10" style={{ fontWeight: 500 }}>{movieReleaseDate}</div>
                <div className="movie-name myt-5" style={{ fontWeight: 600 }}>{movieTitle}</div>
                <div className="movie-genre myt-5" style={{ opacity: 0.8, fontSize: 15 }}>{movieGenre}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Home;