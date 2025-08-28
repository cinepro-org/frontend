/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useRef } from "react";
import "../styles/HomePage.css";
import { Film, MonitorPlay, Tv, ChevronDown, PaintRoller, TvIcon, Play, ALargeSmall, Image, Monitor, Palette } from "lucide-react"; // Import Lucide icons
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "../components/DropdownComponents/DropdownMenu";
import { ToggleGroup, ToggleGroupItem } from "../components/togglegroup/ToggleGroup";

// Constants for default content
const DEFAULT_MOVIE_ID = "786892";
const DEFAULT_SHOW_ID = "94605";
const DEFAULT_ANIME_ID = "12234";
const DEFAULT_SHOW_SEASON = 1; // S1
const DEFAULT_SHOW_EPISODE = 1; // E1
const DEFAULT_ANIME_EPISODE = 1; // E1
const DEFAULT_ANIME_DUB = true;

function HomePage() {
  const [testMovieId, setTestMovieId] = useState("");
  const [testShowId, setTestShowId] = useState("");
  const [testSeasonNum, setTestSeasonNum] = useState("");
  const [testEpisodeNum, setTestEpisodeNum] = useState("");
  const [testAnimeDub, setTestAnimeDub] = useState(false);
  const [testPlayerType, setTestPlayerType] = useState("vidstack");
  const [testTheme, setTestTheme] = useState("ff4d6d"); // Default to pink-red without '#'
  const [testAutoplay, setTestAutoplay] = useState(false);
  const [testShowTitle, setTestShowTitle] = useState(true);
  const [testShowPoster, setTestShowPoster] = useState(true);
  const [contentType, setContentType] = useState("movie");

  const [iframeSrc, setIframeSrc] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const [isPlayerTypeDropdownOpen, setIsPlayerTypeDropdownOpen] = useState(false);

  // Ref for the debounce timer
  const debounceTimerRef = useRef(null);

  // Function to generate the player link
  const generatePlayerLink = () => {
    const queryParams = new URLSearchParams();
    queryParams.append("player", testPlayerType);

    // Append theme without the '#'
    if (testTheme) {
      queryParams.append("theme", testTheme);
    }

    if (testAutoplay) {
      queryParams.append("autoplay", testAutoplay);
    }
    if (testShowTitle) {
      queryParams.append("title", testShowTitle);
    }
    if (testShowPoster) {
      queryParams.append("poster", testShowPoster);
    }
    // Add autoplay and dub to URL
    if (contentType === 'anime' && testAnimeDub) {
      queryParams.append("dub", testAnimeDub);
    }

    let path = "";
    let id, season, episode;
    if (contentType === "movie") {
      id = testMovieId || DEFAULT_MOVIE_ID;
      path = `/movie/${id}?${queryParams.toString()}`;
    } else if (contentType === "series") {
      id = testShowId || DEFAULT_SHOW_ID;
      season = testSeasonNum || DEFAULT_SHOW_SEASON;
      episode = testEpisodeNum || DEFAULT_SHOW_EPISODE;
      path = `/tv/${id}/${season}/${episode}?${queryParams.toString()}`;
    } else if (contentType === "anime") {
      id = testShowId || DEFAULT_ANIME_ID;
      episode = testEpisodeNum || DEFAULT_ANIME_EPISODE;
      path = `/anime/${id}/${episode}?${queryParams.toString()}`;
    }

    if (path) {
      const fullLink = `${window.location.origin}${path}`;
      setGeneratedLink(fullLink);
      setIframeSrc(path);
    }
  };

  // Effect to handle default URLs and automatic fetch
  useEffect(() => {
    // Set default state based on content type
    const setDefaultStates = (type) => {
      if (type === 'movie') {
        setTestMovieId(DEFAULT_MOVIE_ID);
        setTestShowId("");
        setTestSeasonNum("");
        setTestEpisodeNum("");
        setTestAnimeDub(false);
      } else if (type === 'series') {
        setTestMovieId("");
        setTestShowId(DEFAULT_SHOW_ID);
        setTestSeasonNum(DEFAULT_SHOW_SEASON);
        setTestEpisodeNum(DEFAULT_SHOW_EPISODE);
        setTestAnimeDub(false);
      } else if (type === 'anime') {
        setTestMovieId("");
        setTestShowId(DEFAULT_ANIME_ID);
        setTestSeasonNum("");
        setTestEpisodeNum(DEFAULT_ANIME_EPISODE);
        setTestAnimeDub(DEFAULT_ANIME_DUB);
      }
    };

    // Initial mount and when contentType changes, set default states and generate link
    setDefaultStates(contentType);
    generatePlayerLink();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType]);

  // Effect to handle debounced fetch
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      // Fetch only if there is a valid ID
      let id;
      if (contentType === 'movie' && testMovieId) {
        id = testMovieId;
      } else if ((contentType === 'series' || contentType === 'anime') && testShowId) {
        id = testShowId;
      }

      if (id) {
        generatePlayerLink();
      }
    }, 500); // 500ms debounce

    // Cleanup function to clear the timer when the component unmounts or dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMovieId, testShowId, testSeasonNum, testEpisodeNum, testPlayerType, testTheme, testAutoplay, testShowTitle, testShowPoster, testAnimeDub]);

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink).then(() => {
        alert("Player link copied to clipboard!");
      }).catch(err => {
        console.error('Failed to copy link: ', err);
      });
    }
  };

  const handleThemeChange = (e) => {
    const color = e.target.value.replace("#", "");
    setTestTheme(color);
  };

  return (
    <div className="homepage">
      <div className="divblur"></div>
      <div className="divblur2"></div>
      <header className="header">
        <div className="site-top-header">
          <h1 className="site-title">CinePro</h1>
          <div className="social-links">
            {/* <button>
              <svg width="15px" height="15px" viewBox="0 -28.5 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" fill="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#ffffff" fillRule="nonzero"> </path> </g> </g></svg>
            </button>
            <div className="separator"></div>
             */}
            <button onClick={() =>{window.open("https://github.com/cinepro-org/", "_blank")}}>
              <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.0744 2.9938C4.13263 1.96371 4.37869 1.51577 5.08432 1.15606C5.84357 0.768899 7.04106 0.949072 8.45014 1.66261C9.05706 1.97009 9.11886 1.97635 10.1825 1.83998C11.5963 1.65865 13.4164 1.65929 14.7213 1.84164C15.7081 1.97954 15.7729 1.97265 16.3813 1.66453C18.3814 0.651679 19.9605 0.71795 20.5323 1.8387C20.8177 2.39812 20.8707 3.84971 20.6494 5.04695C20.5267 5.71069 20.5397 5.79356 20.8353 6.22912C22.915 9.29385 21.4165 14.2616 17.8528 16.1155C17.5801 16.2574 17.3503 16.3452 17.163 16.4167C16.5879 16.6363 16.4133 16.703 16.6247 17.7138C16.7265 18.2 16.8491 19.4088 16.8973 20.4002C16.9844 22.1922 16.9831 22.2047 16.6688 22.5703C16.241 23.0676 15.6244 23.076 15.2066 22.5902C14.9341 22.2734 14.9075 22.1238 14.9075 20.9015C14.9075 19.0952 14.7095 17.8946 14.2417 16.8658C13.6854 15.6415 14.0978 15.185 15.37 14.9114C17.1383 14.531 18.5194 13.4397 19.2892 11.8146C20.0211 10.2698 20.1314 8.13501 18.8082 6.83668C18.4319 6.3895 18.4057 5.98446 18.6744 4.76309C18.7748 4.3066 18.859 3.71768 18.8615 3.45425C18.8653 3.03823 18.8274 2.97541 18.5719 2.97541C18.4102 2.97541 17.7924 3.21062 17.1992 3.49805L16.2524 3.95695C16.1663 3.99866 16.07 4.0147 15.975 4.0038C13.5675 3.72746 11.2799 3.72319 8.86062 4.00488C8.76526 4.01598 8.66853 3.99994 8.58215 3.95802L7.63585 3.49882C7.04259 3.21087 6.42482 2.97541 6.26317 2.97541C5.88941 2.97541 5.88379 3.25135 6.22447 4.89078C6.43258 5.89203 6.57262 6.11513 5.97101 6.91572C5.06925 8.11576 4.844 9.60592 5.32757 11.1716C5.93704 13.1446 7.4295 14.4775 9.52773 14.9222C10.7926 15.1903 11.1232 15.5401 10.6402 16.9905C10.26 18.1319 10.0196 18.4261 9.46707 18.4261C8.72365 18.4261 8.25796 17.7821 8.51424 17.1082C8.62712 16.8112 8.59354 16.7795 7.89711 16.5255C5.77117 15.7504 4.14514 14.0131 3.40172 11.7223C2.82711 9.95184 3.07994 7.64739 4.00175 6.25453C4.31561 5.78028 4.32047 5.74006 4.174 4.83217C4.09113 4.31822 4.04631 3.49103 4.0744 2.9938Z" fill="#ffffff"></path> <path d="M3.33203 15.9454C3.02568 15.4859 2.40481 15.3617 1.94528 15.6681C1.48576 15.9744 1.36158 16.5953 1.66793 17.0548C1.8941 17.3941 2.16467 17.6728 2.39444 17.9025C2.4368 17.9449 2.47796 17.9858 2.51815 18.0257C2.71062 18.2169 2.88056 18.3857 3.05124 18.5861C3.42875 19.0292 3.80536 19.626 4.0194 20.6962C4.11474 21.1729 4.45739 21.4297 4.64725 21.5419C4.85315 21.6635 5.07812 21.7352 5.26325 21.7819C5.64196 21.8774 6.10169 21.927 6.53799 21.9559C7.01695 21.9877 7.53592 21.998 7.99999 22.0008C8.00033 22.5527 8.44791 23.0001 8.99998 23.0001C9.55227 23.0001 9.99998 22.5524 9.99998 22.0001V21.0001C9.99998 20.4478 9.55227 20.0001 8.99998 20.0001C8.90571 20.0001 8.80372 20.0004 8.69569 20.0008C8.10883 20.0026 7.34388 20.0049 6.67018 19.9603C6.34531 19.9388 6.07825 19.9083 5.88241 19.871C5.58083 18.6871 5.09362 17.8994 4.57373 17.2891C4.34391 17.0194 4.10593 16.7834 3.91236 16.5914C3.87612 16.5555 3.84144 16.5211 3.80865 16.4883C3.5853 16.265 3.4392 16.1062 3.33203 15.9454Z" fill="#ffffff"></path> </g></svg>
            </button>
          </div>
        </div>
        <div className="nav-links">
          <a href="#player-demo-section" className="nav-link">Player</a>
          <div className="separator"></div>
          <a href={"https://cinepro.mintlify.app/introduction"} target="_blank" rel="noopener noreferrer" className="nav-link">Docs</a>
          <div className="separator"></div>
          <a href="#docs" className="nav-link">Api</a>
          <div className="separator"></div>
          <a href="#faq" className="nav-link">FAQs</a>
        </div>

      </header>

      <main className="main-content">
        <section className="presentation-section">
          <div className="presentation-gradient"></div>
          <div className="presentation-text">
            <h2>CinePro API</h2>
            <p>Seamlessly integrate powerful video playback into your applications.</p>

            <div className="buttonholder">
              <button className="cta-button" onClick={() => document.getElementById('docs').scrollIntoView({ behavior: 'smooth' })}>Get Started </button>

              <button className="cta-button" onClick={() => document.getElementById('player-demo-section').scrollIntoView({ behavior: 'smooth' })}>Try the Player</button>
              <button className="cta-button" onClick={() => window.open("https://cinepro.mintlify.app/introduction" , "_blank")}>Read The Docs</button>
            </div>
          </div>
        </section>

        <section id="player-demo-section" className="player-demo-section">
          <h3>Test the Player</h3>
          <p>Experiment with different settings and content types.</p>

          <ToggleGroup type="single" value={contentType} onValueChange={(value) => {
            if (value) {
              setContentType(value);
            }
          }}>
            <ToggleGroupItem value="movie" aria-label="Movie Player">
              <Film className="h-4 w-4" /> Movie Player
            </ToggleGroupItem>
            <ToggleGroupItem value="series" aria-label="Series Player">
              <MonitorPlay className="h-4 w-4" /> Series Player
            </ToggleGroupItem>
            {/* <ToggleGroupItem value="anime" aria-label="Anime Player">
              <Tv className="h-4 w-4" /> Anime Player
            </ToggleGroupItem> */}
          </ToggleGroup>

          <div className="input-row">
            <input
              type="text"
              id="id-input"
              placeholder={contentType === 'movie' ? "TMDb Movie ID (e.g., 550)" : "TMDb Show/Anilist ID (e.g., 1399)"}
              value={contentType === 'movie' ? testMovieId : testShowId}
              onChange={(e) => contentType === 'movie' ? setTestMovieId(e.target.value) : setTestShowId(e.target.value)}
              className="id-input"
            />
            {(contentType === 'series' || contentType === 'anime') && (
              <div className="season-episode-group">
                {contentType === 'series' && (
                  <input
                    type="number"
                    placeholder="S"
                    value={testSeasonNum}
                    onChange={(e) => setTestSeasonNum(e.target.value)}
                    className="se-input"
                    min="1"
                  />
                )}
                <input
                  type="number"
                  placeholder="E"
                  value={testEpisodeNum}
                  onChange={(e) => setTestEpisodeNum(e.target.value)}
                  className="se-input"
                  min="1"
                />
                {contentType === 'anime' && (
                  <label className="anime-dub-toggle">
                    <span>Dub</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={testAnimeDub}
                        onChange={(e) => setTestAnimeDub(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="player-and-customization-layout">
            <div className="player-preview-area">
              <h4>Player Preview</h4>
              {iframeSrc ? (
                <div className="iframe-container">
                  <iframe
                    src={iframeSrc}
                    title="CinePro Player Demo"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    className="player-iframe"
                  ></iframe>
                </div>
              ) : (
                <div className="player-placeholder">
                  Select content and click Generate & Test to see preview.
                </div>
              )}
              <div className="generated-link-bar">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="generated-link-input"
                  placeholder="Generated Player Link"
                />
                <button className="copy-link-button" onClick={handleCopyLink} disabled={!generatedLink}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                </button>
              </div>
            </div>

            <div className="player-settings-area">
              <h4>Player Settings</h4>
              <div className="player-options-grid">
                <div className="setting-item">
                  <div className="setting-label">
                    <Monitor className="option-icon"/>
                    <span>Player</span>
                    <p>select the player type</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="dropdown-trigger-button" onClick={() => setIsPlayerTypeDropdownOpen(!isPlayerTypeDropdownOpen)}>
                        {testPlayerType === 'vidstack' ? 'Vidstack' : 'ArtPlayer'} <ChevronDown size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    {isPlayerTypeDropdownOpen && (
                      <DropdownMenuContent className="w-56" onBlur={() => setIsPlayerTypeDropdownOpen(false)} setIsOpen={setIsPlayerTypeDropdownOpen}>
                        <DropdownMenuLabel>Select Player</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={testPlayerType} onValueChange={(val) => { setTestPlayerType(val); setIsPlayerTypeDropdownOpen(false); }}>
                          <DropdownMenuRadioItem value="vidstack">Vidstack</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="art">ArtPlayer</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </div>

                <label className="setting-item color-setting">
                  <div className="setting-label">
                    <Palette className="option-icon"/>
                    <span>Theme</span>
                    <p>set the player overall color</p>
                  </div>

                  <div className="separator"></div>

                  <div className="setting-color">
                    <input type="color" value={`#${testTheme}`} onChange={handleThemeChange} className="setting-color-input" />
                    <span className="color-hex">{testTheme}</span>

                  </div>
                </label>

                <label className="setting-item">
                  <span>Autoplay</span>
                  <label className="switch">
                    <input type="checkbox" checked={testAutoplay} onChange={(e) => setTestAutoplay(e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </label>

                <label className="setting-item">
                  <span>Show Title</span>
                  <label className="switch">
                    <input type="checkbox" checked={testShowTitle} onChange={(e) => setTestShowTitle(e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </label>

                <label className="setting-item">
                  <span>Show Poster</span>
                  <label className="switch">
                    <input type="checkbox" checked={testShowPoster} onChange={(e) => setTestShowPoster(e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section id="docs" className="docs-section">
          <h3>API Documentation</h3>
          <h4>Embed Movies</h4>
          <p>ID is required from <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="doc-link">The Movie Database API</a>.</p>
          <pre><code>{`${window.location.origin}/movie/{tmdbId}`}</code></pre>
          <h5>Code Example:</h5>
          <pre><code>{`<iframe src="${window.location.origin}/movie/786892" frameborder="0" allowfullscreen></iframe>`}</code></pre>
          <h4>Embed Shows</h4>
          <p>ID is required from <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="doc-link">The Movie Database API</a>. Season and episode number should not be empty.</p>
          <pre><code>{`${window.location.origin}/tv/{tmdbId}/{season}/{episode}`}</code></pre>
          <h5>Code Example:</h5>
          <pre><code>{`<iframe src="${window.location.origin}/tv/94605/1/1" frameborder="0" allowfullscreen></iframe>`}</code></pre>
          {/* <h4>Embed Anime</h4>
          <p>ID is required from <a href="https://anilist.co/" target="_blank" rel="noopener noreferrer" className="doc-link">Anilist API</a>. ID should not be empty, dub by default is false.</p>
          <pre><code>{`${window.location.origin}/anime/{anilistId}/{episodeNumber}?dub={trueOrFalse}`}</code></pre>
          <h5>Code Example:</h5>
          <pre><code>{`<iframe src="${window.location.origin}/anime/12234/1?dub=true" frameborder="0" allowfullscreen></iframe>`}</code></pre>
           */}
          <h4>Player Options</h4>
          <p>Customize the player's behavior and appearance using URL query parameters:</p>
          <div className="player-options-doc-grid">
            <div className="option-item">
              <TvIcon className="option-icon" />
              <strong>player</strong>
              <p>Selects the player type (<code>vidstack</code> or <code>art</code>).</p>
              <pre><code>player=vidstack</code></pre>
            </div>
            <div className="option-item">
              <PaintRoller className="option-icon" />
              <strong>theme</strong>
              <p>Sets the primary color of the player (HEX code without '#').</p>
              <pre><code>theme=B20710</code></pre>
            </div>
            <div className="option-item">
              <Play className="option-icon" />
              <strong>autoplay</strong>
              <p>Controls whether the player automatically starts playing media.</p>
              <pre><code>autoplay=true</code></pre>
            </div>
            <div className="option-item">
              <ALargeSmall className="option-icon" />
              <strong>title</strong>
              <p>Controls whether the title is displayed in the player interface (fetched from TMDB).</p>
              <pre><code>title=true</code></pre>
            </div>
            <div className="option-item">
              <Image className="option-icon" />
              <strong>poster</strong>
              <p>Determines if the poster image is shown (fetched from TMDB backdrop).</p>
              <pre><code>poster=true</code></pre>
            </div>
            <div className="option-item">
              <strong>primaryColor</strong>
              <p>Sets the primary color of the player, including sliders and autoplay controls.</p>
              <pre><code>primaryColor=B20710</code></pre>
            </div>
            <div className="option-item">
              <strong>secondaryColor</strong>
              <p>Defines the color of the progress bar behind the sliders.</p>
              <pre><code>secondaryColor=170000</code></pre>
            </div>
            <div className="option-item">
              <strong>autoNext</strong>
              <p>Controls whether the player automatically plays the next episode/content.</p>
              <pre><code>autoNext=true</code></pre>
            </div>
            <div className="option-item">
              <strong>nextButton</strong>
              <p>Controls whether the next button is displayed in the player controls.</p>
              <pre><code>nextButton=true</code></pre>
            </div>
            <div className="option-item">
              <strong>subtitleColor</strong>
              <p>Sets the color of subtitle text.</p>
              <pre><code>subtitleColor=FFFFFF</code></pre>
            </div>
            <div className="option-item">
              <strong>subtitleFontSize </strong>
              <p>Controls the font size of subtitles.</p>
              <pre><code>subtitleFontSize=16</code></pre>
            </div>
            <div className="option-item">
              <strong>subtitleOpacity</strong>
              <p>Controls the opacity of the subtitle background.</p>
              <pre><code>subtitleOpacity=0.5</code></pre>
            </div>
          </div>
        </section>

        <section id="faq" className="docs-section">
          <h3>Frequently Asked Questions</h3>
          <p>Find answers to commonly asked questions</p>

          <div className="faq-category">
            <h4>All (6)</h4>
            <div className="faq-item">
              <h5>1. Are your links protected from DMCA?</h5>
              <p>Yes, our links are protected.</p>
            </div>
            <div className="faq-item">
              <h5>2. Are subtitles available for all movies and TV shows?</h5>
              <p>Subtitle availability varies by content, but we strive to provide a wide selection.</p>
            </div>
            <div className="faq-item">
              <h5>3. What should I do if I come across incorrect movies or TV shows?</h5>
              <p>Please report any incorrect content through our Discord or Telegram channels.</p>
            </div>
            <div className="faq-item">
              <h5>4. Is it possible to change the video quality?</h5>
              <p>Yes, for adaptive streaming sources (like HLS), video quality can be changed in the player settings.</p>
            </div>
            <div className="faq-item">
              <h5>5. Do you offer movies and TV shows in languages other than English?</h5>
              <p>Yes, we offer content in various languages, with multi-language subtitles available.</p>
            </div>
            <div className="faq-item">
              <h5>6. Can I use this API for anime?</h5>
              <p>No, the API doesnt support embedding anime content yet , but we are working on it</p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>&copy; 2025 CinePro. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default HomePage;