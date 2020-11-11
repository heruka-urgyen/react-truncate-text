#!/bin/bash

rm -rf example/dist
cd example
npx webpack --env production
cd dist
git init
git add .
git commit -m "example for gh-pages"
git remote add origin git@github.com:heruka-urgyen/react-truncate-text.git
git push --force origin master:gh-pages
