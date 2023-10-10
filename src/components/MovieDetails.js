import { useState, useEffect } from "react";
import { Loader } from "./Loader&Error";
import StarRating from "../StarRating";

export default function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatch,
  watched,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState("");
  const KEY = process.env.REACT_APP_API_KEY;

  // "c28a22b8"

  const isWatched = watched?.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched?.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  useEffect(() => {
    async function getMovieDetails() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch movie details");
        }
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Fetch movie details only if selectedId is available
    if (selectedId) {
      getMovieDetails();
    }
  }, [selectedId, KEY]);

  useEffect(() => {
    // Set document title based on the movie title
    document.title = `MOVIE | ${movie.Title || "MyFavMovie"}`;

    // Cleanup function to reset document title when component unmounts
    return () => {
      document.title = "MyFavMovie";
    };
  }, [movie.Title]);

  if (isLoading) {
    return <Loader />;
  }

  const {
    Title,
    Year,
    Poster,
    Runtime,
    imdbRating,
    Plot,
    Released,
    Actors,
    Director,
    Genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title: Title,
      year: Year,
      poster: Poster,
      imdbRating: Number(imdbRating),
      runtime: Runtime.split(" ")[0],
      userRating,
    };
    onAddWatch(newWatchedMovie);
    onCloseMovie();
  }

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <img src={Poster} alt={`Poster of ${Title}`} />
        <div className="details-overview">
          <h2>{Title}</h2>
          <p>
            {Released}&bull; {Runtime}
          </p>
          <p>{Genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} IMDb Rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
              />
              {userRating > 0 && (
                <button className="btn-add" onClick={handleAdd}>
                  + Add to list
                </button>
              )}
            </>
          ) : (
            <p>
              You rated this movie {watchedUserRating} <span>⭐</span>
            </p>
          )}
        </div>
        <p>
          <em>{Plot}</em>
        </p>
        <p>Starring {Actors}</p>
        <p>Directed by {Director}</p>
      </section>
    </div>
  );
}
