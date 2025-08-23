> [!important]
> Change this Readme file before release that it matches the actual project.

# CinePro Frontend

## Description

This repository contains the frontend for CinePro, an open-source movie and TV show streaming platform. The frontend is built using React and provides a user-friendly interface to browse and watch movies and TV shows. It integrates with the CinePro backend to fetch movie and TV show data and streams videos using HLS.js.

## Features

- Browse and watch movies and TV shows
- Stream videos using HLS.js
- Responsive design

## Usage

### Pages

#### Home Page

The home page provides an introduction and instructions on how to use the platform. It is implemented in [`HomePage`](src/pages/HomePage.jsx).

#### Movie Page

The movie page displays the video player for a specific movie. It fetches the movie data from the backend and streams the video using HLS.js. It is implemented in [`Movie`](src/pages/Movie.jsx).

### Components

#### VideoPlayer

The `VideoPlayer` component is responsible for streaming videos using HLS.js. It is implemented in [`VideoPlayer`](src/components/VideoPlayer.jsx).

## Installation

### Requirements

- Node.js
- Vite

### Steps

1. Clone the repository
2. Install the dependencies with `npm install`
3. Create a `.env` file based on the `.env.example` file and set the `VITE_API_URL` variable
4. Start the development server with `npm run dev`
5. The server should now be running on `http://localhost:3000`

## License

You can use this project for **personal and non-commercial use ONLY**! You are **not allowed to sell this project or any part of it and/or add ANY KIND of tracking or advertisement to it.**

## Notice

This project is for educational purposes only. We do not host any kind of content. We provide only the links to already available content on the internet. We do not host, upload any videos, films or media files. We are not responsible for the accuracy, compliance, copyright, legality, decency, or any other aspect of the content of other linked sites. If you have any legal issues please contact the appropriate media file owners or host sites.
