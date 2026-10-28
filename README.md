# CAR WORLD QUIZ — live public vehicle data

This repository contains **public, non-secret JSON and approved artwork only**. The app source code remains in a separate, private repository.

* `fast-furious-cars.json`: unofficial movie-vehicle reference candidates; no film stills, no quiz permissions.
* `quiz-cars.json`: reviewed and approved cars to load as quiz content; initially empty until editorial/image review.
* `images/*.webp`: separately cleared, original car illustrations only.

These public files can be changed independently of App Store versions, once the compatible app version is released. Publish only verified data and images. Never add API keys, passwords, or private data.

Docs and the editing/publishing script live in the private CAR WORLD QUIZ development repo.

## Updating the real daily quiz

In iOS 1.2 and later, approved cars in quiz-cars.json are merged into the actual five-question daily ranked pool; the much larger film candidate catalog is not automatically playable. Only approved original artwork and checked model/origin data may be published.

For each new car, validate its film reference and manufacturer country; prepare an original square WebP image, put it in images, append the matching quiz-cars.json record, and mark exactly the matching film catalog record quizReady. Run node scripts/check-content.mjs after updating the files; GitHub Actions also checks the public feed. These checks do not replace editorial or image-rights review.

Never add newly playable cars in the middle of a JST ranking day. Set availableFrom to a FUTURE JST date, preferably the next day or later, so everybody receives the same five questions on a given day. The app must be iOS 1.2+; the current publicly released 1.1 does not load this remote feed.
